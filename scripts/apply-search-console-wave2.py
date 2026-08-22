from pathlib import Path
import re

# Search Console 4B Wave 2
# Yalnızca kullanıcının paylaştığı sorgularda gösterim alan kümeler.
# Mevcut title, H1, URL, canonical, breadcrumb, rehber ve fiyatlandırma yapısı korunur.
TARGETS = {
    Path("telefon/samsung/galaxy-a16"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("telefon/samsung/galaxy-a26"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("telefon/samsung/galaxy-a32"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("telefon/samsung/galaxy-a35-5g"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("telefon/samsung/galaxy-a36-5g"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("telefon/samsung/galaxy-a52"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("telefon/samsung/galaxy-a56-5g"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("telefon/apple/iphone-12-pro"): "hafıza, pil sağlığı, ekran ve cihaz durumu",
    Path("tablet/samsung"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("tablet/apple/ipad-9-nesil"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("tablet/apple/ipad-10-nesil"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("tablet/lenovo/tab-m11"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("akilli-saat/apple/apple-watch-se-2"): "kasa, ekran, batarya ve genel cihaz durumu",
    Path("akilli-saat/apple/apple-watch-series-6"): "kasa, ekran, batarya ve genel cihaz durumu",
    Path("akilli-saat/apple/apple-watch-series-7"): "kasa, ekran, batarya ve genel cihaz durumu",
    Path("akilli-saat/apple/apple-watch-series-8"): "kasa, ekran, batarya ve genel cihaz durumu",
}

FIELD_RE = {
    "seo_description": re.compile(r'^seo_description:\s*".*"$', re.MULTILINE),
    "seo_intro": re.compile(r'^seo_intro:\s*".*"$', re.MULTILINE),
    "seo_h1": re.compile(r'^seo_h1:\s*"(.*)"$', re.MULTILINE),
}


def replace_field(text: str, field: str, value: str) -> str:
    return FIELD_RE[field].sub(f'{field}: "{value}"', text, count=1)


def page_label(text: str) -> str | None:
    match = FIELD_RE["seo_h1"].search(text)
    if not match:
        return None
    h1 = match.group(1)
    for marker in (" Kaça Satılır?", " İkinci El"):
        if marker in h1:
            return h1.split(marker, 1)[0].strip()
    return h1.strip()


changed = 0
skipped = 0
for root, factors in TARGETS.items():
    if not root.exists():
        skipped += 1
        continue
    for path in sorted(root.rglob("index.md")):
        text = path.read_text(encoding="utf-8")
        label = page_label(text)
        if not label:
            continue

        description = (
            f"{label} ikinci el fiyatı Türkiye 2026: {factors} dikkate alınarak güncel tahmini "
            "satış değerini KaçaGider ile ücretsiz hesapla."
        )
        intro = (
            f"{label} ikinci el fiyatı Türkiye 2026 ne kadar? {factors.capitalize()} birlikte "
            "değerlendirilir. Cihaz bilgilerini seçerek güncel tahmini satış değerini KaçaGider ile ücretsiz öğrenebilirsiniz."
        )

        updated = replace_field(text, "seo_description", description)
        updated = replace_field(updated, "seo_intro", intro)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed += 1

print(f"SEO 4B Search Console wave 2: {changed} page(s) updated, {skipped} missing target root(s) skipped")
