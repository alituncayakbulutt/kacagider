(function(){
"use strict";
if(window.__KG_MARKETPLACE_DETAILS__) return;
window.__KG_MARKETPLACE_DETAILS__=true;

var CATEGORY_IMAGES={phone:"/assets/categories/telefon.jpg",telefon:"/assets/categories/telefon.jpg",tablet:"/assets/categories/tablet.jpg",computer:"/assets/categories/bilgisayar.jpg",bilgisayar:"/assets/categories/bilgisayar.jpg",watch:"/assets/categories/akilli-saat.jpg","akilli-saat":"/assets/categories/akilli-saat.jpg",console:"/assets/categories/oyun-konsolu.jpg","oyun-konsolu":"/assets/categories/oyun-konsolu.jpg"};
var CATEGORY_ALT={phone:"İkinci el telefon",telefon:"İkinci el telefon",tablet:"İkinci el tablet",computer:"İkinci el bilgisayar",bilgisayar:"İkinci el bilgisayar",watch:"İkinci el akıllı saat","akilli-saat":"İkinci el akıllı saat",console:"İkinci el oyun konsolu","oyun-konsolu":"İkinci el oyun konsolu"};

function clean(v){return String(v||"").replace(/\s+/g," ").trim();}
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

function installStyle(){
  if(document.getElementById("kgStableCategoryStyle"))return;
  var s=document.createElement("style");
  s.id="kgStableCategoryStyle";
  s.textContent=`
  #viewHome .kg-product-art,#viewHome .category-image,#viewHome .category-media{overflow:hidden!important;display:flex!important;align-items:center!important;justify-content:center!important;background:#fff!important}
  #viewHome .kg-product-art img,#viewHome .category-image img,#viewHome .category-media img{display:block!important;width:86%!important;height:86%!important;max-width:86%!important;max-height:86%!important;object-fit:contain!important;object-position:center!important;transform:none!important;background:transparent!important}
  #viewHome [data-category="computer"] .kg-product-art img,#viewHome [data-category="bilgisayar"] .kg-product-art img{width:92%!important;max-width:92%!important;height:78%!important;max-height:78%!important}
  #kgHeaderAccountAction{display:inline-flex!important;visibility:visible!important;opacity:1!important;align-items:center!important;justify-content:center!important;gap:9px!important;min-width:116px!important;height:46px!important;padding:0 15px!important;border:1px solid #536278!important;border-radius:12px!important;background:rgba(255,255,255,.04)!important;color:#fff!important;font-size:13px!important;font-weight:900!important;white-space:nowrap!important;cursor:pointer!important}
  #kgHeaderAccountAction:hover{background:rgba(255,255,255,.11)!important;border-color:#718198!important}
  #kgHeaderAccountAction::before{content:"";display:block;width:18px;height:18px;flex:0 0 18px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'/%3E%3C/svg%3E") center/contain no-repeat}
  @media(max-width:900px){#kgHeaderAccountAction{min-width:auto!important;height:42px!important;padding:0 10px!important;font-size:11px!important}}
  `;
  document.head.appendChild(s);
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

function placeHeaderAccount(){
  var host=document.querySelector(".kg-approved-topbar .kg-topbar-actions");
  var sell=host&&host.querySelector(".kg-v4-action.sell");
  var account=document.getElementById("kgHeaderAccountAction");
  if(!host||!sell||!account)return;
  account.style.setProperty("display","inline-flex","important");
  account.style.setProperty("visibility","visible","important");
  account.style.setProperty("opacity","1","important");
  if(sell.nextSibling!==account)host.insertBefore(account,sell.nextSibling);
}
function watchHeaderAccount(){
  var header=document.querySelector(".kg-approved-topbar");
  if(header&&typeof MutationObserver!=="undefined"){
    new MutationObserver(function(){placeHeaderAccount();}).observe(header,{childList:true,subtree:true});
  }
  [0,80,250,600,1200,2200].forEach(function(ms){setTimeout(placeHeaderAccount,ms);});
}

function loadFreshAuthBackend(){
  if(document.querySelector('script[data-kg-google-auth-fresh="1"]'))return;
  var script=document.createElement("script");
  script.src="/assets/supabase-marketplace.js?v=20260827-google-auth-3";
  script.async=true;
  script.dataset.kgGoogleAuthFresh="1";
  document.head.appendChild(script);
}

function loadMobileHomeResponsive(){
  if(document.getElementById("kgMobileHomeResponsiveInline"))return;
  var fallback=`@media(max-width:900px){
    html,body{width:100%!important;max-width:100%!important;overflow-x:hidden!important}
    .kg-approved-topbar .kg-topbar-inner{width:100%!important;max-width:none!important;min-height:0!important;padding:10px 12px 11px!important;display:grid!important;grid-template-columns:128px minmax(0,1fr)!important;grid-template-areas:"brand actions" "search search"!important;gap:9px 10px!important}
    .kg-approved-topbar .kg-brand{grid-area:brand!important;width:128px!important;min-width:0!important;max-width:128px!important}
    .kg-approved-topbar .kg-brand-main{font-size:24px!important;line-height:.9!important;white-space:nowrap!important}
    .kg-approved-topbar .kg-brand-tagline{font-size:7.5px!important}
    .kg-approved-topbar .kg-topbar-actions{grid-area:actions!important;width:100%!important;min-width:0!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important}
    .kg-v4-action.listings,.kg-approved-topbar .kg-theme-btn,.kg-theme-btn{display:none!important}
    .kg-v4-action.sell,.kg-v4-action.account,#kgHeaderAccountAction,.kg-account-session{width:100%!important;min-width:0!important;height:38px!important;min-height:38px!important;padding:0 7px!important;font-size:10.5px!important}
    .kg-v4-search{grid-area:search!important;width:100%!important;height:44px!important;min-height:44px!important;padding:0 12px!important}
    .kg-v4-search input{font-size:16px!important;height:42px!important}.kg-v4-search button{display:none!important}.kg-v4-subbar{display:none!important}
    #kgV4Slider{width:100%!important;max-width:none!important;margin:12px auto 16px!important;padding:0 10px!important}
    .kg-v4-shell{width:100%!important;height:430px!important;border-radius:18px!important}
    .kg-v4-slide{grid-template-columns:1fr!important;grid-template-rows:auto auto!important;gap:12px!important;padding:20px 16px 38px!important}
    .kg-v4-copy h1,.kg-v4-copy h2{font-size:25px!important;line-height:1.07!important;text-align:center!important}.kg-v4-copy p{font-size:12.5px!important;text-align:center!important}
    .kg-v4-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin-top:13px!important}.kg-v4-btn{width:100%!important;min-height:42px!important;font-size:11.5px!important}
    .kg-v4-visual{height:125px!important}.kg-v4-card{width:190px!important;max-width:58vw!important;height:120px!important}.kg-v4-arrow{width:32px!important;height:32px!important;bottom:58px!important;top:auto!important;margin:0!important}.kg-v4-dots{bottom:10px!important}
    #viewHome:not(.category-selected) .kg-approved-category-grid,#viewHome:not(.category-selected) .category-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important;overflow:visible!important}
    #viewHome:not(.category-selected) .kg-approved-card,#viewHome:not(.category-selected) .category-card{min-width:0!important;min-height:238px!important;padding:10px!important}
    #viewHome.category-selected .layout,#viewHome.category-selected .valuation-layout{grid-template-columns:1fr!important;gap:12px!important}.side,.valuation-sidebar{position:static!important}
    #viewHome.category-selected .grid3,#viewHome.category-selected .phone-basic-grid,#viewHome.category-selected .subgrid,#viewHome.category-selected .sales-grid{grid-template-columns:1fr!important}
    #viewHome.category-selected select,#viewHome.category-selected input,#viewHome.category-selected textarea{font-size:16px!important;min-height:44px!important}
    .kg-info-section,.standalone-card{width:calc(100% - 18px)!important;max-width:none!important;margin:10px 9px 16px!important;padding:18px 12px!important}.kg-dyk-grid,.kg-contact-layout,.kg-contact-form{grid-template-columns:1fr!important}
    .kg-account-direct-overlay,.kg-mp-overlay{padding:0!important;align-items:flex-end!important}.kg-account-direct-card,.kg-mp-modal{width:100%!important;max-width:100%!important;max-height:90dvh!important;overflow:auto!important;border-radius:20px 20px 0 0!important}
  }`;
  function apply(css){
    var style=document.getElementById("kgMobileHomeResponsiveInline");
    if(!style){style=document.createElement("style");style.id="kgMobileHomeResponsiveInline";document.head.appendChild(style);}
    style.textContent=css+"\n"+fallback;
  }
  fetch("/assets/mobile-home-responsive.css?v=20260829-3-"+Date.now(),{cache:"no-store"})
    .then(function(r){if(!r.ok)throw new Error("mobile css "+r.status);return r.text();})
    .then(apply)
    .catch(function(){apply(fallback);});
}

function boot(){loadMobileHomeResponsive();loadFreshAuthBackend();applyImages();requestAnimationFrame(applyImages);setTimeout(applyImages,350);watchHeaderAccount();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
