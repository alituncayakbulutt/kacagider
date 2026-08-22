from pathlib import Path
import re

TITLE_RE = re.compile(r'^(seo_title:\s*)"([^"]*)"\s*$', re.M)
DESC_RE = re.compile(r'^(seo_description:\s*)"([^"]*)"\s*$', re.M)
H1_RE = re.compile(r'^(seo_h1:\s*)"([^"]*)"\s*$', re.M)
STORAGE_RE = re.compile(r'\b(?:\d+\s*GB|\d+\s*TB)\b', re.I)


def extract_base(title: str) -> str:
    patterns = [
        r'\s+Ne Kadar Eder\?\s+2026\s+Fiyatı\s+Kaça Satılır\?\s*\|\s*KaçaGider$',
        r'\s+Ne Kadar Eder\?\s+2026\s+İkinci El Fiyatı\s+Kaça Satılır\?\s*\|\s*KaçaGider$',
        r'\s+Kaça Satılır\?\s+2026\s+İkinci El Fiyatı\s*\|\s*KaçaGider$',
        r'\s+Kaça Satılır\?\s+2026\s+Fiyatı\s*\|\s*KaçaGider$',
        r'\s+Kaça Satılır\?\s+2026\s*\|\s*KaçaGider$',
        r'\s+Kaça Satılır\?\s*\|\s*KaçaGider$',
        r'\s+Ne Kadar Eder\?\s+2026\s+İkinci El Fiyatı\s*\|\s*KaçaGider$',
        r'\s+Ne Kadar Eder\?\s+2026\s+Fiyatı\s*\|\s*KaçaGider$',
        r'\s+Ne Kadar Eder\?\s+2026\s*\|\s*KaçaGider$',
        r'\s+Ne Kadar Eder\?\s*\|\s*KaçaGider$',
        r'\s+İkinci El Fiyatı\s+2026\s*\|\s*KaçaGider$',
        r'\s+İkinci El Fiyatı\s*\|\s*KaçaGider$',
        r'\s*\|\s*KaçaGider$',
    ]
    base = title.strip()
    for p in patterns:
        new = re.sub(p, '', base, flags=re.I)
        if new != base:
            return new.strip()
    return base


def make_title(base: str) -> str:
    long = f'{base} Kaça Satılır? 2026 İkinci El Fiyatı | KaçaGider'
    if len(long) <= 68:
        return long
    medium = f'{base} Kaça Satılır? 2026 Fiyatı | KaçaGider'
    if len(medium) <= 68:
        return medium
    short = f'{base} Kaça Satılır? 2026 | KaçaGider'
    if len(short) <= 68:
        return short
    return f'{base} Kaça Satılır? | KaçaGider'


def make_h1(base: str) -> str:
    return f'{base} Kaça Satılır? 2026 İkinci El Fiyatı'


def phone_description(base: str, camera: bool = False) -> str:
    details = 'ekran, batarya'
    if camera:
        details += ', kamera'
    details += ' ve cihaz durumu'
    if STORAGE_RE.search(base):
        return (
            f'{base} kaça satılır? {details.capitalize()}na göre 2026 güncel ikinci el '
            f'tahmini satış değerini KaçaGider ile ücretsiz hesapla.'
        )
    return (
        f'{base} kaça satılır? Hafıza, {details}na göre 2026 güncel ikinci el '
        f'tahmini satış değerini KaçaGider ile ücretsiz hesapla.'
    )


def apple_description(base: str) -> str:
    if STORAGE_RE.search(base):
        return (
            f'{base} kaça satılır? Pil sağlığı ve cihaz durumuna göre 2026 güncel ikinci el '
            f'tahmini satış değerini KaçaGider ile ücretsiz hesapla.'
        )
    return (
        f'{base} kaça satılır? Hafıza, pil sağlığı ve cihaz durumuna göre 2026 güncel ikinci el '
        f'tahmini satış değerini KaçaGider ile ücretsiz hesapla.'
    )


def tablet_description(base: str) -> str:
    if STORAGE_RE.search(base):
        return (
            f'{base} kaça satılır? Ekran, batarya ve cihaz durumuna göre 2026 güncel ikinci el '
            f'tahmini satış değerini KaçaGider ile ücretsiz hesapla.'
        )
    return (
        f'{base} kaça satılır? Hafıza, ekran, batarya ve cihaz durumuna göre 2026 güncel ikinci el '
        f'tahmini satış değerini KaçaGider ile ücretsiz hesapla.'
    )


def computer_description(base: str) -> str:
    return (
        f'{base} kaça satılır? İşlemci, RAM, depolama ve cihaz durumuna göre 2026 güncel ikinci el '
        f'tahmini satış değerini KaçaGider ile ücretsiz hesapla.'
    )


def watch_description(base: str) -> str:
    return (
        f'{base} kaça satılır? Kasa, ekran, batarya ve genel cihaz durumuna göre 2026 güncel ikinci el '
        f'tahmini satış değerini KaçaGider ile ücretsiz hesapla.'
    )


def console_description(base: str) -> str:
    return (
        f'{base} kaça satılır? Depolama, kozmetik durum, aksesuarlar ve çalışma durumuna göre 2026 güncel '
        f'ikinci el tahmini satış değerini KaçaGider ile ücretsiz hesapla.'
    )


def optimize_tree(root: Path, brand: str, description_builder, skip_model=None):
    scanned = changed = skipped = 0
    for path in root.rglob('index.md'):
        parts = path.parts
        if len(parts) < 4:
            continue

        model_slug = parts[2]
        if skip_model and skip_model(model_slug):
            skipped += 1
            continue

        text = path.read_text(encoding='utf-8')
        title_match = TITLE_RE.search(text)
        desc_match = DESC_RE.search(text)
        if not title_match or not desc_match:
            continue

        scanned += 1
        base = extract_base(title_match.group(2))
        if not base:
            continue

        new_title = make_title(base)
        new_desc = description_builder(base)

        updated = TITLE_RE.sub(lambda m: f'{m.group(1)}"{new_title}"', text, count=1)
        updated = DESC_RE.sub(lambda m: f'{m.group(1)}"{new_desc}"', updated, count=1)

        if updated != text:
            path.write_text(updated, encoding='utf-8')
            changed += 1

    print(f'{brand}: scanned {scanned}, changed {changed}, skipped {skipped}.')


def align_h1_tree(root: Path, label: str):
    scanned = changed = 0
    for path in root.rglob('index.md'):
        if len(path.parts) < 4:
            continue
        text = path.read_text(encoding='utf-8')
        title_match = TITLE_RE.search(text)
        h1_match = H1_RE.search(text)
        if not title_match or not h1_match:
            continue
        scanned += 1
        base = extract_base(title_match.group(2))
        if not base:
            continue
        new_h1 = make_h1(base)
        updated = H1_RE.sub(lambda m: f'{m.group(1)}"{new_h1}"', text, count=1)
        if updated != text:
            path.write_text(updated, encoding='utf-8')
            changed += 1
    print(f'{label} H1: scanned {scanned}, changed {changed}.')


# AŞAMA 1 — mevcut yapı korunur, yalnızca arama sonucu başlık/açıklamaları güncellenir.
optimize_tree(
    Path('telefon/apple'),
    'Apple iPhone',
    apple_description,
    skip_model=lambda slug: slug == 'iphone-13' or slug.startswith('iphone-13-'),
)
optimize_tree(Path('telefon/samsung'), 'Samsung Galaxy', lambda base: phone_description(base))
optimize_tree(Path('telefon/xiaomi'), 'Xiaomi Redmi POCO', lambda base: phone_description(base))
optimize_tree(Path('telefon/oppo'), 'OPPO', lambda base: phone_description(base, camera=True))
optimize_tree(Path('telefon/vivo'), 'Vivo', lambda base: phone_description(base, camera=True))
optimize_tree(Path('telefon/huawei'), 'Huawei', lambda base: phone_description(base, camera=True))
optimize_tree(Path('telefon/honor'), 'Honor', lambda base: phone_description(base, camera=True))
optimize_tree(Path('telefon/realme'), 'Realme', lambda base: phone_description(base, camera=True))
optimize_tree(Path('telefon/oneplus'), 'OnePlus', lambda base: phone_description(base, camera=True))
optimize_tree(Path('telefon/google'), 'Google Pixel', lambda base: phone_description(base, camera=True))

for brand in ['apple', 'samsung', 'xiaomi', 'huawei', 'honor', 'lenovo']:
    optimize_tree(Path('tablet') / brand, f'Tablet {brand}', tablet_description)

for brand in ['apple', 'asus', 'acer', 'casper', 'dell', 'hp', 'huawei', 'lenovo', 'monster', 'msi']:
    optimize_tree(Path('bilgisayar') / brand, f'Bilgisayar {brand}', computer_description)

for brand in ['apple', 'samsung', 'huawei']:
    optimize_tree(Path('akilli-saat') / brand, f'Akıllı Saat {brand}', watch_description)

for brand in ['playstation', 'xbox']:
    optimize_tree(Path('oyun-konsolu') / brand, f'Oyun Konsolu {brand}', console_description)

# AŞAMA 2A.1 — sayfa yapısını değiştirmeden H1'i arama niyetiyle hizala.
for root, label in [
    (Path('telefon'), 'Telefon'),
    (Path('tablet'), 'Tablet'),
    (Path('bilgisayar'), 'Bilgisayar'),
    (Path('akilli-saat'), 'Akıllı Saat'),
    (Path('oyun-konsolu'), 'Oyun Konsolu'),
]:
    align_h1_tree(root, label)
