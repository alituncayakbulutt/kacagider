(function(){
"use strict";
if(window.__KG_MARKETPLACE_DETAILS__) return;
window.__KG_MARKETPLACE_DETAILS__=true;

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

var SPRITE="/assets/categories/latest/categories-sprite.svg?v=20260823d";
var LATEST_CATEGORY_POSITIONS={
  phone:"0% 50%",
  telefon:"0% 50%",
  tablet:"25% 50%",
  computer:"50% 50%",
  bilgisayar:"50% 50%",
  watch:"75% 50%",
  "akilli-saat":"75% 50%",
  console:"100% 50%",
  "oyun-konsolu":"100% 50%"
};

var CATEGORY_ALT={
  phone:"Güncel lansman renkli telefon",
  telefon:"Güncel lansman renkli telefon",
  tablet:"Güncel tablet modeli",
  computer:"Güncel dizüstü bilgisayar modeli",
  bilgisayar:"Güncel dizüstü bilgisayar modeli",
  watch:"Güncel akıllı saat modeli",
  "akilli-saat":"Güncel akıllı saat modeli",
  console:"Güncel oyun konsolu modeli",
  "oyun-konsolu":"Güncel oyun konsolu modeli"
};

function cleanText(v){return String(v||"").replace(/\s+/g," ").trim()}
function labelForSelect(el){
  var field=el.closest('.field');
  var label=field&&field.querySelector('label');
  return cleanText(label&&label.textContent).replace(/\s*ⓘ\s*$/,'');
}
function labelForGroup(row){
  var group=row.getAttribute('data-group')||'';
  if(GROUP_LABELS[group]) return GROUP_LABELS[group];
  var parent=row.parentElement;
  var label=parent&&parent.querySelector('.field label');
  if(!label && parent&&parent.previousElementSibling) label=parent.previousElementSibling.querySelector&&parent.previousElementSibling.querySelector('label');
  return cleanText(label&&label.textContent).replace(/\s*ⓘ\s*$/,'') || group;
}
function add(out,seen,label,value){
  label=cleanText(label); value=cleanText(value);
  if(!label||!value||/^(Seçiniz|—)$/i.test(value)) return;
  var key=label.toLocaleLowerCase('tr-TR');
  if(seen[key]) return;
  seen[key]=true;
  out.push({label:label,value:value});
}
function collectDetails(){
  var root=document.querySelector('#valuationArea')||document.querySelector('.form-panel')||document;
  var out=[],seen={};
  root.querySelectorAll('select').forEach(function(el){
    if(['phoneBrand','model','storage','genericBrand','genericModel','genericStorage'].indexOf(el.id)>=0) return;
    var opt=el.options&&el.options[el.selectedIndex];
    add(out,seen,labelForSelect(el),opt?opt.textContent:el.value);
  });
  root.querySelectorAll('.option-row[data-group]').forEach(function(row){
    var active=row.querySelector('.option.active');
    if(!active) return;
    add(out,seen,labelForGroup(row),active.textContent);
  });
  return out;
}

var original=Storage.prototype.setItem;
Storage.prototype.setItem=function(key,value){
  if(key==='kg_marketplace_listings_v1'){
    try{
      var rows=JSON.parse(value);
      if(Array.isArray(rows)&&rows.length){
        var last=rows[rows.length-1];
        if(last&&typeof last==='object'&&(!Array.isArray(last.details)||!last.details.length)){
          last.details=collectDetails();
          value=JSON.stringify(rows);
        }
      }
    }catch(e){}
  }
  return original.call(this,key,value);
};

function installLatestCategoryImages(){
  var root=document.getElementById('viewHome')||document;
  Object.keys(LATEST_CATEGORY_POSITIONS).forEach(function(key){
    root.querySelectorAll('[data-category="'+key+'"]').forEach(function(card){
      var art=card.querySelector('.kg-product-art');
      if(!art) return;
      art.setAttribute('role','img');
      art.setAttribute('aria-label',CATEGORY_ALT[key]||'Güncel cihaz modeli');
      art.style.setProperty('background-image','url("'+SPRITE+'")','important');
      art.style.setProperty('background-repeat','no-repeat','important');
      art.style.setProperty('background-size','500% 100%','important');
      art.style.setProperty('background-position',LATEST_CATEGORY_POSITIONS[key],'important');
      art.style.setProperty('background-color','#fff','important');
      var img=art.querySelector('img');
      if(img) img.style.setProperty('display','none','important');
    });
  });
}

function installListingsNav(){
  if(document.getElementById('kgMpListingsNav')) return;
  var nav=document.querySelector('.kg-main-nav');
  if(!nav){
    var infoCandidates=Array.from(document.querySelectorAll('a,button')).filter(function(el){
      return cleanText(el.textContent).toLocaleUpperCase('tr-TR').indexOf('BİLGİ MERKEZİ')!==-1;
    });
    if(infoCandidates.length) nav=infoCandidates[0].parentElement;
  }
  if(!nav) return;
  var link=document.createElement('a');
  link.id='kgMpListingsNav';
  link.href='/ilanlar/';
  link.textContent='İlanlar';
  link.setAttribute('aria-label','Yayındaki ilanları görüntüle');
  link.style.whiteSpace='nowrap';
  var info=Array.from(nav.querySelectorAll('a,button')).find(function(el){
    return cleanText(el.textContent).toLocaleUpperCase('tr-TR').indexOf('BİLGİ MERKEZİ')!==-1;
  });
  if(info) nav.insertBefore(link,info);
  else nav.appendChild(link);
}

function loadMarketplaceHeader(){
  if(document.getElementById('kgMarketplaceHomeHeaderScript')) return;
  var s=document.createElement('script');
  s.id='kgMarketplaceHomeHeaderScript';
  s.src='/assets/marketplace-home-header.js';
  s.defer=true;
  document.head.appendChild(s);
}

function loadMarketplaceSlider(){
  if(document.getElementById('kgMarketplaceHomeSliderScript')) return;
  var s=document.createElement('script');
  s.id='kgMarketplaceHomeSliderScript';
  s.src='/assets/marketplace-home-slider.js';
  s.defer=true;
  document.head.appendChild(s);
}

function syncMarketplaceDetails(){
  installListingsNav();
  installLatestCategoryImages();
}

loadMarketplaceHeader();
loadMarketplaceSlider();
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',syncMarketplaceDetails,{once:true});
else syncMarketplaceDetails();
new MutationObserver(syncMarketplaceDetails).observe(document.documentElement,{subtree:true,childList:true});
})();
