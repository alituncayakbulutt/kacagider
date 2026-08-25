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

# Stable entity IDs help Google connect the brand, website and application.
index = index.replace(
    '"@type": "WebSite",\n  "name": "KaçaGider",',
    '"@type": "WebSite",\n  "@id": "https://kacagider.com.tr/#website",\n  "name": "KaçaGider",',
    1,
)
index = index.replace(
    '"description": "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel ikinci el piyasa değeri ve satış kararı platformu."\n}',
    '"description": "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel ikinci el piyasa değeri ve satış kararı platformu.",\n  "publisher": {"@id":"https://kacagider.com.tr/#organization"}\n}',
    1,
)
index = index.replace(
    '"description": "Kullanıcının ürün, model, kapasite ve kondisyon bilgilerini güncel piyasa verileriyle değerlendirerek ikinci el piyasa değerini anlamasına yardımcı olan web uygulaması."\n}',
    '"description": "Kullanıcının ürün, model, kapasite ve kondisyon bilgilerini güncel piyasa verileriyle değerlendirerek ikinci el piyasa değerini anlamasına yardımcı olan web uygulaması.",\n  "provider": {"@id":"https://kacagider.com.tr/#organization"}\n}',
    1,
)
if '"@id": "https://kacagider.com.tr/#organization"' not in index:
    org = r'''
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
'''
    index = index.replace("</head>", org + "\n</head>", 1)
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
# duplicate-intent pilot pages, or generic category-root titles.
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

page_meta_pattern = re.compile(r"function pageMeta\(\{kind,brand,model,variant,url,breadcrumbs,links,linksHeading\}\)\{[\s\S]*?\n\}")
page_meta_replacement = '''function pageMeta({kind,brand,model,variant,url,breadcrumbs,links,linksHeading}){
  const config=categoryConfig[kind];
  const subject=[model,variant].filter(Boolean).join(" ") || (brand ? `${brand} ${config.name}` : config.name);
  const plural=!model && !variant;
  const priceText=plural ? "İkinci El Fiyatları" : "İkinci El Fiyatı";
  let h1=`${subject} ${priceText}`;
  let title=`${h1} 2026 | KaçaGider`;
  let description=seoCopy({kind,brand,model,variant});
  let intro=description;
  let contextHeading=`${subject} için ikinci el değerleme`;
  let context=seoCopy({kind,brand,model,variant});

  if(!brand&&!model&&!variant){
    const roots={
      phone:{title:"Telefonum Ne Kadar Eder? 2026 İkinci El Fiyatları | KaçaGider",h1:"Telefonum Ne Kadar Eder? 2026 İkinci El Telefon Fiyatları",description:"Telefonum ne kadar eder, kaç para eder veya kaça satılır? Marka, model, hafıza ve kondisyonu seç; 2026 güncel ikinci el piyasa değerini ücretsiz öğren."},
      tablet:{title:"Tabletim Ne Kadar Eder? İkinci El Tablet Fiyatları | KaçaGider",h1:"Tabletim Ne Kadar Eder? İkinci El Tablet Fiyatları",description:"Tabletim ne kadar eder, tabletimi kaça satarım? iPad, Samsung, Xiaomi, Huawei, Lenovo ve Honor modellerinde güncel ikinci el piyasa değerini öğren."},
      computer:{title:"Bilgisayarım Ne Kadar Eder? İkinci El Laptop Fiyatları | KaçaGider",h1:"Bilgisayarım Ne Kadar Eder? İkinci El Laptop Fiyatları",description:"Bilgisayarım ne kadar eder, laptopumu kaça satarım? MacBook, Asus, Lenovo, HP, Dell, MSI ve diğer modellerde güncel ikinci el piyasa değerini öğren."},
      watch:{title:"Akıllı Saatim Ne Kadar Eder? İkinci El Saat Fiyatları | KaçaGider",h1:"Akıllı Saatim Ne Kadar Eder? İkinci El Saat Fiyatları",description:"Akıllı saatim ne kadar eder, saatimi kaça satarım? Apple Watch, Samsung Galaxy Watch ve Huawei modellerinde güncel ikinci el piyasa değerini öğren."},
      console:{title:"PS5 / Xbox Ne Kadar Eder? İkinci El Konsol Fiyatları | KaçaGider",h1:"PS5 / Xbox Ne Kadar Eder? İkinci El Konsol Fiyatları",description:"PS5 veya Xbox ne kadar eder, konsolumu kaça satarım? PlayStation ve Xbox modellerinde güncel ikinci el piyasa değerini ücretsiz öğren."}
    };
    const root=roots[kind];
    if(root){title=root.title;h1=root.h1;description=root.description;intro=root.description;contextHeading=`${config.name} ikinci el piyasa değeri`;context=seoCopy({kind,brand,model,variant});}
  }

  return {layout:"seo",seo_title:title,seo_description:description,seo_h1:h1,seo_intro:intro,seo_context_heading:contextHeading,seo_context:context,seo_breadcrumbs:breadcrumbs,seo_links:links,seo_links_heading:linksHeading,seo_canonical:absolute(url)};
}'''
gen = page_meta_pattern.sub(page_meta_replacement, gen, count=1)

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
