from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def write(rel, text):
    (ROOT / rel).write_text(text, encoding="utf-8")


def replace_if_present(text, old, new):
    return text.replace(old, new) if old in text else text


# 1) Homepage: broaden positioning from phone-only to the five core categories
# and remove estimator language from user-facing SEO metadata/schema.
index = read("index.html")
index = replace_if_present(
    index,
    "<title>İkinci El Telefon Fiyatları – Telefonun Kaç Para Eder? | KaçaGider</title>",
    "<title>İkinci El Cihaz Değeri: Telefon, Tablet, Bilgisayar | KaçaGider</title>",
)
old_desc = "Telefonunun ikinci el değerini saniyeler içinde öğren. iPhone, Samsung, Xiaomi ve diğer modeller için güncel tahmini fiyatını KaçaGider ile hesapla."
new_desc = "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolunun güncel ikinci el piyasa değerini öğren; doğru satış fiyatına yaklaşmak için KaçaGider ile karşılaştır."
index = index.replace(old_desc, new_desc)
index = replace_if_present(
    index,
    "İkinci el telefon ve elektronik ürünler için tahmini piyasa değeri hesaplama platformu.",
    "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel ikinci el piyasa değeri ve satış kararı platformu.",
)
index = replace_if_present(
    index,
    "Kullanıcının ürün, model, hafıza ve kondisyon bilgilerine göre ikinci el piyasa değeri tahmini sunan web uygulaması.",
    "Kullanıcının ürün, model, kapasite ve kondisyon bilgilerini güncel piyasa verileriyle değerlendirerek ikinci el piyasa değerini anlamasına yardımcı olan web uygulaması.",
)
index = replace_if_present(
    index,
    "Telefonun Kaç Para Eder? <span>Güncel İkinci El Telefon Değerini Öğren</span>",
    "İkinci El Değerini Öğren. <span>Doğru Fiyata Sat.</span>",
)
index = replace_if_present(
    index,
    "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel piyasa verileriyle anında fiyat tahmini al.",
    "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel piyasa verilerini değerlendir; cihazının ikinci el piyasa değerini öğren.",
)
write("index.html", index)


# 2) Global SEO layout: same market-value language, Organization/WebPage entities,
# and no generic FAQPage rich-result markup.
layout = read("_layouts/seo.html")
layout = replace_if_present(
    layout,
    "İkinci el telefon ve elektronik ürünler için tahmini piyasa değeri hesaplama platformu.",
    "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel ikinci el piyasa değeri ve satış kararı platformu.",
)
layout = replace_if_present(
    layout,
    "Kullanıcının ürün, model, hafıza ve kondisyon bilgilerine göre ikinci el piyasa değeri tahmini sunan web uygulaması.",
    "Kullanıcının ürün, model, kapasite ve kondisyon bilgilerini güncel piyasa verileriyle değerlendirerek ikinci el piyasa değerini anlamasına yardımcı olan web uygulaması.",
)

# Remove only FAQPage JSON-LD. Visible FAQ content may stay when it is useful to users.
layout = re.sub(
    r"\{% if page\.seo_faqs %\}<script type=\"application/ld\+json\">\{\"@context\":\"https://schema\.org\",\"@type\":\"FAQPage\"[\s\S]*?</script>\{% endif %\}\s*",
    "",
    layout,
    count=1,
)

if '"@id": "https://kacagider.com.tr/#organization"' not in layout:
    entities = r'''
<script type="application/ld+json" id="kg-organization-schema">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://kacagider.com.tr/#organization",
  "name": "KaçaGider",
  "alternateName": "KaçaGider.com.tr",
  "url": "https://kacagider.com.tr/",
  "email": "info@kacagider.com.tr"
}
</script>
<script type="application/ld+json" id="kg-webpage-schema">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "{{ page.seo_canonical }}#webpage",
  "url": "{{ page.seo_canonical }}",
  "name": {{ page.seo_title | jsonify }},
  "description": {{ page.seo_description | jsonify }},
  "inLanguage": "tr-TR",
  "isPartOf": {"@id":"https://kacagider.com.tr/#website"},
  "about": {"@id":"https://kacagider.com.tr/#organization"}
}
</script>
'''
    layout = layout.replace("</head>", entities + "\n</head>", 1)

# Add stable @id/publisher/provider relationships where the existing schemas permit it.
layout = layout.replace(
    '"@type": "WebSite",\n  "name": "KaçaGider",',
    '"@type": "WebSite",\n  "@id": "https://kacagider.com.tr/#website",\n  "name": "KaçaGider",',
    1,
)
layout = layout.replace(
    '"description": "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel ikinci el piyasa değeri ve satış kararı platformu."\n}',
    '"description": "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel ikinci el piyasa değeri ve satış kararı platformu.",\n  "publisher": {"@id":"https://kacagider.com.tr/#organization"}\n}',
    1,
)
layout = layout.replace(
    '"description": "Kullanıcının ürün, model, kapasite ve kondisyon bilgilerini güncel piyasa verileriyle değerlendirerek ikinci el piyasa değerini anlamasına yardımcı olan web uygulaması."\n}',
    '"description": "Kullanıcının ürün, model, kapasite ve kondisyon bilgilerini güncel piyasa verileriyle değerlendirerek ikinci el piyasa değerini anlamasına yardımcı olan web uygulaması.",\n  "provider": {"@id":"https://kacagider.com.tr/#organization"}\n}',
    1,
)
write("_layouts/seo.html", layout)


# 3) Generator: future regenerations must not restore old copy, FAQ rich-result markup,
# or duplicate-intent pilot pages.
gen = read("scripts/generate-seo-static-pages.mjs")

seo_copy_pattern = re.compile(r"function seoCopy\(\{kind,model,variant,brand\}\)\{[\s\S]*?\n\}")
seo_copy_replacement = '''function seoCopy({kind,model,variant,brand}){
  const config=categoryConfig[kind];
  const subject=seoSubject({brand,model,variant});
  if(variant) return `${subject} güncel ikinci el piyasa değerini ${config.context} ve Türkiye ikinci el piyasa verileriyle KaçaGider üzerinden değerlendirin.`;
  if(model) return `${subject} ikinci el piyasa değerini ${config.context} ve güncel piyasa verileriyle KaçaGider üzerinden inceleyin.`;
  if(brand) return `${brand} ${config.name} modellerinin güncel ikinci el piyasa değerini model, ${config.context} ve piyasa koşullarına göre KaçaGider ile inceleyin.`;
  return `${config.plural} ikinci el piyasa değerlerini güncel piyasa verileri ve ürün kondisyonuna göre KaçaGider ile değerlendirin.`;
}'''
gen = seo_copy_pattern.sub(seo_copy_replacement, gen, count=1)

gen = gen.replace(
    "<title>İkinci El Telefon Fiyatları – Telefonun Kaç Para Eder? | KaçaGider</title>",
    "<title>İkinci El Cihaz Değeri: Telefon, Tablet, Bilgisayar | KaçaGider</title>",
)
gen = gen.replace(old_desc, new_desc)
gen = gen.replace(
    "Telefonun Kaç Para Eder? <span>Güncel İkinci El Telefon Değerini Öğren</span>",
    "İkinci El Değerini Öğren. <span>Doğru Fiyata Sat.</span>",
)
gen = gen.replace(
    "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel piyasa verileriyle anında fiyat tahmini al.",
    "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel piyasa verilerini değerlendir; cihazının ikinci el piyasa değerini öğren.",
)
# Keep visible FAQs if content editors need them, but don't emit FAQPage JSON-LD.
gen = gen.replace("breadcrumbSchema+faqSchema+'</head>'", "breadcrumbSchema+'</head>'")

# Stop generation of old pilot/doorway-style duplicate-intent pages. Existing live URLs are
# intentionally left in place until Search Console/backlink data is reviewed before consolidation.
gen = re.sub(
    r"const phaseOnePilotPages=\[[\s\S]*?\n\];\nfor\(const page of phaseOnePilotPages\) addPage\(page\.url,page\.meta\);",
    "const phaseOnePilotPages=[];\nfor(const page of phaseOnePilotPages) addPage(page.url,page.meta);",
    gen,
    count=1,
)
write("scripts/generate-seo-static-pages.mjs", gen)

print("SEO 2026 strategy applied to index.html, _layouts/seo.html and generator.")
print("Next: run python3 scripts/seo-site-audit.py and inspect warnings before committing generated changes.")
