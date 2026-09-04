(function(){
  'use strict';

  function removeLegacyFooter(){
    var legacy=document.getElementById('kgGlobalFooter');
    if(legacy) legacy.remove();
    var legacyStyle=document.getElementById('kgGlobalFooterStyle');
    if(legacyStyle) legacyStyle.remove();
  }

  function watchLegacyFooter(){
    removeLegacyFooter();
    if(!document.body || typeof MutationObserver==='undefined') return;
    var observer=new MutationObserver(function(){ removeLegacyFooter(); });
    observer.observe(document.body,{childList:true});
    setTimeout(function(){ removeLegacyFooter(); observer.disconnect(); },4000);
  }

  function addFooter(){
    removeLegacyFooter();
    if(document.getElementById('kgSiteTrustFooter')){
      watchLegacyFooter();
      return;
    }
    var blocked=['/admin/'];
    if(blocked.some(function(p){return location.pathname.indexOf(p)===0;})) return;

    var style=document.createElement('style');
    style.id='kgSiteTrustFooterStyle';
    style.textContent=''
      +'.kg-site-footer{margin-top:38px;background:#08172b;color:#dbe4f0;border-top:1px solid #1a2a42}'
      +'.kg-site-footer *{box-sizing:border-box}'
      +'.kg-site-footer-wrap{max-width:1480px;margin:auto;padding:38px 32px 24px}'
      +'.kg-site-footer-grid{display:grid;grid-template-columns:minmax(300px,1.55fr) repeat(3,minmax(155px,1fr));gap:40px;align-items:start}'
      +'.kg-site-footer-brand{font-size:27px;font-weight:950;letter-spacing:-.8px;color:#fff;line-height:1}'
      +'.kg-site-footer-brand span{color:#10b956}'
      +'.kg-site-footer-intro{max-width:470px;margin:13px 0 0;color:#aab7c9;font-size:13.5px;line-height:1.68}'
      +'.kg-site-footer h3{margin:1px 0 14px;color:#fff;font-size:13.5px;font-weight:850;letter-spacing:.1px}'
      +'.kg-site-footer-links{display:grid;gap:10px}'
      +'.kg-site-footer a{color:#bdc8d8;text-decoration:none;font-size:13px;line-height:1.35;transition:color .18s ease}'
      +'.kg-site-footer a:hover{color:#45dd83}'
      +'.kg-site-footer a:focus-visible{outline:2px solid #45dd83;outline-offset:3px;border-radius:4px}'
      +'.kg-site-footer-note{margin-top:16px;max-width:270px;font-size:11.5px;color:#8f9db0;line-height:1.55}'
      +'.kg-site-footer-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}'
      +'.kg-site-footer-badge{border:1px solid #31435f;background:#10213a;border-radius:999px;padding:6px 10px;color:#c3cfdf;font-size:10.5px;font-weight:750;line-height:1}'
      +'.kg-site-footer-bottom{border-top:1px solid #20314c;margin-top:30px;padding-top:18px;display:flex;align-items:center;justify-content:space-between;gap:18px;color:#8d9bad;font-size:11.5px;line-height:1.45}'
      +'@media(max-width:1000px){.kg-site-footer-grid{grid-template-columns:1.35fr 1fr 1fr;gap:32px}.kg-site-footer-grid>div:last-child{grid-column:2/4}.kg-site-footer-note{max-width:420px}}'
      +'@media(max-width:800px){.kg-site-footer-wrap{padding:30px 20px 22px}.kg-site-footer-grid{grid-template-columns:1fr 1fr;gap:28px 24px}.kg-site-footer-brandbox{grid-column:1/-1}.kg-site-footer-grid>div:last-child{grid-column:auto}.kg-site-footer-bottom{align-items:flex-start;flex-direction:column;margin-top:26px}}'
      +'@media(max-width:520px){.kg-site-footer{margin-top:30px}.kg-site-footer-wrap{padding:28px 18px 20px}.kg-site-footer-grid{grid-template-columns:1fr;gap:25px}.kg-site-footer-brandbox{grid-column:auto}.kg-site-footer-grid>div:last-child{grid-column:auto}.kg-site-footer-brand{font-size:25px}.kg-site-footer-intro{font-size:13px}.kg-site-footer-badges{gap:7px}.kg-site-footer-bottom{gap:8px}}'
      +'.kg-site-footer.kg-site-footer-home{margin-top:0}';
    document.head.appendChild(style);

    var footer=document.createElement('footer');
    footer.id='kgSiteTrustFooter';
    footer.className='kg-site-footer'+((location.pathname==='/'||location.pathname==='/index.html')?' kg-site-footer-home':'');
    footer.setAttribute('aria-label','KaçaGider kurumsal ve güven bağlantıları');
    footer.innerHTML='<div class="kg-site-footer-wrap"><div class="kg-site-footer-grid"><div class="kg-site-footer-brandbox"><div class="kg-site-footer-brand">Kaça<span>Gider</span></div><p class="kg-site-footer-intro">İkinci el telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için tahmini piyasa değerini anlamana yardımcı olan bağımsız fiyat rehberi ve ilan platformu.</p><div class="kg-site-footer-badges"><span class="kg-site-footer-badge">Ücretsiz değerleme</span><span class="kg-site-footer-badge">Şeffaf metodoloji</span><span class="kg-site-footer-badge">Güvenli kullanım rehberleri</span></div></div><div><h3>KaçaGider</h3><div class="kg-site-footer-links"><a href="/hakkimizda/">Hakkımızda</a><a href="/veri-metodolojisi/">Veri Metodolojisi</a><a href="/bilgi-merkezi/">Bilgi Merkezi</a><a href="/iletisim/">İletişim</a></div></div><div><h3>Güven</h3><div class="kg-site-footer-links"><a href="/guven-merkezi/">Güven Merkezi</a><a href="/ilan-guvenligi/">İlan Güvenliği</a><a href="/gizlilik-politikasi/">Gizlilik Politikası</a><a href="/kvkk/">KVKK Aydınlatma</a></div></div><div><h3>Yasal</h3><div class="kg-site-footer-links"><a href="/kullanim-kosullari/">Kullanım Koşulları</a><a href="/cerez-politikasi/">Çerez Politikası</a><a href="mailto:info@kacagider.com.tr">info@kacagider.com.tr</a></div><p class="kg-site-footer-note">KaçaGider tarafından gösterilen değerler tahminidir; kesin alım veya satış garantisi değildir.</p></div></div><div class="kg-site-footer-bottom"><span>© '+new Date().getFullYear()+' KaçaGider. Tüm hakları saklıdır.</span><span>Satmadan veya satın almadan önce piyasa değerini kontrol et.</span></div></div>';
    document.body.appendChild(footer);
    watchLegacyFooter();

    footer.addEventListener('click',function(e){
      var a=e.target.closest('a');
      if(!a) return;
      if(typeof window.gtag==='function'){
        window.gtag('event','site_footer_link_clicked',{
          link_url:a.getAttribute('href')||'',
          page_path:location.pathname
        });
      }
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addFooter);
  else addFooter();
})();