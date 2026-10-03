(function(){
"use strict";
if(window.__KG_MARKETPLACE_DETAILS__) return;
window.__KG_MARKETPLACE_DETAILS__=true;

var CATEGORY_IMAGES={phone:"/assets/categories/telefon.jpg",telefon:"/assets/categories/telefon.jpg",tablet:"/assets/categories/tablet.jpg",computer:"/assets/categories/bilgisayar.jpg",bilgisayar:"/assets/categories/bilgisayar.jpg",watch:"/assets/categories/akilli-saat.jpg","akilli-saat":"/assets/categories/akilli-saat.jpg",console:"/assets/categories/oyun-konsolu.jpg","oyun-konsolu":"/assets/categories/oyun-konsolu.jpg"};
var CATEGORY_ALT={phone:"İkinci el telefon",telefon:"İkinci el telefon",tablet:"İkinci el tablet",computer:"İkinci el bilgisayar",bilgisayar:"İkinci el bilgisayar",watch:"İkinci el akıllı saat","akilli-saat":"İkinci el akıllı saat",console:"İkinci el oyun konsolu","oyun-konsolu":"İkinci el oyun konsolu"};

function clean(v){return String(v||"").replace(/\s+/g," ").trim();}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c];});}
function selectedCategory(){
  var active=document.querySelector('.category-card.active[data-category],.kg-approved-card.active[data-category]');
  var k=active&&active.dataset?active.dataset.category:"";
  var map={phone:"phone",telefon:"phone",tablet:"tablet",computer:"computer",bilgisayar:"computer",watch:"watch","akilli-saat":"watch",console:"console","oyun-konsolu":"console"};
  if(map[k])return map[k];
  var n=document.getElementById("selectedCategoryName"),t=n?clean(n.textContent):"";
  return {"Telefon":"phone","Tablet":"tablet","Bilgisayar":"computer","Akıllı Saat":"watch","Oyun Konsolu":"console"}[t]||"phone";
}
function selectText(id){var el=document.getElementById(id);if(!el)return"";if(el.tagName==="SELECT"){var o=el.options[el.selectedIndex];return o?clean(o.textContent):"";}return clean(el.value);}
function activeText(group){var el=document.querySelector('[data-group="'+group+'"] .option.active');return el?clean(el.textContent):"";}
function add(out,label,value){value=clean(value);if(value&&value!=="Seçiniz"&&value!=="—")out.push({label:label,value:value});}

function collectDetails(){
  var out=[],key=selectedCategory();
  if(key==="phone"){
    add(out,"Pil Sağlığı",selectText("battery"));
    add(out,"Ekran Durumu",selectText("screen"));
    add(out,"Face ID",selectText("faceid"));
    add(out,"Cihaz Kaydı",activeText("deviceRegistration"));
    try{if(typeof window.getChangedPartsSummary==="function")add(out,"Değişen Parça / İşlem Geçmişi",window.getChangedPartsSummary());}catch(_e){}
    add(out,"Çizik Sayısı",activeText("scratchCount"));
    add(out,"Çizik Derinliği",activeText("scratchDepth"));
    add(out,"Piksel Atması",activeText("protector"));
    add(out,"Kasa Ezik / Darbe",activeText("dent"));
    add(out,"Kasa Yüzeyi",activeText("surface"));
    add(out,"Köşeler",activeText("corners"));
    add(out,"Arka Cam Durumu",activeText("backGlass"));
  }else{
    add(out,"Kondisyon",selectText("genericCondition"));
    add(out,"Çalışma Durumu",selectText("genericWorking"));
    add(out,"Kutu / Aksesuar",selectText("genericAccessories"));
  }
  return out;
}
window.KGMarketplaceCollectDetails=collectDetails;

function price(){
  var el=document.getElementById("mainPrice");
  return Number(String(el&&el.textContent||"").replace(/[^0-9]/g,""))||0;
}
function deviceFields(){
  var category=selectedCategory(),generic=category!=="phone";
  return {
    category:category,
    brand:selectText(generic?"genericBrand":"phoneBrand"),
    model:selectText(generic?"genericModel":"model"),
    storage:selectText(generic?"genericStorage":"storage")
  };
}
function scoreSnapshot(){
  try{
    if(typeof window.KGGetDeviceScoreSnapshot==="function")return window.KGGetDeviceScoreSnapshot();
  }catch(_e){}
  return window.KG_DEVICE_SCORE_SNAPSHOT||null;
}
function captureValuation(){
  var d=deviceFields(),score=scoreSnapshot();
  return {
    category:d.category,
    brand:d.brand,
    model:d.model,
    storage:d.storage,
    marketValue:price(),
    details:collectDetails(),
    score:score&&Number.isFinite(Number(score.score))?Math.round(Number(score.score)):null,
    scoreLabel:score?clean(score.label):"",
    scoreComponents:score&&score.components?score.components:{},
    capturedAt:new Date().toISOString(),
    source:"kacagider_valuation"
  };
}
function normalizedSnapshot(value){
  value=value&&typeof value==="object"?value:{};
  return {
    category:clean(value.category),
    brand:clean(value.brand),
    model:clean(value.model),
    storage:clean(value.storage),
    marketValue:Number(value.marketValue||value.market_value||0)||0,
    details:Array.isArray(value.details)?value.details:[],
    score:Number.isFinite(Number(value.score==null?value.device_score:value.score))?Math.round(Number(value.score==null?value.device_score:value.score)):null,
    scoreLabel:clean(value.scoreLabel||value.score_label||value.device_score_label),
    scoreComponents:value.scoreComponents||value.score_components||{},
    capturedAt:value.capturedAt||value.captured_at||null,
    source:value.source||"kacagider_valuation"
  };
}
function ensureValuationCardStyle(){
  if(document.getElementById("kgValuationCardStyle"))return;
  var style=document.createElement("style");
  style.id="kgValuationCardStyle";
  style.textContent='.kg-valuation-card{margin:14px 0;border:1px solid #bfe5cc;border-radius:15px;background:linear-gradient(145deg,#f3fff7,#fff);overflow:hidden}.kg-vc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px 15px;border-bottom:1px solid #dcefe3}.kg-vc-head span{display:block;color:#148044;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.04em}.kg-vc-head strong{display:block;margin-top:4px;color:#172033;font-size:15px}.kg-vc-price{text-align:right;white-space:nowrap}.kg-vc-price b{display:block;color:#0b9343;font-size:18px}.kg-vc-price small{color:#667085;font-size:9px}.kg-vc-score{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:12px 15px 0;padding:10px 12px;border-radius:11px;background:#eafaf0;color:#176b3a;font-size:11px;font-weight:850}.kg-vc-score b{font-size:17px}.kg-vc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:12px 15px 15px}.kg-vc-item{padding:9px 10px;border:1px solid #e1e8e4;border-radius:10px;background:#fff}.kg-vc-item span{display:block;color:#7b8798;font-size:9px;font-weight:800;text-transform:uppercase}.kg-vc-item strong{display:block;margin-top:3px;color:#27334a;font-size:11px;line-height:1.35}.kg-vc-lock{padding:0 15px 13px;color:#667085;font-size:10px;line-height:1.45}@media(max-width:520px){.kg-vc-head{flex-direction:column}.kg-vc-price{text-align:left}.kg-vc-grid{grid-template-columns:1fr}}';
  document.head.appendChild(style);
}
function valuationCardHtml(value){
  ensureValuationCardStyle();
  var x=normalizedSnapshot(value),name=[x.brand,x.model,x.storage].filter(Boolean).join(" ");
  var details=x.details.filter(function(item){return item&&clean(item.value);}).map(function(item){
    return '<div class="kg-vc-item"><span>'+esc(item.label||"Özellik")+'</span><strong>'+esc(item.value||"—")+'</strong></div>';
  }).join("");
  var score=x.score!==null?'<div class="kg-vc-score"><span>KaçaGider Cihaz Skoru</span><b>'+esc(x.score+'/100'+(x.scoreLabel?' · '+x.scoreLabel:''))+'</b></div>':"";
  return '<section class="kg-valuation-card"><div class="kg-vc-head"><div><span>Değerlendirme kartı</span><strong>'+esc(name||"Cihaz")+'</strong></div><div class="kg-vc-price"><b>'+esc(x.marketValue?x.marketValue.toLocaleString("tr-TR")+' TL':'—')+'</b><small>KaçaGider piyasa değeri</small></div></div>'+score+'<div class="kg-vc-grid">'+(details||'<div class="kg-vc-item"><span>Durum</span><strong>Detay bulunamadı</strong></div>')+'</div><div class="kg-vc-lock">🔒 Bu özellikler değerleme sonucundan alınmıştır ve satış süreci boyunca değiştirilmeden taşınır.</div></section>';
}
function valuationHasDamage(value){
  var x=normalizedSnapshot(value),damaged=false;
  var cleanValues={
    "Ekran Durumu":["Orijinal – Temiz"],"Çizik Sayısı":["Yok"],"Çizik Derinliği":["Seçiniz","Yok"],"Piksel Atması":["Yok"],
    "Kasa Ezik / Darbe":["Yok"],"Kasa Yüzeyi":["Temiz"],"Köşeler":["Temiz"],"Arka Cam Durumu":["Temiz"],
    "Kondisyon":["Çok temiz","Temiz"],"Çalışma Durumu":["Tüm özellikler çalışıyor"]
  };
  x.details.forEach(function(item){
    var label=clean(item&&item.label),valueText=clean(item&&item.value),allowed=cleanValues[label];
    if(allowed&&valueText&&allowed.indexOf(valueText)<0)damaged=true;
  });
  return damaged;
}
window.KGMarketplaceCaptureValuationSnapshot=captureValuation;
window.KGMarketplaceNormalizeValuationSnapshot=normalizedSnapshot;
window.KGMarketplaceValuationCardHtml=valuationCardHtml;
window.KGMarketplaceValuationHasDamage=valuationHasDamage;

function installStyle(){
  if(document.getElementById("kgStableCategoryStyle"))return;
  var s=document.createElement("style");
  s.id="kgStableCategoryStyle";
  s.textContent=`
  #viewHome .kg-product-art,#viewHome .category-image,#viewHome .category-media{overflow:hidden!important;display:flex!important;align-items:center!important;justify-content:center!important;background:#fff!important}
  #viewHome .kg-product-art img,#viewHome .category-image img,#viewHome .category-media img{display:block!important;width:86%!important;height:86%!important;max-width:86%!important;max-height:86%!important;object-fit:contain!important;object-position:center!important;transform:none!important;background:transparent!important}
  #viewHome [data-category="computer"] .kg-product-art img,#viewHome [data-category="bilgisayar"] .kg-product-art img{width:92%!important;max-width:92%!important;height:78%!important;max-height:78%!important}
  #viewHome.category-selected .valuation-layout.kg-query-layout{display:block!important;max-width:1040px!important;margin-left:auto!important;margin-right:auto!important}
  #viewHome.category-selected .valuation-layout.kg-query-layout>.side{display:none!important}
  #viewHome.category-selected .valuation-layout.kg-query-layout>.valuation-main{width:100%!important;max-width:none!important}
  #phonePanel[data-kg-wizard="1"]{overflow:hidden}
  .kg-query-progress{padding:18px 32px 0;color:#07833d;font-size:12px;font-weight:900;letter-spacing:.05em}
  .kg-query-progress div{height:6px;margin-top:9px;overflow:hidden;border-radius:99px;background:#e8edf0}
  .kg-query-progress i{display:block;height:100%;border-radius:99px;background:#10b85a;transition:width .2s ease}
  .kg-query-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 32px}
  .kg-query-nav button{min-width:135px;padding:13px 18px;border-radius:11px;font:inherit;font-weight:850;cursor:pointer}
  .kg-query-back{border:1px solid #d7dfe3;background:#f4f6f7;color:#172033}
  .kg-query-next{border:0;background:#0caf51;color:#fff}
  @media(max-width:720px){.kg-query-progress{padding:15px 18px 0}.kg-query-nav{padding:15px 18px}.kg-query-nav button{min-width:118px}}
  `;
  document.head.appendChild(s);
}


function installQueryWizard(){
  var layout=document.querySelector("#viewHome.category-selected .valuation-layout")||document.querySelector("#viewHome .valuation-layout");
  var panel=document.getElementById("phonePanel");
  if(!layout||!panel||panel.getAttribute("data-kg-wizard")==="1")return;
  panel.setAttribute("data-kg-wizard","1");
  layout.classList.add("kg-query-layout");
  var sections=Array.prototype.slice.call(panel.querySelectorAll(":scope > section.section"));
  var calc=panel.querySelector(":scope > .calc-wrap");
  if(sections.length<2||!calc)return;
  var current=0,progress=document.createElement("div"),nav=document.createElement("div");
  progress.className="kg-query-progress";
  nav.className="kg-query-nav";
  panel.insertBefore(progress,sections[0]);
  panel.insertBefore(nav,calc);
  function firstStepReady(){
    var brand=selectText("phoneBrand"),model=selectText("model"),storage=selectText("storage");
    if(!brand||/seçiniz/i.test(brand)){alert("Devam etmek için marka seç.");return false}
    if(!model||/önce|seçiniz/i.test(model)){alert("Devam etmek için model seç.");return false}
    if(!storage||/önce|seçiniz/i.test(storage)){alert("Devam etmek için hafıza seç.");return false}
    return true;
  }
  function render(){
    sections.forEach(function(section,index){section.style.display=index===current?"block":"none"});
    progress.innerHTML='<span>ADIM '+(current+1)+' / '+sections.length+'</span><div><i style="width:'+(((current+1)/sections.length)*100)+'%"></i></div>';
    nav.innerHTML=(current?'<button type="button" class="kg-query-back">← Geri</button>':'<span></span>')+(current<sections.length-1?'<button type="button" class="kg-query-next">Devam Et →</button>':'');
    calc.style.display=current===sections.length-1?"block":"none";
    var back=nav.querySelector(".kg-query-back"),next=nav.querySelector(".kg-query-next");
    if(back)back.onclick=function(){current-=1;render();panel.scrollIntoView({behavior:"smooth",block:"start"})};
    if(next)next.onclick=function(){if(current===0&&!firstStepReady())return;current+=1;render();panel.scrollIntoView({behavior:"smooth",block:"start"})};
  }
  render();
}

function applyImages(){
  installStyle();
  var root=document.getElementById("viewHome")||document;
  Object.keys(CATEGORY_IMAGES).forEach(function(key){
    root.querySelectorAll('[data-category="'+key+'"]').forEach(function(card){
      var img=card.querySelector(".kg-product-art img,.category-image img,.category-media img");
      if(!img)return;
      var src=CATEGORY_IMAGES[key];
      if(img.getAttribute("data-kg-stable-src")===src)return;
      img.src=src;
      img.setAttribute("data-kg-stable-src",src);
      img.alt=CATEGORY_ALT[key]||"İkinci el cihaz";
      img.loading="eager";
      img.decoding="async";
      img.onerror=null;
    });
  });
}


var RESULT_STORAGE_KEY="kg-result-snapshot-v1";
function resultPrice(id){
  var el=document.getElementById(id);
  return Number(String(el&&el.textContent||"").replace(/[^0-9]/g,""))||0;
}
function saveAndOpenResult(button){
  var attempts=0;
  function check(){
    attempts+=1;
    var snapshot=captureValuation();
    if(snapshot.brand&&snapshot.model&&snapshot.marketValue&&(!button.disabled||attempts>30)){
      snapshot.quickPrice=resultPrice("quickPrice");
      snapshot.listingPrice=resultPrice("listingPrice");
      snapshot.normalPrice=resultPrice("normalPrice")||snapshot.marketValue;
      snapshot.trustScore=resultPrice("trustScore");
      snapshot.resultCreatedAt=new Date().toISOString();
      try{sessionStorage.setItem(RESULT_STORAGE_KEY,JSON.stringify(snapshot));}catch(_e){}
      window.location.assign("/sonuc/");
      return;
    }
    if(attempts<50)setTimeout(check,100);
  }
  setTimeout(check,250);
}
function installResultStep(){
  if(window.__KG_RESULT_STEP__)return;
  window.__KG_RESULT_STEP__=true;
  document.addEventListener("click",function(event){
    var button=event.target&&event.target.closest?event.target.closest(".calc-btn"):null;
    var priceEl=document.getElementById("mainPrice");
    if(!button||!priceEl)return;
    var completed=false;
    var observer=new MutationObserver(function(){
      if(completed||!resultPrice("mainPrice"))return;
      completed=true;
      observer.disconnect();
      saveAndOpenResult(button);
    });
    observer.observe(priceEl,{childList:true,characterData:true,subtree:true});
    setTimeout(function(){observer.disconnect();},10000);
  },true);
}

function boot(){
  installResultStep();
  installQueryWizard();
  applyImages();
  requestAnimationFrame(applyImages);
  setTimeout(applyImages,350);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
