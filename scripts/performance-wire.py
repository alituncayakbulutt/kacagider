from pathlib import Path
import re

PERF_VERSION = "20260904-p8"
HINT_MARKER = "<!-- KaçaGider FAZ 8: Performance resource hints -->"
HINTS = f'''{HINT_MARKER}
<link rel="preconnect" href="https://www.googletagmanager.com">
<link rel="dns-prefetch" href="//www.googletagmanager.com">
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">
<link rel="dns-prefetch" href="//cfkrmzoghpoddkvzplyq.supabase.co">
'''

changed = []


def write_if_changed(path: Path, before: str, after: str):
    if before == after:
        return
    path.write_text(after, encoding="utf-8")
    changed.append(str(path))


def add_hints(path: Path, text: str) -> str:
    if HINT_MARKER in text:
        return text
    if "<head>" not in text:
        raise SystemExit(f"{path}: <head> bulunamadi")
    return text.replace("<head>", "<head>\n" + HINTS, 1)


# Core HTML/layout resource hints.
for filename in [
    "index.html",
    "_layouts/seo.html",
    "ilanlar/index.html",
    "ilan/index.html",
    "hesabim/index.html",
]:
    path = Path(filename)
    if not path.exists():
        raise SystemExit(f"{filename}: bulunamadi")
    before = path.read_text(encoding="utf-8")
    after = add_hints(path, before)

    if filename == "index.html":
        # Version the two synchronous pricing data files so normal browser caching
        # can be used without the old Date.now() reload cache-buster.
        after = after.replace(
            '<script src="data/phone-prices.js"></script>',
            f'<script src="data/phone-prices.js?v={PERF_VERSION}"></script>',
        )
        after = after.replace(
            '<script src="data/screen-repair-prices.js"></script>',
            f'<script src="data/screen-repair-prices.js?v={PERF_VERSION}"></script>',
        )

        # Remove the legacy full-page cache bypass that forced ?fresh=<timestamp>
        # on every manual reload. Versioned assets are the cache invalidation path.
        after = re.sub(
            r'\n<script>\s*\(function \(\) \{\s*try\{\s*var entries = performance\.getEntriesByType.*?\?fresh=.*?\}\s*catch \(e\) \{\}\s*\}\)\(\);\s*</script>\s*\n',
            "\n",
            after,
            count=1,
            flags=re.DOTALL,
        )

        # The first category image is a cheap, above-the-fold candidate; prioritize it.
        after = after.replace(
            '<img src="assets/categories/telefon.jpg" alt="Telefon">',
            '<img src="assets/categories/telefon.jpg" alt="Telefon" decoding="async" fetchpriority="high">',
        )
        for src, alt in [
            ("tablet.jpg", "Tablet"),
            ("bilgisayar.jpg", "Bilgisayar"),
            ("akilli-saat.jpg", "Akıllı Saat"),
            ("oyun-konsolu.jpg", "Oyun Konsolu"),
        ]:
            after = after.replace(
                f'<img src="assets/categories/{src}" alt="{alt}">',
                f'<img src="assets/categories/{src}" alt="{alt}" decoding="async">',
            )

        preload = '<link rel="preload" as="image" href="/assets/categories/telefon.jpg" fetchpriority="high">'
        if preload not in after:
            after = after.replace(HINTS, HINTS + preload + "\n", 1)

    write_if_changed(path, before, after)


# Marketplace list: async image decode everywhere, first rendered listing gets LCP priority.
path = Path("assets/marketplace-v2-list.js")
before = path.read_text(encoding="utf-8")
after = before
old_fallback = "function fallbackMedia(x,alt,hidden){const src=typeof window.getKgCategoryImage==='function'?window.getKgCategoryImage(x.category):'';return '<div class=\"kg-mpv2-placeholder\"'+(hidden?' style=\"display:none\"':'')+'>'+(src?'<img src=\"'+esc(src)+'\" alt=\"'+alt+'\" loading=\"lazy\">':(icon[x.category]||'📦'))+'</div>'}"
new_fallback = "function mediaAttrs(priority){return priority?' loading=\"eager\" fetchpriority=\"high\" decoding=\"async\"':' loading=\"lazy\" fetchpriority=\"low\" decoding=\"async\"'}\nfunction fallbackMedia(x,alt,hidden,priority){const src=typeof window.getKgCategoryImage==='function'?window.getKgCategoryImage(x.category):'';return '<div class=\"kg-mpv2-placeholder\"'+(hidden?' style=\"display:none\"':'')+'>'+(src?'<img src=\"'+esc(src)+'\" alt=\"'+alt+'\"'+mediaAttrs(priority)+'>':(icon[x.category]||'📦'))+'</div>'}"
old_media = "function media(x){const alt=esc(title(x)),photo=x.photos&&x.photos[0]?x.photos[0]:'';if(photo)return '<img src=\"'+esc(photo)+'\" alt=\"'+alt+'\" loading=\"lazy\" onerror=\"this.style.display=\\'none\\';this.nextElementSibling.style.display=\\'flex\\'\">'+fallbackMedia(x,alt,true);return fallbackMedia(x,alt,false)}"
new_media = "function media(x,priority){const alt=esc(title(x)),photo=x.photos&&x.photos[0]?x.photos[0]:'';if(photo)return '<img src=\"'+esc(photo)+'\" alt=\"'+alt+'\"'+mediaAttrs(priority)+' onerror=\"this.style.display=\\'none\\';this.nextElementSibling.style.display=\\'flex\\'\">'+fallbackMedia(x,alt,true,priority);return fallbackMedia(x,alt,false,priority)}"
if old_fallback in after:
    after = after.replace(old_fallback, new_fallback, 1)
if old_media in after:
    after = after.replace(old_media, new_media, 1)
after = after.replace("rows.map(({x,m})=>", "rows.map(({x,m},index)=>", 1)
after = after.replace("'+media(x)+'</div>", "'+media(x,index===0)+'</div>", 1)
write_if_changed(path, before, after)


# Marketplace detail: prioritize the main image; lazy-load only thumbnail images.
path = Path("assets/marketplace-v2-detail.js")
before = path.read_text(encoding="utf-8")
after = before
after = after.replace(
    "'<img id=\"mainPhoto\" src=\"'+esc(p[0])+'\" alt=\"'+esc(title(x))+'\">'",
    "'<img id=\"mainPhoto\" src=\"'+esc(p[0])+'\" alt=\"'+esc(title(x))+'\" loading=\"eager\" fetchpriority=\"high\" decoding=\"async\">'",
    1,
)
after = after.replace(
    "'<img id=\"mainPhoto\" src=\"'+esc(fallback)+'\" alt=\"'+esc(title(x))+'\">'",
    "'<img id=\"mainPhoto\" src=\"'+esc(fallback)+'\" alt=\"'+esc(title(x))+'\" loading=\"eager\" fetchpriority=\"high\" decoding=\"async\">'",
    1,
)
after = after.replace(
    "<img src=\"'+esc(src)+'\" alt=\"Fotoğraf '+(i+1)+'\">",
    "<img src=\"'+esc(src)+'\" alt=\"Fotoğraf '+(i+1)+'\" loading=\"lazy\" fetchpriority=\"low\" decoding=\"async\">",
    1,
)
write_if_changed(path, before, after)

print(f"PHASE 8 WIRE: {len(changed)} file(s) updated")
for item in changed:
    print(" -", item)
