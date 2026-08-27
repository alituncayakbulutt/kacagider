import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root=process.cwd();
const siteUrl="https://kacagider.com.tr";
const generatedAt=new Date().toISOString().slice(0,10);

function elementStub(){
  const state={style:{},dataset:{},classList:{add(){},remove(){},toggle(){return false;}},addEventListener(){},removeEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},appendChild(){},remove(){},closest(){return null;},focus(){},blur(){}};
  return new Proxy(state,{get(target,key){return key in target ? target[key] : "";},set(target,key,value){target[key]=value;return true;}});
}

function getCatalogRuntime(indexSource,priceSource){
  const documentElement=elementStub();
  const context={
    console:{log(){},warn(){},error(){}}, URL, URLSearchParams, Math, Number, String, Object, Array, Set, Map, JSON, Date,
    fetch:async()=>({ok:false,json:async()=>[],text:async()=>""}), alert(){}, performance:{getEntriesByType(){return[];}},
    localStorage:{getItem(){return null;},setItem(){}},
    document:{documentElement,body:elementStub(),getElementById(){return elementStub();},querySelector(){return null;},querySelectorAll(){return[];},addEventListener(){}},
    window:{location:{pathname:"/",href:siteUrl+"/",replace(){}},history:{replaceState(){}},addEventListener(){}},
    setTimeout(){return 0;}, clearTimeout(){}, requestAnimationFrame(){},
  };
  context.window.window=context.window;
  vm.createContext(context);
  vm.runInContext(priceSource,context,{filename:"data/phone-prices.js"});
  const scripts=[...indexSource.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .filter(match=>!/<script[^>]+(?:src=|type="application\/ld\+json")/.test(match[0]))
    .map(match=>match[1]);
  for(const script of scripts){
    try{vm.runInContext(script,context,{filename:"index.html"});}catch(error){
      // Sayfa davranışı için gereken DOM kodu katalog verisini etkilemez; sonraki scriptleri yürütmeye devam et.
    }
  }
  vm.runInContext("globalThis.__kgSeoCatalog={PHONE_CATALOG,STATIC_CATALOG,PHONE_STORAGE_OPTIONS_BY_BRAND,TABLET_STORAGE_OPTIONS,COMPUTER_STORAGE_OPTIONS,WATCH_VARIANT_OPTIONS,CONSOLE_STORAGE_OPTIONS};",context);
  return context.__kgSeoCatalog;
}

function slug(value){
  return String(value).toLocaleLowerCase("tr-TR")
    .replace(/ı/g,"i").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ö/g,"o").replace(/ç/g,"c")
    .replace(/\+/g," plus ").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}

function storageLabel(value,kind){
  const numeric=Number(value);
  if(kind==="watch") return `${numeric} mm`;
  if(numeric===1000 || numeric===1024) return "1 TB";
  if(numeric===2000 || numeric===2048) return "2 TB";
  if(numeric===4000) return "4 TB";
  return `${numeric} GB`;
}

function variantUrlPart(value,kind){
  const numeric=Number(value);
  if(kind==="watch") return `${numeric}mm`;
  if(numeric===1000 || numeric===1024) return "1tb";
  if(numeric===2000 || numeric===2048) return "2tb";
  if(numeric===4000) return "4tb";
  return `${numeric}gb`;
}

function yaml(value){return JSON.stringify(value);}
function pagePath(...parts){return "/"+parts.filter(Boolean).map(slug).join("/")+"/";}
function absolute(url){return siteUrl+url;}

const categoryConfig={
  phone:{path:"telefon",name:"Telefon",plural:"Telefon",variantTerm:"hafıza",context:"hafıza, kondisyon ve cihaz kayıt durumu",catalogKey:"PHONE_CATALOG"},
  tablet:{path:"tablet",name:"Tablet",plural:"Tablet",variantTerm:"kapasite",context:"kapasite ve kondisyon",catalogKey:"STATIC_CATALOG"},
  computer:{path:"bilgisayar",name:"Bilgisayar",plural:"Bilgisayar",variantTerm:"kapasite",context:"kapasite ve kondisyon",catalogKey:"STATIC_CATALOG"},
  watch:{path:"akilli-saat",name:"Akıllı Saat",plural:"Akıllı Saat",variantTerm:"kasa boyutu",context:"kasa boyutu ve kondisyon",catalogKey:"STATIC_CATALOG"},
  console:{path:"oyun-konsolu",name:"Oyun Konsolu",plural:"Oyun Konsolu",variantTerm:"depolama",context:"depolama ve kondisyon",catalogKey:"STATIC_CATALOG"}
};

function seoSubject({brand,model,variant}){
  const normalizedBrand=String(brand||"").toLocaleLowerCase("tr-TR");
  const normalizedModel=String(model||"").toLocaleLowerCase("tr-TR");
  const modelWithBrand=brand&&model&&normalizedModel.includes(normalizedBrand)
    ? model
    : [brand,model].filter(Boolean).join(" ");
  return [modelWithBrand,variant].filter(Boolean).join(" ");
}

const categoryLandingConfig={
  phone:{url:"/telefonum-ne-kadar-eder/",title:"Telefonum Ne Kadar Eder? İkinci El Değerini Hesapla | KaçaGider",h1:"Telefonum Ne Kadar Eder?"},
  tablet:{url:"/tabletim-ne-kadar-eder/",title:"Tabletim Ne Kadar Eder? İkinci El Değerini Hesapla | KaçaGider",h1:"Tabletim Ne Kadar Eder?"},
  computer:{url:"/bilgisayarim-ne-kadar-eder/",title:"Bilgisayarım Ne Kadar Eder? İkinci El Değerini Hesapla | KaçaGider",h1:"Bilgisayarım Ne Kadar Eder?"},
  watch:{url:"/akilli-saatim-ne-kadar-eder/",title:"Akıllı Saatim Ne Kadar Eder? İkinci El Değerini Hesapla | KaçaGider",h1:"Akıllı Saatim Ne Kadar Eder?"},
  console:{url:"/oyun-konsolum-ne-kadar-eder/",title:"Oyun Konsolum Ne Kadar Eder? İkinci El Değerini Hesapla | KaçaGider",h1:"Oyun Konsolum Ne Kadar Eder?"}
};

function modelSeoMeta({kind,brand,model,variant,url,breadcrumbs,variants,links=[]}){
  const config=categoryConfig[kind];
  const normalizedBrand=String(brand||"").toLocaleLowerCase("tr-TR");
  const normalizedModel=String(model||"").toLocaleLowerCase("tr-TR");
  const brandInModel=Boolean(brand&&model&&normalizedModel.includes(normalizedBrand));
  const subject=brandInModel?model:`${brand} ${model}`;
  const displaySubject=variant?`${subject} ${variant}`:subject;
  const optionText=[...new Set((variants||[]).map(Number))].filter(Number.isFinite).map(value=>storageLabel(value,kind)).join(", ");
  const description=`${displaySubject} ne kadar eder? ${optionText?`${optionText} seçeneklerinde `:""}${displaySubject} ikinci el fiyatı ve piyasa değeri, ${config.context} dikkate alınarak KaçaGider ile ücretsiz hesaplanır.`;
  const related=[{label:`${config.name} değerleme`,url:`/${config.path}/`},{label:"İkinci el fiyat nasıl hesaplanır?",url:"/ikinci-el-fiyat-nasil-hesaplanir/"},...links];
  const uniqueLinks=[...new Map(related.map(link=>[link.url,link])).values()];
  return {layout:"seo",seo_title:`${displaySubject} Ne Kadar Eder? ${brandInModel?"Güncel İkinci El Fiyatı":"İkinci El Fiyatı"} | KaçaGider`,seo_description:description,seo_h1:variant?`${displaySubject} İkinci El Fiyatı`:`${subject} Ne Kadar Eder?`,seo_intro:`${displaySubject} için güncel ikinci el değerini, gerçek cihaz bilgileri ve kondisyon ayrıntılarıyla KaçaGider üzerinden inceleyin.`,seo_context_heading:`${displaySubject} için güncel değerleme`,seo_context:`${displaySubject} değeri; ${config.context} ile birlikte güncel piyasa koşullarına göre değişebilir.`,seo_breadcrumbs:breadcrumbs,seo_links:uniqueLinks,seo_links_heading:`${displaySubject} ilgili sayfalar`,seo_canonical:absolute(url),seo_cta:{url:`/${config.path}/`,label:`${config.name} değerini hesapla`},seo_sections:[
    {title:`${displaySubject} Kaça Satılır?`,text:`${displaySubject} için tek bir sabit satış fiyatı yoktur. Cihazın kondisyonu, özellikleri ve güncel piyasa koşulları gerçek satış değerini etkiler.`},
    {title:`${displaySubject} İkinci El Fiyatı`,text:`${displaySubject} ikinci el fiyatı, mevcut seçenekler ve cihazın kullanım durumuna göre değerlendirilir.${optionText?` Bu sayfada bulunan seçenekler: ${optionText}.`:""}`},
    {title:`${displaySubject} Piyasa Değeri`,text:`KaçaGider piyasa değeri, seçilen ürün bilgilerini ve ${config.context} ayrıntılarını birlikte değerlendirerek bir başlangıç referansı sunar.`},
    {title:`${displaySubject} Değeri Nasıl Hesaplanır?`,text:`Marka, model, ${config.variantTerm} ve kondisyon bilgilerini değerleme ekranında seçin. Sonuç, cihazın gerçek durumu ile piyasa koşullarına göre değişebilir.`}
  ],seo_faqs:[
    {question:`${displaySubject} ne kadar eder?`,answer:`Güncel değeri öğrenmek için ${config.name} değerleme ekranında model ve cihaz bilgilerini seçin.`},
    {question:`${displaySubject} kaça satılır?`,answer:`Satış değeri; kondisyon, özellikler ve güncel piyasa koşullarına göre değişir.`},
    {question:`${displaySubject} ikinci el fiyatı nasıl hesaplanır?`,answer:`${config.context} bilgileri ve seçilen ürün özellikleri birlikte değerlendirilir.`},
    {question:`${displaySubject} piyasa değeri neden değişir?`,answer:`Piyasa hareketleri, cihaz kondisyonu ve özelliklerdeki farklılıklar değeri etkileyebilir.`},
    ...(optionText?[{question:`${displaySubject} hangi seçeneklerle değerlendirilir?`,answer:`Bu sayfada kullanılabilen seçenekler: ${optionText}.`}]:[])
  ]};
}

function landingMeta({kind}){
  const config=categoryConfig[kind];
  const landing=categoryLandingConfig[kind];
  const url=landing.url;
  return {layout:"seo",seo_title:landing.title,seo_description:`${config.name} ikinci el değerini ve güncel piyasa fiyatını KaçaGider ile öğren. ${config.name} özelliklerini seçerek ücretsiz değerleme yap.`,seo_h1:landing.h1,seo_intro:`${config.name} cihazınızın güncel ikinci el değerini, gerçek ürün bilgileri ve kondisyonunu seçerek KaçaGider ile inceleyin.`,seo_context_heading:`${config.name} değerleme rehberi`,seo_context:`${config.name} piyasa değeri; model, ${config.context} ve güncel piyasa koşullarına göre değerlendirilir.`,seo_breadcrumbs:[{label:"Ana Sayfa",url:"/"},{label:config.name,url:`/${config.path}/`},{label:landing.h1,url}],seo_links:[{label:`${config.name} değerleme aracını aç`,url:`/${config.path}/`},{label:"İkinci el fiyat nasıl hesaplanır?",url:"/ikinci-el-fiyat-nasil-hesaplanir/"}],seo_links_heading:"İlgili sayfalar",seo_canonical:absolute(url),seo_cta:{url:`/${config.path}/`,label:`${config.name} değerini hesapla`},seo_sections:[{title:`${config.name} ikinci el fiyatı nasıl belirlenir?`,text:`Model, ${config.context} ve güncel piyasa koşulları birlikte değerlendirilir. KaçaGider sonucu satış garantisi değil, karar vermeye yardımcı bir piyasa referansıdır.`},{title:`${config.name} değerini hesaplarken nelere dikkat edilmeli?`,text:`Ürünün gerçek modelini ve kapasite/özellik bilgilerini doğru seçin; kondisyon ve çalışmayan özellikleri olduğu gibi belirtin.`},{title:`${config.name} satmadan önce`,text:"Kişisel verileri yedekleyin, hesaplarınızdan çıkış yapın ve cihazı teslim etmeden önce gerekli sıfırlama adımlarını kontrol edin."}],seo_faqs:[{question:`${config.name} kaç para eder?`,answer:`Model ve kondisyon bilgilerini KaçaGider değerleme aracında seçerek güncel piyasa referansını inceleyebilirsiniz.`},{question:`${config.name} değeri neye göre değişir?`,answer:`Model, kapasite veya ürün özelliği, kondisyon ve piyasa koşulları birlikte etkili olur.`}]};
}

function infoMeta(){
  const url="/ikinci-el-fiyat-nasil-hesaplanir/";
  const links=Object.values(categoryLandingConfig).map(landing=>({label:landing.h1,url:landing.url}));
  return {layout:"seo",seo_title:"İkinci El Fiyat Nasıl Hesaplanır? | KaçaGider",seo_description:"İkinci el telefon, tablet, bilgisayar, akıllı saat ve oyun konsolu fiyatlarının hangi bilgilerle hesaplandığını öğrenin.",seo_h1:"İkinci El Fiyat Nasıl Hesaplanır?",seo_intro:"İkinci el piyasa değeri; ürünün modeli, kapasitesi ve gerçek kondisyonu birlikte değerlendirilerek anlaşılır.",seo_context_heading:"KaçaGider değerleme yaklaşımı",seo_context:"KaçaGider, kullanıcı tarafından seçilen ürün bilgilerini ve kondisyon ayrıntılarını güncel piyasa referansı olarak değerlendirir.",seo_breadcrumbs:[{label:"Ana Sayfa",url:"/"},{label:"İkinci El Fiyat Nasıl Hesaplanır?",url}],seo_links:links,seo_links_heading:"Kategori değerleme sayfaları",seo_canonical:absolute(url),seo_sections:[{title:"Model ve kapasite",text:"Aynı ürün ailesindeki model ve kapasite farkları ikinci el değerini değiştirebilir. Bu nedenle değerleme sırasında doğru seçenekleri seçmek önemlidir."},{title:"Kondisyon bilgileri",text:"Ekran, kasa, pil, çalışmayan özellikler ve kullanım durumu gibi gerçek bilgiler sonucu etkileyebilir."},{title:"Piyasa koşulları",text:"Gösterilen değer güncel piyasa koşullarına göre bir referanstır; gerçek satış fiyatı ürünün durumuna ve satış şartlarına göre değişebilir."}],seo_faqs:[{question:"İkinci el fiyat hangi bilgilere göre hesaplanır?",answer:"Model, kapasite veya ilgili ürün özelliği, kondisyon ve güncel piyasa koşulları birlikte değerlendirilir."},{question:"KaçaGider sonucu kesin satış fiyatı mı?",answer:"Hayır. Sonuç, gerçek satış kararına yardımcı olan güncel bir piyasa referansıdır."}]};
}

function seoCopy({kind,model,variant,brand}){
  const config=categoryConfig[kind];
  const subject=seoSubject({brand,model,variant});
  if(variant) return `${subject} güncel ikinci el piyasa değerini ${config.context} ve Türkiye ikinci el piyasa verileriyle KaçaGider üzerinden değerlendirin.`;
  if(model) return `${subject} ikinci el piyasa değerini ${config.context} ve güncel piyasa verileriyle KaçaGider üzerinden inceleyin.`;
  if(brand) return `${brand} ${config.name} modellerinin güncel ikinci el piyasa değerini model, ${config.context} ve piyasa koşullarına göre KaçaGider ile inceleyin.`;
  return `${config.plural} ikinci el piyasa değerlerini güncel piyasa verileri ve ürün kondisyonuna göre KaçaGider ile değerlendirin.`;
}

function pageMeta({kind,brand,model,variant,url,breadcrumbs,links,linksHeading}){
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
}

function documentText(meta){
  return "---\n"+Object.entries(meta).map(([key,value])=>`${key}: ${yaml(value)}`).join("\n")+"\n---\n";
}

function layoutFrom(index){
  const seoCss=`
/* Yalnızca SEO sayfalarının breadcrumb ve bağlamsal içeriği. */
.kg-seo-breadcrumb{max-width:1180px;margin:18px auto 0;padding:0 20px;color:#667085;font-size:13px;line-height:1.5}.kg-seo-breadcrumb a{color:#087a37;text-decoration:none;font-weight:700}.kg-seo-breadcrumb a:hover{text-decoration:underline}.kg-seo-breadcrumb span{margin:0 7px;color:#98a2b3}.kg-seo-context{max-width:1180px;margin:20px auto 0;padding:18px 20px;border:1px solid #dfe7ef;border-radius:14px;background:#fff}.kg-seo-context h2{margin:0 0 8px;font-size:20px;color:#111827}.kg-seo-context p{margin:0;color:#667085;line-height:1.65}.kg-seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.kg-seo-links a{border:1px solid #cfe7d8;border-radius:999px;padding:7px 10px;color:#087a37;background:#f4fcf7;text-decoration:none;font-size:13px;font-weight:700}.kg-seo-links a:hover{background:#e7f8ec}@media(max-width:720px){.kg-seo-breadcrumb{padding:0 12px}.kg-seo-context{margin:16px 12px 0;padding:16px}.kg-seo-context h2{font-size:18px}}
`;
  const breadcrumbMarkup=`
{% if page.seo_breadcrumbs %}<nav class="kg-seo-breadcrumb" aria-label="Breadcrumb">{% for crumb in page.seo_breadcrumbs %}{% unless forloop.first %}<span aria-hidden="true">›</span>{% endunless %}<a href="{{ crumb.url }}">{{ crumb.label }}</a>{% endfor %}</nav>{% endif %}
`;
  const contextMarkup=`
{% if page.seo_context %}<section class="kg-seo-context" aria-label="Sayfa bilgisi"><h2>{{ page.seo_context_heading }}</h2><p>{{ page.seo_context }}</p>{% if page.seo_links %}<div class="kg-seo-links" aria-label="İlgili sayfalar">{% for link in page.seo_links %}<a href="{{ link.url }}">{{ link.label }}</a>{% endfor %}</div>{% endif %}</section>{% endif %}
`;
  const breadcrumbSchema=`
{% if page.seo_breadcrumbs %}<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{% for crumb in page.seo_breadcrumbs %}{"@type":"ListItem","position":{{ forloop.index }},"name":{{ crumb.label | jsonify }},"item":"https://kacagider.com.tr{{ crumb.url }}"}{% unless forloop.last %},{% endunless %}{% endfor %}]}</script>{% endif %}
`;
  const phaseOneSeoCss=`
.kg-seo-cta-wrap{display:flex;justify-content:center;margin:18px 20px 0}.kg-seo-cta{display:inline-flex;align-items:center;justify-content:center;padding:13px 20px;border-radius:12px;background:#0aa34a;color:#fff;font-weight:800;text-decoration:none;box-shadow:0 8px 18px rgba(10,163,74,.16)}.kg-seo-cta:hover{background:#087f3b}.kg-seo-article{max-width:1180px;margin:20px auto 0;padding:22px 20px;border:1px solid #dfe7ef;border-radius:14px;background:#fff}.kg-seo-article-section+.kg-seo-article-section{margin-top:24px;padding-top:24px;border-top:1px solid #e8edf3}.kg-seo-article h2{margin:0 0 9px;font-size:22px;color:#111827}.kg-seo-article h3{margin:0 0 6px;font-size:17px;color:#111827}.kg-seo-article p{margin:0;color:#667085;line-height:1.7}.kg-seo-article ul{margin:12px 0 0;padding-left:20px;color:#667085;line-height:1.7}.kg-seo-faq-item+.kg-seo-faq-item{margin-top:14px}@media(max-width:720px){.kg-seo-cta-wrap{margin:16px 12px 0}.kg-seo-cta{width:100%}.kg-seo-article{margin:16px 12px 0;padding:18px 16px}.kg-seo-article h2{font-size:20px}}
`;
  const ctaMarkup=`
{% if page.seo_cta %}<div class="kg-seo-cta-wrap"><a class="kg-seo-cta" href="{{ page.seo_cta.url }}">{{ page.seo_cta.label }}</a></div>{% endif %}
`;
  const articleMarkup=`
{% if page.seo_sections %}<section class="kg-seo-article" aria-label="Sayfa rehberi">{% for section in page.seo_sections %}<article class="kg-seo-article-section"><h2>{{ section.title }}</h2><p>{{ section.text }}</p>{% if section.items %}<ul>{% for item in section.items %}<li>{{ item }}</li>{% endfor %}</ul>{% endif %}</article>{% endfor %}</section>{% endif %}
`;
  const faqMarkup=`
{% if page.seo_faqs %}<section class="kg-seo-article" aria-labelledby="seoFaqTitle"><h2 id="seoFaqTitle">Sık Sorulan Sorular</h2>{% for faq in page.seo_faqs %}<article class="kg-seo-faq-item"><h3>{{ faq.question }}</h3><p>{{ faq.answer }}</p></article>{% endfor %}</section>{% endif %}
`;
  const faqSchema=`
{% if page.seo_faqs %}<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{% for faq in page.seo_faqs %}{"@type":"Question","name":{{ faq.question | jsonify }},"acceptedAnswer":{"@type":"Answer","text":{{ faq.answer | jsonify }}}}{% unless forloop.last %},{% endunless %}{% endfor %}]}</script>{% endif %}
`;

  return ("---\n---\n"+index)
    .replace("</style>",seoCss+"\n"+phaseOneSeoCss+"\n</style>")
    .replace("<title>İkinci El Cihaz Değeri: Telefon, Tablet, Bilgisayar | KaçaGider</title>","<title>{{ page.seo_title }}</title>")
    .replace('<meta name="description" content="Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolunun güncel ikinci el piyasa değerini öğren; doğru satış fiyatına yaklaşmak için KaçaGider ile karşılaştır.">','<meta name="description" content="{{ page.seo_description }}">')
    .replace('href="https://kacagider.com.tr/"','href="{{ page.seo_canonical }}"')
    .replaceAll('content="İkinci El Telefon Fiyatları – Telefonun Kaç Para Eder? | KaçaGider"','content="{{ page.seo_title }}"')
    .replaceAll('content="Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolunun güncel ikinci el piyasa değerini öğren; doğru satış fiyatına yaklaşmak için KaçaGider ile karşılaştır."','content="{{ page.seo_description }}"')
    .replace('content="https://kacagider.com.tr/"','content="{{ page.seo_canonical }}"')
    .replace('İkinci El Değerini Öğren. <span>Doğru Fiyata Sat.</span>','{{ page.seo_h1 }}')
    .replace('Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel piyasa verilerini değerlendir; cihazının ikinci el piyasa değerini öğren.','{{ page.seo_intro }}')
    .replace('{{ page.seo_intro }}</p>\n  </div>','{{ page.seo_intro }}</p>'+ctaMarkup+'\n  </div>')
    .replace('<main class="page app-view active" id="viewHome">','<main class="page app-view active" id="viewHome">'+breadcrumbMarkup)
    .replace('</main>',contextMarkup+articleMarkup+faqMarkup+'</main>')
    .replace('</head>',breadcrumbSchema+'</head>');
}

const index=await readFile(path.join(root,"index.html"),"utf8");
const prices=await readFile(path.join(root,"data","phone-prices.js"),"utf8");
const runtime=getCatalogRuntime(index,prices);
const pages=[];
const addPage=(url,meta)=>pages.push({url,meta});

async function findGeneratedSeoDocuments(directory,documents=[]){
  let entries=[];
  try{entries=await readdir(directory,{withFileTypes:true});}catch{return documents;}
  for(const entry of entries){
    const fullPath=path.join(directory,entry.name);
    if(entry.isDirectory()) await findGeneratedSeoDocuments(fullPath,documents);
    if(entry.isFile()&&entry.name==="index.md"){
      const content=await readFile(fullPath,"utf8");
      if(/^---\nlayout:\s*"?seo"?\s*\n/.test(content)) documents.push(fullPath);
    }
  }
  return documents;
}

for(const [kind,config] of Object.entries(categoryConfig)){
  const catalog=kind==="phone" ? runtime.PHONE_CATALOG : runtime.STATIC_CATALOG[kind];
  const categoryUrl=`/${config.path}/`;
  const categoryBrands=Object.keys(catalog);
  addPage(categoryUrl,pageMeta({kind,url:categoryUrl,breadcrumbs:[{label:"Ana Sayfa",url:"/"},{label:config.name,url:categoryUrl}],links:[{label:categoryLandingConfig[kind].h1,url:categoryLandingConfig[kind].url},{label:"İkinci el fiyat nasıl hesaplanır?",url:"/ikinci-el-fiyat-nasil-hesaplanir/"},...categoryBrands.map(brand=>({label:brand,url:pagePath(config.path,brand)}))],linksHeading:`${config.name} markaları`}));

  for(const [brand,models] of Object.entries(catalog)){
    const brandUrl=pagePath(config.path,brand);
    addPage(brandUrl,pageMeta({kind,brand,url:brandUrl,breadcrumbs:[{label:"Ana Sayfa",url:"/"},{label:config.name,url:categoryUrl},{label:brand,url:brandUrl}],links:models.map(model=>({label:model,url:pagePath(config.path,brand,model)})),linksHeading:`${brand} modelleri`}));

    for(const model of models){
      const modelUrl=pagePath(config.path,brand,model);
      const variants=(kind==="phone" ? runtime.PHONE_STORAGE_OPTIONS_BY_BRAND?.[brand]?.[model]
        : kind==="tablet" ? runtime.TABLET_STORAGE_OPTIONS?.[brand]?.[model]
        : kind==="computer" ? runtime.COMPUTER_STORAGE_OPTIONS?.[brand]?.[model]
        : kind==="watch" ? runtime.WATCH_VARIANT_OPTIONS?.[brand]?.[model]
        : runtime.CONSOLE_STORAGE_OPTIONS?.[model]) || [];
      const variantLinks=[...new Set(variants.map(Number))].filter(Number.isFinite).map(value=>({label:storageLabel(value,kind),url:`/${config.path}/${slug(brand)}/${slug(model)}/${variantUrlPart(value,kind)}/`}));
      const relatedModels=models.filter(candidate=>candidate!==model).slice(0,3).map(candidate=>({label:`${candidate} ikinci el fiyatı`,url:pagePath(config.path,brand,candidate)}));
      addPage(modelUrl,modelSeoMeta({kind,brand,model,url:modelUrl,variants,breadcrumbs:[{label:"Ana Sayfa",url:"/"},{label:config.name,url:categoryUrl},{label:brand,url:brandUrl},{label:model,url:modelUrl}],links:[...relatedModels,...variantLinks]}));

      for(const value of [...new Set(variants.map(Number))].filter(Number.isFinite)){
        const variant=storageLabel(value,kind);
        const variantUrl=`/${config.path}/${slug(brand)}/${slug(model)}/${variantUrlPart(value,kind)}/`;
        addPage(variantUrl,modelSeoMeta({kind,brand,model,variant,url:variantUrl,variants,breadcrumbs:[{label:"Ana Sayfa",url:"/"},{label:config.name,url:categoryUrl},{label:brand,url:brandUrl},{label:model,url:modelUrl},{label:variant,url:variantUrl}],links:[{label:`${model} ana sayfası`,url:modelUrl},...variantLinks.filter(link=>link.url!==variantUrl)]}));
      }
    }
  }
}

for(const kind of Object.keys(categoryConfig)){
  const landing=categoryLandingConfig[kind];
  addPage(landing.url,landingMeta({kind}));
}
addPage("/ikinci-el-fiyat-nasil-hesaplanir/",infoMeta());

const phaseOnePilotPages=[];
for(const page of phaseOnePilotPages) addPage(page.url,page.meta);

const byUrl=new Map();
for(const page of pages){if(byUrl.has(page.url)) throw Error(`Duplicate URL: ${page.url}`);byUrl.set(page.url,page);}
const phaseOnePilotUrls=new Set(phaseOnePilotPages.map(page=>page.url));
const duplicateCount=(key,excludedUrls=new Set())=>{
  const values=pages.filter(page=>!excludedUrls.has(page.url)).map(page=>page.meta[key]);
  return values.length-new Set(values).size;
};

const allUrls=new Set(["/",...pages.map(page=>page.url)]);
const brokenCanonical=pages.filter(page=>page.meta.seo_canonical!==absolute(page.url)).length;
const brokenBreadcrumb=pages.filter(page=>page.meta.seo_breadcrumbs.some(crumb=>!allUrls.has(crumb.url))).length;
const inboundUrls=new Set(pages.flatMap(page=>[
  ...page.meta.seo_links.map(link=>link.url),
  ...page.meta.seo_breadcrumbs.slice(0,-1).map(crumb=>crumb.url)
]));
const orphanPages=pages.filter(page=>!inboundUrls.has(page.url)).length;
const audit={generated_at:generatedAt,total_indexable_urls:pages.length+1,duplicate_title:duplicateCount("seo_title"),duplicate_description:duplicateCount("seo_description"),duplicate_h1:duplicateCount("seo_h1",phaseOnePilotUrls),intentional_shared_pilot_h1:phaseOnePilotPages.length-1,broken_canonical:brokenCanonical,broken_breadcrumb:brokenBreadcrumb,orphan_url:orphanPages,sitemap_url_count:pages.length+1};
if(audit.duplicate_title||audit.duplicate_description||audit.duplicate_h1||audit.broken_canonical||audit.broken_breadcrumb||audit.orphan_url) throw Error(`SEO audit failed: ${JSON.stringify(audit)}`);

// The existing SEO layout already renders the V2 front matter; preserve it so
// marketplace-specific changes in index.html cannot be copied into the layout.
const generatedFiles=new Set(pages.map(page=>path.join(root,page.url,"index.md")));
for(const categoryDirectory of Object.values(categoryConfig).map(config=>path.join(root,config.path))){
  for(const oldFile of await findGeneratedSeoDocuments(categoryDirectory)){
    if(!generatedFiles.has(oldFile)) await rm(oldFile);
  }
}
for(const page of pages){
  const file=path.join(root,page.url,"index.md");
  await mkdir(path.dirname(file),{recursive:true});
  await writeFile(file,documentText(page.meta));
}

const sitemap=[{url:"/",priority:"1.0",frequency:"weekly"},...pages.map(page=>({url:page.url,priority:page.meta.seo_breadcrumbs.length===2?"0.9":page.meta.seo_breadcrumbs.length===3?"0.8":page.meta.seo_breadcrumbs.length===4?"0.7":"0.6",frequency:"weekly"}))]
  .map(entry=>`  <url><loc>${absolute(entry.url)}</loc><lastmod>${generatedAt}</lastmod><changefreq>${entry.frequency}</changefreq><priority>${entry.priority}</priority></url>`).join("\n");
await writeFile(path.join(root,"sitemap.xml"),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`);
await writeFile(path.join(root,"seo-audit.json"),JSON.stringify(audit,null,2)+"\n");
console.log(JSON.stringify(audit));
