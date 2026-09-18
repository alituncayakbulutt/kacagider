from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
LAYOUT = ROOT / "_layouts" / "seo.html"
SITEMAP = ROOT / "sitemap.xml"
VARIANT_URL = re.compile(r"/(?:telefon|tablet|bilgisayar|akilli-saat|oyun-konsolu)/[^/]+/[^/]+/\d+(?:gb|tb|mm)/$", re.I)


def main() -> int:
    errors = []
    text = LAYOUT.read_text(encoding="utf-8")
    required = ["kg_is_variant", "noindex,follow", "kg_render_canonical", "FAQPage", "BreadcrumbList", "Bu içerik nasıl hazırlanıyor?"]
    forbidden = ["id=\"valuationArea\"", "id=\"mainPrice\"", "data/phone-prices.js", "data/screen-repair-prices.js"]
    for marker in required:
        if marker not in text:
            errors.append(f"SEO V4 layout missing marker: {marker}")
    for marker in forbidden:
        if marker in text:
            errors.append(f"SEO V4 layout still embeds application marker: {marker}")

    root = ET.parse(SITEMAP).getroot()
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [node.text.strip() for node in root.findall("s:url/s:loc", ns) if node.text]
    leaked = [url for url in urls if VARIANT_URL.search(url)]
    if leaked:
        errors.append(f"Primary sitemap contains {len(leaked)} storage/size variants")
    print(f"SEO V4 RUNTIME AUDIT: sitemap={len(urls)}, errors={len(errors)}")
    for error in errors:
        print("-", error)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
