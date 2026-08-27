(function(){
"use strict";
if(window.__KG_MARKETPLACE_DETAILS__) return;
window.__KG_MARKETPLACE_DETAILS__=true;

var CATEGORY_IMAGES={phone:"/assets/categories/telefon.jpg",telefon:"/assets/categories/telefon.jpg",tablet:"/assets/categories/tablet.jpg",computer:"/assets/categories/bilgisayar.jpg",bilgisayar:"/assets/categories/bilgisayar.jpg",watch:"/assets/categories/akilli-saat.jpg","akilli-saat":"/assets/categories/akilli-saat.jpg",console:"/assets/categories/oyun-konsolu.jpg","oyun-konsolu":"/assets/categories/oyun-konsolu.jpg"};
var CATEGORY_ALT={phone:"İkinci el telefon",telefon:"İkinci el telefon",tablet:"İkinci el tablet",computer:"İkinci el bilgisayar",bilgisayar:"İkinci el bilgisayar",watch:"İkinci el akıllı saat","akilli-saat":"İkinci el akıllı saat",console:"İkinci el oyun konsolu","oyun-konsolu":"İkinci el oyun konsolu"};
var authWatchInstalled=false;

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
  var s=document.createElement("style");s.id="kgStableCategoryStyle";s.textContent=`#viewHome .kg-product-art,#viewHome .category-image,#viewHome .category-media{overflow:hidden!important;display:flex!important;align-items:center!important;justify-content:center!important;background:#fff!important}#viewHome .kg-product-art img,#viewHome .category-image img,#viewHome .category-media img{display:block!important;width:86%!important;height:86%!important;max-width:86%!important;max-height:86%!important;object-fit:contain!important;object-position:center!important;transform:none!important;background:transparent!important}#viewHome [data-category="computer"] .kg-product-art img,#viewHome [data-category="bilgisayar"] .kg-product-art img{width:92%!important;max-width:92%!important;height:78%!important;max-height:78%!important}`;document.head.appendChild(s);
}
function applyImages(){
  installStyle();var root=document.getElementById("viewHome")||document;
  Object.keys(CATEGORY_IMAGES).forEach(function(key){root.querySelectorAll('[data-category="'+key+'"]').forEach(function(card){var img=card.querySelector(".kg-product-art img,.category-image img,.category-media img");if(!img)return;var src=CATEGORY_IMAGES[key];if(img.getAttribute("data-kg-stable-src")===src)return;img.src=src;img.setAttribute("data-kg-stable-src",src);img.alt=CATEGORY_ALT[key]||"İkinci el cihaz";img.loading="eager";img.decoding="async";img.onerror=null;});});
}

function installAccountStyle(){
  if(document.getElementById("kgAccountActionStyle"))return;
  var s=document.createElement("style");
  s.id="kgAccountActionStyle";
  s.textContent=`
  .kg-account-logout{height:46px;display:inline-flex;align-items:center;justify-content:center;padding:0 14px;border:1px solid #536278;border-radius:12px;background:rgba(255,255,255,.04);color:#fff;font-size:12px;font-weight:900;white-space:nowrap;cursor:pointer}
  .kg-account-logout:hover{background:rgba(255,255,255,.10)}
  .kg-account-logout:disabled{opacity:.6;cursor:wait}
  @media(max-width:900px){.kg-account-logout{height:42px;padding:0 10px;font-size:11px}}
  @media(max-width:600px){.kg-account-logout{padding:0 9px;font-size:10px}}
  `;
  document.head.appendChild(s);
}
function ensureAuthBackend(){
  if(window.KGMarketplaceSupabase)return Promise.resolve(window.KGMarketplaceSupabase);
  return new Promise(function(resolve,reject){
    var existing=document.querySelector('script[data-kg-marketplace-backend]');
    if(!existing){
      existing=document.createElement("script");
      existing.src="/assets/supabase-marketplace.js";
      existing.async=true;
      existing.dataset.kgMarketplaceBackend="1";
      document.head.appendChild(existing);
    }
    var tries=0,t=setInterval(function(){
      tries++;
      if(window.KGMarketplaceSupabase){clearInterval(t);resolve(window.KGMarketplaceSupabase);}
      else if(tries>=120){clearInterval(t);reject(new Error("Oturum bilgisi yüklenemedi."));}
    },50);
    existing.addEventListener("error",function(){clearInterval(t);reject(new Error("Oturum sistemi yüklenemedi."));},{once:true});
  });
}
function setLogoutButton(user){
  var actions=document.querySelector(".kg-approved-topbar .kg-topbar-actions");
  if(!actions)return;
  var button=document.getElementById("kgAccountLogout");
  if(!user){if(button)button.remove();return;}
  installAccountStyle();
  if(button)return;
  button=document.createElement("button");
  button.type="button";
  button.id="kgAccountLogout";
  button.className="kg-account-logout";
  button.textContent="Çıkış Yap";
  button.setAttribute("aria-label","KaçaGider hesabından çıkış yap");
  button.addEventListener("click",async function(){
    button.disabled=true;
    button.textContent="Çıkılıyor…";
    try{
      var api=await ensureAuthBackend();
      await api.ready;
      var result=await api.signOut();
      if(result&&result.error)throw result.error;
      try{sessionStorage.removeItem("kg-pending-listing-auth-v1");}catch(_e){}
      window.location.assign("/");
    }catch(error){
      console.error("KaçaGider çıkış:",error);
      button.disabled=false;
      button.textContent="Çıkış Yap";
      alert("Çıkış işlemi tamamlanamadı. Lütfen tekrar dene.");
    }
  });
  var theme=actions.querySelector(".kg-theme-btn");
  if(theme)actions.insertBefore(button,theme);else actions.appendChild(button);
}
async function syncLogoutButton(){
  try{
    var api=await ensureAuthBackend();
    await api.ready;
    var user=api.getSessionUser?await api.getSessionUser():await api.getUser();
    setLogoutButton(user);
    if(authWatchInstalled)return;
    var client=await api.init();
    if(client&&client.auth&&typeof client.auth.onAuthStateChange==="function"){
      authWatchInstalled=true;
      client.auth.onAuthStateChange(function(_event,session){setLogoutButton(session&&session.user?session.user:null);});
    }
  }catch(error){
    console.warn("KaçaGider hesap durumu:",error);
  }
}

function boot(){applyImages();requestAnimationFrame(applyImages);setTimeout(applyImages,350);syncLogoutButton();setTimeout(syncLogoutButton,500);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();