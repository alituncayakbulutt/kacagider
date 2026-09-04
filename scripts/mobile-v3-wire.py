from pathlib import Path
import re

LINK = '<link rel="stylesheet" href="/assets/mobile-v3.css?v=20260904-1">'
MARKER = '<!-- KaçaGider FAZ 7: Mobile V3 final responsive layer -->'
TARGETS = [
    Path('index.html'),
    Path('_layouts/seo.html'),
    Path('ilanlar/index.html'),
    Path('hesabim/index.html'),
]


def normalize_mobile_head(text: str, path: Path) -> str:
    # Repair the two malformed closing-head shapes produced by the first wiring run.
    text = text.replace(
        '</head\n' + MARKER + '\n' + LINK + '\n>',
        '</head>',
    )
    text = text.replace(
        '</\n' + MARKER + '\n' + LINK + '\nhead>',
        '</head>',
    )

    # Remove an existing Mobile V3 marker/link so wiring stays idempotent.
    text = text.replace(MARKER + '\n', '')
    text = text.replace(LINK + '\n', '')
    text = text.replace(MARKER, '')
    text = text.replace(LINK, '')

    # Reinsert immediately before the first valid closing head tag.
    match = re.search(r'</head\s*>', text, flags=re.IGNORECASE)
    if not match:
        raise SystemExit(f'{path}: valid </head> not found after repair')

    insertion = MARKER + '\n' + LINK + '\n</head>'
    return text[:match.start()] + insertion + text[match.end():]


updated = []
for path in TARGETS:
    original = path.read_text(encoding='utf-8')
    cleaned = normalize_mobile_head(original, path)
    if cleaned != original:
        path.write_text(cleaned, encoding='utf-8')
        updated.append(str(path))

print(f'Mobile V3 wiring/repair: {len(updated)} file(s) updated')
for path in updated:
    print(' -', path)
