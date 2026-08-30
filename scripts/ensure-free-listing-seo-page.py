from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANDING = ROOT / "ucretsiz-ilan-ver" / "index.md"
SITEMAP = ROOT / "sitemap.xml"
URL = "https://kacagider.com.tr/ucretsiz-ilan-ver/"
ENTRY = f'  <url><loc>{URL}</loc><lastmod>2026-08-30</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n'


def main():
    if not LANDING.exists():
        raise SystemExit("Free listing landing page is missing")
    text = SITEMAP.read_text(encoding="utf-8")
    if URL not in text:
        marker = "</urlset>"
        if marker not in text:
            raise SystemExit("sitemap.xml closing tag not found")
        text = text.replace(marker, ENTRY + marker, 1)
        SITEMAP.write_text(text, encoding="utf-8")
        print("Added free listing landing to sitemap")
    else:
        print("Free listing landing already exists in sitemap")


if __name__ == "__main__":
    main()
