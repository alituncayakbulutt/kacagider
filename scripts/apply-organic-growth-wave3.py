from pathlib import Path
import re

FIELD_RE = {
    "seo_description": re.compile(r'^(seo_description:\s*)"([^"]*)"\s*$', re.M),
    "seo_intro": re.compile(r'^(seo_intro:\s*)"([^"]*)"\s*$', re.M),
}

# AŞAMA 4A / Organik büyüme dalga 3
# Yalnızca model merkezlerinin açıklama ve giriş metni güçlendirilir.
# Title, H1, URL, canonical, breadcrumb, rehber linkleri ve fiyat motoru değişmez.
APPLE_MODELS = {
    "telefon/apple/iphone-16/index.md": "iPhone 16",
    "telefon/apple/iphone-16-plus/index.md": "iPhone 16 Plus",
    "telefon/apple/iphone-16-pro/index.md": "iPhone 16 Pro",
    "telefon/apple/iphone-16-pro-max/index.md": "iPhone 16 Pro Max",
    "telefon/apple/iphone-16e/index.md": "iPhone 16e",
}

ANDROID_MODELS = {
    "telefon/samsung/galaxy-s23-fe/index.md": "Galaxy S23 FE",
    "telefon/samsung/galaxy-s24-fe/index.md": "Galaxy S24 FE",
    "telefon/samsung/galaxy-a35-5g/index.md": "Galaxy A35 5G",
    "telefon/samsung/galaxy-a36-5g/index.md": "Galaxy A36 5G",
    "telefon/samsung/galaxy-a55-5g/index.md": "Galaxy A55 5G",
    "telefon/samsung/galaxy-a56-5g/index.md": "Galaxy A56 5G",
    "telefon/xiaomi/redmi-note-14/index.md": "Redmi Note 14",
    "telefon/xiaomi/redmi-note-14-5g/index.md": "Redmi Note 14 5G",
    "telefon/xiaomi/redmi-note-14-pro/index.md": "Redmi Note 14 Pro",
    "telefon/xiaomi/redmi-note-14-pro-5g/index.md": "Redmi Note 14 Pro 5G",
    "telefon/xiaomi/redmi-note-14-pro-plus-5g/index.md": "Redmi Note 14 Pro+ 5G",
    "telefon/xiaomi/poco-x6/index.md": "POCO X6",
    "telefon/xiaomi/poco-x6-pro/index.md": "POCO X6 Pro",
    "telefon/xiaomi/poco-f6/index.md": "POCO F6",
    "telefon/xiaomi/poco-f6-pro/index.md": "POCO F6 Pro",
}


def fields_for(name: str, apple: bool) -> dict:
    if apple:
        return {
            "seo_description": f"{name} ne kadar eder, kaça satılır? Hafıza, pil sağlığı, ekran ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.",
            "seo_intro": f"{name} ne kadar eder ve kaça satılır? Hafıza, pil sağlığı, ekran ve genel cihaz durumunu seçerek 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz öğrenebilirsiniz.",
        }
    return {
        "seo_description": f"{name} ne kadar eder, kaça satılır? Hafıza, ekran, batarya ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.",
        "seo_intro": f"{name} ne kadar eder ve kaça satılır? Hafıza, ekran, batarya ve genel cihaz durumunu seçerek 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz öğrenebilirsiniz.",
    }


def apply_fields(path: Path, fields: dict) -> bool:
    text = path.read_text(encoding="utf-8")
    updated = text
    for field, value in fields.items():
        pattern = FIELD_RE[field]
        if not pattern.search(updated):
            raise SystemExit(f"Missing {field} in {path}; file left unchanged.")
        updated = pattern.sub(lambda m, v=value: f'{m.group(1)}"{v}"', updated, count=1)
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


changed = 0
for file_name, model_name in APPLE_MODELS.items():
    path = Path(file_name)
    if not path.exists():
        raise SystemExit(f"Organic growth page not found: {file_name}")
    changed += int(apply_fields(path, fields_for(model_name, True)))

for file_name, model_name in ANDROID_MODELS.items():
    path = Path(file_name)
    if not path.exists():
        raise SystemExit(f"Organic growth page not found: {file_name}")
    changed += int(apply_fields(path, fields_for(model_name, False)))

print(f"AŞAMA 4A organic growth wave 3: {changed} page(s) changed.")
