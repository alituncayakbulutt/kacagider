(function(){
  'use strict';
  function ensure(){
    if(location.pathname!=='/' && location.pathname!=='/index.html') return;
    var home=document.getElementById('viewHome');
    if(!home || document.getElementById('kgHomeInfoCenterCta')) return;
    if(!document.getElementById('kgHomeInfoCenterCtaStyle')){
      var style=document.createElement('style');
      style.id='kgHomeInfoCenterCtaStyle';
      style.textContent='.kg-home-info-cta{max-width:1348px;margin:0 auto 22px;padding:0 30px;display:block;text-decoration:none}.kg-home-info-cta-inner{min-height:82px;border:1px solid #c9ead6;border-radius:18px;background:linear-gradient(120deg,#f4fff8,#fff 60%,#f3f7ff);display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px 20px;box-shadow:0 10px 26px rgba(15,23,42,.06);transition:.18s}.kg-home-info-cta:hover .kg-home-info-cta-inner{transform:translateY(-2px);border-color:#75d39a;box-shadow:0 14px 30px rgba(15,23,42,.09)}.kg-home-info-cta-copy{display:flex;align-items:center;gap:14px;min-width:0}.kg-home-info-cta-icon{width:46px;height:46px;flex:0 0 46px;border-radius:13px;background:#e8fbef;display:flex;align-items:center;justify-content:center;font-size:23px}.kg-home-info-cta-copy strong{display:block;color:#0b1628;font-size:16px;font-weight:950;margin-bottom:3px}.kg-home-info-cta-copy span{display:block;color:#667085;font-size:12px;line-height:1.4}.kg-home-info-cta-btn{flex:0 0 auto;min-height:44px;padding:0 16px;border-radius:11px;background:#0b1628;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;white-space:nowrap}.kg-home-info-cta:hover .kg-home-info-cta-btn{background:#16a34a}#viewHome.category-selected #kgHomeInfoCenterCta{display:none!important}@media(max-width:640px){.kg-home-info-cta{padding:0 10px;margin-bottom:14px}.kg-home-info-cta-inner{min-height:0;padding:14px;border-radius:15px;align-items:stretch}.kg-home-info-cta-copy{align-items:flex-start}.kg-home-info-cta-icon{width:40px;height:40px;flex-basis:40px;font-size:20px}.kg-home-info-cta-copy strong{font-size:14px}.kg-home-info-cta-copy span{font-size:11px}.kg-home-info-cta-btn{min-height:40px;padding:0 11px;font-size:10.5px;align-self:center}}@media(max-width:390px){.kg-home-info-cta-inner{display:grid;grid-template-columns:1fr}.kg-home-info-cta-btn{width:100%}}';
      document.head.appendChild(style);
    }
    var link=document.createElement('a');
    link.id='kgHomeInfoCenterCta';
    link.className='kg-home-info-cta';
    link.href='/bilgi-merkezi/';
    link.setAttribute('aria-label','Bilgi Merkezi - sorununa çözüm bul');
    link.innerHTML='<div class="kg-home-info-cta-inner"><div class="kg-home-info-cta-copy"><span class="kg-home-info-cta-icon" aria-hidden="true">🛠️</span><div><strong>Sorunun mu var? Bilgi Merkezi’nde çözümünü bul.</strong><span>Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolu sorunları için hızlı çözüm ve destek asistanı.</span></div></div><span class="kg-home-info-cta-btn">Bilgi Merkezine Git →</span></div>';
    var target=home.querySelector('.kg-approved-category-grid,.category-grid,.home-intro');
    if(target) target.insertAdjacentElement('beforebegin',link);
    else home.insertBefore(link,home.firstChild);
    link.addEventListener('click',function(){ if(typeof window.gtag==='function') window.gtag('event','home_info_center_clicked',{page_path:location.pathname}); });
  }
  ensure();
  setTimeout(ensure,0);
  setTimeout(ensure,400);
  setTimeout(ensure,1000);
})();