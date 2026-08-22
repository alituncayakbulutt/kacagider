from pathlib import Path
import re

FIELD_RE = {
    'seo_description': re.compile(r'^(seo_description:\s*)"([^"]*)"\s*$', re.M),
    'seo_intro': re.compile(r'^(seo_intro:\s*)"([^"]*)"\s*$', re.M),
}

# AŞAMA 4A / varyant genişletmesi
# Yalnızca daha önce 4A kapsamına alınmış model ailelerinin hafıza varyantlarını
# aynı "ne kadar eder + kaça satılır" arama niyetiyle güçlendirir.
# Title, H1, URL, canonical, breadcrumb, rehber bağlantıları ve fiyat motoru değişmez.
FAMILIES = [
    ('telefon/apple/iphone-13', 'iPhone 13', 'apple'),
    ('telefon/apple/iphone-13-pro', 'iPhone 13 Pro', 'apple'),
    ('telefon/apple/iphone-13-pro-max', 'iPhone 13 Pro Max', 'apple'),
    ('telefon/samsung/galaxy-s24', 'Galaxy S24', 'android'),
    ('telefon/samsung/galaxy-s24-plus', 'Galaxy S24+', 'android'),
    ('telefon/samsung/galaxy-s24-ultra', 'Galaxy S24 Ultra', 'android'),
    ('telefon/samsung/galaxy-s23', 'Galaxy S23', 'android'),
    ('telefon/samsung/galaxy-s23-plus', 'Galaxy S23+', 'android'),
    ('telefon/samsung/galaxy-s23-ultra', 'Galaxy S23 Ultra', 'android'),
    ('telefon/xiaomi/redmi-note-13-pro', 'Redmi Note 13 Pro', 'android'),
    ('telefon/xiaomi/redmi-note-13-pro-5g', 'Redmi Note 13 Pro 5G', 'android'),
    ('telefon/xiaomi/redmi-note-13-pro-plus-5g', 'Redmi Note 13 Pro+ 5G', 'android'),
]


def storage_label(folder_name: str) -> str:
    value = folder_name.lower()
    if value.endswith('gb') and value[:-2].isdigit():
        return f'{int(value[:-2])} GB'
    if value.endswith('tb') and value[:-2].isdigit():
        return f'{int(value[:-2])} TB'
    raise SystemExit(f'Unexpected storage folder: {folder_name}')


def copy_for(model: str, storage: str, kind: str) -> dict:
    if kind == 'apple':
        return {
            'seo_description': f'{model} {storage} ne kadar eder, kaça satılır? Pil sağlığı, ekran ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.',
            'seo_intro': f'{model} {storage} ne kadar eder ve kaça satılır? Pil sağlığı, ekran ve genel cihaz durumunu seçerek 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz öğrenebilirsiniz.',
        }
    return {
        'seo_description': f'{model} {storage} ne kadar eder, kaça satılır? Ekran, batarya ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.',
        'seo_intro': f'{model} {storage} ne kadar eder ve kaça satılır? Ekran, batarya ve genel cihaz durumunu seçerek 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz öğrenebilirsiniz.',
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
checked = 0
for base_name, model, kind in FAMILIES:
    base = Path(base_name)
    if not base.exists():
        raise SystemExit(f'4A family not found: {base_name}')
    for child in sorted(base.iterdir()):
        if not child.is_dir():
            continue
        page = child / 'index.md'
        if not page.exists():
            continue
        checked += 1
        if apply_fields(page, copy_for(model, storage_label(child.name), kind)):
            changed += 1

print(f'AŞAMA 4A variant expansion: {changed} page(s) changed, {checked} variant page(s) checked.')
