(function(){
"use strict";
if(window.__KG_HERO_SLIDER_SYNC__) return;
window.__KG_HERO_SLIDER_SYNC__=true;

function installStyle(){
  if(document.getElementById('kgHeroSliderSyncStyle')) return;
  var style=document.createElement('style');
  style.id='kgHeroSliderSyncStyle';
  style.textContent=`
    #viewHome .kg-market-copy h1{
      margin:0;
      max-width:760px;
      color:#0b1628;
      font-size:43px;
      line-height:1.04;
      letter-spacing:-1.45px;
      font-weight:950;
    }
    #viewHome .kg-market-copy h1 span{color:#16a34a}
    #viewHome .kg-approved-hero.kg-hero-moved,
    #viewHome .hero.kg-hero-moved{display:none!important}
    html[data-theme="dark"] #viewHome .kg-market-copy h1{color:#f1f5f9}
    @media(max-width:980px){#viewHome .kg-market-copy h1{font-size:37px;text-align:center}}
    @media(max-width:640px){#viewHome .kg-market-copy h1{font-size:31px;letter-spacing:-.9px}}
  `;
  document.head.appendChild(style);
}

function setText(el,text){
  if(el && el.textContent!==text) el.textContent=text;
}

function wireFreeListing(el){
  if(!el || el.dataset.kgFreeListingWired==='1') return;
  el.dataset.kgFreeListingWired='1';
  if(el.tagName==='A') el.setAttribute('href','#');
  el.addEventListener('click',function(e){
    e.preventDefault();
    var action=document.querySelector('.kg-mp-home-action');
    if(action){action.click();return;}
    if(typeof window.kgGoCategory==='function'){window.kgGoCategory('phone');return;}
    var phone=document.querySelector('[data-category="phone"]');
    if(phone) phone.click();
  });
}

function wireListings(el){
  if(!el || el.dataset.kgListingsWired==='1') return;
  el.dataset.kgListingsWired='1';
  if(el.tagName==='A') el.setAttribute('href','/ilanlar/');
  else el.addEventListener('click',function(e){e.preventDefault();window.location.href='/ilanlar/';});
}

function sync(){
  if(window.location.pathname!=='/') return false;
  var home=document.getElementById('viewHome');
  if(!home) return false;
  var hero=home.querySelector('.kg-approved-hero,.hero');
  var slider=home.querySelector('#kgMarketplaceSlider,.kg-market-slider');
  if(!hero || !slider) return false;
  var slides=slider.querySelectorAll('.kg-market-slide');
  if(!slides.length) return false;

  installStyle();

  var first=slides[0];
  var firstCopy=first.querySelector('.kg-market-copy');
  var sourceH1=hero.querySelector('h1');
  var sourceP=hero.querySelector('p');
  if(firstCopy && sourceH1 && !firstCopy.querySelector('h1')){
    var oldH2=firstCopy.querySelector('h2');
    if(oldH2) oldH2.replaceWith(sourceH1); else firstCopy.insertBefore(sourceH1,firstCopy.firstChild);
    var oldP=firstCopy.querySelector('p');
    if(sourceP){if(oldP) oldP.replaceWith(sourceP); else firstCopy.appendChild(sourceP);}
  }
  hero.classList.add('kg-hero-moved');

  setText(first.querySelector('.kg-market-eyebrow'),'ANINDA DEĞERLEME');
  var firstButtons=first.querySelectorAll('.kg-market-btn');
  if(firstButtons[0]) setText(firstButtons[0],'Fiyatını Hesapla →');
  if(firstButtons[1]){setText(firstButtons[1],'Ücretsiz İlan Ver →');wireFreeListing(firstButtons[1]);}

  if(slides[1]){
    var second=slides[1];
    var h2=second.querySelector('h2');
    if(h2) h2.innerHTML='Değerini öğren. <span>Doğru fiyata sat.</span>';
    setText(second.querySelector('p'),'Cihazının güncel piyasa değerini öğren, ücretsiz ilanını oluştur ve alıcını bul.');
    setText(second.querySelector('.kg-market-eyebrow'),'ÜCRETSİZ İLAN');
    var secondButtons=second.querySelectorAll('.kg-market-btn');
    if(secondButtons[0]) setText(secondButtons[0],'Ücretsiz İlan Ver →');
    if(secondButtons[1]){setText(secondButtons[1],'İlanları Gör →');wireListings(secondButtons[1]);}
  }

  if(slides[2]){
    setText(slides[2].querySelector('.kg-market-eyebrow'),'ŞEFFAF FİYAT KARŞILAŞTIRMASI');
  }
  return true;
}

function boot(){
  if(sync()) return;
  var tries=0;
  var timer=setInterval(function(){
    tries++;
    if(sync() || tries>80) clearInterval(timer);
  },100);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
