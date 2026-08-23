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

var SPRITE="/assets/categories/latest/categories-sprite.svg?v=20260823e";
var LATEST_CATEGORY_TRANSFORMS={
  phone:"translateX(-10%)",
  telefon:"translateX(-10%)",
  tablet:"translateX(-30%)",
  computer:"translateX(-50%)",
  bilgisayar:"translateX(-50%)",
  watch:"translateX(-70%)",
  "akilli-saat":"translateX(-70%)",
  console:"translateX(-90%)",
  "oyun-konsolu":"translateX(-90%)"
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
  Object.keys(LATEST_CATEGORY_TRANSFORMS).forEach(function(key){
    root.querySelectorAll('[data-category="'+key+'"]').forEach(function(card){
      var art=card.querySelector('.kg-product-art');
      var img=art&&art.querySelector('img');
      if(!art||!img) return;
      art.setAttribute('role','img');
      art.setAttribute('aria-label',CATEGORY_ALT[key]||'Güncel cihaz modeli');
      art.style.setProperty('position','relative','important');
      art.style.setProperty('overflow','hidden','important');
      art.style.setProperty('background','#fff','important');
      img.setAttribute('src',SPRITE);
      img.setAttribute('alt','');
      img.style.setProperty('display','block','important');
      img.style.setProperty('position','absolute','important');
      img.style.setProperty('top','0','important');
      img.style.setProperty('left','50%','important');
      img.style.setProperty('height','100%','important');
      img.style.setProperty('width','auto','important');
      img.style.setProperty('max-width','none','important');
      img.style.setProperty('object-fit','fill','important');
      img.style.setProperty('background','transparent','important');
      img.style.setProperty('transform',LATEST_CATEGORY_TRANSFORMS[key],'important');
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