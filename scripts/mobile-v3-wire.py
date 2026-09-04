from pathlib import Path

LINK = '<link rel="stylesheet" href="/assets/mobile-v3.css?v=20260904-1">'
MARKER = '<!-- KaçaGider FAZ 7: Mobile V3 final responsive layer -->'
TARGETS = [
    Path('index.html'),
    Path('_layouts/seo.html'),
    Path('ilanlar/index.html'),
    Path('hesabim/index.html'),
]

updated = []
for path in TARGETS:
    text = path.read_text(encoding='utf-8')
    if '/assets/mobile-v3.css' in text:
        continue
    pos = text.lower().rfind('</head>')
    if pos < 0:
        raise SystemExit(f'{path}: </head> not found')
    prefix = text[:pos]
    suffix = text[pos:]
    spacer = '' if prefix.endswith('\n') else '\n'
    text = prefix + spacer + MARKER + '\n' + LINK + '\n' + suffix
    path.write_text(text, encoding='utf-8')
    updated.append(str(path))

print(f'Mobile V3 wiring: {len(updated)} file(s) updated')
for path in updated:
    print(' -', path)
