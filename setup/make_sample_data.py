"""Makes sample store data for the demo store "Noor Naturals" (fictional).

Outputs:
  setup/shopify_products_import.csv  -> import into your Shopify dev store
  clients/noor/products.json              -> backup product data the bot uses
                                        (dev stores are password-protected)
"""
import csv, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent

PRODUCTS = [
    ("Rose Water Toner", "Toner", 12.99, "Alcohol-free rose water toner. Calms and hydrates all skin types. 200 ml.", "toner, rose, sensitive skin, all skin types"),
    ("Vitamin C Glow Serum", "Serum", 24.99, "10% vitamin C serum for dull skin and dark spots. Use in the morning, then sunscreen. 30 ml.", "serum, vitamin c, dark spots, brightening"),
    ("Niacinamide Pore Serum", "Serum", 19.99, "5% niacinamide + zinc. Reduces oil and visible pores. Good for oily and acne-prone skin. 30 ml.", "serum, oily skin, acne, pores"),
    ("Hyaluronic Hydration Serum", "Serum", 21.99, "Deep hydration for dry and dehydrated skin. Safe for sensitive skin. 30 ml.", "serum, dry skin, hydration, sensitive skin"),
    ("Gentle Foam Cleanser", "Cleanser", 14.99, "Low-pH foaming cleanser. Removes oil without drying. 150 ml.", "cleanser, oily skin, combination skin"),
    ("Oat Milk Cream Cleanser", "Cleanser", 15.99, "Creamy, fragrance-free cleanser for dry and sensitive skin. 150 ml.", "cleanser, dry skin, sensitive skin, fragrance-free"),
    ("Daily Sunscreen SPF 50", "Sunscreen", 18.99, "Light, no white cast SPF 50 PA++++. Works under makeup. 50 ml.", "sunscreen, spf, daily, all skin types"),
    ("Tinted Sunscreen SPF 40", "Sunscreen", 20.99, "Tinted SPF 40 that evens skin tone. Shades: Light, Medium, Deep. 50 ml.", "sunscreen, tinted, makeup"),
    ("Ceramide Barrier Moisturizer", "Moisturizer", 22.99, "Rich cream with ceramides for dry, damaged skin barrier. 50 ml.", "moisturizer, dry skin, barrier, winter"),
    ("Oil-Free Gel Moisturizer", "Moisturizer", 17.99, "Light gel moisturizer for oily and acne-prone skin. Non-comedogenic. 50 ml.", "moisturizer, oily skin, acne, gel"),
    ("Retinol Night Cream", "Night cream", 27.99, "0.3% retinol for fine lines and texture. Night use only. Not for pregnancy. 30 ml.", "retinol, anti-aging, night"),
    ("Clay Detox Mask", "Mask", 16.99, "Kaolin clay mask. Use 1-2 times a week to clear pores. 100 g.", "mask, clay, oily skin, pores"),
    ("Lip Repair Balm", "Lip care", 7.99, "Shea butter lip balm for dry, cracked lips. 10 g.", "lip, balm, dry lips"),
    ("Under-Eye Caffeine Gel", "Eye care", 15.99, "Caffeine gel to reduce puffiness and dark circles. 15 ml.", "eye, dark circles, puffiness"),
    ("Starter Glow Kit", "Bundle", 49.99, "Gentle Foam Cleanser + Vitamin C Glow Serum + Daily Sunscreen SPF 50. Save 15%.", "bundle, kit, gift, beginner routine"),
]

def handle(title):
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")

def main():
    (ROOT / "clients" / "noor").mkdir(exist_ok=True)
    # Shopify CSV (minimal columns Shopify accepts for import)
    cols = ["Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
            "Option1 Name", "Option1 Value", "Variant Price", "Variant Requires Shipping",
            "Variant Taxable", "Status"]
    with open(ROOT / "setup" / "shopify_products_import.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(cols)
        for title, ptype, price, desc, tags in PRODUCTS:
            w.writerow([handle(title), title, f"<p>{desc}</p>", "Noor Naturals", ptype, tags,
                        "TRUE", "Title", "Default Title", f"{price:.2f}", "TRUE", "TRUE", "active"])

    # Same shape as Shopify's public /products.json
    data = {"products": [
        {"title": t, "handle": handle(t), "product_type": pt, "tags": tg.split(", "),
         "body_html": f"<p>{d}</p>", "variants": [{"price": f"{p:.2f}", "available": True}]}
        for t, pt, p, d, tg in PRODUCTS]}
    (ROOT / "clients" / "noor" / "products.json").write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Wrote {len(PRODUCTS)} products.")

if __name__ == "__main__":
    main()
