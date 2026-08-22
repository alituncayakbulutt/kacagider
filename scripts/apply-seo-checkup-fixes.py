from pathlib import Path

changed = []

# 1) Keep the valuation engine consistent on SEO landing/model pages.
layout = Path("_layouts/seo.html")
text = layout.read_text(encoding="utf-8")
needle = '<script src="data/phone-prices.js"></script>\n'
insert = needle + '<script src="data/screen-repair-prices.js"></script>\n'
if 'data/screen-repair-prices.js' not in text:
    if needle not in text:
        raise SystemExit("SEO checkup: phone-prices script anchor not found in _layouts/seo.html")
    text = text.replace(needle, insert, 1)
    layout.write_text(text, encoding="utf-8")
    changed.append(str(layout))

# 2) Give the homepage the same social-preview image coverage as SEO pages.
index = Path("index.html")
text = index.read_text(encoding="utf-8")
if 'property="og:image"' not in text:
    anchor = '<meta property="og:url" content="https://kacagider.com.tr/">\n'
    social = anchor + (
        '<meta property="og:image" content="https://kacagider.com.tr/assets/categories/telefon.jpg">\n'
        '<meta property="og:image:secure_url" content="https://kacagider.com.tr/assets/categories/telefon.jpg">\n'
        '<meta property="og:image:alt" content="KaçaGider ikinci el telefon değeri hesaplama">\n'
        '<meta name="twitter:image" content="https://kacagider.com.tr/assets/categories/telefon.jpg">\n'
        '<meta name="twitter:image:alt" content="KaçaGider ikinci el telefon değeri hesaplama">\n'
    )
    if anchor not in text:
        raise SystemExit("SEO checkup: homepage og:url anchor not found")
    text = text.replace(anchor, social, 1)

if '<meta name="twitter:card" content="summary">' in text:
    text = text.replace(
        '<meta name="twitter:card" content="summary">',
        '<meta name="twitter:card" content="summary_large_image">',
        1,
    )

new_text = text
old_text = index.read_text(encoding="utf-8")
if new_text != old_text:
    index.write_text(new_text, encoding="utf-8")
    changed.append(str(index))

print("SEO checkup fixes:", ", ".join(changed) if changed else "no changes needed")
