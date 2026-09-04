from pathlib import Path
import re
import sys

MOBILE_LINK = '/assets/mobile-v3.css?v=20260904-1'
TARGETS = [
    Path('index.html'),
    Path('_layouts/seo.html'),
    Path('ilanlar/index.html'),
    Path('ilan/index.html'),
    Path('hesabim/index.html'),
]

errors = []

for path in TARGETS:
    if not path.exists():
        errors.append(f'{path}: missing')
        continue
    text = path.read_text(encoding='utf-8')
    low = text.casefold()

    if '<meta name="viewport"' not in low:
        errors.append(f'{path}: viewport meta missing')
    if text.count(MOBILE_LINK) != 1:
        errors.append(f'{path}: Mobile V3 stylesheet link count is {text.count(MOBILE_LINK)}')
    if len(re.findall(r'</head\s*>', text, flags=re.IGNORECASE)) != 1:
        errors.append(f'{path}: valid closing head count is not 1')
    if '</head\n<!-- KaçaGider FAZ 7' in text or '</\n<!-- KaçaGider FAZ 7' in text:
        errors.append(f'{path}: malformed closing head around Mobile V3 marker')

css_path = Path('assets/mobile-v3.css')
if not css_path.exists():
    errors.append('assets/mobile-v3.css: missing')
else:
    css = css_path.read_text(encoding='utf-8')
    required_fragments = {
        '@media(max-width:980px)': 'tablet/mobile breakpoint',
        '@media(max-width:760px)': 'primary phone breakpoint',
        '@media(max-width:430px)': 'narrow-phone breakpoint',
        'font-size:16px!important': 'iOS form zoom protection',
        'touch-action:manipulation': 'touch interaction rule',
        '100dvh': 'dynamic viewport height support',
        'overflow-x:hidden': 'horizontal overflow guard',
        'prefers-reduced-motion:reduce': 'reduced motion support',
    }
    for fragment, label in required_fragments.items():
        if fragment not in css:
            errors.append(f'assets/mobile-v3.css: missing {label}')

if errors:
    print(f'MOBILE V3 AUDIT: FAIL ({len(errors)} issue(s))')
    for item in errors:
        print(' -', item)
    sys.exit(1)

print(f'MOBILE V3 AUDIT: PASS ({len(TARGETS)} core surfaces)')
