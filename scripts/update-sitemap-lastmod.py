from pathlib import Path
import re
import subprocess

SITEMAP = Path('sitemap.xml')
BASE = 'https://kacagider.com.tr'

URL_RE = re.compile(r'(<url>\s*<loc>([^<]+)</loc>.*?<lastmod>)([^<]+)(</lastmod>.*?</url>)')


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


replace_entry.changed = 0
text = SITEMAP.read_text(encoding='utf-8')
updated = URL_RE.sub(replace_entry, text)

if updated != text:
    SITEMAP.write_text(updated, encoding='utf-8')
    print(f'Sitemap lastmod updated for {replace_entry.changed} URLs from actual Git file history.')
else:
    print('Sitemap lastmod values are already aligned with Git file history.')
