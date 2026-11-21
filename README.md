# thekhansa Store Assistant (Groq version)

An AI chatbot for Shopify stores. It answers customers 24/7 using the store's products and policies, and saves leads to a Google Sheet.
One app serves all your clients. Each client is one folder in `clients/`.

## What's inside
| File | What it does |
|---|---|
| `api/index.py` | The backend (FastAPI + Groq API) |
| `static/widget.js` | The chat bubble that goes on the store |
| `static/demo.html` | A test page (open `/demo`) |
| `clients/noor/` | Demo client: config, store info, backup products |
| `setup/shopify_products_import.csv` | 15 demo products to import into Shopify |
| `setup/google_sheet_leads.gs` | Saves leads to Google Sheets |
| `setup/test_questions.md` | 21 questions to test the bot |

---

## Part 1: Run it on your laptop (15 min)
1. Get a free API key: sign up at console.groq.com > API Keys > Create API Key. Copy it (it's shown once).
2. In the project folder:
   ```
   pip install -r requirements.txt uvicorn
   set GROQ_API_KEY=your-key        (Windows)
   uvicorn api.index:app --reload
   ```
3. Open http://127.0.0.1:8000/demo, click the bubble and ask the 21 test questions.

If you get a model error, pick a current model from console.groq.com/docs/models, e.g. `set MODEL=openai/gpt-oss-20b`.

## Part 2: Put it online on Vercel (10 min)
1. Push this folder to a new GitHub repo.
2. On vercel.com: Add New > Project > pick the repo > Deploy.
3. Settings > Environment Variables: add `GROQ_API_KEY` (and `LEADS_WEBHOOK_URL` after Part 4). Redeploy.
4. Check: `https://YOUR-APP.vercel.app/api/health` should show `"ai_key_set": true`.
5. Test page: `https://YOUR-APP.vercel.app/demo`

Note: Vercel's free (Hobby) plan is for personal projects. Once you have paying clients, move to Pro.

## Part 3: Shopify demo store (30 min)
1. Sign up free at shopify.com/partners.
2. Stores > Add store > Development store. Name it, e.g. `noor-naturals-demo`.
3. Products > Import > upload `setup/shopify_products_import.csv`.
4. Online Store > Themes > Edit code > `theme.liquid`. Just before `</body>` paste:
   ```html
   <script src="https://YOUR-APP.vercel.app/widget.js" data-client="noor" defer></script>
   ```
5. In `clients/noor/config.json`, set `store_url` to your store link. Push again.

Dev stores have a password, so the bot reads products from `clients/noor/products.json` instead. Real stores are public, so the bot reads live products automatically.

## Part 4: Leads to Google Sheets (10 min)
Follow the steps at the top of `setup/google_sheet_leads.gs`. Put the URL in Vercel as `LEADS_WEBHOOK_URL`.

---

## Adding a new client (about 1 hour)
1. Copy `clients/noor` to `clients/<new-id>` (lowercase, no spaces).
2. Edit `config.json`: name, store link, bot name, greeting, brand colour.
3. Rewrite `store_info.md` with their real shipping, returns, contact and FAQs.
4. Delete `products.json` (a live store gives products automatically).
5. Push. Give them the script line with `data-client="<new-id>"`.

## Running costs (rough)
- AI: Groq's free tier is enough for testing and demos. It has rate limits, so for paying clients use a paid Groq plan (very cheap) or the Claude version.
- Hosting: one Vercel account for all clients.
- Built-in limit: 20 messages per minute per visitor, to stop abuse.
