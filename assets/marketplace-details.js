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

/* Son hedef görünüm: kırmızı telefon, tek mor iPad, mor MacBook, tek Milanese saat, kutusuz PS5. */
var LATEST_CATEGORY_IMAGES={
  phone:"/assets/categories/latest/telefon-card-v2.png",
  telefon:"/assets/categories/latest/telefon-card-v2.png",
  tablet:"/assets/categories/latest/tablet-card-v2.png",
  computer:"/assets/categories/latest/bilgisayar-card-v2.png",
  bilgisayar:"/assets/categories/latest/bilgisayar-card-v2.png",
  watch:"/assets/categories/latest/akilli-saat-card-v2.png",
  "akilli-saat":"/assets/categories/latest/akilli-saat-card-v2.png",
  console:"/assets/categories/latest/oyun-konsolu-card-v2.png",
  "oyun-konsolu":"/assets/categories/latest/oyun-konsolu-card-v2.png"
};

var CATEGORY_FALLBACK_IMAGES={
  phone:"/assets/categories/latest/telefon-card-v2.png",
  telefon:"/assets/categories/latest/telefon-card-v2.png",
  tablet:"/assets/categories/latest/tablet-card-v2.png",
  computer:"/assets/categories/latest/bilgisayar-card-v2.png",
  bilgisayar:"/assets/categories/latest/bilgisayar-card-v2.png",
  watch:"/assets/categories/latest/akilli-saat-card-v2.png",
  "akilli-saat":"/assets/categories/latest/akilli-saat-card-v2.png",
  console:"/assets/categories/latest/oyun-konsolu-card-v2.png",
  "oyun-konsolu":"/assets/categories/latest/oyun-konsolu-card-v2.png"
};

var CATEGORY_SIZE={
  phone:{w:"84%",h:"84%"},
  telefon:{w:"84%",h:"84%"},
  tablet:{w:"86%",h:"86%"},
  computer:{w:"92%",h:"76%"},
  bilgisayar:{w:"92%",h:"76%"},
  watch:{w:"84%",h:"84%"},
  "akilli-saat":{w:"84%",h:"84%"},
  console:{w:"86%",h:"82%"},
  "oyun-konsolu":{w:"86%",h:"82%"}
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
      var size=CATEGORY_SIZE[key]||{w:"84%",h:"84%"};

      art.style.setProperty('position','relative','important');
      art.style.setProperty('overflow','hidden','important');
      art.style.setProperty('display','flex','important');
      art.style.setProperty('align-items','center','important');
      art.style.setProperty('justify-content','center','important');
      art.style.setProperty('background','#fff','important');
      art.style.setProperty('height','300px','important');
      art.style.setProperty('min-height','300px','important');
      art.style.setProperty('padding','58px 14px 12px','important');
      art.style.setProperty('box-sizing','border-box','important');

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
})();