from pathlib import Path
import re

FIELD_RE = {
    'seo_description': re.compile(r'^(seo_description:\s*)"([^"]*)"\s*$', re.M),
    'seo_intro': re.compile(r'^(seo_intro:\s*)"([^"]*)"\s*$', re.M),
}

# AŞAMA 4A / organik büyüme dalga 2
# Mevcut SEO mimarisini korur; yalnızca açıklama ve ilk görünür metni güçlendirir.
# Koruma: Galaxy S25 ana model ve daha önce özel optimize edilen hafıza sayfaları bu dalgaya dahil değildir.
FAMILIES = [
    ('telefon/apple/iphone-14', 'iPhone 14', 'apple'),
    ('telefon/apple/iphone-14-plus', 'iPhone 14 Plus', 'apple'),
    ('telefon/apple/iphone-14-pro', 'iPhone 14 Pro', 'apple'),
    ('telefon/apple/iphone-14-pro-max', 'iPhone 14 Pro Max', 'apple'),
    ('telefon/apple/iphone-15', 'iPhone 15', 'apple'),
    ('telefon/apple/iphone-15-plus', 'iPhone 15 Plus', 'apple'),
    ('telefon/apple/iphone-15-pro', 'iPhone 15 Pro', 'apple'),
    ('telefon/apple/iphone-15-pro-max', 'iPhone 15 Pro Max', 'apple'),
    ('telefon/samsung/galaxy-s22', 'Galaxy S22', 'android'),
    ('telefon/samsung/galaxy-s22-plus', 'Galaxy S22+', 'android'),
    ('telefon/samsung/galaxy-s22-ultra', 'Galaxy S22 Ultra', 'android'),
    ('telefon/samsung/galaxy-s25-plus', 'Galaxy S25+', 'android'),
    ('telefon/samsung/galaxy-s25-ultra', 'Galaxy S25 Ultra', 'android'),
    ('telefon/samsung/galaxy-s25-edge', 'Galaxy S25 Edge', 'android'),
    ('telefon/samsung/galaxy-s25-fe', 'Galaxy S25 FE', 'android'),
]


def storage_label(folder_name: str) -> str:
    value = folder_name.lower()
    if value.endswith('gb') and value[:-2].isdigit():
        return f'{int(value[:-2])} GB'
    if value.endswith('tb') and value[:-2].isdigit():
        return f'{int(value[:-2])} TB'
    raise SystemExit(f'Unexpected storage folder: {folder_name}')


def model_copy(model: str, kind: str) -> dict:
    if kind == 'apple':
        return {
            'seo_description': f'{model} ne kadar eder, kaça satılır? Hafıza, pil sağlığı, ekran ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.',
            'seo_intro': f'{model} ne kadar eder ve kaça satılır? Hafıza, pil sağlığı, ekran ve genel cihaz durumunu seçerek 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz öğrenebilirsiniz.',
        }
    return {
        'seo_description': f'{model} ne kadar eder, kaça satılır? Hafıza, ekran, batarya ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.',
        'seo_intro': f'{model} ne kadar eder ve kaça satılır? Hafıza, ekran, batarya ve genel cihaz durumunu seçerek 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz öğrenebilirsiniz.',
    }


def variant_copy(model: str, storage: str, kind: str) -> dict:
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


model_changed = 0
variant_changed = 0
variant_checked = 0

for base_name, model, kind in FAMILIES:
    base = Path(base_name)
    page = base / 'index.md'
    if not page.exists():
        raise SystemExit(f'4A wave2 model page not found: {page}')
    if apply_fields(page, model_copy(model, kind)):
        model_changed += 1

    for child in sorted(base.iterdir()):
        if not child.is_dir():
            continue
        variant_page = child / 'index.md'
        if not variant_page.exists():
            continue
        variant_checked += 1
        if apply_fields(variant_page, variant_copy(model, storage_label(child.name), kind)):
            variant_changed += 1

print(
    f'AŞAMA 4A wave 2: {model_changed} model page(s), '
    f'{variant_changed} variant page(s) changed; {variant_checked} variants checked.'
)
