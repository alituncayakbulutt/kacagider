from pathlib import Path
import re
import subprocess

SITEMAP = Path('sitemap.xml')
BASE = 'https://kacagider.com.tr'

URL_RE = re.compile(r'(<url>\s*<loc>([^<]+)</loc>.*?<lastmod>)([^<]+)(</lastmod>.*?</url>)')
CANONICAL_RE = re.compile(r'^seo_canonical:\s*"(https://kacagider\.com\.tr/[^"]*)"\s*$', re.MULTILINE)
LOC_RE = re.compile(r'<loc>([^<]+)</loc>')


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
        if url_to_source(url) == path:
            found.append((url, path))
    return sorted(found, key=lambda item: item[0])


replace_entry.changed = 0
text = SITEMAP.read_text(encoding='utf-8')
updated = URL_RE.sub(replace_entry, text)

# Add canonical SEO pages that were created after the sitemap entry list was built.
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
    block = '\n'.join(missing_entries) + '\n'
    updated = updated.replace(marker, block + marker, 1)

if updated != text:
    SITEMAP.write_text(updated, encoding='utf-8')
    print(
        f'Sitemap synced: {replace_entry.changed} lastmod update(s), '
        f'{len(missing_entries)} missing canonical page(s) added.'
    )
else:
    print('Sitemap lastmod and canonical coverage are already aligned with Git content.')
