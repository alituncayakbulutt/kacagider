from pathlib import Path
import re

TARGETS = {
    Path("telefon/apple/iphone-15-pro-max"): "pil sağlığı, ekran ve cihaz durumu",
    Path("telefon/samsung/galaxy-a24"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("telefon/samsung/galaxy-s23-ultra"): "hafıza, ekran, batarya ve cihaz durumu",
    Path("telefon/xiaomi/redmi-15"): "hafıza, ekran, batarya ve cihaz durumu",
}

FIELD_RE = {
    "seo_description": re.compile(r'^seo_description:\s*".*"$', re.MULTILINE),
    "seo_intro": re.compile(r'^seo_intro:\s*".*"$', re.MULTILINE),
    "seo_h1": re.compile(r'^seo_h1:\s*"(.*)"$', re.MULTILINE),
}


def replace_field(text: str, field: str, value: str) -> str:
    pattern = FIELD_RE[field]
    replacement = f'{field}: "{value}"'
    return pattern.sub(replacement, text, count=1)


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
for root, factors in TARGETS.items():
    if not root.exists():
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

print(f"SEO 4B Search Console wave 1: {changed} page(s) updated")
