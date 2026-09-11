from pathlib import Path
import re
import sys

REQUIRED = ['seo_title', 'seo_description', 'seo_h1', 'seo_canonical']
DEVICE_ROOTS = {'telefon', 'tablet', 'bilgisayar', 'akilli-saat', 'oyun-konsolu'}
VARIANT_RE = re.compile(r'^\d+(?:gb|tb|mm)$', re.I)
SITE = 'https://kacagider.com.tr'

# These are intentionally consolidated aliases. They are allowed to canonicalize
# to the single winning landing and must not be treated as duplicate canonicals.
CONSOLIDATED_CANONICAL_ALIASES = {
    'telefonum-kac-para/index.md': f'{SITE}/telefonum-ne-kadar-eder/',
    'telefonum-kaca-gider/index.md': f'{SITE}/telefonum-ne-kadar-eder/',
}

# V3 starts with known metadata debt from the legacy ~2k-page footprint.
# CI blocks NEW debt instead of forcing a risky mass rewrite of every page.
QUALITY_WARNING_BASELINE = {
    'long_title': 111,
    'short_title': 0,
    'long_description': 41,
    'short_description': 0,
    'duplicate_title': 1,
    'duplicate_description': 1,
}
QUALITY_WARNING_CATEGORIES = set(QUALITY_WARNING_BASELINE)

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
    return f'{SITE}/{rel}/'


def local_target_exists(url: str):
    if not url.startswith('/') or url.startswith('//'):
        return True
    clean = url.split('#', 1)[0].split('?', 1)[0]
    if clean == '/':
        return Path('index.html').exists()
    rel = clean.strip('/')
    return (Path(rel) / 'index.md').exists() or (Path(rel) / 'index.html').exists() or Path(rel).exists()


def warning_category(item: str):
    if ': long title (' in item:
        return 'long_title'
    if ': very short title (' in item:
        return 'short_title'
    if ': long description (' in item:
        return 'long_description'
    if ': short description (' in item:
        return 'short_description'
    if item.startswith('duplicate title '):
        return 'duplicate_title'
    if item.startswith('duplicate description '):
        return 'duplicate_description'
    if item.startswith('sitemap.xml: URL has no local source'):
        return 'stale_sitemap_source'
    if 'legacy valuation wording still present' in item:
        return 'legacy_wording'
    if item == 'index.html: Twitter large image card missing':
        return 'twitter_card'
    return 'other'


def is_consolidated_alias(path: Path, canonical: str):
    expected = CONSOLIDATED_CANONICAL_ALIASES.get(path.as_posix())
    return expected is not None and canonical == expected


def is_device_variant(path: Path):
    """Storage/mm child pages stay reachable during migration but are not primary sitemap URLs."""
    parts = path.parts
    # telefon/apple/iphone-13/128gb/index.md
    if len(parts) != 5 or parts[-1] != 'index.md':
        return False
    if parts[0] not in DEVICE_ROOTS:
        return False
    return bool(VARIANT_RE.fullmatch(parts[-2]))


def requires_primary_sitemap(path: Path, canonical: str):
    if is_device_variant(path):
        return False
    if is_consolidated_alias(path, canonical):
        return False
    return canonical == expected_url(path)


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
primary_sitemap_canonicals = []
variant_pages = 0
alias_pages = 0

for path in sorted(set(pages)):
    fm, text = frontmatter(path)

    for field in REQUIRED:
        if not fm.get(field):
            errors.append(f'{path}: missing {field}')

    canonical = fm.get('seo_canonical', '')
    alias = False
    if canonical:
        expected = expected_url(path)
        alias = is_consolidated_alias(path, canonical)
        if canonical != expected and not alias:
            errors.append(f'{path}: canonical mismatch ({canonical} != {expected})')
        if alias:
            alias_pages += 1
        if any(host in canonical for host in ('localhost', 'github.dev', 'app.github.dev')):
            errors.append(f'{path}: preview/local URL used as canonical ({canonical})')
        # Consolidated aliases deliberately share the winner's canonical and do
        # not participate in primary-canonical uniqueness checks.
        if not alias:
            canonicals.setdefault(canonical, []).append(str(path))
        if requires_primary_sitemap(path, canonical):
            primary_sitemap_canonicals.append(canonical)

    if is_device_variant(path):
        variant_pages += 1

    title = fm.get('seo_title', '')
    if title:
        if not alias:
            titles.setdefault(title, []).append(str(path))
        if len(title) > 75:
            warnings.append(f'{path}: long title ({len(title)} chars)')
        if len(title) < 25:
            warnings.append(f'{path}: very short title ({len(title)} chars)')

    desc = fm.get('seo_description', '')
    if desc:
        if not alias:
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
if f'Sitemap: {SITE}/sitemap.xml' not in robots:
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

# Homepage/global wording warnings remain informational. V3 avoids turning
# wording cleanup into a site-wide automatic rewrite.
legacy_phrases = ('tahmini fiyat', 'fiyat tahmini', 'tahmini piyasa değeri')
for name, text in [('index.html', index), ('_layouts/seo.html', layout)]:
    low = text.casefold()
    for phrase in legacy_phrases:
        if phrase in low:
            warnings.append(f'{name}: legacy valuation wording still present ({phrase})')

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

# V3 primary sitemap deliberately excludes storage/mm variants and consolidated
# aliases. Category/brand/model/core self-canonicals are still required.
for canonical in sorted(set(primary_sitemap_canonicals)):
    if canonical not in sitemap:
        errors.append(f'sitemap.xml: missing primary URL {canonical}')

# Explicitly fail if a storage/mm child leaks back into the primary sitemap.
variant_sitemap_urls = []
for url in re.findall(r'<loc>(https://kacagider\.com\.tr/[^<]*)</loc>', sitemap):
    route = url.replace(f'{SITE}/', '', 1).strip('/')
    parts = [part for part in route.split('/') if part]
    if len(parts) == 4 and parts[0] in DEVICE_ROOTS and VARIANT_RE.fullmatch(parts[-1]):
        variant_sitemap_urls.append(url)

    if not route:
        continue
    if not ((Path(route) / 'index.md').exists() or (Path(route) / 'index.html').exists() or Path(route).exists()):
        warnings.append(f'sitemap.xml: URL has no local source {url}')

if variant_sitemap_urls:
    errors.append(
        f'sitemap.xml: {len(variant_sitemap_urls)} storage/mm variant URL(s) leaked into primary sitemap; '
        f'first: {variant_sitemap_urls[:5]}'
    )

# Metadata debt is reduced gradually. Fail only when a warning category exceeds
# the measured V3 baseline; this prevents regression without another mass edit.
quality_counts = {key: 0 for key in QUALITY_WARNING_CATEGORIES}
for item in warnings:
    category = warning_category(item)
    if category in quality_counts:
        quality_counts[category] += 1

for category, current in quality_counts.items():
    baseline = QUALITY_WARNING_BASELINE[category]
    if current > baseline:
        errors.append(
            f'SEO metadata regression: {category} increased to {current} (V3 baseline {baseline})'
        )

print(f'SEO AUDIT: {len(set(pages))} canonical SEO pages checked')
print(f' - primary sitemap candidates: {len(set(primary_sitemap_canonicals))}')
print(f' - storage/mm variant pages excluded from primary sitemap: {variant_pages}')
print(f' - consolidated canonical aliases: {alias_pages}')

if warnings:
    category_counts = {}
    for item in warnings:
        key = warning_category(item)
        category_counts[key] = category_counts.get(key, 0) + 1
    print('WARNING SUMMARY:')
    for key in sorted(category_counts):
        suffix = ''
        if key in QUALITY_WARNING_BASELINE:
            suffix = f' (baseline <= {QUALITY_WARNING_BASELINE[key]})'
        print(f' - {key}: {category_counts[key]}{suffix}')
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
