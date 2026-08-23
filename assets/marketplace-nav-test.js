(function(){
  "use strict";
  if(window.__KG_MARKETPLACE_NAV_CLEAN__) return;
  window.__KG_MARKETPLACE_NAV_CLEAN__=true;

  function qs(s,r){return (r||document).querySelector(s)}
  function qsa(s,r){return Array.from((r||document).querySelectorAll(s))}

  function installStyle(){
    if(qs('#kgUnifiedMarketplaceStyle')) return;
    var st=document.createElement('style');
    st.id='kgUnifiedMarketplaceStyle';
    st.textContent=`
      .kg-approved-topbar.kg-unified-market-header{
        position:sticky!important;top:0!important;z-index:1000!important;
        background:#071426!important;border:0!important;
        box-shadow:0 2px 12px rgba(7,20,38,.14)!important;
      }
      .kg-unified-market-header .kg-topbar-inner{
        max-width:1480px!important;margin:0 auto!important;
        min-height:82px!important;height:auto!important;
        padding:11px 30px!important;
        display:grid!important;
        grid-template-columns:235px minmax(340px,1fr) auto!important;
        align-items:center!important;gap:22px!important;
      }
      .kg-unified-market-header .kg-brand{
        padding:0!important;border:0!important;width:max-content!important;
      }
      .kg-unified-market-header .kg-brand-main{font-size:34px!important;line-height:.88!important}
      .kg-unified-market-header .kg-brand small{font-size:15px!important}
      .kg-unified-market-header .kg-brand-tagline{font-size:9px!important;margin-top:6px!important}

      .kg-unified-search{
        height:52px;min-width:0;display:flex;align-items:center;gap:10px;
        padding:0 14px;border-radius:13px;background:#fff;border:1px solid #dfe5ec;
        box-shadow:0 3px 12px rgba(2,6,23,.06);
      }
      .kg-unified-search span{font-size:18px;color:#667085;flex:0 0 auto}
      .kg-unified-search input{
        width:100%!important;min-width:0!important;height:48px!important;
        padding:0!important;border:0!important;outline:0!important;box-shadow:none!important;
        background:transparent!important;color:#172033!important;font-size:14px!important;font-weight:650!important;
      }
      .kg-unified-search input::placeholder{color:#7c8798!important;opacity:1}
      .kg-unified-search button{
        flex:0 0 auto;border:0;border-radius:9px;background:#eaf8ef;color:#087a37;
        padding:8px 12px;font-size:12px;font-weight:900;cursor:pointer;
      }
      .kg-unified-search:focus-within{border-color:#4ade80;box-shadow:0 0 0 3px rgba(34,197,94,.11)}

      .kg-unified-market-header .kg-topbar-actions{
        display:flex!important;align-items:center!important;justify-content:flex-end!important;
        gap:9px!important;min-width:max-content!important;
      }
      .kg-unified-action{
        height:44px;display:inline-flex;align-items:center;justify-content:center;
        padding:0 15px;border-radius:11px;text-decoration:none!important;white-space:nowrap;
        font-size:12px;font-weight:900;transition:.16s ease;
      }
      .kg-unified-action.listings{color:#fff!important;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.05)}
      .kg-unified-action.sell{color:#fff!important;border:1px solid #16a34a;background:#16a34a;box-shadow:0 7px 15px rgba(22,163,74,.18)}
      .kg-unified-action:hover{transform:translateY(-1px)}
      .kg-unified-market-header .kg-theme-btn{width:44px!important;height:44px!important;border-radius:11px!important}
      .kg-unified-market-header .kg-mobile-nav-toggle{display:none!important}

      .kg-unified-subbar{
        width:100%;background:#fff;border-top:1px solid rgba(255,255,255,.08);
        border-bottom:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(15,23,42,.035);
      }
      .kg-unified-subbar-inner{
        max-width:1480px;min-height:56px;margin:0 auto;padding:0 28px;
        display:flex;align-items:center;justify-content:center;
      }
      .kg-unified-market-header .kg-main-nav{
        width:auto!important;display:flex!important;align-items:center!important;justify-content:center!important;
        gap:34px!important;white-space:nowrap!important;margin:0!important;padding:0!important;
      }
      .kg-unified-market-header .kg-main-nav a{
        color:#253047!important;text-decoration:none!important;font-size:14px!important;font-weight:800!important;
        padding:18px 0 16px!important;position:relative!important;
      }
      .kg-unified-market-header .kg-main-nav a[data-nav="didYouKnow"]{margin-left:0!important}
      .kg-unified-market-header .kg-main-nav a:hover,.kg-unified-market-header .kg-main-nav a.active{color:#15803d!important}
      .kg-unified-market-header .kg-main-nav a.active::after{bottom:7px!important;height:3px!important;background:#16a34a!important}

      /* Tek bir kayan bilgilendirme alanı: aynı anda yalnızca 1 slayt görünür. */
      #viewHome:not(.category-selected) .kg-home-carousel{display:block!important}
      #viewHome.category-selected .kg-home-carousel{display:none!important}
      .kg-home-carousel{max-width:1408px;margin:20px auto 24px;padding:0 30px}
      .kg-home-carousel-shell{
        position:relative;overflow:hidden;border:1px solid #dfe7e3;border-radius:25px;
        background:linear-gradient(118deg,#f8fffa 0%,#f4f8fb 55%,#eef6f1 100%);
        box-shadow:0 16px 38px rgba(15,23,42,.07);
      }
      .kg-home-slide{display:none;grid-template-columns:minmax(0,1.12fr) minmax(350px,.88fr);align-items:center;gap:26px;min-height:310px;padding:34px 56px}
      .kg-home-slide.active{display:grid!important}
      .kg-home-copy{max-width:700px}
      .kg-home-eyebrow{display:inline-flex;align-items:center;gap:7px;padding:6px 10px;border-radius:999px;background:#e9faef;color:#087a37;font-size:10px;font-weight:950;letter-spacing:.4px;margin-bottom:12px}
      .kg-home-eyebrow:before{content:"";width:7px;height:7px;border-radius:50%;background:#16a34a}
      .kg-home-copy h2{margin:0;color:#0b1628;font-size:42px;line-height:1.04;letter-spacing:-1.35px;font-weight:950}
      .kg-home-copy h2 span{color:#16a34a}
      .kg-home-copy p{margin:15px 0 0;color:#5f6c7d;font-size:15px;line-height:1.55}
      .kg-home-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
      .kg-home-btn{min-height:46px;padding:0 18px;border-radius:12px;text-decoration:none!important;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;cursor:pointer}
      .kg-home-btn.primary{border:1px solid #16a34a;background:#16a34a;color:#fff!important;box-shadow:0 9px 18px rgba(22,163,74,.18)}
      .kg-home-btn.secondary{border:1px solid #cfd9d5;background:#fff;color:#142033!important}
      .kg-home-visual{position:relative;min-height:235px;display:flex;align-items:center;justify-content:center}
      .kg-home-device{width:min(320px,90%);height:230px;border:1px solid rgba(255,255,255,.94);border-radius:23px;background:rgba(255,255,255,.88);box-shadow:0 20px 42px rgba(15,23,42,.12);display:flex;align-items:center;justify-content:center;overflow:hidden}
      .kg-home-device img{width:82%;height:82%;object-fit:contain}
      .kg-home-badge{position:absolute;right:4%;top:7%;padding:7px 10px;border-radius:999px;background:#fff;color:#087a37;border:1px solid #e4ece8;font-size:10px;font-weight:950;box-shadow:0 7px 16px rgba(15,23,42,.09)}
      .kg-home-stat{position:absolute;left:0;bottom:3%;min-width:180px;padding:11px 13px;border-radius:14px;background:#071426;color:#fff;box-shadow:0 11px 24px rgba(7,20,38,.18)}
      .kg-home-stat small{display:block;color:#b9c7d8;font-size:9px}.kg-home-stat strong{display:block;color:#4ade80;font-size:14px;margin-top:2px}
      .kg-home-arrow{position:absolute;top:50%;z-index:4;width:40px;height:40px;margin-top:-20px;border:1px solid #dae3df;border-radius:50%;background:#fff;color:#142033;font-size:22px;cursor:pointer;box-shadow:0 7px 18px rgba(15,23,42,.09)}
      .kg-home-arrow.prev{left:13px}.kg-home-arrow.next{right:13px}
      .kg-home-dots{position:absolute;left:50%;bottom:13px;transform:translateX(-50%);display:flex;gap:6px;z-index:5}
      .kg-home-dot{width:8px;height:8px;padding:0;border:0;border-radius:999px;background:#aeb9b3;cursor:pointer}.kg-home-dot.active{width:26px;background:#16a34a}
      #viewHome:not(.category-selected) #kgMpHome{display:none!important}
      #viewHome:not(.category-selected) .kg-home-carousel + .kg-approved-hero{margin-top:24px!important}

      html[data-theme="dark"] .kg-unified-subbar{background:#111c2d!important;border-color:#2d3c52!important}
      html[data-theme="dark"] .kg-unified-market-header .kg-main-nav a{color:#edf3fb!important}
      html[data-theme="dark"] .kg-home-carousel-shell{background:linear-gradient(118deg,#111e2f,#132537 55%,#112a26);border-color:#27384b}
      html[data-theme="dark"] .kg-home-copy h2{color:#f1f5f9}html[data-theme="dark"] .kg-home-copy p{color:#b5c1d0}

      @media(max-width:1120px){
        .kg-unified-market-header .kg-topbar-inner{grid-template-columns:205px minmax(250px,1fr) auto!important;gap:14px!important;padding:10px 18px!important}
        .kg-unified-market-header .kg-brand-main{font-size:30px!important}.kg-unified-market-header .kg-main-nav{gap:20px!important}.kg-unified-market-header .kg-main-nav a{font-size:12px!important}.kg-unified-action{padding:0 11px;font-size:11px}
      }
      @media(max-width:900px){
        .kg-unified-market-header .kg-topbar-inner{grid-template-columns:1fr auto!important;grid-template-areas:"brand actions" "search search"!important;gap:9px 12px!important;padding:10px 14px!important}
        .kg-unified-market-header .kg-brand{grid-area:brand}.kg-unified-search{grid-area:search;height:47px}.kg-unified-market-header .kg-topbar-actions{grid-area:actions}
        .kg-unified-action.listings{display:none}.kg-unified-action.sell{height:40px}.kg-unified-market-header .kg-mobile-nav-toggle{display:block!important;width:40px!important;height:40px!important}
        .kg-unified-market-header .kg-theme-btn{width:40px!important;height:40px!important}.kg-unified-subbar{display:none}.kg-unified-market-header.menu-open .kg-unified-subbar{display:block!important;position:absolute;top:100%;left:0;right:0;box-shadow:0 12px 22px rgba(15,23,42,.12)}
        .kg-unified-market-header.menu-open .kg-main-nav{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:0!important;width:100%!important}.kg-unified-market-header.menu-open .kg-main-nav a{padding:12px 10px!important;border-bottom:1px solid #eef2f6}
        .kg-home-slide{grid-template-columns:1fr;gap:16px;padding:30px 42px 44px;text-align:center}.kg-home-actions{justify-content:center}.kg-home-copy{margin:0 auto}.kg-home-copy h2{font-size:36px}.kg-home-visual{min-height:205px}.kg-home-device{height:195px}
      }
      @media(max-width:600px){
        .kg-unified-market-header .kg-topbar-inner{padding:9px 11px!important}.kg-unified-market-header .kg-brand-main{font-size:24px!important}.kg-unified-market-header .kg-brand small{font-size:12px!important}.kg-unified-market-header .kg-brand-tagline{display:none!important}.kg-unified-action.sell{padding:0 9px;font-size:10px}.kg-unified-search button{display:none}
        .kg-home-carousel{margin:12px auto 18px;padding:0 10px}.kg-home-carousel-shell{border-radius:19px}.kg-home-slide{padding:26px 22px 42px}.kg-home-copy h2{font-size:30px}.kg-home-copy p{font-size:14px}.kg-home-actions{display:grid;grid-template-columns:1fr}.kg-home-btn{width:100%}.kg-home-visual{min-height:180px}.kg-home-device{height:170px;width:250px}.kg-home-stat{min-width:150px}.kg-home-arrow{width:34px;height:34px;margin-top:-17px}
      }
    `;
    document.head.appendChild(st);
  }

  function goValue(){
    if(typeof window.kgGoCategory==='function'){window.kgGoCategory('phone');return;}
    var phone=qs('[data-category="phone"]');
    if(phone) phone.click();
  }

  function installHeader(){
    var header=qs('.kg-approved-topbar');
    var inner=header&&qs('.kg-topbar-inner',header);
    var nav=header&&qs('.kg-main-nav',header);
    var actions=header&&qs('.kg-topbar-actions',header);
    if(!header||!inner||!nav||!actions) return false;

    installStyle();
    header.classList.add('kg-unified-market-header');

    /* Önceki denemelerden kalan tekrarları temizle. */
    qsa('.kg-market-search,.kg-unified-search',header).forEach(function(el){el.remove();});
    qsa('.kg-market-subbar,.kg-unified-subbar',header).forEach(function(el){
      var oldNav=qs('.kg-main-nav',el);
      if(oldNav && oldNav!==nav) oldNav.remove();
      el.remove();
    });
    qsa('#kgMarketSellAction,.kg-market-header-action,.kg-unified-action',header).forEach(function(el){el.remove();});

    var search=document.createElement('form');
    search.className='kg-unified-search';
    search.innerHTML='<span aria-hidden="true">⌕</span><input type="search" autocomplete="off" placeholder="Marka, model veya ilan ara..."><button type="submit">Ara</button>';
    search.addEventListener('submit',function(e){e.preventDefault();var v=String(qs('input',search).value||'').trim();if(v) location.href='/ilanlar/?q='+encodeURIComponent(v);});
    inner.insertBefore(search,actions);

    var mobile=qs('#mobileNavToggle',actions),theme=qs('#themeToggle',actions);
    actions.innerHTML='';
    var listings=document.createElement('a');listings.href='/ilanlar/';listings.className='kg-unified-action listings';listings.textContent='İlanlar';
    var sell=document.createElement('a');sell.href='/';sell.className='kg-unified-action sell';sell.textContent='Ücretsiz İlan Ver';sell.onclick=function(e){if(location.pathname==='/'){e.preventDefault();var b=qs('.kg-mp-home-action');if(b)b.click();else goValue();}};
    actions.appendChild(listings);actions.appendChild(sell);if(mobile)actions.appendChild(mobile);if(theme)actions.appendChild(theme);

    var sub=document.createElement('div');sub.className='kg-unified-subbar';
    var subInner=document.createElement('div');subInner.className='kg-unified-subbar-inner';
    sub.appendChild(subInner);subInner.appendChild(nav);header.appendChild(sub);
    return true;
  }

  var slides=[
    {eyebrow:'KAÇAGİDER PAZARYERİ',title:'Değerini öğren. <span>Doğru fiyata sat.</span>',text:'Cihazının güncel tahmini değerini öğren, ücretsiz ilanını oluştur ve alıcını bul.',primary:'Ücretsiz İlan Ver',primaryAction:'value',secondary:'İlanları Gör',secondaryHref:'/ilanlar/',image:'/assets/categories/telefon.jpg',badge:'Ücretsiz ilan',statLabel:'KaçaGider tahmini',statValue:'Bağımsız fiyat'},
    {eyebrow:'ANINDA DEĞERLEME',title:'Telefonunun değerini <span>saniyeler içinde öğren.</span>',text:'Marka, model, hafıza ve kondisyonunu seç. KaçaGider güncel piyasa verileriyle tahmini değerini hesaplasın.',primary:'Fiyatımı Hesapla',primaryAction:'value',secondary:'Kategorileri Gör',secondaryAction:'categories',image:'/assets/categories/telefon.jpg',badge:'Üyeliksiz sorgulama',statLabel:'Sonuç',statValue:'Anında tahmin'},
    {eyebrow:'ŞEFFAF FİYAT KARŞILAŞTIRMASI',title:'İlan fiyatını tahminle karşılaştır. <span>Güvenle karar ver.</span>',text:'Satıcının ilan fiyatını KaçaGider tahminiyle yan yana gör. Değerine yakın ilanları daha kolay fark et.',primary:'İlanları İncele',primaryHref:'/ilanlar/',secondary:'Ücretsiz İlan Ver',secondaryAction:'value',image:'/assets/categories/tablet.jpg',badge:'Piyasa değerine yakın',statLabel:'Karşılaştırma',statValue:'Tahmin + ilan fiyatı'}
  ];

  function btn(label,kind,href,action){if(href)return '<a class="kg-home-btn '+kind+'" href="'+href+'">'+label+' →</a>';return '<button type="button" class="kg-home-btn '+kind+'" data-action="'+(action||'')+'">'+label+' →</button>';}
  function slide(s,i){return '<article class="kg-home-slide '+(i===0?'active':'')+'" data-index="'+i+'"><div class="kg-home-copy"><span class="kg-home-eyebrow">'+s.eyebrow+'</span><h2>'+s.title+'</h2><p>'+s.text+'</p><div class="kg-home-actions">'+btn(s.primary,'primary',s.primaryHref,s.primaryAction)+btn(s.secondary,'secondary',s.secondaryHref,s.secondaryAction)+'</div></div><div class="kg-home-visual"><div class="kg-home-device"><img src="'+s.image+'" alt=""></div><span class="kg-home-badge">✓ '+s.badge+'</span><div class="kg-home-stat"><small>'+s.statLabel+'</small><strong>'+s.statValue+'</strong></div></div></article>';}

  function installCarousel(){
    if(location.pathname!=='/') return false;
    var home=qs('#viewHome');if(!home)return false;
    var hero=qs('.kg-approved-hero,.hero',home);if(!hero)return false;
    /* Önceki iki slider uygulamasının tüm kopyalarını kaldır. */
    qsa('#kgMarketplaceSlider,.kg-market-slider,#kgUnifiedCarousel,.kg-home-carousel',home).forEach(function(el){el.remove();});
    var root=document.createElement('section');root.id='kgUnifiedCarousel';root.className='kg-home-carousel';
    root.innerHTML='<div class="kg-home-carousel-shell">'+slides.map(slide).join('')+'<button class="kg-home-arrow prev" type="button" aria-label="Önceki">‹</button><button class="kg-home-arrow next" type="button" aria-label="Sonraki">›</button><div class="kg-home-dots">'+slides.map(function(_,i){return '<button class="kg-home-dot '+(i===0?'active':'')+'" type="button" data-dot="'+i+'"></button>';}).join('')+'</div></div>';
    home.insertBefore(root,hero);
    var idx=0,timer=null,paused=false;
    function show(n){idx=(n+slides.length)%slides.length;qsa('.kg-home-slide',root).forEach(function(el,i){el.classList.toggle('active',i===idx)});qsa('.kg-home-dot',root).forEach(function(el,i){el.classList.toggle('active',i===idx)});}
    function start(){clearInterval(timer);timer=setInterval(function(){if(!paused)show(idx+1)},6000)}
    qs('.prev',root).onclick=function(){show(idx-1);start()};qs('.next',root).onclick=function(){show(idx+1);start()};qsa('[data-dot]',root).forEach(function(b){b.onclick=function(){show(Number(b.dataset.dot));start()}});
    qsa('[data-action]',root).forEach(function(b){b.onclick=function(){if(b.dataset.action==='value')goValue();else{var g=qs('.kg-category-section');if(g)g.scrollIntoView({behavior:'smooth',block:'start'})}}});
    root.onmouseenter=function(){paused=true};root.onmouseleave=function(){paused=false};start();return true;
  }

  function boot(){installStyle();installHeader();installCarousel();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
