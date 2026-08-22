from pathlib import Path

LAYOUT = Path('_layouts/seo.html')
MARKER = 'id="kg-social-image-meta"'
ANCHOR = '<meta property="og:type" content="website">\n'

BLOCK = '''{% assign kg_share_image = page.seo_image %}
{% unless kg_share_image %}
  {% if page.seo_canonical contains '/tablet/' %}
    {% assign kg_share_image = '/assets/categories/tablet.jpg' %}
  {% elsif page.seo_canonical contains '/bilgisayar/' %}
    {% assign kg_share_image = '/assets/categories/bilgisayar.jpg' %}
  {% elsif page.seo_canonical contains '/akilli-saat/' %}
    {% assign kg_share_image = '/assets/categories/akilli-saat.jpg' %}
  {% elsif page.seo_canonical contains '/oyun-konsolu/' %}
    {% assign kg_share_image = '/assets/categories/oyun-konsolu.jpg' %}
  {% else %}
    {% assign kg_share_image = '/assets/categories/telefon.jpg' %}
  {% endif %}
{% endunless %}
{% assign kg_share_image_absolute = kg_share_image | prepend: 'https://kacagider.com.tr' %}
<meta id="kg-social-image-meta" property="og:image" content="{{ kg_share_image_absolute }}">
<meta property="og:image:secure_url" content="{{ kg_share_image_absolute }}">
<meta property="og:image:alt" content="{{ page.seo_h1 | default: page.seo_title }}">
<meta name="twitter:image" content="{{ kg_share_image_absolute }}">
<meta name="twitter:image:alt" content="{{ page.seo_h1 | default: page.seo_title }}">
'''

text = LAYOUT.read_text(encoding='utf-8')

if MARKER in text:
    print('Social image metadata already present; no layout change needed.')
elif ANCHOR not in text:
    raise SystemExit('Expected Open Graph anchor not found; layout left untouched.')
else:
    updated = text.replace(ANCHOR, BLOCK + ANCHOR, 1)
    updated = updated.replace(
        '<meta name="twitter:card" content="summary">',
        '<meta name="twitter:card" content="summary_large_image">',
        1,
    )
    LAYOUT.write_text(updated, encoding='utf-8')
    print('Category-based Open Graph and Twitter image metadata added.')
