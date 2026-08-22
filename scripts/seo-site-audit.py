from pathlib import Path
import re
import sys

ROOT = Path('.')
DEVICE_ROOTS = [Path('telefon'), Path('tablet'), Path('bilgisayar'), Path('akilli-saat'), Path('oyun-konsolu')]
EXTRA_ROOTS = [Path('rehber'), Path('telefonum-ne-kadar-eder'), Path('telefonum-kac-para'), Path('telefonum-kaca-gider')]
REQUIRED = ['seo_title', 'seo_description', 'seo_h1', 'seo_canonical']
errors = []
warnings = []


def frontmatter(path: Path):
    text = path.read_text(encoding='utf-8')
    if not text.startswith('---'):
        return {}, text
    parts = text.split('---', 2)
    if len(parts) < 3:
        return {}, text
    fm = {}
    for line in parts[1].splitlines():
        m = re.match(r'^([a-zA-Z0-9_]+):\s*"(.*)"\s*$', line)
        if m:
            fm[m.group(1)] = m.group(2)
    return fm, text


def expected_url(path: Path):
    if path == Path('index.html'):
        return 'https://kacagider.com.tr/'
    rel = path.parent.as_posix().strip('/')
    return f'https://kacagider.com.tr/{rel}/'


def local_target_exists(url: str):
    if not url.startswith('/') or url.startswith('//'):
        return True
    clean = url.split('#', 1)[0].split('?', 1)[0]
    if clean == '/':
        return Path('index.html').exists()
    rel = clean.strip('/')
    return (Path(rel) / 'index.md').exists() or Path(rel).is_file() or Path(rel).exists()

pages = []
for root in DEVICE_ROOTS + EXTRA_ROOTS:
    if root.exists():
        pages.extend(root.rglob('index.md'))

canonicals = {}
titles = {}
for path in sorted(set(pages)):
    fm, text = frontmatter(path)
    if not fm:
        warnings.append(f'{path}: front matter could not be parsed')
        continue

    for field in REQUIRED:
        if not fm.get(field):
            errors.append(f'{path}: missing {field}')

    canonical = fm.get('seo_canonical', '')
    if canonical:
        expected = expected_url(path)
        if canonical != expected:
            errors.append(f'{path}: canonical mismatch ({canonical} != {expected})')
        canonicals.setdefault(canonical, []).append(str(path))

    title = fm.get('seo_title', '')
    if title:
        titles.setdefault(title, []).append(str(path))
        if len(title) > 75:
            warnings.append(f'{path}: long title ({len(title)} chars)')

    desc = fm.get('seo_description', '')
    if desc and len(desc) > 180:
        warnings.append(f'{path}: long description ({len(desc)} chars)')

    # Validate local URLs explicitly present in JSON-like front-matter arrays.
    for url in re.findall(r'"url":"(/[^"]*)"', text):
        if not local_target_exists(url):
            errors.append(f'{path}: broken local link {url}')

for canonical, paths in canonicals.items():
    if len(paths) > 1:
        errors.append(f'duplicate canonical {canonical}: {", ".join(paths)}')

# Duplicate titles are usually a signal, but not always a hard build failure.
for title, paths in titles.items():
    if len(paths) > 1:
        warnings.append(f'duplicate title {title}: {", ".join(paths)}')

robots = Path('robots.txt').read_text(encoding='utf-8') if Path('robots.txt').exists() else ''
if 'Sitemap: https://kacagider.com.tr/sitemap.xml' not in robots:
    errors.append('robots.txt: sitemap declaration missing or wrong')

index = Path('index.html').read_text(encoding='utf-8')
layout = Path('_layouts/seo.html').read_text(encoding='utf-8')
for name, text in [('index.html', index), ('_layouts/seo.html', layout)]:
    if 'G-078JHH25LH' in text:
        errors.append(f'{name}: stale GA4 measurement ID found')
    if 'G-6L6B0DE3L6' not in text:
        errors.append(f'{name}: correct GA4 measurement ID missing')
    if 'data/phone-prices.js' not in text:
        errors.append(f'{name}: phone pricing script missing')
    if 'data/screen-repair-prices.js' not in text:
        errors.append(f'{name}: screen repair pricing script missing')

if 'property="og:image"' not in index or 'name="twitter:image"' not in index:
    errors.append('index.html: homepage social image metadata missing')
if 'summary_large_image' not in index:
    warnings.append('index.html: Twitter large image card missing')

# Preserve the intentionally deleted visible phone-guide hub.
if Path('rehber/telefon/index.md').exists():
    errors.append('rehber/telefon/index.md exists; deleted Telefon Bilgi Merkezi hub must stay absent')

# Basic sitemap coverage for canonical SEO pages.
sitemap = Path('sitemap.xml').read_text(encoding='utf-8') if Path('sitemap.xml').exists() else ''
for canonical in canonicals:
    if canonical not in sitemap:
        errors.append(f'sitemap.xml: missing {canonical}')

print(f'SEO AUDIT: {len(set(pages))} SEO pages checked')
if warnings:
    print(f'WARNINGS ({len(warnings)}):')
    for item in warnings[:100]:
        print(' -', item)
    if len(warnings) > 100:
        print(f' - ... {len(warnings)-100} more warning(s)')
if errors:
    print(f'ERRORS ({len(errors)}):')
    for item in errors:
        print(' -', item)
    sys.exit(1)
print('SEO AUDIT: PASS')
