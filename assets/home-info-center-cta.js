(function(){
  'use strict';

  function addStyles(){
    if(document.getElementById('kgHomeInfoCenterCtaStyle')) return;
    var style=document.createElement('style');
    style.id='kgHomeInfoCenterCtaStyle';
    style.textContent=''
      +'.kg-home-info-cta{max-width:1348px;margin:0 auto 22px;padding:0 30px;display:block;text-decoration:none}'
      +'.kg-home-info-cta-inner{min-height:82px;border:1px solid #c9ead6;border-radius:18px;background:linear-gradient(120deg,#f4fff8,#fff 60%,#f3f7ff);display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px 20px;box-shadow:0 10px 26px rgba(15,23,42,.06);transition:.18s}'
      +'.kg-home-info-cta:hover .kg-home-info-cta-inner{transform:translateY(-2px);border-color:#75d39a;box-shadow:0 14px 30px rgba(15,23,42,.09)}'
      +'.kg-home-info-cta-copy{display:flex;align-items:center;gap:14px;min-width:0}.kg-home-info-cta-icon{width:46px;height:46px;flex:0 0 46px;border-radius:13px;background:#e8fbef;display:flex;align-items:center;justify-content:center;font-size:23px}'
      +'.kg-home-info-cta-copy strong{display:block;color:#0b1628;font-size:16px;font-weight:950;margin-bottom:3px}.kg-home-info-cta-copy span{display:block;color:#667085;font-size:12px;line-height:1.4}'
      +'.kg-home-info-cta-btn{flex:0 0 auto;min-height:44px;padding:0 16px;border-radius:11px;background:#0b1628;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;white-space:nowrap}.kg-home-info-cta:hover .kg-home-info-cta-btn{background:#16a34a}'
      +'.kg-home-trust{max-width:1288px;margin:0 auto 22px;border:1px solid #dce4ee;border-radius:18px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.05);padding:18px 20px}'
      +'.kg-home-trust-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:14px}.kg-home-trust-title{display:flex;gap:12px;align-items:flex-start}.kg-home-trust-badge{width:42px;height:42px;flex:0 0 42px;border-radius:12px;background:#eef7ff;display:flex;align-items:center;justify-content:center;font-size:21px}'
      +'.kg-home-trust h2{margin:0 0 4px;color:#0b1628;font-size:17px;line-height:1.25}.kg-home-trust p{margin:0;color:#667085;font-size:12px;line-height:1.55}.kg-home-trust-main{color:#087a37!important;font-weight:850;text-decoration:none;font-size:12px;white-space:nowrap;padding-top:4px}.kg-home-trust-main:hover{text-decoration:underline}'
      +'.kg-home-trust-links{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.kg-home-trust-link{display:flex;align-items:center;gap:9px;min-height:54px;padding:10px 12px;border:1px solid #e3e8ef;border-radius:12px;background:#fbfcfe;text-decoration:none;color:#253047;transition:.16s}.kg-home-trust-link:hover{border-color:#9bd9b4;background:#f7fff9;transform:translateY(-1px)}.kg-home-trust-link-icon{font-size:18px;line-height:1}.kg-home-trust-link strong{display:block;font-size:11.5px;color:#172033}.kg-home-trust-link small{display:block;margin-top:2px;color:#7b8798;font-size:10px;line-height:1.3}'
      +'#viewHome.category-selected #kgHomeInfoCenterCta,#viewHome.category-selected #kgHomeTrustCenter{display:none!important}'
      +'@media(max-width:760px){.kg-home-trust{margin:0 10px 14px;padding:15px 14px;border-radius:15px}.kg-home-trust-head{display:block}.kg-home-trust-main{display:inline-block;margin-top:9px}.kg-home-trust-links{grid-template-columns:1fr 1fr}.kg-home-info-cta{padding:0 10px;margin-bottom:14px}.kg-home-info-cta-inner{min-height:0;padding:14px;border-radius:15px;align-items:stretch}.kg-home-info-cta-copy{align-items:flex-start}.kg-home-info-cta-icon{width:40px;height:40px;flex-basis:40px;font-size:20px}.kg-home-info-cta-copy strong{font-size:14px}.kg-home-info-cta-copy span{font-size:11px}.kg-home-info-cta-btn{min-height:40px;padding:0 11px;font-size:10.5px;align-self:center}}'
      +'@media(max-width:430px){.kg-home-trust-links{grid-template-columns:1fr}.kg-home-info-cta-inner{display:grid;grid-template-columns:1fr}.kg-home-info-cta-btn{width:100%}}';
    document.head.appendChild(style);
  }

  function track(name,label){
    if(typeof window.gtag==='function') window.gtag('event',name,{link_label:label||'',page_path:location.pathname});
  }

  function ensureInfoCta(home){
    if(document.getElementById('kgHomeInfoCenterCta')) return;
    var link=document.createElement('a');
    link.id='kgHomeInfoCenterCta';
    link.className='kg-home-info-cta';
    link.href='/bilgi-merkezi/';
    link.setAttribute('aria-label','Bilgi Merkezi - sorununa çözüm bul');
    link.innerHTML='<div class="kg-home-info-cta-inner"><div class="kg-home-info-cta-copy"><span class="kg-home-info-cta-icon" aria-hidden="true">🛠️</span><div><strong>Sorunun mu var? Bilgi Merkezi’nde çözümünü bul.</strong><span>Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolu sorunları için hızlı çözüm ve destek asistanı.</span></div></div><span class="kg-home-info-cta-btn">Bilgi Merkezine Git →</span></div>';
    var target=home.querySelector('.kg-approved-category-grid,.category-grid,.home-intro');
    if(target) target.insertAdjacentElement('beforebegin',link);
    else home.insertBefore(link,home.firstChild);
    link.addEventListener('click',function(){track('home_info_center_clicked','Bilgi Merkezi');});
  }

  function ensureTrustCenter(home){
    if(document.getElementById('kgHomeTrustCenter')) return;
    var box=document.createElement('section');
    box.id='kgHomeTrustCenter';
    box.className='kg-home-trust';
    box.setAttribute('aria-labelledby','kgHomeTrustTitle');
    box.innerHTML=''
      +'<div class="kg-home-trust-head">'
      +'<div class="kg-home-trust-title"><span class="kg-home-trust-badge" aria-hidden="true">🛡️</span><div><h2 id="kgHomeTrustTitle">Şeffaflık ve güven KaçaGider’in temelidir</h2><p>Fiyatların nasıl oluşturulduğunu, kişisel verilerin nasıl ele alındığını ve ilan verirken dikkat edilmesi gerekenleri açıkça inceleyebilirsin.</p></div></div>'
      +'<a class="kg-home-trust-main" href="/guven-merkezi/">Güven Merkezini Aç →</a>'
      +'</div>'
      +'<div class="kg-home-trust-links">'
      +'<a class="kg-home-trust-link" href="/veri-metodolojisi/"><span class="kg-home-trust-link-icon" aria-hidden="true">📊</span><span><strong>Veri Metodolojisi</strong><small>Değerlerin nasıl hesaplandığını gör</small></span></a>'
      +'<a class="kg-home-trust-link" href="/gizlilik-politikasi/"><span class="kg-home-trust-link-icon" aria-hidden="true">🔒</span><span><strong>Gizlilik Politikası</strong><small>Veri kullanım yaklaşımını incele</small></span></a>'
      +'<a class="kg-home-trust-link" href="/kvkk/"><span class="kg-home-trust-link-icon" aria-hidden="true">📄</span><span><strong>KVKK</strong><small>Kişisel veri haklarını öğren</small></span></a>'
      +'<a class="kg-home-trust-link" href="/ilan-guvenligi/"><span class="kg-home-trust-link-icon" aria-hidden="true">✅</span><span><strong>İlan Güvenliği</strong><small>Güvenli alım-satım önerilerini gör</small></span></a>'
      +'</div>';

    var categoryTarget=home.querySelector('.kg-approved-category-grid,.category-grid');
    var intro=home.querySelector('.home-intro');
    if(categoryTarget) categoryTarget.insertAdjacentElement('afterend',box);
    else if(intro) intro.insertAdjacentElement('afterend',box);
    else home.appendChild(box);

    box.addEventListener('click',function(e){
      var a=e.target.closest('a');
      if(!a) return;
      track('home_trust_link_clicked',(a.textContent||'').trim().slice(0,80));
    });
  }

  function ensure(){
    if(location.pathname!=='/' && location.pathname!=='/index.html') return;
    var home=document.getElementById('viewHome');
    if(!home) return;
    addStyles();
    ensureInfoCta(home);
    ensureTrustCenter(home);
  }

  ensure();
  setTimeout(ensure,0);
  setTimeout(ensure,400);
  setTimeout(ensure,1000);
})();