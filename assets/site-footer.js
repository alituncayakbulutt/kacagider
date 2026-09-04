(function(){
  'use strict';
  var FAVORITES_KEY='kg_marketplace_favorites_v1';
  function hasTrustFooter(){
    if(document.getElementById('kgSiteTrustFooter')) return true;
    return Array.from(document.scripts||[]).some(function(script){
      return /\/assets\/site-trust-footer\.js(?:\?|$)/.test(script.src||'');
    });
  }
  function inject(){
    if(document.getElementById('kgGlobalFooter') || hasTrustFooter()) return;
    var style=document.createElement('style');
    style.id='kgGlobalFooterStyle';
    style.textContent='.kg-global-footer{margin-top:40px;background:#0b1628;color:#fff;border-top:1px solid rgba(255,255,255,.08)}.kg-global-footer *{box-sizing:border-box}.kg-footer-inner{max-width:1480px;margin:0 auto;padding:38px 30px 22px}.kg-footer-top{display:grid;grid-template-columns:1.35fr repeat(3,1fr);gap:38px}.kg-footer-brand{font-size:27px;font-weight:950;letter-spacing:-.8px}.kg-footer-brand span{color:#10b956}.kg-footer-copy{margin:10px 0 0;max-width:390px;color:#aeb9c9;font-size:13px;line-height:1.65}.kg-footer-title{font-size:13px;font-weight:900;color:#fff;margin:3px 0 13px}.kg-footer-links{display:grid;gap:9px}.kg-footer-links a{color:#b8c3d2;text-decoration:none;font-size:12.5px;line-height:1.4}.kg-footer-links a:hover{color:#34d77a}.kg-footer-contact{display:inline-flex!important;align-items:center;gap:7px}.kg-footer-bottom{margin-top:30px;padding-top:18px;border-top:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;gap:20px;align-items:center;color:#8795a9;font-size:11.5px}.kg-footer-note{max-width:760px;line-height:1.55}.kg-footer-badge{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.kg-footer-badge span{border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:6px 9px;color:#aeb9c9;white-space:nowrap}@media(max-width:900px){.kg-footer-top{grid-template-columns:1fr 1fr}.kg-footer-bottom{align-items:flex-start;flex-direction:column}.kg-footer-badge{justify-content:flex-start}}@media(max-width:560px){.kg-global-footer{margin-top:28px}.kg-footer-inner{padding:30px 18px 18px}.kg-footer-top{grid-template-columns:1fr;gap:25px}.kg-footer-brand{font-size:24px}.kg-footer-copy{font-size:12.5px}.kg-footer-bottom{margin-top:25px}.kg-footer-badge span{font-size:10.5px}}';
    document.head.appendChild(style);
    var footer=document.createElement('footer');
    footer.id='kgGlobalFooter';
    footer.className='kg-global-footer';
    footer.setAttribute('aria-label','KaçaGider kurumsal ve yasal bağlantılar');
    footer.innerHTML='<div class="kg-footer-inner"><div class="kg-footer-top"><div><div class="kg-footer-brand">Kaça<span>Gider</span></div><p class="kg-footer-copy">Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için ikinci el piyasa değerini anlamaya, doğru satış fiyatını belirlemeye ve ücretsiz ilan vermeye yardımcı olan bağımsız platform.</p></div><div><div class="kg-footer-title">KaçaGider</div><nav class="kg-footer-links"><a href="/hakkimizda/">Hakkımızda</a><a href="/veri-metodolojisi/">Veri Metodolojisi</a><a href="/bilgi-merkezi/">Bilgi Merkezi</a><a href="/iletisim/">İletişim</a></nav></div><div><div class="kg-footer-title">Güven</div><nav class="kg-footer-links"><a href="/guven-merkezi/">Güven Merkezi</a><a href="/ilan-guvenligi/">İlan Güvenliği</a><a href="/gizlilik-politikasi/">Gizlilik Politikası</a><a href="/kvkk/">KVKK Aydınlatma</a></nav></div><div><div class="kg-footer-title">Yasal</div><nav class="kg-footer-links"><a href="/kullanim-kosullari/">Kullanım Koşulları</a><a href="/cerez-politikasi/">Çerez Politikası</a><a class="kg-footer-contact" href="mailto:info@kacagider.com.tr">✉ info@kacagider.com.tr</a></nav></div></div><div class="kg-footer-bottom"><div class="kg-footer-note">© '+new Date().getFullYear()+' KaçaGider. Gösterilen değerler tahmini piyasa değerlendirmesidir; kesin alım veya satış teklifi değildir.</div><div class="kg-footer-badge"><span>🔒 Gizlilik odaklı</span><span>📊 Şeffaf metodoloji</span><span>🛡️ Güvenli ilan rehberi</span></div></div></div>';
    document.body.appendChild(footer);
    footer.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a)return;if(typeof window.gtag==='function')window.gtag('event','footer_link_clicked',{link_url:a.getAttribute('href')||'',page_path:location.pathname});});
  }

  function localFavorites(){try{var v=JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]');return Array.isArray(v)?v:[];}catch(_e){return [];}}
  function writeFavorites(v){try{localStorage.setItem(FAVORITES_KEY,JSON.stringify(Array.from(new Set(v.filter(Boolean)))));}catch(_e){}}
  function paintFavorites(){var favs=new Set(localFavorites());document.querySelectorAll('[data-fav]').forEach(function(b){var active=favs.has(b.dataset.fav);b.classList.toggle('active',active);b.textContent=active?'♥':'♡';});}
  async function favoriteContext(){var api=window.KGMarketplaceSupabase;if(!api)return null;try{await api.ready;var user=await api.getUser();if(!user)return null;var client=await api.init();return {api:api,user:user,client:client};}catch(_e){return null;}}
  async function syncAllFavorites(){var ctx=await favoriteContext();if(!ctx)return;var cloud=await ctx.client.from('user_favorites').select('listing_id').eq('user_id',ctx.user.id);if(cloud.error)return;var cloudIds=(cloud.data||[]).map(function(x){return x.listing_id;}).filter(Boolean),local=localFavorites(),cloudSet=new Set(cloudIds),missing=local.filter(function(id){return !cloudSet.has(id);});if(missing.length){await ctx.client.from('user_favorites').upsert(missing.map(function(id){return {user_id:ctx.user.id,listing_id:id};}),{onConflict:'user_id,listing_id'});}writeFavorites(cloudIds.concat(local));paintFavorites();setTimeout(paintFavorites,700);setTimeout(paintFavorites,1600);}
  async function syncOneFavorite(id){var ctx=await favoriteContext();if(!ctx||!id)return;var active=localFavorites().includes(id);if(active)await ctx.client.from('user_favorites').upsert({user_id:ctx.user.id,listing_id:id},{onConflict:'user_id,listing_id'});else await ctx.client.from('user_favorites').delete().eq('user_id',ctx.user.id).eq('listing_id',id);}
  function bindFavoriteCloudSync(){if(document.documentElement.dataset.kgFavoriteCloud==='1')return;document.documentElement.dataset.kgFavoriteCloud='1';document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-fav]');if(!b)return;var id=b.dataset.fav;setTimeout(function(){syncOneFavorite(id);},0);});setTimeout(syncAllFavorites,250);setTimeout(syncAllFavorites,1100);}

  function boot(){inject();bindFavoriteCloudSync();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();