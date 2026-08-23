(function(){
  "use strict";

  function injectStyle(){
    if(document.getElementById("kgMarketplaceDirectUiStyle")) return;
    var s=document.createElement("style");
    s.id="kgMarketplaceDirectUiStyle";
    s.textContent=`
      .kg-approved-topbar.kg-direct-market{position:sticky!important;top:0!important;z-index:1000!important;background:#071426!important;border:0!important;box-shadow:0 4px 18px rgba(7,20,38,.12)!important}
      .kg-direct-market .kg-topbar-inner{max-width:1480px!important;min-height:88px!important;margin:0 auto!important;padding:14px 28px!important;display:grid!important;grid-template-columns:250px minmax(320px,1fr) auto!important;align-items:center!important;gap:24px!important}
      .kg-direct-market .kg-brand{padding-right:0!important;border-right:0!important}
      .kg-direct-market-search{height:54px;display:flex;align-items:center;gap:10px;padding:0 16px;border-radius:14px;background:#fff;border:1px solid rgba(255,255,255,.65);box-shadow:0 4px 14px rgba(2,6,23,.08)}
      .kg-direct-market-search span{font-size:20px;color:#667085}.kg-direct-market-search input{width:100%!important;height:48px!important;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;padding:0!important;color:#172033!important;font-size:14px!important;font-weight:600!important}.kg-direct-market-search input::placeholder{color:#7b8798!important}
      .kg-direct-market-actions{display:flex;align-items:center;gap:10px}.kg-direct-market-link{height:46px;display:inline-flex;align-items:center;justify-content:center;padding:0 16px;border-radius:12px;text-decoration:none;white-space:nowrap;font-size:13px;font-weight:900}.kg-direct-market-link.listings{color:#fff;border:1px solid rgba(226,232,240,.34);background:rgba(255,255,255,.06)}.kg-direct-market-link.sell{color:#fff;border:1px solid #16a34a;background:#16a34a;box-shadow:0 7px 16px rgba(22,163,74,.22)}
      .kg-direct-subbar{width:100%;background:#fff;border-bottom:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(15,23,42,.035)}.kg-direct-subbar-inner{max-width:1480px;min-height:58px;margin:0 auto;padding:0 28px;display:flex;align-items:center;justify-content:center}.kg-direct-market .kg-main-nav{width:100%;display:flex!important;align-items:center!important;justify-content:center!important;gap:34px!important;white-space:nowrap!important}.kg-direct-market .kg-main-nav a{color:#253047!important;padding:19px 0 17px!important;font-size:14px!important;font-weight:800!important;text-decoration:none!important}.kg-direct-market .kg-main-nav a:hover,.kg-direct-market .kg-main-nav a.active{color:#15803d!important}.kg-direct-market .kg-main-nav a.active::after{bottom:8px!important;background:#16a34a!important}
      .kg-direct-slider{max-width:1408px;margin:26px auto 24px;padding:0 30px}.kg-direct-slider-shell{position:relative;min-height:330px;border:1px solid #dfe7e3;border-radius:26px;overflow:hidden;background:linear-gradient(118deg,#f8fffa 0%,#f4f8fb 54%,#edf5f0 100%);box-shadow:0 18px 42px rgba(15,23,42,.08)}.kg-direct-slide{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1.12fr) minmax(380px,.88fr);align-items:center;gap:28px;padding:40px 58px;opacity:0;visibility:hidden;transform:translateX(18px);transition:.42s ease}.kg-direct-slide.active{position:relative;opacity:1;visibility:visible;transform:none}.kg-direct-copy{max-width:690px}.kg-direct-eyebrow{display:inline-flex;margin-bottom:12px;padding:7px 11px;border-radius:999px;background:#e9faef;color:#087a37;font-size:11px;font-weight:950}.kg-direct-copy h2{margin:0;color:#0b1628;font-size:43px;line-height:1.04;letter-spacing:-1.4px;font-weight:950}.kg-direct-copy h2 span{color:#16a34a}.kg-direct-copy p{margin:16px 0 0;color:#5f6c7d;font-size:16px;line-height:1.55}.kg-direct-slide-actions{display:flex;gap:11px;flex-wrap:wrap;margin-top:24px}.kg-direct-slide-actions a,.kg-direct-slide-actions button{min-height:48px;padding:0 19px;border-radius:13px;font-size:14px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;cursor:pointer}.kg-direct-primary{border:1px solid #16a34a;background:#16a34a;color:#fff}.kg-direct-secondary{border:1px solid #cfd9d5;background:#fff;color:#142033}.kg-direct-visual{position:relative;min-height:250px;display:flex;align-items:center;justify-content:center}.kg-direct-device{width:min(330px,92%);height:245px;border:1px solid rgba(255,255,255,.94);border-radius:25px;background:rgba(255,255,255,.88);box-shadow:0 22px 46px rgba(15,23,42,.13);display:flex;align-items:center;justify-content:center;overflow:hidden}.kg-direct-device img{width:82%;height:82%;object-fit:contain}.kg-direct-badge{position:absolute;right:4%;top:7%;padding:8px 11px;border-radius:999px;background:#fff;color:#087a37;font-size:10px;font-weight:950;box-shadow:0 8px 20px rgba(15,23,42,.11);border:1px solid #e4ece8}.kg-direct-stat{position:absolute;left:0;bottom:3%;min-width:185px;padding:12px 14px;border-radius:15px;background:#071426;color:#fff;box-shadow:0 12px 28px rgba(7,20,38,.20)}.kg-direct-stat small{display:block;color:#b9c7d8;font-size:9px}.kg-direct-stat strong{display:block;color:#4ade80;font-size:14px;margin-top:3px}.kg-direct-arrow{position:absolute;top:50%;z-index:5;width:42px;height:42px;margin-top:-21px;border:1px solid #dae3df;border-radius:50%;background:#fff;color:#142033;box-shadow:0 8px 20px rgba(15,23,42,.10);font-size:24px;cursor:pointer}.kg-direct-arrow.prev{left:13px}.kg-direct-arrow.next{right:13px}.kg-direct-dots{position:absolute;left:50%;bottom:15px;transform:translateX(-50%);display:flex;gap:7px;z-index:6}.kg-direct-dot{width:8px;height:8px;border:0;border-radius:999px;background:#aab6b0;padding:0;cursor:pointer}.kg-direct-dot.active{width:26px;background:#16a34a}
      #viewHome:not(.category-selected) #kgMpHome{display:none!important}#viewHome.category-selected .kg-direct-slider{display:none!important}
      @media(max-width:980px){.kg-direct-market .kg-topbar-inner{grid-template-columns:1fr auto!important;grid-template-areas:"brand actions" "search search"!important;gap:11px 14px!important;padding:12px 16px!important}.kg-direct-market .kg-brand{grid-area:brand}.kg-direct-market-search{grid-area:search}.kg-direct-market-actions{grid-area:actions}.kg-direct-market-link.listings{display:none}.kg-direct-subbar{display:none}.kg-direct-slider{padding:0 18px}.kg-direct-slide{grid-template-columns:1fr;padding:34px 42px 48px;text-align:center}.kg-direct-slide-actions{justify-content:center}.kg-direct-copy h2{font-size:37px}.kg-direct-visual{min-height:220px}.kg-direct-device{height:210px}}
      @media(max-width:640px){.kg-direct-slider{padding:0 10px;margin-top:14px}.kg-direct-slide{padding:28px 24px 48px}.kg-direct-copy h2{font-size:31px}.kg-direct-copy p{font-size:14px}.kg-direct-slide-actions{display:grid}.kg-direct-slide-actions a,.kg-direct-slide-actions button{width:100%}.kg-direct-visual{min-height:190px}.kg-direct-device{height:180px;width:260px}.kg-direct-market-link.sell{height:42px;padding:0 10px;font-size:10px}}
    `;
    document.head.appendChild(s);
  }

  function installListingsNav(){
    if(document.getElementById("kgMpListingsNav")) return;
    var nav=document.querySelector(".kg-main-nav") || document.querySelector("nav");
    if(!nav) return;
    var link=document.createElement("a");
    link.id="kgMpListingsNav";
    link.href="/ilanlar/";
    link.textContent="İlanlar";
    link.setAttribute("aria-label","Yayındaki ilanları görüntüle");
    var info=Array.from(nav.querySelectorAll("a,button")).find(function(el){
      return String(el.textContent||"").trim().toLocaleUpperCase("tr-TR").indexOf("BİLGİ MERKEZİ")!==-1;
    });
    if(info && info.parentNode===nav) nav.insertBefore(link,info);
    else nav.appendChild(link);
  }

  function goPhone(){
    try{if(typeof window.kgGoCategory==="function"){window.kgGoCategory("phone");return}}catch(e){}
    var card=document.querySelector('[data-category="phone"]');if(card)card.click();
  }

  function installHeader(){
    var header=document.querySelector(".kg-approved-topbar");
    if(!header || header.classList.contains("kg-direct-market")) return;
    var inner=header.querySelector(".kg-topbar-inner"),nav=header.querySelector(".kg-main-nav"),actions=header.querySelector(".kg-topbar-actions");
    if(!inner||!nav||!actions) return;
    injectStyle();installListingsNav();header.classList.add("kg-direct-market");
    var search=document.createElement("form");search.className="kg-direct-market-search";search.innerHTML='<span>⌕</span><input type="search" placeholder="Marka, model veya ilan ara...">';search.onsubmit=function(e){e.preventDefault();var v=search.querySelector("input").value.trim();if(v)location.href="/ilanlar/?q="+encodeURIComponent(v)};inner.insertBefore(search,actions);
    var existing=document.getElementById("kgMpListingsNav");if(existing&&existing.parentNode)existing.parentNode.removeChild(existing);existing.className="kg-direct-market-link listings";
    var sell=document.createElement("a");sell.href="/";sell.className="kg-direct-market-link sell";sell.textContent="Ücretsiz İlan Ver";sell.onclick=function(e){if(location.pathname==="/"){e.preventDefault();goPhone()}};
    var theme=actions.querySelector("#themeToggle");actions.innerHTML="";actions.className="kg-topbar-actions kg-direct-market-actions";actions.appendChild(existing);actions.appendChild(sell);if(theme)actions.appendChild(theme);
    var sub=document.createElement("div");sub.className="kg-direct-subbar";var si=document.createElement("div");si.className="kg-direct-subbar-inner";si.appendChild(nav);sub.appendChild(si);header.appendChild(sub);
  }

  var SLIDES=[
    ["KAÇAGİDER PAZARYERİ","Değerini öğren. <span>Doğru fiyata sat.</span>","Cihazının güncel tahmini değerini öğren, ücretsiz ilanını oluştur ve alıcını bul.","Ücretsiz İlan Ver","İlanları Gör","/assets/categories/telefon.jpg","Ücretsiz ilan","Bağımsız fiyat"],
    ["ANINDA DEĞERLEME","Telefonunun değerini <span>saniyeler içinde öğren.</span>","Marka, model, hafıza ve kondisyonunu seç. KaçaGider güncel piyasa verileriyle tahmini değerini hesaplasın.","Fiyatımı Hesapla","Nasıl çalışır?","/assets/categories/telefon.jpg","Üyeliksiz sorgulama","Anında tahmin"],
    ["ŞEFFAF FİYAT KARŞILAŞTIRMASI","İlan fiyatını tahminle karşılaştır. <span>Güvenle karar ver.</span>","Satıcının ilan fiyatını KaçaGider tahminiyle yan yana gör. Değerine yakın ilanları daha kolay fark et.","İlanları İncele","Ücretsiz İlan Ver","/assets/categories/tablet.jpg","Piyasa karşılaştırması","Tahmin + ilan fiyatı"]
  ];

  function installSlider(){
    if(location.pathname!=="/"||document.getElementById("kgDirectMarketSlider")) return;
    var home=document.getElementById("viewHome"),hero=home&&home.querySelector(".kg-approved-hero,.hero");if(!home||!hero)return;
    injectStyle();var root=document.createElement("section");root.id="kgDirectMarketSlider";root.className="kg-direct-slider";
    root.innerHTML='<div class="kg-direct-slider-shell">'+SLIDES.map(function(x,i){return '<article class="kg-direct-slide '+(i===0?'active':'')+'"><div class="kg-direct-copy"><span class="kg-direct-eyebrow">'+x[0]+'</span><h2>'+x[1]+'</h2><p>'+x[2]+'</p><div class="kg-direct-slide-actions"><button class="kg-direct-primary" data-main="'+i+'">'+x[3]+' →</button><button class="kg-direct-secondary" data-second="'+i+'">'+x[4]+' →</button></div></div><div class="kg-direct-visual"><div class="kg-direct-device"><img src="'+x[5]+'" alt=""></div><span class="kg-direct-badge">✓ '+x[6]+'</span><div class="kg-direct-stat"><small>KaçaGider avantajı</small><strong>'+x[7]+'</strong></div></div></article>'}).join('')+'<button class="kg-direct-arrow prev">‹</button><button class="kg-direct-arrow next">›</button><div class="kg-direct-dots">'+SLIDES.map(function(_,i){return '<button class="kg-direct-dot '+(i===0?'active':'')+'" data-dot="'+i+'"></button>'}).join('')+'</div></div>';
    home.insertBefore(root,hero);var idx=0;function show(n){idx=(n+SLIDES.length)%SLIDES.length;root.querySelectorAll(".kg-direct-slide").forEach(function(el,i){el.classList.toggle("active",i===idx)});root.querySelectorAll(".kg-direct-dot").forEach(function(el,i){el.classList.toggle("active",i===idx)})}root.querySelector(".prev").onclick=function(){show(idx-1)};root.querySelector(".next").onclick=function(){show(idx+1)};root.querySelectorAll("[data-dot]").forEach(function(b){b.onclick=function(){show(Number(b.dataset.dot))}});root.querySelectorAll("[data-main]").forEach(function(b){b.onclick=function(){var n=Number(b.dataset.main);if(n===2)location.href="/ilanlar/";else goPhone()}});root.querySelectorAll("[data-second]").forEach(function(b){b.onclick=function(){var n=Number(b.dataset.second);if(n===0)location.href="/ilanlar/";else if(n===2)goPhone();else{var c=document.querySelector(".kg-category-section");if(c)c.scrollIntoView({behavior:"smooth"})}}});setInterval(function(){show(idx+1)},6500);
  }

  function boot(){installListingsNav();installHeader();installSlider()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  var tries=0,t=setInterval(function(){tries++;boot();if((document.querySelector(".kg-direct-market")&&document.getElementById("kgDirectMarketSlider"))||tries>50)clearInterval(t)},100);
})();
