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
  const modelWithBrand=brand&&model&&normalizedModel.startsWith(normalizedBrand)
    ? model
    : [brand,model].filter(Boolean).join(" ");
  return [modelWithBrand,variant].filter(Boolean).join(" ");
}

function seoCopy({kind,model,variant,brand}){
  const config=categoryConfig[kind];
  const subject=seoSubject({brand,model,variant});
  if(variant) return `${subject} ikinci el değerini Türkiye ikinci el piyasasına göre ${config.context} bilgileriyle KaçaGider üzerinden değerlendirin.`;
  if(model) return `${subject} ikinci el fiyatını Türkiye ikinci el piyasasına göre ${config.context} bilgileriyle KaçaGider üzerinden değerlendirin.`;
  if(brand) return `${brand} ${config.name} modellerinin ikinci el değerini Türkiye ikinci el piyasası ve cihaz kondisyonuna göre KaçaGider ile inceleyin.`;
  return `${config.plural} ikinci el fiyatlarını Türkiye ikinci el piyasası ve ürün kondisyonuna göre KaçaGider ile değerlendirin.`;
}

function pageMeta({kind,brand,model,variant,url,breadcrumbs,links,linksHeading}){
  const config=categoryConfig[kind];
  const subject=[model,variant].filter(Boolean).join(" ") || (brand ? `${brand} ${config.name}` : config.name);
  const plural=!model && !variant;
  const priceText=plural ? "İkinci El Fiyatları" : "İkinci El Fiyatı";
  const h1=`${subject} ${priceText}`;
  const title=`${h1} 2026 | KaçaGider`;
  const description=seoCopy({kind,brand,model,variant});
  return {layout:"seo",seo_title:title,seo_description:description,seo_h1:h1,seo_intro:description,seo_context_heading:`${subject} için ikinci el değerleme`,seo_context:seoCopy({kind,brand,model,variant}),seo_breadcrumbs:breadcrumbs,seo_links:links,seo_links_heading:linksHeading,seo_canonical:absolute(url)};
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
  return ("---\n---\n"+index)
    .replace("</style>",seoCss+"\n</style>")
    .replace("<title>KaçaGider.com.tr – İkinci El Telefon Fiyatı Hesaplama</title>","<title>{{ page.seo_title }}</title>")
    .replace('<meta name="description" content="Telefonunun ve ikinci el elektronik ürünlerinin güncel piyasa değerini KaçaGider ile hesapla. iPhone, Samsung ve diğer modeller için kondisyon ve gerçek satış verilerine göre tahmini fiyatını öğren.">','<meta name="description" content="{{ page.seo_description }}">')
    .replace('href="https://kacagider.com.tr/"','href="{{ page.seo_canonical }}"')
    .replaceAll('content="KaçaGider.com.tr – İkinci El Telefon Fiyatı Hesaplama"','content="{{ page.seo_title }}"')
    .replaceAll('content="Telefonunun ve ikinci el elektronik ürünlerinin güncel piyasa değerini saniyeler içinde öğren."','content="{{ page.seo_description }}"')
    .replaceAll('content="Telefonunun güncel ikinci el piyasa değerini kondisyon ve satış verilerine göre hesapla."','content="{{ page.seo_description }}"')
    .replace('content="https://kacagider.com.tr/"','content="{{ page.seo_canonical }}"')
    .replace('Cihazının <span>Gerçek Değerini</span> Öğren','{{ page.seo_h1 }}')
    .replace('Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel piyasa verileriyle anında fiyat tahmini al.','{{ page.seo_intro }}')
    .replace('<main class="page app-view active" id="viewHome">','<main class="page app-view active" id="viewHome">'+breadcrumbMarkup)
    .replace('</main>',contextMarkup+'</main>')
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
  addPage(categoryUrl,pageMeta({kind,url:categoryUrl,breadcrumbs:[{label:"Ana Sayfa",url:"/"},{label:config.name,url:categoryUrl}],links:categoryBrands.map(brand=>({label:brand,url:pagePath(config.path,brand)})),linksHeading:`${config.name} markaları`}));

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
      addPage(modelUrl,pageMeta({kind,brand,model,url:modelUrl,breadcrumbs:[{label:"Ana Sayfa",url:"/"},{label:config.name,url:categoryUrl},{label:brand,url:brandUrl},{label:model,url:modelUrl}],links:variantLinks,linksHeading:`${model} seçenekleri`}));

      for(const value of [...new Set(variants.map(Number))].filter(Number.isFinite)){
        const variant=storageLabel(value,kind);
        const variantUrl=`/${config.path}/${slug(brand)}/${slug(model)}/${variantUrlPart(value,kind)}/`;
        addPage(variantUrl,pageMeta({kind,brand,model,variant,url:variantUrl,breadcrumbs:[{label:"Ana Sayfa",url:"/"},{label:config.name,url:categoryUrl},{label:brand,url:brandUrl},{label:model,url:modelUrl},{label:variant,url:variantUrl}],links:[{label:`${model} ana sayfası`,url:modelUrl},...variantLinks.filter(link=>link.url!==variantUrl)],linksHeading:`${model} diğer seçenekleri`}));
      }
    }
  }
}

const byUrl=new Map();
for(const page of pages){if(byUrl.has(page.url)) throw Error(`Duplicate URL: ${page.url}`);byUrl.set(page.url,page);}
const duplicateCount=key=>pages.length-new Set(pages.map(page=>page.meta[key])).size;
const allUrls=new Set(["/",...pages.map(page=>page.url)]);
const brokenCanonical=pages.filter(page=>page.meta.seo_canonical!==absolute(page.url)).length;
const brokenBreadcrumb=pages.filter(page=>page.meta.seo_breadcrumbs.some(crumb=>!allUrls.has(crumb.url))).length;
const inboundUrls=new Set(pages.flatMap(page=>[
  ...page.meta.seo_links.map(link=>link.url),
  ...page.meta.seo_breadcrumbs.slice(0,-1).map(crumb=>crumb.url)
]));
const orphanPages=pages.filter(page=>!inboundUrls.has(page.url)).length;
const audit={generated_at:generatedAt,total_indexable_urls:pages.length+1,duplicate_title:duplicateCount("seo_title"),duplicate_description:duplicateCount("seo_description"),duplicate_h1:duplicateCount("seo_h1"),broken_canonical:brokenCanonical,broken_breadcrumb:brokenBreadcrumb,orphan_url:orphanPages,sitemap_url_count:pages.length+1};
if(audit.duplicate_title||audit.duplicate_description||audit.duplicate_h1||audit.broken_canonical||audit.broken_breadcrumb||audit.orphan_url) throw Error(`SEO audit failed: ${JSON.stringify(audit)}`);

await writeFile(path.join(root,"_layouts","seo.html"),layoutFrom(index));
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
