from pathlib import Path
from urllib.parse import urlparse
import re
import subprocess

SITEMAP = Path('sitemap.xml')
BASE = 'https://kacagider.com.tr'
DEVICE_CATEGORIES = {'telefon', 'tablet', 'bilgisayar', 'akilli-saat', 'oyun-konsolu'}
VARIANT_SLUG_RE = re.compile(r'^\d+(?:gb|tb|mm)$', re.IGNORECASE)

URL_RE = re.compile(r'(<url>\s*<loc>([^<]+)</loc>.*?<lastmod>)([^<]+)(</lastmod>.*?</url>)')
ENTRY_RE = re.compile(r'\s*<url>\s*<loc>([^<]+)</loc>.*?</url>', re.DOTALL)
CANONICAL_RE = re.compile(r'^seo_canonical:\s*"(https://kacagider\.com\.tr/[^"]*)"\s*$', re.MULTILINE)
LOC_RE = re.compile(r'<loc>([^<]+)</loc>')


def route_parts(url: str):
    if not url.startswith(BASE):
        return []
    path = urlparse(url).path.strip('/')
    return [part for part in path.split('/') if part]


def is_device_variant_url(url: str) -> bool:
    """Return True only for exact device storage/size variant URLs.

    Examples suppressed from the primary sitemap:
    /telefon/apple/iphone-15-pro-max/256gb/
    /akilli-saat/apple/apple-watch-series-10/42mm/

    The route remains live and indexable. This only prevents thin variants from
    competing with the model URL for crawl priority in the primary sitemap.
    """
    parts = route_parts(url)
    return (
        len(parts) == 4
        and parts[0] in DEVICE_CATEGORIES
        and bool(VARIANT_SLUG_RE.fullmatch(parts[-1]))
    )


def is_sitemap_eligible(url: str) -> bool:
    return not is_device_variant_url(url)


def url_to_source(url: str):
    if not url.startswith(BASE):
        return None

    route = url[len(BASE):]
    if not route:
        route = '/'

    if route == '/':
        candidates = [Path('index.html'), Path('index.md')]
    else:
        clean = route.strip('/')
        candidates = [
            Path(clean) / 'index.md',
            Path(clean) / 'index.html',
            Path(f'{clean}.md'),
            Path(f'{clean}.html'),
        ]

    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def git_lastmod(path: Path):
    result = subprocess.run(
        ['git', 'log', '-1', '--format=%cs', '--', path.as_posix()],
        check=False,
        capture_output=True,
        text=True,
    )
    value = result.stdout.strip()
    return value if re.fullmatch(r'\d{4}-\d{2}-\d{2}', value) else None


def replace_entry(match):
    prefix, url, old_date, suffix = match.groups()
    if not is_sitemap_eligible(url):
        return match.group(0)

    source = url_to_source(url)
    if not source:
        return match.group(0)

    new_date = git_lastmod(source)
    if not new_date or new_date == old_date:
        return match.group(0)

    replace_entry.changed += 1
    return f'{prefix}{new_date}{suffix}'


def priority_for(url: str) -> str:
    route = url[len(BASE):].strip('/')
    if not route:
        return '1.0'
    parts = route.split('/')
    if parts[0] == 'rehber':
        return '0.6' if len(parts) <= 2 else '0.5'
    if route in {'telefonum-ne-kadar-eder', 'telefonum-kac-para', 'telefonum-kaca-gider'}:
        return '0.8'
    if len(parts) == 1:
        return '0.9'
    if len(parts) == 2:
        return '0.8'
    if len(parts) == 3:
        return '0.7'
    return '0.6'


def discover_canonical_pages():
    found = []
    for path in Path('.').rglob('index.md'):
        if any(part.startswith('.') for part in path.parts):
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            continue
        match = CANONICAL_RE.search(text)
        if not match:
            continue
        url = match.group(1)
        if not is_sitemap_eligible(url):
            continue
        if url_to_source(url) == path:
            found.append((url, path))
    return sorted(found, key=lambda item: item[0])


def prune_entry(match):
    url = match.group(1)
    if not url.startswith(BASE):
        return match.group(0)

    if is_device_variant_url(url):
        prune_entry.variant_removed += 1
        return ''

    if not url_to_source(url):
        prune_entry.stale_removed += 1
        return ''

    return match.group(0)


replace_entry.changed = 0
prune_entry.variant_removed = 0
prune_entry.stale_removed = 0
text = SITEMAP.read_text(encoding='utf-8')
updated = URL_RE.sub(replace_entry, text)

# Primary sitemap policy: keep category, brand and model pages; storage/mm
# variants remain live but are not promoted as independent crawl targets.
updated = ENTRY_RE.sub(prune_entry, updated)

# Add canonical SEO pages created after the sitemap was built, except thin
# storage/size variants suppressed by the policy above.
existing = set(LOC_RE.findall(updated))
missing_entries = []
for url, source in discover_canonical_pages():
    if url in existing:
        continue
    lastmod = git_lastmod(source) or '2026-08-22'
    missing_entries.append(
        f'  <url><loc>{url}</loc><lastmod>{lastmod}</lastmod>'
        f'<changefreq>weekly</changefreq><priority>{priority_for(url)}</priority></url>'
    )
    existing.add(url)

if missing_entries:
    marker = '</urlset>'
    if marker not in updated:
        raise SystemExit('sitemap.xml: closing urlset tag not found')
    block = '\n' + '\n'.join(missing_entries) + '\n'
    updated = updated.replace(marker, block + marker, 1)

# Keep XML readable after removals.
updated = re.sub(r'\n{3,}', '\n\n', updated)

if updated != text:
    SITEMAP.write_text(updated, encoding='utf-8')
    print(
        f'Sitemap synced: {replace_entry.changed} lastmod update(s), '
        f'{prune_entry.variant_removed} device variant URL(s) suppressed, '
        f'{prune_entry.stale_removed} stale URL(s) removed, '
        f'{len(missing_entries)} missing canonical page(s) added.'
    )
else:
    print('Sitemap lastmod and primary canonical coverage are already aligned with Git content.')
