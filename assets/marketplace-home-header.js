(function(){
"use strict";
if(window.__KG_MARKETPLACE_HOME_HEADER__) return;
window.__KG_MARKETPLACE_HOME_HEADER__=true;

function installStyle(){
  if(document.getElementById('kg-market-header-style')) return;
  var style=document.createElement('style');
  style.id='kg-market-header-style';
  style.textContent=`
/* Marketplace test header: reference layout logic, KaçaGider colors/content */
.kg-approved-topbar.kg-market-header{
  position:sticky!important;
  top:0!important;
  z-index:1000!important;
  background:#071426!important;
  border:0!important;
  box-shadow:0 4px 18px rgba(7,20,38,.12)!important;
}
.kg-market-header .kg-topbar-inner{
  max-width:1480px!important;
  min-height:88px!important;
  margin:0 auto!important;
  padding:14px 28px!important;
  display:grid!important;
  grid-template-columns:250px minmax(300px,1fr) auto!important;
  align-items:center!important;
  gap:26px!important;
}
.kg-market-header .kg-brand{
  padding-right:0!important;
  border-right:0!important;
  color:#f8fafc!important;
}
.kg-market-header .kg-brand-main{font-size:36px!important;line-height:.86!important;color:#f8fafc!important}
.kg-market-header .kg-brand-main span{color:#22c55e!important}
.kg-market-header .kg-brand small{font-size:16px!important;color:#f8fafc!important}
.kg-market-header .kg-brand-tagline{font-size:9px!important;color:#b8c7d9!important}

.kg-market-search{
  min-width:0;
  height:54px;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 16px;
  border-radius:14px;
  background:#fff;
  border:1px solid rgba(255,255,255,.5);
  box-shadow:0 4px 14px rgba(2,6,23,.08);
}
.kg-market-search-icon{
  flex:0 0 auto;
  width:22px;height:22px;
  display:grid;place-items:center;
  color:#667085;
  font-size:20px;
}
.kg-market-search input{
  width:100%!important;
  height:50px!important;
  min-width:0!important;
  border:0!important;
  outline:0!important;
  background:transparent!important;
  box-shadow:none!important;
  padding:0!important;
  color:#172033!important;
  font-size:14px!important;
  font-weight:600!important;
}
.kg-market-search input::placeholder{color:#7b8798!important;opacity:1}
.kg-market-search button{
  flex:0 0 auto;
  border:0;
  border-radius:10px;
  background:#eefbf4;
  color:#087a37;
  padding:8px 11px;
  font-size:12px;
  font-weight:900;
  cursor:pointer;
}
.kg-market-search:focus-within{
  border-color:#4ade80;
  box-shadow:0 0 0 3px rgba(34,197,94,.13),0 4px 14px rgba(2,6,23,.08);
}

.kg-market-header .kg-topbar-actions{
  display:flex!important;
  align-items:center!important;
  justify-content:flex-end!important;
  gap:10px!important;
}
.kg-market-header-action{
  height:46px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:0 16px;
  border-radius:12px;
  text-decoration:none;
  white-space:nowrap;
  font-size:13px;
  font-weight:900;
  transition:.18s ease;
}
.kg-market-header-action.secondary{
  color:#f8fafc;
  border:1px solid rgba(226,232,240,.34);
  background:rgba(255,255,255,.06);
}
.kg-market-header-action.secondary:hover{background:rgba(255,255,255,.12);color:#fff}
.kg-market-header-action.primary{
  color:#fff;
  border:1px solid #16a34a;
  background:#16a34a;
  box-shadow:0 7px 16px rgba(22,163,74,.22);
}
.kg-market-header-action.primary:hover{background:#15803d;border-color:#15803d;color:#fff}
.kg-market-header .kg-theme-btn{
  width:46px!important;height:46px!important;
  border-radius:12px!important;
}

.kg-market-subbar{
  width:100%;
  background:#fff;
  border-top:1px solid rgba(255,255,255,.08);
  border-bottom:1px solid #e5e7eb;
  box-shadow:0 2px 8px rgba(15,23,42,.035);
}
.kg-market-subbar-inner{
  max-width:1480px;
  min-height:58px;
  margin:0 auto;
  padding:0 28px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.kg-market-header .kg-main-nav{
  width:100%;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:34px!important;
  white-space:nowrap!important;
}
.kg-market-header .kg-main-nav a{
  position:relative;
  color:#253047!important;
  padding:19px 0 17px!important;
  font-size:14px!important;
  font-weight:800!important;
  text-decoration:none!important;
}
.kg-market-header .kg-main-nav a[data-nav="didYouKnow"]{margin-left:20px!important}
.kg-market-header .kg-main-nav a:hover{color:#15803d!important}
.kg-market-header .kg-main-nav a.active{color:#15803d!important}
.kg-market-header .kg-main-nav a.active::after{
  left:0!important;right:0!important;bottom:8px!important;height:3px!important;background:#16a34a!important;
}
.kg-market-header .kg-mobile-nav-toggle{display:none!important}

html[data-theme="dark"] .kg-market-subbar{background:#111c2d!important;border-color:#2d3c52!important}
html[data-theme="dark"] .kg-market-header .kg-main-nav a{color:#edf3fb!important}
html[data-theme="dark"] .kg-market-header .kg-main-nav a:hover,
html[data-theme="dark"] .kg-market-header .kg-main-nav a.active{color:#4ade80!important}
html[data-theme="dark"] .kg-market-search{background:#111c2d!important;border-color:#34445b!important}
html[data-theme="dark"] .kg-market-search input{color:#edf3fb!important}
html[data-theme="dark"] .kg-market-search input::placeholder{color:#aebbd0!important}
html[data-theme="dark"] .kg-market-search button{background:#133b2b!important;color:#d9fbe6!important}

@media(max-width:1180px){
  .kg-market-header .kg-topbar-inner{grid-template-columns:210px minmax(240px,1fr) auto!important;gap:16px!important;padding:12px 18px!important}
  .kg-market-header .kg-brand-main{font-size:31px!important}
  .kg-market-header .kg-main-nav{gap:21px!important}
  .kg-market-header .kg-main-nav a{font-size:13px!important}
  .kg-market-header-action{padding:0 12px;font-size:12px}
}
@media(max-width:900px){
  .kg-market-header .kg-topbar-inner{
    grid-template-columns:1fr auto!important;
    grid-template-areas:"brand actions" "search search"!important;
    min-height:auto!important;
    gap:11px 14px!important;
    padding:12px 16px!important;
  }
  .kg-market-header .kg-brand{grid-area:brand}
  .kg-market-header .kg-topbar-actions{grid-area:actions}
  .kg-market-search{grid-area:search;height:48px}
  .kg-market-search input{height:44px!important}
  .kg-market-header .kg-brand-main{font-size:28px!important}
  .kg-market-header-action.secondary{display:none!important}
  .kg-market-header-action.primary{height:42px;padding:0 12px;font-size:11px}
  .kg-market-header .kg-theme-btn{width:42px!important;height:42px!important}
  .kg-market-header .kg-mobile-nav-toggle{display:block!important;width:42px!important;height:42px!important}
  .kg-market-subbar{display:none}
  .kg-market-header.menu-open .kg-market-subbar{
    display:block!important;
    position:absolute;
    top:100%;left:0;right:0;
    background:#fff;
    border-top:1px solid #e5e7eb;
    box-shadow:0 12px 24px rgba(15,23,42,.12);
  }
  .kg-market-header.menu-open .kg-market-subbar-inner{padding:6px 14px 12px}
  .kg-market-header.menu-open .kg-main-nav{
    position:static!important;
    display:grid!important;
    grid-template-columns:repeat(2,minmax(0,1fr))!important;
    gap:0!important;
    padding:0!important;
    background:transparent!important;
    border:0!important;
    box-shadow:none!important;
  }
  .kg-market-header.menu-open .kg-main-nav a{
    padding:13px 10px!important;
    border-bottom:1px solid #eef2f6;
    color:#253047!important;
    font-size:13px!important;
  }
  .kg-market-header.menu-open .kg-main-nav a[data-nav="didYouKnow"]{margin-left:0!important}
  html[data-theme="dark"] .kg-market-header.menu-open .kg-market-subbar{background:#111c2d!important;border-color:#2d3c52!important}
  html[data-theme="dark"] .kg-market-header.menu-open .kg-main-nav a{color:#edf3fb!important;border-color:#2d3c52!important}
}
@media(max-width:560px){
  .kg-market-header .kg-topbar-inner{padding:10px 12px!important}
  .kg-market-header .kg-brand-main{font-size:24px!important}
  .kg-market-header .kg-brand small{font-size:12px!important}
  .kg-market-header .kg-brand-tagline{display:none!important}
  .kg-market-header-action.primary{padding:0 9px;font-size:10px}
  .kg-market-search button{display:none}
}
`;
  document.head.appendChild(style);
}

function runSearch(e){
  if(e) e.preventDefault();
  var input=document.getElementById('kgMarketSearchInput');
  var q=input?String(input.value||'').trim():'';
  if(!q) return;
  window.location.href='/ilanlar/?q='+encodeURIComponent(q);
}

function installHeader(){
  var header=document.querySelector('.kg-approved-topbar');
  var inner=header&&header.querySelector('.kg-topbar-inner');
  var nav=header&&header.querySelector('.kg-main-nav');
  var actions=header&&header.querySelector('.kg-topbar-actions');
  if(!header||!inner||!nav||!actions) return false;
  if(header.classList.contains('kg-market-header')) return true;

  installStyle();
  header.classList.add('kg-market-header');

  var search=document.createElement('form');
  search.className='kg-market-search';
  search.setAttribute('role','search');
  search.innerHTML='<span class="kg-market-search-icon" aria-hidden="true">⌕</span><input id="kgMarketSearchInput" type="search" autocomplete="off" placeholder="Marka, model veya ilan ara..."><button type="submit">Ara</button>';
  search.addEventListener('submit',runSearch);
  inner.insertBefore(search,actions);

  var listings=document.getElementById('kgMpListingsNav');
  if(!listings){
    listings=document.createElement('a');
    listings.id='kgMpListingsNav';
    listings.href='/ilanlar/';
    listings.textContent='İlanlar';
    listings.setAttribute('aria-label','Yayındaki ilanları görüntüle');
  }else if(listings.parentElement){
    listings.parentElement.removeChild(listings);
  }
  listings.className='kg-market-header-action secondary';

  var sell=document.createElement('a');
  sell.id='kgMarketSellAction';
  sell.href='/';
  sell.className='kg-market-header-action primary';
  sell.textContent='Ücretsiz İlan Ver';
  sell.addEventListener('click',function(e){
    if(window.location.pathname!=='/') return;
    e.preventDefault();
    var action=document.querySelector('.kg-mp-home-action');
    if(action){action.click();return;}
    var cards=document.querySelector('.kg-approved-category-grid,.category-grid');
    if(cards) cards.scrollIntoView({behavior:'smooth',block:'start'});
  });

  var mobile=actions.querySelector('#mobileNavToggle');
  var theme=actions.querySelector('#themeToggle');
  actions.innerHTML='';
  actions.appendChild(listings);
  actions.appendChild(sell);
  if(mobile) actions.appendChild(mobile);
  if(theme) actions.appendChild(theme);

  var sub=document.createElement('div');
  sub.className='kg-market-subbar';
  var subInner=document.createElement('div');
  subInner.className='kg-market-subbar-inner';
  sub.appendChild(subInner);
  subInner.appendChild(nav);
  header.appendChild(sub);
  return true;
}

function boot(){
  if(installHeader()) return;
  var tries=0;
  var timer=setInterval(function(){
    tries++;
    if(installHeader()||tries>40) clearInterval(timer);
  },100);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
