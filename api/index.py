"""thekhansa Store Assistant (Groq version) - AI chatbot backend for Shopify stores.

One app serves many clients. Each client has a folder in clients/<id>/ with:
  config.json     name, store link, colours, greeting
  store_info.md   shipping, returns, contact, FAQs
  products.json   backup product list (used if the live store can't be read)

Endpoints:
  GET  /widget.js      the chat bubble script that goes on the store
  POST /api/chat       {client, messages:[{role, content}]} -> {reply}
  POST /api/lead       {client, name, contact, question}   -> saves a lead
  GET  /api/health     quick check
"""
import html
import json
import os
import pathlib
import re
import time
from collections import defaultdict, deque

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

ROOT = pathlib.Path(__file__).resolve().parent.parent
CLIENTS_DIR = ROOT / "clients"
MODEL = os.environ.get("MODEL", "openai/gpt-oss-120b")  # see console.groq.com/docs/models
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
LEADS_WEBHOOK_URL = os.environ.get("LEADS_WEBHOOK_URL", "")
PRODUCT_CACHE_SECONDS = 600
MAX_PRODUCTS_IN_PROMPT = 150
RATE_LIMIT_PER_MIN = 20

app = FastAPI(title="thekhansa Store Assistant")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET", "POST"],
                   allow_headers=["Content-Type"])

_product_cache: dict[str, tuple[float, list]] = {}
_hits: dict[str, deque] = defaultdict(deque)


# ---------- helpers ----------
def load_client(client_id: str) -> dict:
    if not re.fullmatch(r"[a-z0-9_-]{1,40}", client_id or ""):
        raise HTTPException(400, "Bad client id")
    folder = CLIENTS_DIR / client_id
    if not (folder / "config.json").exists():
        raise HTTPException(404, "Unknown client")
    cfg = json.loads((folder / "config.json").read_text(encoding="utf-8"))
    info_file = folder / "store_info.md"
    cfg["store_info"] = info_file.read_text(encoding="utf-8") if info_file.exists() else ""
    cfg["id"] = client_id
    cfg["folder"] = folder
    return cfg


def strip_html(text: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", text or ""))).strip()


def get_products(cfg: dict) -> list:
    """Live products from the store's public /products.json, else the backup file."""
    cached = _product_cache.get(cfg["id"])
    if cached and time.time() - cached[0] < PRODUCT_CACHE_SECONDS:
        return cached[1]
    products = []
    url = cfg.get("store_url", "").rstrip("/")
    if url:
        try:
            r = httpx.get(f"{url}/products.json", params={"limit": 250}, timeout=5,
                          follow_redirects=False)
            if r.status_code == 200 and "json" in r.headers.get("content-type", ""):
                products = r.json().get("products", [])
        except (httpx.HTTPError, ValueError):
            products = []
    if not products:  # dev stores are password protected -> use backup file
        backup = cfg["folder"] / "products.json"
        if backup.exists():
            products = json.loads(backup.read_text(encoding="utf-8")).get("products", [])
    _product_cache[cfg["id"]] = (time.time(), products)
    return products


def products_text(cfg: dict, products: list) -> str:
    base = cfg.get("store_url", "").rstrip("/")
    lines = []
    for p in products[:MAX_PRODUCTS_IN_PROMPT]:
        variants = p.get("variants") or [{}]
        prices = sorted({float(v.get("price", 0) or 0) for v in variants})
        price = f"${prices[0]:.2f}" if len(prices) == 1 else f"${prices[0]:.2f}-${prices[-1]:.2f}"
        in_stock = any(v.get("available", True) for v in variants)
        tags = p.get("tags", [])
        tags = ", ".join(tags) if isinstance(tags, list) else str(tags)
        desc = strip_html(p.get("body_html", ""))[:220]
        lines.append(f"- {p.get('title')} | {price} | {'in stock' if in_stock else 'SOLD OUT'} | "
                     f"type: {p.get('product_type', '')} | tags: {tags} | {desc} | "
                     f"link: {base}/products/{p.get('handle', '')}")
    return "\n".join(lines) or "(no products found)"


def system_prompt(cfg: dict) -> str:
    return f"""You are {cfg.get('bot_name', 'the shop assistant')}, the online shopping assistant for {cfg['name']}.

Rules:
- Use ONLY the store information and product list below. Never invent products, prices, discounts or policies.
- Keep answers short: 2-4 sentences. Friendly, simple words.
- When helpful, recommend up to 3 products. Give the name, price and the link as a plain URL.
- Reply in the same language the customer writes in.
- If you don't know, or the customer needs a person (order problems, complaints, custom requests), say so and ask them to tap "Leave your contact" so the team can reply.
- No medical advice or claims. For allergies or skin conditions, suggest a patch test or a doctor.
- Stay on topic: this store and its products.

STORE INFORMATION:
{cfg['store_info']}

PRODUCTS:
{products_text(cfg, get_products(cfg))}
"""


def rate_limited(ip: str) -> bool:
    now = time.time()
    q = _hits[ip]
    while q and now - q[0] > 60:
        q.popleft()
    if len(q) >= RATE_LIMIT_PER_MIN:
        return True
    q.append(now)
    return False


# ---------- request models ----------
class Msg(BaseModel):
    role: str
    content: str = Field(max_length=1000)


class ChatIn(BaseModel):
    client: str
    messages: list[Msg] = Field(min_length=1, max_length=30)


class LeadIn(BaseModel):
    client: str
    name: str = Field(default="", max_length=100)
    contact: str = Field(min_length=3, max_length=150)
    question: str = Field(default="", max_length=1000)


# ---------- routes ----------
@app.get("/api/health")
def health():
    return {"ok": True, "model": MODEL, "ai_key_set": bool(os.environ.get("GROQ_API_KEY"))}


@app.get("/widget.js")
def widget():
    return FileResponse(ROOT / "static" / "widget.js", media_type="application/javascript",
                        headers={"Cache-Control": "public, max-age=300"})


@app.get("/demo")
def demo_page():
    """A plain test page with the bubble on it, for trying the bot before a store exists."""
    return FileResponse(ROOT / "static" / "demo.html", media_type="text/html")


@app.get("/api/config/{client_id}")
def public_config(client_id: str):
    cfg = load_client(client_id)
    return {k: cfg.get(k) for k in ("name", "bot_name", "greeting", "color")}


@app.post("/api/chat")
def chat(body: ChatIn, request: Request):
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "?")
    if rate_limited(ip.split(",")[0].strip()):
        raise HTTPException(429, "Too many messages. Please wait a minute.")
    cfg = load_client(body.client)
    msgs = [{"role": m.role, "content": m.content} for m in body.messages[-10:]
            if m.role in ("user", "assistant") and m.content.strip()]
    while msgs and msgs[0]["role"] != "user":  # API needs the first message from the user
        msgs.pop(0)
    if not msgs:
        raise HTTPException(400, "No message")
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        raise HTTPException(503, "AI key not set on the server")
    payload = {"model": MODEL, "max_tokens": 600, "temperature": 0.3,
               "messages": [{"role": "system", "content": system_prompt(cfg)}] + msgs}
    if MODEL.startswith("openai/gpt-oss"):
        payload["reasoning_effort"] = "low"  # faster, cheaper answers
    try:
        r = httpx.post(GROQ_URL, json=payload, timeout=25,
                       headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 429:
            raise HTTPException(429, "Too many messages right now. Please wait a moment.")
        r.raise_for_status()
        reply = (r.json()["choices"][0]["message"].get("content") or "").strip()
    except HTTPException:
        raise
    except (httpx.HTTPError, KeyError, ValueError) as e:
        print("AI error:", e, getattr(getattr(e, "response", None), "text", "")[:500])
        raise HTTPException(502, "The assistant is busy. Please try again.")
    return {"reply": reply or "Sorry, I didn't catch that. Could you ask again?"}


@app.post("/api/lead")
def lead(body: LeadIn):
    cfg = load_client(body.client)
    row = {"time": time.strftime("%Y-%m-%d %H:%M:%S"), "client": cfg["name"],
           "name": body.name, "contact": body.contact, "question": body.question}
    print("LEAD:", json.dumps(row))
    if LEADS_WEBHOOK_URL:
        try:
            httpx.post(LEADS_WEBHOOK_URL, json=row, timeout=8, follow_redirects=True)
        except httpx.HTTPError as e:
            print("Lead webhook failed:", e)
    return {"ok": True}
