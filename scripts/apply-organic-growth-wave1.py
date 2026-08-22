from pathlib import Path
import re

FIELD_RE = {
    'seo_description': re.compile(r'^(seo_description:\s*)"([^"]*)"\s*$', re.M),
    'seo_intro': re.compile(r'^(seo_intro:\s*)"([^"]*)"\s*$', re.M),
}

# AŞAMA 4 / Organik büyüme dalga 1
# Amaç: reklam vermeden yüksek ticari arama niyeti taşıyan model merkezlerini
# "ne kadar eder + kaça satılır" diliyle güçlendirmek.
# URL, canonical, breadcrumb, title, H1, rehber bağlantıları ve fiyat motoru değişmez.
OVERRIDES = {
    'telefon/apple/iphone-13/index.md': {
        'seo_description': 'iPhone 13 ne kadar eder, kaça satılır? Hafıza, pil sağlığı, ekran ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.',
        'seo_intro': 'iPhone 13 ne kadar eder ve kaça satılır? Hafıza, pil sağlığı, ekran ve genel cihaz durumunu seçerek 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz öğrenebilirsiniz.',
    },
    'telefon/samsung/galaxy-s24/index.md': {
        'seo_description': 'Galaxy S24 ne kadar eder, kaça satılır? Hafıza, ekran, batarya ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.',
        'seo_intro': 'Galaxy S24 ne kadar eder ve kaça satılır? Hafıza, ekran, batarya ve genel cihaz durumunu seçerek 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz öğrenebilirsiniz.',
    },
    'telefon/samsung/galaxy-s23/index.md': {
        'seo_description': 'Galaxy S23 ne kadar eder, kaça satılır? Hafıza, ekran, batarya ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.',
        'seo_intro': 'Galaxy S23 ne kadar eder ve kaça satılır? Hafıza, ekran, batarya ve genel cihaz durumunu seçerek 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz öğrenebilirsiniz.',
    },
    'telefon/xiaomi/redmi-note-13-pro/index.md': {
        'seo_description': 'Redmi Note 13 Pro ne kadar eder, kaça satılır? Hafıza, ekran, batarya ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.',
        'seo_intro': 'Redmi Note 13 Pro ne kadar eder ve kaça satılır? Hafıza, ekran, batarya ve genel cihaz durumunu seçerek 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz öğrenebilirsiniz.',
    },
}


def apply_fields(path: Path, fields: dict) -> bool:
    text = path.read_text(encoding='utf-8')
    updated = text
    for field, value in fields.items():
        pattern = FIELD_RE[field]
        if not pattern.search(updated):
            raise SystemExit(f'Missing {field} in {path}; file left unchanged.')
        updated = pattern.sub(lambda m, v=value: f'{m.group(1)}"{v}"', updated, count=1)
    if updated != text:
        path.write_text(updated, encoding='utf-8')
        return True
    return False


changed = 0
for file_name, fields in OVERRIDES.items():
    path = Path(file_name)
    if not path.exists():
        raise SystemExit(f'Organic growth page not found: {file_name}')
    if apply_fields(path, fields):
        changed += 1

print(f'AŞAMA 4 organic growth wave 1: {changed} page(s) changed.')
