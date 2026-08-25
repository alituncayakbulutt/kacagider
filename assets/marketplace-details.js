(function(){
"use strict";
if(window.__KG_MARKETPLACE_DETAILS__) return;
window.__KG_MARKETPLACE_DETAILS__=true;

var CATEGORY_IMAGES={
  phone:"/assets/categories/telefon.jpg",
  telefon:"/assets/categories/telefon.jpg",
  tablet:"/assets/categories/tablet.jpg",
  computer:"/assets/categories/bilgisayar.jpg",
  bilgisayar:"/assets/categories/bilgisayar.jpg",
  watch:"/assets/categories/akilli-saat.jpg",
  "akilli-saat":"/assets/categories/akilli-saat.jpg",
  console:"/assets/categories/oyun-konsolu.jpg",
  "oyun-konsolu":"/assets/categories/oyun-konsolu.jpg"
};
var CATEGORY_ALT={
  phone:"İkinci el telefon",
  telefon:"İkinci el telefon",
  tablet:"İkinci el tablet",
  computer:"İkinci el bilgisayar",
  bilgisayar:"İkinci el bilgisayar",
  watch:"İkinci el akıllı saat",
  "akilli-saat":"İkinci el akıllı saat",
  console:"İkinci el oyun konsolu",
  "oyun-konsolu":"İkinci el oyun konsolu"
};
var GROUP_LABELS={
  deviceRegistration:"Cihaz Kaydı",
  scratchCount:"Ekran Çizik Sayısı",
  scratchDepth:"Ekran Çizik Derinliği",
  protector:"Piksel Atması",
  dent:"Kasa Ezik / Darbe",
  surface:"Kasa Yüzeyi",
  corners:"Köşeler",
  backGlass:"Arka Cam Durumu"
};

function cleanText(v){return String(v||"").replace(/\s+/g," ").trim();}
function addDetail(out,seen,label,value){
  label=cleanText(label);value=cleanText(value);
  if(!label||!value||/^(Seçiniz|—)$/i.test(value)) return;
  var key=label.toLocaleLowerCase("tr-TR");
  if(seen[key]) return;
  seen[key]=true;
  out.push({label:label,value:value});
}
function collectDetails(){
  var root=document.querySelector("#valuationArea")||document.querySelector(".form-panel")||document;
  var out=[],seen={};
  root.querySelectorAll("select").forEach(function(el){
    if(["phoneBrand","model","storage","genericBrand","genericModel","genericStorage"].indexOf(el.id)>=0) return;
    var field=el.closest(".field");
    var label=field&&field.querySelector("label");
    var opt=el.options&&el.options[el.selectedIndex];
    addDetail(out,seen,cleanText(label&&label.textContent).replace(/\s*ⓘ\s*$/, ""),opt?opt.textContent:el.value);
  });
  root.querySelectorAll(".option-row[data-group]").forEach(function(row){
    var active=row.querySelector(".option.active");
    if(!active) return;
    var group=row.getAttribute("data-group")||"";
    var label=GROUP_LABELS[group]||group;
    addDetail(out,seen,label,active.textContent);
  });
  return out;
}
window.KGMarketplaceCollectDetails=collectDetails;

function installStyle(){
  if(document.getElementById("kgStableCategoryStyle")) return;
  var s=document.createElement("style");
  s.id="kgStableCategoryStyle";
  s.textContent=`
  #viewHome .kg-product-art,
  #viewHome .category-image,
  #viewHome .category-media{
    overflow:hidden!important;
    display:flex!important;
    align-items:center!important;
    justify-content:center!important;
    background:#fff!important;
  }
  #viewHome .kg-product-art img,
  #viewHome .category-image img,
  #viewHome .category-media img{
    display:block!important;
    width:86%!important;
    height:86%!important;
    max-width:86%!important;
    max-height:86%!important;
    object-fit:contain!important;
    object-position:center!important;
    transform:none!important;
    background:transparent!important;
  }
  #viewHome [data-category="computer"] .kg-product-art img,
  #viewHome [data-category="bilgisayar"] .kg-product-art img{width:92%!important;max-width:92%!important;height:78%!important;max-height:78%!important}
  `;
  document.head.appendChild(s);
}
function applyCategoryImages(){
  installStyle();
  var root=document.getElementById("viewHome")||document;
  Object.keys(CATEGORY_IMAGES).forEach(function(key){
    root.querySelectorAll('[data-category="'+key+'"]').forEach(function(card){
      var img=card.querySelector(".kg-product-art img,.category-image img,.category-media img");
      if(!img) return;
      var src=CATEGORY_IMAGES[key];
      if(img.getAttribute("data-kg-stable-src")===src) return;
      img.src=src;
      img.setAttribute("data-kg-stable-src",src);
      img.alt=CATEGORY_ALT[key]||"İkinci el cihaz";
      img.loading="eager";
      img.decoding="async";
      img.onerror=null;
    });
  });
}
function boot(){
  applyCategoryImages();
  requestAnimationFrame(applyCategoryImages);
  setTimeout(applyCategoryImages,350);
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
else boot();
})();