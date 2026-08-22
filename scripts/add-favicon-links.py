from pathlib import Path

TARGETS = [Path('index.html'), Path('_layouts/seo.html')]
LINK = '<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any">\n'

changed = []
for path in TARGETS:
    text = path.read_text(encoding='utf-8')
    if '/favicon.svg' in text:
        continue
    anchor = '<link rel="canonical"'
    pos = text.find(anchor)
    if pos < 0:
        raise SystemExit(f'favicon: canonical link not found in {path}')
    end = text.find('\n', pos)
    if end < 0:
        raise SystemExit(f'favicon: canonical line ending not found in {path}')
    updated = text[:end+1] + LINK + text[end+1:]
    path.write_text(updated, encoding='utf-8')
    changed.append(str(path))

print('Favicon links:', ', '.join(changed) if changed else 'already present')
