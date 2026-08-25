from pathlib import Path
import re
import sys

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
    rel = path.parent.as_posix().strip('/')
    return f'https://kacagider.com.tr/{rel}/'


def local_target_exists(url: str):
    if not url.startswith('/') or url.startswith('//'):
        return True
    clean = url.split('#', 1)[0].split('?', 1)[0]
    if clean == '/':
        return Path('index.html').exists()
    rel = clean.strip('/')
    return (Path(rel) / 'index.md').exists() or (Path(rel) / 'index.html').exists() or Path(rel).exists()


# Full-site scope: every index.md that declares an SEO canonical.
pages = []
for path in Path('.').rglob('index.md'):
    if any(part.startswith('.') for part in path.parts):
        continue
    fm, _ = frontmatter(path)
    if fm.get('seo_canonical'):
        pages.append(path)

canonicals = {}
titles = {}
descriptions = {}
for path in sorted(set(pages)):
    fm, text = frontmatter(path)

    for field in REQUIRED:
        if not fm.get(field):
            errors.append(f'{path}: missing {field}')

    canonical = fm.get('seo_canonical', '')
    if canonical:
        expected = expected_url(path)
        if canonical != expected:
            errors.append(f'{path}: canonical mismatch ({canonical} != {expected})')
        if any(host in canonical for host in ('localhost', 'github.dev', 'app.github.dev')):
            errors.append(f'{path}: preview/local URL used as canonical ({canonical})')
        canonicals.setdefault(canonical, []).append(str(path))

    title = fm.get('seo_title', '')
    if title:
        titles.setdefault(title, []).append(str(path))
        if len(title) > 75:
            warnings.append(f'{path}: long title ({len(title)} chars)')
        if len(title) < 25:
            warnings.append(f'{path}: very short title ({len(title)} chars)')

    desc = fm.get('seo_description', '')
    if desc:
        descriptions.setdefault(desc, []).append(str(path))
        if len(desc) > 180:
            warnings.append(f'{path}: long description ({len(desc)} chars)')
        if len(desc) < 90:
            warnings.append(f'{path}: short description ({len(desc)} chars)')

    for url in re.findall(r'"url":"(/[^"]*)"', text):
        if not local_target_exists(url):
            errors.append(f'{path}: broken local link {url}')

for canonical, paths in canonicals.items():
    if len(paths) > 1:
        errors.append(f'duplicate canonical {canonical}: {", ".join(paths)}')

for title, paths in titles.items():
    if len(paths) > 1:
        warnings.append(f'duplicate title {title}: {", ".join(paths)}')

for desc, paths in descriptions.items():
    if len(paths) > 1:
        warnings.append(f'duplicate description ({len(paths)} pages): {", ".join(paths)}')

robots = Path('robots.txt').read_text(encoding='utf-8') if Path('robots.txt').exists() else ''
if 'Sitemap: https://kacagider.com.tr/sitemap.xml' not in robots:
    errors.append('robots.txt: sitemap declaration missing or wrong')

index = Path('index.html').read_text(encoding='utf-8')
layout = Path('_layouts/seo.html').read_text(encoding='utf-8')
stale_ga_id = 'G-' + '6L6B0DE3L6'
for name, text in [('index.html', index), ('_layouts/seo.html', layout)]:
    if stale_ga_id in text:
        errors.append(f'{name}: stale GA4 measurement ID found')
    if 'G-078JHH25LH' not in text:
        errors.append(f'{name}: correct GA4 measurement ID missing')
    if 'data/phone-prices.js' not in text:
        errors.append(f'{name}: phone pricing script missing')
    if 'data/screen-repair-prices.js' not in text:
        errors.append(f'{name}: screen repair pricing script missing')

if 'property="og:image"' not in index or 'name="twitter:image"' not in index:
    errors.append('index.html: homepage social image metadata missing')
if 'summary_large_image' not in index:
    warnings.append('index.html: Twitter large image card missing')

# Homepage/global messaging should use market-value language rather than presenting KaçaGider as a random estimator.
legacy_phrases = ('tahmini fiyat', 'fiyat tahmini', 'tahmini piyasa değeri')
for name, text in [('index.html', index), ('_layouts/seo.html', layout)]:
    low = text.casefold()
    for phrase in legacy_phrases:
        if phrase in low:
            warnings.append(f'{name}: legacy valuation wording still present ({phrase})')

# Preserve the intentionally deleted visible phone-guide hub.
if Path('rehber/telefon/index.md').exists():
    errors.append('rehber/telefon/index.md exists; deleted Telefon Bilgi Merkezi hub must stay absent')

# A real 404 page prevents soft-error experiences and must never be indexable.
not_found = Path('404.html')
if not not_found.exists():
    errors.append('404.html: custom 404 page missing')
else:
    not_found_text = not_found.read_text(encoding='utf-8').casefold()
    if 'noindex' not in not_found_text:
        errors.append('404.html: noindex directive missing')

sitemap = Path('sitemap.xml').read_text(encoding='utf-8') if Path('sitemap.xml').exists() else ''
if any(host in sitemap for host in ('localhost', 'github.dev', 'app.github.dev')):
    errors.append('sitemap.xml: preview/local URL found')
for canonical in canonicals:
    if canonical not in sitemap:
        errors.append(f'sitemap.xml: missing {canonical}')

# Sitemap URLs that no longer resolve to a local source are suspicious; warn rather than auto-delete.
for url in re.findall(r'<loc>(https://kacagider\.com\.tr/[^<]*)</loc>', sitemap):
    route = url.replace('https://kacagider.com.tr/', '', 1).strip('/')
    if not route:
        continue
    if not ((Path(route) / 'index.md').exists() or (Path(route) / 'index.html').exists() or Path(route).exists()):
        warnings.append(f'sitemap.xml: URL has no local source {url}')

print(f'SEO AUDIT: {len(set(pages))} canonical SEO pages checked')
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
