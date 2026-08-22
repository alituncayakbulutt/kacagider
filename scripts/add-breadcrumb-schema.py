from pathlib import Path

# AŞAMA 2B: mevcut seo_breadcrumbs verisini görünür yapıyı değiştirmeden JSON-LD'ye çevirir.
LAYOUT = Path('_layouts/seo.html')
MARKER = 'id="kg-breadcrumb-schema"'
ANCHOR = '''<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "KaçaGider",
  "url": "https://kacagider.com.tr/",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "inLanguage": "tr-TR",
  "description": "Kullanıcının ürün, model, hafıza ve kondisyon bilgilerine göre ikinci el piyasa değeri tahmini sunan web uygulaması."
}
</script>
'''

BREADCRUMB_SCHEMA = '''
{% if page.seo_breadcrumbs and page.seo_breadcrumbs.size > 1 %}
<script type="application/ld+json" id="kg-breadcrumb-schema">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {% for crumb in page.seo_breadcrumbs %}
    {
      "@type": "ListItem",
      "position": {{ forloop.index }},
      "name": {{ crumb.label | jsonify }},
      "item": {{ crumb.url | prepend: "https://kacagider.com.tr" | jsonify }}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ]
}
</script>
{% endif %}
'''

text = LAYOUT.read_text(encoding='utf-8')

if MARKER in text:
    print('Breadcrumb schema already present; no layout change needed.')
elif ANCHOR not in text:
    raise SystemExit('Expected WebApplication anchor not found; layout left untouched.')
else:
    updated = text.replace(ANCHOR, ANCHOR + BREADCRUMB_SCHEMA, 1)
    LAYOUT.write_text(updated, encoding='utf-8')
    print('BreadcrumbList schema added to SEO layout.')
