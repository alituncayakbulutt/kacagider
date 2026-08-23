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

/*
  Ana kategori kartlarında güncel resmi ürün görselleri kullanılır.
  Telefon görseli kullanıcı tarafından seçilen lansman görseli olarak yerelde kalır.
  Diğer kategoriler Apple / PlayStation resmi ürün kaynaklarından gelir.
*/
var LATEST_CATEGORY_IMAGES={
  phone:"/assets/categories/latest/telefon-card.webp?v=20260824c",
  telefon:"/assets/categories/latest/telefon-card.webp?v=20260824c",
  tablet:"https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/ipad-pro-11-inch-m5.png",
  computer:"https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/macbook-pro-14-inch-m5-pro-m5-max.png",
  bilgisayar:"https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/macbook-pro-14-inch-m5-pro-m5-max.png",
  watch:"https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/apple-watch-ultra-3-hero.png",
  "akilli-saat":"https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/apple-watch-ultra-3-hero.png",
  console:"https://gmedia.playstation.com/is/image/SIEPDC/PS5-Pro-box-image-block-01-en-02apr25",
  "oyun-konsolu":"https://gmedia.playstation.com/is/image/SIEPDC/PS5-Pro-box-image-block-01-en-02apr25"
};

var CATEGORY_FALLBACK_IMAGES={
  tablet:"/assets/categories/tablet.jpg",
  computer:"/assets/categories/bilgisayar.jpg",
  bilgisayar:"/assets/categories/bilgisayar.jpg",
  watch:"/assets/categories/akilli-saat.jpg",
  "akilli-saat":"/assets/categories/akilli-saat.jpg",
  console:"/assets/categories/oyun-konsolu.jpg",
  "oyun-konsolu":"/assets/categories/oyun-konsolu.jpg"
};

var CATEGORY_SCALE={
  phone:"scale(1.55)",
  telefon:"scale(1.55)",
  tablet:"scale(1.02)",
  computer:"scale(1.04)",
  bilgisayar:"scale(1.04)",
  watch:"scale(.96)",
  "akilli-saat":"scale(.96)",
  console:"scale(1.04)",
  "oyun-konsolu":"scale(1.04)"
};

var CATEGORY_ALT={
  phone:"Kozmik turuncu güncel lansman telefon modeli",
  telefon:"Kozmik turuncu güncel lansman telefon modeli",
  tablet:"Apple iPad Pro M5",
  computer:"Apple MacBook Pro M5 Pro ve M5 Max",
  bilgisayar:"Apple MacBook Pro M5 Pro ve M5 Max",
  watch:"Apple Watch Ultra 3",
  "akilli-saat":"Apple Watch Ultra 3",
  console:"PlayStation 5 Pro",
  "oyun-konsolu":"PlayStation 5 Pro"
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
      img.style.setProperty('width','100%','important');
      img.style.setProperty('height','100%','important');
      img.style.setProperty('max-width','100%','important');
      img.style.setProperty('max-height','100%','important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('object-position','center center','important');
      img.style.setProperty('transform',CATEGORY_SCALE[key]||'scale(1)','important');
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