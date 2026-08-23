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

/* Son onaylanan görünüm: kırmızı telefon, tek mor iPad, mor MacBook, tek Milanese saat, kutusuz PS5. */
var LATEST_CATEGORY_IMAGES={
  phone:"https://www.smartmobsolution.com/wp-content/uploads/2023/08/Product-Red.jpg",
  telefon:"https://www.smartmobsolution.com/wp-content/uploads/2023/08/Product-Red.jpg",
  tablet:"https://uk.static.webuy.com/product_images/Computing/Apple%20iPad/SAPPA24362TBSPGWIFA_l.jpg",
  computer:"https://estore.jawwal.ps/storage/product/4968/3CGHOZcn3BlG6UKhFZiabuRcN7q0nqCbpup4hVCs.jpg",
  bilgisayar:"https://estore.jawwal.ps/storage/product/4968/3CGHOZcn3BlG6UKhFZiabuRcN7q0nqCbpup4hVCs.jpg",
  watch:"https://www.suritt.com/cdn/shop/files/milanesasilvernueva.jpg",
  "akilli-saat":"https://www.suritt.com/cdn/shop/files/milanesasilvernueva.jpg",
  console:"/assets/categories/oyun-konsolu.jpg?v=20260824e",
  "oyun-konsolu":"/assets/categories/oyun-konsolu.jpg?v=20260824e"
};

var CATEGORY_FALLBACK_IMAGES={
  phone:"/assets/categories/latest/telefon-card.webp",
  telefon:"/assets/categories/latest/telefon-card.webp",
  tablet:"/assets/categories/tablet.jpg",
  computer:"/assets/categories/bilgisayar.jpg",
  bilgisayar:"/assets/categories/bilgisayar.jpg",
  watch:"/assets/categories/akilli-saat.jpg",
  "akilli-saat":"/assets/categories/akilli-saat.jpg",
  console:"/assets/categories/oyun-konsolu.jpg",
  "oyun-konsolu":"/assets/categories/oyun-konsolu.jpg"
};

/* Kartların görsel alanındaki optik boyutları eşitlenmiştir. */
var CATEGORY_SIZE={
  phone:{w:"78%",h:"78%"},
  telefon:{w:"78%",h:"78%"},
  tablet:{w:"82%",h:"82%"},
  computer:{w:"88%",h:"72%"},
  bilgisayar:{w:"88%",h:"72%"},
  watch:{w:"82%",h:"82%"},
  "akilli-saat":{w:"82%",h:"82%"},
  console:{w:"84%",h:"78%"},
  "oyun-konsolu":{w:"84%",h:"78%"}
};

var CATEGORY_ALT={
  phone:"Kırmızı lansman telefon modeli",
  telefon:"Kırmızı lansman telefon modeli",
  tablet:"Tek iPad Pro ürün görseli",
  computer:"Tek MacBook Pro ürün görseli",
  bilgisayar:"Tek MacBook Pro ürün görseli",
  watch:"Tek Apple Watch Milanese ürün görseli",
  "akilli-saat":"Tek Apple Watch Milanese ürün görseli",
  console:"PlayStation 5 ve DualSense ürün görseli",
  "oyun-konsolu":"PlayStation 5 ve DualSense ürün görseli"
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
  Object.keys(LATEST_CATEGORY_IMAGES).forEach(function(key){
    root.querySelectorAll('[data-category="'+key+'"]').forEach(function(card){
      var art=card.querySelector('.kg-product-art');
      var img=art&&art.querySelector('img');
      if(!art||!img) return;
      var src=LATEST_CATEGORY_IMAGES[key];
      var size=CATEGORY_SIZE[key]||{w:"82%",h:"82%"};

      art.style.setProperty('position','relative','important');
      art.style.setProperty('overflow','hidden','important');
      art.style.setProperty('display','flex','important');
      art.style.setProperty('align-items','center','important');
      art.style.setProperty('justify-content','center','important');
      art.style.setProperty('background','#fff','important');

      if(img.getAttribute('data-kg-direct-src')!==src){
        img.setAttribute('src',src);
        img.setAttribute('data-kg-direct-src',src);
        img.setAttribute('alt',CATEGORY_ALT[key]||'Güncel cihaz modeli');
        img.setAttribute('loading','eager');
        img.setAttribute('decoding','async');
        img.onerror=function(){
          var fallback=CATEGORY_FALLBACK_IMAGES[key];
          if(fallback && this.getAttribute('src')!==fallback){
            this.onerror=null;
            this.setAttribute('src',fallback);
          }
        };
      }

      img.style.setProperty('display','block','important');
      img.style.setProperty('position','static','important');
      img.style.setProperty('width',size.w,'important');
      img.style.setProperty('height',size.h,'important');
      img.style.setProperty('max-width',size.w,'important');
      img.style.setProperty('max-height',size.h,'important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('object-position','center center','important');
      img.style.setProperty('transform','none','important');
      img.style.setProperty('transform-origin','center center','important');
      img.style.setProperty('background','#fff','important');
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