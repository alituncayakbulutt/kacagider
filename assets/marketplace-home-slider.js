(function(){
"use strict";
if(window.__KG_MARKETPLACE_HOME_SLIDER__) return;
window.__KG_MARKETPLACE_HOME_SLIDER__=true;

var slides=[
  {
    eyebrow:"KAÇAGİDER PAZARYERİ",
    title:"Değerini öğren. <span>Doğru fiyata sat.</span>",
    text:"Cihazının güncel tahmini değerini öğren, ücretsiz ilanını oluştur ve alıcını bul.",
    primary:"Ücretsiz İlan Ver",
    primaryAction:"value",
    secondary:"İlanları Gör",
    secondaryHref:"/ilanlar/",
    image:"/assets/categories/telefon.jpg",
    imageAlt:"Telefon değerleme ve ücretsiz ilan",
    badge:"Ücretsiz ilan",
    statLabel:"KaçaGider tahmini",
    statValue:"Bağımsız fiyat"
  },
  {
    eyebrow:"ANINDA DEĞERLEME",
    title:"Telefonunun değerini <span>saniyeler içinde öğren.</span>",
    text:"Marka, model, hafıza ve kondisyonunu seç. KaçaGider güncel piyasa verileriyle tahmini değerini hesaplasın.",
    primary:"Fiyatımı Hesapla",
    primaryAction:"value",
    secondary:"Nasıl çalışır?",
    secondaryAction:"categories",
    image:"/assets/categories/telefon.jpg",
    imageAlt:"Anında ikinci el telefon değerleme",
    badge:"Üyeliksiz sorgulama",
    statLabel:"Sonuç",
    statValue:"Anında tahmin"
  },
  {
    eyebrow:"ŞEFFAF FİYAT KARŞILAŞTIRMASI",
    title:"İlan fiyatını tahminle karşılaştır. <span>Güvenle karar ver.</span>",
    text:"Satıcının ilan fiyatını KaçaGider tahminiyle yan yana gör. Değerine yakın ilanları daha kolay fark et.",
    primary:"İlanları İncele",
    primaryHref:"/ilanlar/",
    secondary:"Ücretsiz İlan Ver",
    secondaryAction:"value",
    image:"/assets/categories/tablet.jpg",
    imageAlt:"KaçaGider ilan fiyatı karşılaştırma",
    badge:"Piyasa değerine yakın",
    statLabel:"Karşılaştırma",
    statValue:"Tahmin + ilan fiyatı"
  }
];

function installStyle(){
  if(document.getElementById('kgMarketplaceSliderStyle')) return;
  var style=document.createElement('style');
  style.id='kgMarketplaceSliderStyle';
  style.textContent=`
#viewHome:not(.category-selected) .kg-market-slider{display:block}
#viewHome.category-selected .kg-market-slider{display:none!important}
.kg-market-slider{max-width:1408px;margin:24px auto 28px;padding:0 30px;position:relative}
.kg-market-slider-shell{position:relative;min-height:330px;border:1px solid #dfe7e3;border-radius:26px;overflow:hidden;background:linear-gradient(118deg,#f8fffa 0%,#f4f8fb 54%,#edf5f0 100%);box-shadow:0 18px 42px rgba(15,23,42,.08)}
.kg-market-slide{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(380px,.85fr);align-items:center;gap:28px;padding:40px 58px;opacity:0;visibility:hidden;transform:translateX(18px);transition:opacity .42s ease,transform .42s ease,visibility .42s ease}
.kg-market-slide.is-active{position:relative;opacity:1;visibility:visible;transform:none}
.kg-market-copy{max-width:690px;position:relative;z-index:2}
.kg-market-eyebrow{display:inline-flex;align-items:center;gap:7px;margin-bottom:12px;padding:7px 11px;border-radius:999px;background:#e9faef;color:#087a37;font-size:11px;font-weight:950;letter-spacing:.45px}
.kg-market-eyebrow:before{content:"";width:7px;height:7px;border-radius:50%;background:#16a34a;box-shadow:0 0 0 4px rgba(22,163,74,.10)}
.kg-market-copy h2{margin:0;max-width:690px;color:#0b1628;font-size:43px;line-height:1.04;letter-spacing:-1.45px;font-weight:950}
.kg-market-copy h2 span{color:#16a34a}
.kg-market-copy p{max-width:640px;margin:16px 0 0;color:#5f6c7d;font-size:16px;line-height:1.55}
.kg-market-actions{display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-top:24px}
.kg-market-btn{min-height:48px;padding:0 19px;border-radius:13px;text-decoration:none;font-size:14px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,background .16s ease}
.kg-market-btn:hover{transform:translateY(-1px)}
.kg-market-btn.primary{border:1px solid #16a34a;background:#16a34a;color:#fff;box-shadow:0 10px 20px rgba(22,163,74,.19)}
.kg-market-btn.primary:hover{background:#12863d}
.kg-market-btn.secondary{border:1px solid #cfd9d5;background:rgba(255,255,255,.76);color:#142033;backdrop-filter:blur(8px)}
.kg-market-visual{position:relative;min-height:250px;display:flex;align-items:center;justify-content:center}
.kg-market-orb{position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(34,197,94,.18) 0%,rgba(34,197,94,.07) 46%,transparent 70%);filter:blur(1px)}
.kg-market-device-card{position:relative;width:min(330px,92%);height:245px;border:1px solid rgba(255,255,255,.94);border-radius:25px;background:rgba(255,255,255,.80);box-shadow:0 22px 46px rgba(15,23,42,.13);display:flex;align-items:center;justify-content:center;overflow:hidden;backdrop-filter:blur(12px)}
.kg-market-device-card img{width:82%;height:82%;object-fit:contain;mix-blend-mode:normal}
.kg-market-badge{position:absolute;right:5%;top:8%;padding:8px 11px;border-radius:999px;background:#fff;color:#087a37;font-size:10px;font-weight:950;box-shadow:0 8px 20px rgba(15,23,42,.11);border:1px solid #e4ece8}
.kg-market-stat{position:absolute;left:0;bottom:3%;min-width:182px;padding:12px 14px;border-radius:15px;background:#071426;color:#fff;box-shadow:0 12px 28px rgba(7,20,38,.20)}
.kg-market-stat small{display:block;color:#b9c7d8;font-size:9px;font-weight:750;margin-bottom:3px}.kg-market-stat strong{display:block;color:#4ade80;font-size:14px;font-weight:950}
.kg-market-arrow{position:absolute;top:50%;z-index:5;width:42px;height:42px;margin-top:-21px;border:1px solid #dae3df;border-radius:50%;background:rgba(255,255,255,.90);color:#142033;box-shadow:0 8px 20px rgba(15,23,42,.10);display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;cursor:pointer;transition:.16s ease}
.kg-market-arrow:hover{background:#fff;transform:scale(1.03)}.kg-market-arrow.prev{left:13px}.kg-market-arrow.next{right:13px}
.kg-market-dots{position:absolute;z-index:6;left:50%;bottom:15px;transform:translateX(-50%);display:flex;gap:7px}
.kg-market-dot{width:8px;height:8px;padding:0;border:0;border-radius:999px;background:#aab6b0;cursor:pointer;transition:.2s ease}.kg-market-dot.is-active{width:26px;background:#16a34a}
#viewHome:not(.category-selected) #kgMpHome{display:none!important}
html[data-theme="dark"] .kg-market-slider-shell{border-color:#27384b;background:linear-gradient(118deg,#111e2f,#132537 55%,#112a26)}
html[data-theme="dark"] .kg-market-copy h2{color:#f1f5f9}html[data-theme="dark"] .kg-market-copy p{color:#b5c1d0}html[data-theme="dark"] .kg-market-btn.secondary{background:rgba(17,28,45,.78);border-color:#34465b;color:#edf3fb}html[data-theme="dark"] .kg-market-device-card{background:rgba(255,255,255,.94)}
@media(max-width:980px){.kg-market-slider{padding:0 18px}.kg-market-slide{grid-template-columns:1fr;gap:18px;padding:34px 42px 48px}.kg-market-copy{text-align:center;margin:0 auto}.kg-market-copy p{margin-left:auto;margin-right:auto}.kg-market-actions{justify-content:center}.kg-market-visual{min-height:220px}.kg-market-device-card{height:210px}.kg-market-copy h2{font-size:37px}.kg-market-arrow.prev{left:8px}.kg-market-arrow.next{right:8px}}
@media(max-width:640px){.kg-market-slider{margin:14px auto 22px;padding:0 10px}.kg-market-slider-shell{border-radius:20px}.kg-market-slide{padding:28px 24px 48px}.kg-market-copy h2{font-size:31px;letter-spacing:-.9px}.kg-market-copy p{font-size:14px}.kg-market-visual{min-height:190px}.kg-market-device-card{height:180px;width:260px}.kg-market-stat{left:2%;min-width:152px}.kg-market-badge{right:2%;top:5%}.kg-market-arrow{width:36px;height:36px;margin-top:-18px;font-size:20px}.kg-market-actions{display:grid;grid-template-columns:1fr}.kg-market-btn{width:100%}}
@media(prefers-reduced-motion:reduce){.kg-market-slide,.kg-market-dot,.kg-market-arrow,.kg-market-btn{transition:none!important}}
`;
  document.head.appendChild(style);
}

function buttonHtml(label,kind,href,action){
  if(!label) return '';
  var cls='kg-market-btn '+kind;
  if(href) return '<a class="'+cls+'" href="'+href+'">'+label+' →</a>';
  return '<button type="button" class="'+cls+'" data-slide-action="'+(action||'')+'">'+label+' →</button>';
}

function slideHtml(s,i){
  return '<article class="kg-market-slide '+(i===0?'is-active':'')+'" data-slide="'+i+'">'+
    '<div class="kg-market-copy"><span class="kg-market-eyebrow">'+s.eyebrow+'</span><h2>'+s.title+'</h2><p>'+s.text+'</p><div class="kg-market-actions">'+
      buttonHtml(s.primary,'primary',s.primaryHref,s.primaryAction)+buttonHtml(s.secondary,'secondary',s.secondaryHref,s.secondaryAction)+
    '</div></div>'+
    '<div class="kg-market-visual"><div class="kg-market-orb"></div><div class="kg-market-device-card"><img src="'+s.image+'" alt="'+s.imageAlt+'"><span class="kg-market-badge">✓ '+s.badge+'</span></div><div class="kg-market-stat"><small>'+s.statLabel+'</small><strong>'+s.statValue+'</strong></div></div>'+
  '</article>';
}

function goToValue(){
  try{
    if(typeof window.kgGoCategory==='function'){window.kgGoCategory('phone');return;}
    var phone=document.querySelector('[data-category="phone"]');
    if(phone){phone.click();return;}
  }catch(e){}
  location.href='/';
}
function goToCategories(){
  var target=document.querySelector('.kg-category-section');
  if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
}

function install(){
  if(location.pathname!=='/'||document.getElementById('kgMarketplaceSlider')) return;
  var home=document.getElementById('viewHome');
  if(!home) return;
  var hero=home.querySelector('.kg-approved-hero,.hero');
  if(!hero) return;
  installStyle();
  var root=document.createElement('section');
  root.id='kgMarketplaceSlider';root.className='kg-market-slider';root.setAttribute('aria-label','KaçaGider fırsat ve hizmetleri');
  root.innerHTML='<div class="kg-market-slider-shell">'+slides.map(slideHtml).join('')+'<button class="kg-market-arrow prev" type="button" aria-label="Önceki">‹</button><button class="kg-market-arrow next" type="button" aria-label="Sonraki">›</button><div class="kg-market-dots">'+slides.map(function(_,i){return '<button type="button" class="kg-market-dot '+(i===0?'is-active':'')+'" data-dot="'+i+'" aria-label="'+(i+1)+'. slayt"></button>';}).join('')+'</div></div>';
  home.insertBefore(root,hero);

  var index=0,timer=null,paused=false;
  function show(next){
    index=(next+slides.length)%slides.length;
    root.querySelectorAll('.kg-market-slide').forEach(function(el,i){el.classList.toggle('is-active',i===index);});
    root.querySelectorAll('.kg-market-dot').forEach(function(el,i){el.classList.toggle('is-active',i===index);});
  }
  function start(){
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    clearInterval(timer);timer=setInterval(function(){if(!paused)show(index+1);},6000);
  }
  root.querySelector('.prev').onclick=function(){show(index-1);start();};
  root.querySelector('.next').onclick=function(){show(index+1);start();};
  root.querySelectorAll('[data-dot]').forEach(function(b){b.onclick=function(){show(Number(b.dataset.dot));start();};});
  root.querySelectorAll('[data-slide-action]').forEach(function(b){b.onclick=function(){if(b.dataset.slideAction==='value')goToValue();else if(b.dataset.slideAction==='categories')goToCategories();};});
  root.addEventListener('mouseenter',function(){paused=true;});root.addEventListener('mouseleave',function(){paused=false;});
  root.addEventListener('focusin',function(){paused=true;});root.addEventListener('focusout',function(){paused=false;});
  start();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});else install();
new MutationObserver(install).observe(document.documentElement,{subtree:true,childList:true});
})();
