(function(){
"use strict";
if(window.__KG_MARKETPLACE_NAV_V3__) return;
window.__KG_MARKETPLACE_NAV_V3__=true;

function css(){
  if(document.getElementById('kgNavV3Style')) return;
  var s=document.createElement('style');
  s.id='kgNavV3Style';
  s.textContent=`
  .kg-approved-topbar{position:sticky!important;top:0!important;z-index:1000!important;background:#071426!important;border:0!important;box-shadow:0 2px 10px rgba(7,20,38,.12)!important}
  .kg-approved-topbar .kg-topbar-inner{max-width:1480px!important;min-height:88px!important;margin:0 auto!important;padding:12px 30px!important;display:grid!important;grid-template-columns:240px minmax(360px,1fr) auto!important;gap:22px!important;align-items:center!important}
  .kg-approved-topbar .kg-brand{border:0!important;padding:0!important;color:#fff!important;text-decoration:none!important}
  .kg-approved-topbar .kg-brand-main{font-size:36px!important;color:#fff!important}.kg-approved-topbar .kg-brand-main span{color:#22c55e!important}
  .kg-approved-topbar .kg-brand small{color:#fff!important}.kg-approved-topbar .kg-brand-tagline{color:#b8c7d9!important}
  .kg-v3-search{height:54px;display:flex;align-items:center;gap:10px;padding:0 14px 0 17px;border-radius:14px;background:#fff;border:1px solid #e5e7eb;box-shadow:0 4px 14px rgba(2,6,23,.08)}
  .kg-v3-search span{color:#64748b;font-size:18px}.kg-v3-search input{width:100%!important;height:48px!important;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;color:#172033!important;font-size:14px!important;font-weight:650!important;padding:0!important}
  .kg-v3-search button{height:36px;border:0;border-radius:10px;padding:0 14px;background:#eefbf4;color:#087a37;font-weight:900;cursor:pointer}
  .kg-approved-topbar .kg-topbar-actions{display:flex!important;align-items:center!important;gap:10px!important}
  .kg-v3-action{height:46px;display:inline-flex;align-items:center;justify-content:center;padding:0 16px;border-radius:12px;text-decoration:none;font-size:13px;font-weight:900;white-space:nowrap}
  .kg-v3-action.listings{color:#fff;border:1px solid #536278;background:rgba(255,255,255,.04)}
  .kg-v3-action.sell{color:#fff;border:1px solid #16a34a;background:#16a34a;box-shadow:0 8px 18px rgba(22,163,74,.20)}
  .kg-approved-topbar .kg-theme-btn{width:46px!important;height:46px!important;border-radius:12px!important}
  .kg-v3-subbar{width:100%;background:#fff;border-bottom:1px solid #e5e7eb;box-shadow:0 3px 10px rgba(15,23,42,.05)}
  .kg-v3-subbar-inner{max-width:1480px;min-height:60px;margin:0 auto;padding:0 26px;display:flex;align-items:center;justify-content:center}
  .kg-v3-subbar .kg-main-nav{display:flex!important;align-items:center!important;justify-content:center!important;gap:34px!important;width:100%!important;white-space:nowrap!important}
  .kg-v3-subbar .kg-main-nav a{padding:20px 0 18px!important;color:#253047!important;font-size:14px!important;font-weight:800!important;text-decoration:none!important;position:relative!important}
  .kg-v3-subbar .kg-main-nav a:hover,.kg-v3-subbar .kg-main-nav a.active{color:#15803d!important}
  .kg-v3-subbar .kg-main-nav a.active:after{content:"";position:absolute;left:0;right:0;bottom:9px;height:3px;border-radius:9px;background:#16a34a}
  .kg-v3-subbar #kgMpListingsNav{display:none!important}
  #viewHome:not(.category-selected)>.hero,#viewHome:not(.category-selected)>.kg-approved-hero{display:none!important}
  #viewHome:not(.category-selected) #kgMpHome{display:none!important}
  #kgMarketplaceSlider{display:none!important}
  #viewHome.category-selected #kgV3Slider{display:none!important}
  #kgV3Slider{max-width:1408px;margin:28px auto 26px;padding:0 30px;position:relative}
  .kg-v3-shell{position:relative;height:334px;border:1px solid #dce7e1;border-radius:26px;overflow:hidden;background:linear-gradient(118deg,#f7fff9 0%,#f4f8fb 55%,#edf5f0 100%);box-shadow:0 18px 42px rgba(15,23,42,.08)}
  .kg-v3-slide{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1.18fr) minmax(360px,.82fr);align-items:center;gap:30px;padding:38px 58px;opacity:0;visibility:hidden;pointer-events:none;transform:translateX(12px);transition:opacity .38s ease,transform .38s ease}
  .kg-v3-slide.active{opacity:1;visibility:visible;pointer-events:auto;transform:none}
  .kg-v3-copy{max-width:720px}.kg-v3-eyebrow{display:inline-flex;align-items:center;gap:7px;margin-bottom:11px;padding:6px 10px;border-radius:999px;background:#e9faef;color:#087a37;font-size:10px;font-weight:950;letter-spacing:.45px}.kg-v3-eyebrow:before{content:"";width:7px;height:7px;border-radius:50%;background:#16a34a}
  .kg-v3-copy h1,.kg-v3-copy h2{margin:0!important;max-width:760px!important;text-align:left!important;color:#0b1628!important;font-size:42px!important;line-height:1.04!important;letter-spacing:-1.25px!important;font-weight:950!important}
  .kg-v3-copy h1 span,.kg-v3-copy h2 span{color:#16a34a!important}
  .kg-v3-copy p{margin:14px 0 0!important;max-width:680px!important;text-align:left!important;color:#667085!important;font-size:15px!important;line-height:1.55!important}
  .kg-v3-actions{display:flex;gap:11px;flex-wrap:wrap;margin-top:22px}.kg-v3-btn{min-height:48px;padding:0 19px;border-radius:13px;border:1px solid #cfd9d5;background:#fff;color:#142033;font-size:14px;font-weight:900;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.kg-v3-btn.primary{background:#16a34a;border-color:#16a34a;color:#fff;box-shadow:0 10px 20px rgba(22,163,74,.18)}
  .kg-v3-visual{position:relative;height:252px;display:flex;align-items:center;justify-content:center}.kg-v3-card{position:relative;width:min(330px,92%);height:246px;border-radius:25px;border:1px solid rgba(255,255,255,.95);background:rgba(255,255,255,.84);box-shadow:0 22px 46px rgba(15,23,42,.13);display:flex;align-items:center;justify-content:center;overflow:hidden}.kg-v3-card img{width:82%;height:82%;object-fit:contain}.kg-v3-badge{position:absolute;right:1%;top:7%;padding:8px 11px;border-radius:999px;background:#fff;color:#087a37;border:1px solid #e4ece8;font-size:10px;font-weight:950;box-shadow:0 8px 18px rgba(15,23,42,.1)}.kg-v3-stat{position:absolute;left:-5%;bottom:2%;min-width:190px;padding:12px 14px;border-radius:15px;background:#071426;color:#fff;box-shadow:0 12px 28px rgba(7,20,38,.2)}.kg-v3-stat small{display:block;color:#b9c7d8;font-size:9px;font-weight:750;margin-bottom:3px}.kg-v3-stat strong{display:block;color:#4ade80;font-size:14px;font-weight:950}
  .kg-v3-arrow{position:absolute;top:50%;z-index:5;width:42px;height:42px;margin-top:-21px;border:1px solid #d9e3df;border-radius:50%;background:#fff;color:#142033;box-shadow:0 8px 20px rgba(15,23,42,.1);font-size:24px;line-height:1;cursor:pointer}.kg-v3-arrow.prev{left:14px}.kg-v3-arrow.next{right:14px}.kg-v3-dots{position:absolute;z-index:6;left:50%;bottom:15px;transform:translateX(-50%);display:flex;gap:7px}.kg-v3-dot{width:8px;height:8px;border:0;padding:0;border-radius:999px;background:#aab6b0;cursor:pointer}.kg-v3-dot.active{width:27px;background:#16a34a}
  @media(max-width:1120px){.kg-approved-topbar .kg-topbar-inner{grid-template-columns:205px minmax(280px,1fr) auto!important;gap:15px!important;padding:11px 18px!important}.kg-approved-topbar .kg-brand-main{font-size:31px!important}.kg-v3-subbar .kg-main-nav{gap:22px!important}.kg-v3-subbar .kg-main-nav a{font-size:13px!important}.kg-v3-action{padding:0 12px;font-size:12px}}
  @media(max-width:900px){.kg-approved-topbar .kg-topbar-inner{grid-template-columns:1fr auto!important;grid-template-areas:"brand actions" "search search"!important;gap:10px!important;padding:10px 14px!important}.kg-approved-topbar .kg-brand{grid-area:brand}.kg-v3-search{grid-area:search;height:48px}.kg-approved-topbar .kg-topbar-actions{grid-area:actions}.kg-v3-action.listings{display:none}.kg-v3-action.sell{height:42px;padding:0 11px;font-size:11px}.kg-approved-topbar .kg-mobile-nav-toggle{display:block!important;width:42px!important;height:42px!important}.kg-v3-subbar{display:none}.kg-approved-topbar.menu-open .kg-v3-subbar{display:block!important;position:absolute;left:0;right:0;top:100%}.kg-approved-topbar.menu-open .kg-v3-subbar .kg-main-nav{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:0!important;padding:8px 12px!important}.kg-approved-topbar.menu-open .kg-v3-subbar .kg-main-nav a{padding:13px 10px!important}.kg-v3-shell{height:570px}.kg-v3-slide{grid-template-columns:1fr;padding:30px 42px 48px;gap:18px}.kg-v3-copy{text-align:center;margin:auto}.kg-v3-copy h1,.kg-v3-copy h2,.kg-v3-copy p{text-align:center!important}.kg-v3-actions{justify-content:center}.kg-v3-visual{height:205px}.kg-v3-card{height:200px}.kg-v3-copy h1,.kg-v3-copy h2{font-size:35px!important}}
  @media(max-width:600px){#kgV3Slider{padding:0 10px;margin:15px auto 20px}.kg-v3-shell{height:590px;border-radius:20px}.kg-v3-slide{padding:26px 24px 48px}.kg-v3-copy h1,.kg-v3-copy h2{font-size:30px!important}.kg-v3-copy p{font-size:14px!important}.kg-v3-actions{display:grid;grid-template-columns:1fr}.kg-v3-btn{width:100%}.kg-v3-visual{height:185px}.kg-v3-card{width:255px;height:180px}.kg-v3-stat{left:1%;min-width:155px}.kg-v3-badge{right:1%}.kg-v3-arrow{width:36px;height:36px;margin-top:-18px}}
  `;
  document.head.appendChild(s);
}

function goValue(){
  if(typeof window.kgGoCategory==='function'){window.kgGoCategory('phone');return;}
  var card=document.querySelector('[data-category="phone"]');
  if(card) card.click();
}
function goSell(){
  var b=document.querySelector('.kg-mp-home-action');
  if(b){b.click();return;}
  goValue();
}
function rebuildHeader(){
  var header=document.querySelector('.kg-approved-topbar');
  if(!header) return false;
  var inner=header.querySelector('.kg-topbar-inner');
  var nav=header.querySelector('.kg-main-nav');
  var actions=header.querySelector('.kg-topbar-actions');
  if(!inner||!nav||!actions) return false;
  css();
  header.querySelectorAll('.kg-market-search,.kg-v3-search').forEach(function(x){x.remove();});
  header.querySelectorAll('.kg-market-subbar,.kg-v3-subbar').forEach(function(x){var n=x.querySelector('.kg-main-nav');if(n&&n!==nav)return;x.remove();});
  var search=document.createElement('form');
  search.className='kg-v3-search';
  search.innerHTML='<span aria-hidden="true">⌕</span><input type="search" placeholder="Marka, model veya ilan ara..." aria-label="İlanlarda ara"><button type="submit">Ara</button>';
  search.onsubmit=function(e){e.preventDefault();var q=search.querySelector('input').value.trim();if(q)location.href='/ilanlar/?q='+encodeURIComponent(q);};
  inner.insertBefore(search,actions);
  var mobile=actions.querySelector('#mobileNavToggle');
  var theme=actions.querySelector('#themeToggle');
  actions.innerHTML='';
  var listings=document.createElement('a');listings.href='/ilanlar/';listings.className='kg-v3-action listings';listings.textContent='İlanlar';
  var sell=document.createElement('a');sell.href='#';sell.className='kg-v3-action sell';sell.textContent='Ücretsiz İlan Ver';sell.onclick=function(e){e.preventDefault();goSell();};
  actions.appendChild(listings);actions.appendChild(sell);if(mobile)actions.appendChild(mobile);if(theme)actions.appendChild(theme);
  var sub=document.createElement('div');sub.className='kg-v3-subbar';var si=document.createElement('div');si.className='kg-v3-subbar-inner';sub.appendChild(si);si.appendChild(nav);header.appendChild(sub);
  var mp=document.getElementById('kgMpListingsNav');if(mp)mp.style.display='none';
  return true;
}

var slides=[
  {eyebrow:'GÜNCEL PİYASA DEĞERİ',title:'Telefonun Kaç Para Eder? <span>Güncel İkinci El Telefon Değerini Öğren</span>',text:'Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel piyasa verilerini değerlendirerek ortalama satış değerini öğren.',primary:'Piyasa Değerini Hesapla',secondary:'Ücretsiz İlan Ver',image:'/assets/categories/telefon.jpg',badge:'Üyeliksiz sorgulama',stat1:'Piyasa araştırması',stat2:'Ortalama satış değeri'},
  {eyebrow:'KAÇAGİDER PAZARYERİ',title:'Değerini öğren. <span>Doğru fiyata sat.</span>',text:'Cihazının güncel piyasa değerini öğren, ücretsiz ilanını oluştur ve alıcını bul.',primary:'Ücretsiz İlan Ver',secondary:'İlanları Gör',image:'/assets/categories/telefon.jpg',badge:'Ücretsiz ilan',stat1:'KaçaGider piyasa değeri',stat2:'Bağımsız piyasa verisi'},
  {eyebrow:'ŞEFFAF KARŞILAŞTIRMA',title:'İlan fiyatını piyasa değeriyle karşılaştır. <span>Güvenle karar ver.</span>',text:'Satıcının ilan fiyatını KaçaGider piyasa değeriyle yan yana gör. Değerine yakın ilanları daha kolay fark et.',primary:'İlanları İncele',secondary:'Piyasa Değerini Hesapla',image:'/assets/categories/tablet.jpg',badge:'Piyasa değerine yakın',stat1:'Karşılaştırma',stat2:'Piyasa değeri + ilan fiyatı'}
];

function normalizeMarketLanguage(root){
  root=root||document;
  var replacements=[
    ['KaçaGider tahmini değeri','KaçaGider piyasa değeri'],
    ['KaçaGider tahmini','KaçaGider piyasa değeri'],
    ['tahmini satış fiyatı','ortalama satış değeri'],
    ['Tahmini satış fiyatı','Ortalama satış değeri'],
    ['tahmini fiyat','ortalama satış değeri'],
    ['Tahmini fiyat','Ortalama satış değeri'],
    ['anında fiyat tahmini al','güncel piyasa değerini öğren'],
    ['Anında fiyat tahmini al','Güncel piyasa değerini öğren'],
    ['anında tahmin','sonucu saniyeler içinde gör'],
    ['Anında tahmin','Sonucu saniyeler içinde gör'],
    ['tahmini değer','piyasa değeri'],
    ['Tahmini değer','Piyasa değeri'],
    ['tahminle karşılaştır','piyasa değeriyle karşılaştır'],
    ['Tahminle karşılaştır','Piyasa değeriyle karşılaştır'],
    ['Tahmin + ilan fiyatı','Piyasa değeri + ilan fiyatı']
  ];
  var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  var node;
  while((node=walker.nextNode())){
    var text=node.nodeValue;
    if(!text||!text.trim())continue;
    replacements.forEach(function(pair){text=text.split(pair[0]).join(pair[1]);});
    node.nodeValue=text;
  }
}

function installSlider(){
  if(location.pathname!=='/') return;
  var home=document.getElementById('viewHome');if(!home)return;
  css();
  var old=document.getElementById('kgMarketplaceSlider');if(old)old.remove();
  var hero=home.querySelector(':scope > .kg-approved-hero,:scope > .hero');
  if(!hero)return;
  var existing=document.getElementById('kgV3Slider');if(existing)existing.remove();
  var root=document.createElement('section');root.id='kgV3Slider';root.setAttribute('aria-label','KaçaGider hizmetleri');
  var shell=document.createElement('div');shell.className='kg-v3-shell';root.appendChild(shell);
  slides.forEach(function(sl,i){
    var art=document.createElement('article');art.className='kg-v3-slide'+(i===0?' active':'');art.dataset.index=i;
    art.innerHTML='<div class="kg-v3-copy"><span class="kg-v3-eyebrow">'+sl.eyebrow+'</span><div class="kg-v3-title-slot"></div><div class="kg-v3-actions"><button type="button" class="kg-v3-btn primary">'+sl.primary+' →</button><button type="button" class="kg-v3-btn secondary">'+sl.secondary+' →</button></div></div><div class="kg-v3-visual"><div class="kg-v3-card"><img src="'+sl.image+'" alt=""></div><span class="kg-v3-badge">✓ '+sl.badge+'</span><div class="kg-v3-stat"><small>'+sl.stat1+'</small><strong>'+sl.stat2+'</strong></div></div>';
    var slot=art.querySelector('.kg-v3-title-slot');
    if(i===0){
      var h=hero.querySelector('h1');var p=hero.querySelector('p');
      if(h)slot.appendChild(h);
      if(p){p.textContent=sl.text;slot.appendChild(p);}
    }else{
      slot.innerHTML='<h2>'+sl.title+'</h2><p>'+sl.text+'</p>';
    }
    var buttons=art.querySelectorAll('.kg-v3-btn');
    buttons[0].onclick=function(){if(i===0)goValue();else if(i===1)goSell();else location.href='/ilanlar/';};
    buttons[1].onclick=function(){if(i===0)goSell();else if(i===1)location.href='/ilanlar/';else goValue();};
    shell.appendChild(art);
  });
  hero.remove();
  shell.insertAdjacentHTML('beforeend','<button class="kg-v3-arrow prev" type="button" aria-label="Önceki">‹</button><button class="kg-v3-arrow next" type="button" aria-label="Sonraki">›</button><div class="kg-v3-dots">'+slides.map(function(_,i){return '<button class="kg-v3-dot '+(i===0?'active':'')+'" type="button" data-i="'+i+'" aria-label="'+(i+1)+'. slayt"></button>';}).join('')+'</div>');
  home.insertBefore(root,home.firstChild);
  var idx=0,timer;
  function show(n){idx=(n+slides.length)%slides.length;root.querySelectorAll('.kg-v3-slide').forEach(function(x,i){x.classList.toggle('active',i===idx);});root.querySelectorAll('.kg-v3-dot').forEach(function(x,i){x.classList.toggle('active',i===idx);});}
  function restart(){clearInterval(timer);timer=setInterval(function(){show(idx+1);},6000);}
  root.querySelector('.prev').onclick=function(){show(idx-1);restart();};
  root.querySelector('.next').onclick=function(){show(idx+1);restart();};
  root.querySelectorAll('.kg-v3-dot').forEach(function(b){b.onclick=function(){show(Number(b.dataset.i));restart();};});
  restart();
  normalizeMarketLanguage(home);
}

function boot(){
  rebuildHeader();
  installSlider();
  normalizeMarketLanguage(document);
  setTimeout(function(){rebuildHeader();normalizeMarketLanguage(document);},300);
  setTimeout(function(){rebuildHeader();normalizeMarketLanguage(document);},900);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
new MutationObserver(function(){normalizeMarketLanguage(document);}).observe(document.documentElement,{subtree:true,childList:true});
})();