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
  #kgHeaderAccountAction,#kgAccountSessionAction{gap:9px!important;min-width:112px!important;box-shadow:none!important;transition:background .18s ease,border-color .18s ease!important}
  #kgHeaderAccountAction:hover,#kgAccountSessionAction:hover{background:rgba(255,255,255,.11)!important;border-color:#718198!important}
  #kgHeaderAccountAction::before,#kgAccountSessionAction::before{content:"";display:block;width:18px;height:18px;flex:0 0 18px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'/%3E%3C/svg%3E") center/contain no-repeat}
  @media(max-width:900px){#kgHeaderAccountAction,#kgAccountSessionAction{min-width:auto!important;padding:0 10px!important}}
  `;
  document.head.appendChild(s);
}
function applyImages(){
  installStyle();var root=document.getElementById("viewHome")||document;
  Object.keys(CATEGORY_IMAGES).forEach(function(key){root.querySelectorAll('[data-category="'+key+'"]').forEach(function(card){var img=card.querySelector(".kg-product-art img,.category-image img,.category-media img");if(!img)return;var src=CATEGORY_IMAGES[key];if(img.getAttribute("data-kg-stable-src")===src)return;img.src=src;img.setAttribute("data-kg-stable-src",src);img.alt=CATEGORY_ALT[key]||"İkinci el cihaz";img.loading="eager";img.decoding="async";img.onerror=null;});});
}

function loadAccountSessionNav(){
  if(window.__KG_ACCOUNT_SESSION_NAV__||document.querySelector('script[data-kg-account-session-nav]'))return;
  var s=document.createElement("script");
  s.src="/assets/account-session-nav.js?v=20260827-2308";
  s.async=true;
  s.dataset.kgAccountSessionNav="1";
  document.head.appendChild(s);
}

function showAndPlaceAccount(button,host,sell){
  button.style.setProperty("display","inline-flex","important");
  button.style.setProperty("visibility","visible","important");
  button.style.setProperty("opacity","1","important");
  button.style.setProperty("align-items","center","important");
  button.style.setProperty("justify-content","center","important");
  button.style.setProperty("height","46px","important");
  button.style.setProperty("padding","0 14px","important");
  button.style.setProperty("border","1px solid #536278","important");
  button.style.setProperty("border-radius","12px","important");
  button.style.setProperty("background","rgba(255,255,255,.04)","important");
  button.style.setProperty("color","#fff","important");
  button.style.setProperty("font-size","13px","important");
  button.style.setProperty("font-weight","900","important");
  button.style.setProperty("white-space","nowrap","important");
  button.style.setProperty("cursor","pointer","important");
  if(sell){
    if(sell.nextSibling!==button)host.insertBefore(button,sell.nextSibling);
  }else{
    var theme=host.querySelector(".kg-theme-btn,#themeToggle");
    if(theme)host.insertBefore(button,theme);else host.appendChild(button);
  }
}

function ensureDirectAccountEntry(){
  var host=document.querySelector(".kg-approved-topbar .kg-topbar-actions");
  if(!host)return;
  var sell=host.querySelector(".kg-v4-action.sell,.cta");
  var headerAccount=document.getElementById("kgHeaderAccountAction");
  if(headerAccount){
    showAndPlaceAccount(headerAccount,host,sell);
    return;
  }
  var sessionAccount=document.getElementById("kgAccountSessionAction");
  if(sessionAccount){
    showAndPlaceAccount(sessionAccount,host,sell);
    return;
  }
  var button=document.createElement("button");
  button.type="button";
  button.id="kgAccountSessionAction";
  button.className="kg-account-session";
  button.textContent="Giriş Yap";
  button.setAttribute("aria-label","KaçaGider hesabına giriş yap");
  button.addEventListener("click",function(){
    loadAccountSessionNav();
    button.disabled=true;
    button.textContent="Giriş hazırlanıyor…";
    setTimeout(function(){
      var current=document.getElementById("kgHeaderAccountAction")||document.getElementById("kgAccountSessionAction");
      if(current&&current!==button){current.click();return;}
      button.disabled=false;
      button.textContent="Giriş Yap";
    },650);
  });
  showAndPlaceAccount(button,host,sell);
}

function watchAccountEntry(){
  loadAccountSessionNav();
  ensureDirectAccountEntry();
  var header=document.querySelector(".kg-approved-topbar");
  if(header&&typeof MutationObserver!=="undefined"){
    new MutationObserver(function(){ensureDirectAccountEntry();}).observe(header,{childList:true,subtree:true});
  }
  var tries=0,timer=setInterval(function(){
    ensureDirectAccountEntry();
    tries++;
    if(tries>=40)clearInterval(timer);
  },250);
}

function boot(){applyImages();requestAnimationFrame(applyImages);setTimeout(applyImages,350);watchAccountEntry();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
