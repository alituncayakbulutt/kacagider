from pathlib import Path
import re
import sys

HINT_MARKER = "<!-- KaçaGider FAZ 8: Performance resource hints -->"
PERF_VERSION = "20260904-p8"
CORE = [
    Path("index.html"),
    Path("_layouts/seo.html"),
    Path("ilanlar/index.html"),
    Path("ilan/index.html"),
    Path("hesabim/index.html"),
]

errors = []
notes = []

for path in CORE:
    if not path.exists():
        errors.append(f"{path}: missing")
        continue
    text = path.read_text(encoding="utf-8")
    if text.count(HINT_MARKER) != 1:
        errors.append(f"{path}: performance hint marker count = {text.count(HINT_MARKER)}")
    # Home deliberately defers GA until after first render to protect mobile LCP.
    if path != Path("index.html") and "googletagmanager.com" in text and "rel=\"preconnect\" href=\"https://www.googletagmanager.com\"" not in text:
        errors.append(f"{path}: Google Tag preconnect missing")
    for match in re.finditer(r'<script[^>]+src="https://www\.googletagmanager\.com/[^\"]+"[^>]*>', text, flags=re.I):
        if " async" not in match.group(0).lower():
            errors.append(f"{path}: Google Tag loader is not async")

index = Path("index.html").read_text(encoding="utf-8")
if "?fresh=" in index or "performance.navigation.type === 1" in index:
    errors.append("index.html: legacy timestamp cache-buster still present")
if f'data/phone-prices.js?v={PERF_VERSION}' not in index:
    errors.append("index.html: phone price data is not versioned")
if f'data/screen-repair-prices.js?v={PERF_VERSION}' not in index:
    errors.append("index.html: screen repair data is not versioned")
for src in ["data/phone-prices.js", "data/screen-repair-prices.js"]:
    tag = re.search(rf'<script[^>]+src="{re.escape(src)}[^"]*"[^>]*>', index, flags=re.I)
    if not tag or " defer" not in tag.group(0).lower():
        errors.append(f"index.html: {src} must be deferred to protect first render")
if 'requestIdleCallback(startGa' not in index:
    errors.append("index.html: analytics is not deferred until after first render")
if '<link rel="preload" as="image" href="/assets/categories/telefon.jpg" fetchpriority="high">' not in index:
    errors.append("index.html: primary category image preload missing")
phone_img = re.search(r'<img\s+[^>]*src="assets/categories/telefon\.jpg"[^>]*>', index, flags=re.I)
if not phone_img or 'decoding="async"' not in phone_img.group(0) or 'fetchpriority="high"' not in phone_img.group(0):
    errors.append("index.html: primary category image priority attributes missing")
for src in ["tablet.jpg", "bilgisayar.jpg", "akilli-saat.jpg", "oyun-konsolu.jpg"]:
    if f'<img src="assets/categories/{src}"' not in index or "decoding=\"async\"" not in index[index.find(f'<img src="assets/categories/{src}"'):index.find(f'<img src="assets/categories/{src}"')+180]:
        errors.append(f"index.html: async decode missing for {src}")

list_js = Path("assets/marketplace-v2-list.js").read_text(encoding="utf-8")
for fragment, label in [
    ('loading=\"eager\" fetchpriority=\"high\" decoding=\"async\"', "first-listing image priority"),
    ('loading=\"lazy\" fetchpriority=\"low\" decoding=\"async\"', "deferred listing image loading"),
    ("media(x,index===0)", "first-card priority routing"),
]:
    if fragment not in list_js:
        errors.append(f"assets/marketplace-v2-list.js: missing {label}")

detail_js = Path("assets/marketplace-v2-detail.js").read_text(encoding="utf-8")
for fragment, label in [
    ('id=\"mainPhoto\"', "main listing image"),
    ('loading=\"eager\" fetchpriority=\"high\" decoding=\"async\"', "detail LCP image priority"),
    ('loading=\"lazy\" fetchpriority=\"low\" decoding=\"async\"', "detail thumbnail lazy loading"),
]:
    if fragment not in detail_js:
        errors.append(f"assets/marketplace-v2-detail.js: missing {label}")

budgets = {
    "index.html": 900_000,
    "data/phone-prices.js": 100_000,
    "data/screen-repair-prices.js": 20_000,
    "assets/mobile-v3.css": 35_000,
    "assets/marketplace-v2-list.js": 45_000,
    "assets/marketplace-v2-detail.js": 45_000,
}
for name, limit in budgets.items():
    path = Path(name)
    if not path.exists():
        errors.append(f"{name}: missing")
        continue
    size = path.stat().st_size
    notes.append(f"{name}: {size} bytes / budget {limit}")
    if size > limit:
        errors.append(f"{name}: size budget exceeded ({size} > {limit})")

for name in ["telefon.jpg", "tablet.jpg", "bilgisayar.jpg", "akilli-saat.jpg", "oyun-konsolu.jpg"]:
    path = Path("assets/categories") / name
    if not path.exists():
        errors.append(f"{path}: missing")
        continue
    size = path.stat().st_size
    notes.append(f"{path}: {size} bytes")
    if size > 50_000:
        errors.append(f"{path}: category image exceeds 50 KB")

print("PHASE 8 PERFORMANCE BUDGETS")
for item in notes:
    print(" -", item)

if errors:
    print(f"PERFORMANCE AUDIT: FAIL ({len(errors)} issue(s))")
    for item in errors:
        print(" -", item)
    sys.exit(1)

print(f"PERFORMANCE AUDIT: PASS ({len(CORE)} core surfaces)")
