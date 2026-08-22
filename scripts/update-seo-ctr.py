from pathlib import Path
import re

ROOT = Path('telefon')

TITLE_RE = re.compile(r'^(seo_title:\s*)"([^"]*)"\s*$', re.M)
DESC_RE = re.compile(r'^(seo_description:\s*)"([^"]*)"\s*$', re.M)


def extract_base(title: str) -> str:
    patterns = [
        r'\s+Ne Kadar Eder\?\s+2026\s+İkinci El Fiyatı\s*\|\s*KaçaGider$',
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
            base = new.strip()
            break
    return base


def make_title(base: str) -> str:
    long = f'{base} Ne Kadar Eder? 2026 İkinci El Fiyatı | KaçaGider'
    if len(long) <= 68:
        return long
    medium = f'{base} Ne Kadar Eder? 2026 | KaçaGider'
    if len(medium) <= 68:
        return medium
    return f'{base} Ne Kadar Eder? | KaçaGider'


def make_description(base: str) -> str:
    return (
        f'{base} ne kadar eder? Hafıza ve cihaz durumuna göre güncel ikinci el '
        f'tahmini satış değerini KaçaGider ile ücretsiz hesapla.'
    )

changed = 0
scanned = 0

for path in ROOT.rglob('index.md'):
    parts = path.parts
    # Only model and storage pages: telefon/marka/model/index.md and deeper.
    # Skip category root and brand pages.
    if len(parts) < 4:
        continue

    text = path.read_text(encoding='utf-8')
    title_match = TITLE_RE.search(text)
    desc_match = DESC_RE.search(text)
    if not title_match or not desc_match:
        continue

    scanned += 1
    old_title = title_match.group(2)
    base = extract_base(old_title)
    if not base:
        continue

    new_title = make_title(base)
    new_desc = make_description(base)

    updated = TITLE_RE.sub(lambda m: f'{m.group(1)}"{new_title}"', text, count=1)
    updated = DESC_RE.sub(lambda m: f'{m.group(1)}"{new_desc}"', updated, count=1)

    if updated != text:
        path.write_text(updated, encoding='utf-8')
        changed += 1

print(f'Scanned {scanned} phone model/storage pages; changed {changed}.')
