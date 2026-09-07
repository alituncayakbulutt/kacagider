(function(){
  "use strict";
  if(window.__KG_DEALER_TRUST_OFFERS__)return;
  window.__KG_DEALER_TRUST_OFFERS__=true;

  function esc(v){return String(v==null?"":v).replace(/[&<>\"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c];});}
  function num(v){var n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(100,Math.round(n))):null;}

  function ensureStyle(){
    if(document.getElementById('kg-dealer-trust-style'))return;
    var s=document.createElement('style');
    s.id='kg-dealer-trust-style';
    s.textContent='\
.kg-dealer-trust{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-top:8px}.kg-dealer-trust-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:999px;background:#eef8f1;color:#176b38;border:1px solid #d2ead9;font-size:10px;font-weight:850}.kg-dealer-trust-badge strong{font-size:11px}.kg-dealer-trust-badge.verified{background:#edf7ff;color:#185a96;border-color:#cfe4f7}.kg-dealer-trust-meta{width:100%;color:#667085;font-size:10px;line-height:1.45}.kg-dealer-trust-loading{font-size:10px;color:#98a2b3;margin-top:7px}html[data-theme="dark"] .kg-dealer-trust-badge{background:#173122!important;color:#bfe7cb!important;border-color:#315541!important}html[data-theme="dark"] .kg-dealer-trust-badge.verified{background:#172b40!important;color:#c5def5!important;border-color:#35526d!important}html[data-theme="dark"] .kg-dealer-trust-meta{color:#aebbd0!important}';
    document.head.appendChild(s);
  }

  function getClient(){
    if(window.__KG_SUPABASE_CLIENT__)return Promise.resolve(window.__KG_SUPABASE_CLIENT__);
    if(window.KGMarketplaceSupabase&&typeof window.KGMarketplaceSupabase.init==='function')return window.KGMarketplaceSupabase.init();
    return Promise.resolve(null);
  }

  function renderHost(host,profile){
    if(!host||!profile)return;
    var score=num(profile.trust_score);
    var verified=Boolean(profile.dealer_verified);
    var completed=Number(profile.completed_transaction_count||0);
    var positive=Number(profile.positive_signal_count||0);
    var negative=Number(profile.negative_signal_count||0);
    var meta=[];
    if(completed>0)meta.push(completed+' tamamlanan işlem');
    if(positive>0)meta.push(positive+' olumlu güven sinyali');
    if(negative>0)meta.push(negative+' olumsuz güven sinyali');
    host.innerHTML='<div class="kg-dealer-trust">'
      +(score!==null?'<span class="kg-dealer-trust-badge">Telefoncu Güven Puanı <strong>'+score+'/100</strong> · '+esc(profile.trust_label||'')+'</span>':'')
      +(verified?'<span class="kg-dealer-trust-badge verified">✓ Doğrulanmış Telefoncu</span>':'')
      +(meta.length?'<div class="kg-dealer-trust-meta">'+esc(meta.join(' · '))+'</div>':'')
      +'</div>';
    host.dataset.kgDealerTrustReady='1';
  }

  function trustHost(card){
    var existing=card.querySelector('[data-kg-dealer-trust-host]');
    if(existing)return existing;
    var host=document.createElement('div');
    host.dataset.kgDealerTrustHost='1';
    var anchor=card.querySelector('.dealer-name,.store-name,.offer-dealer,.dealer,.offer-title,h3,h4,strong')||card.firstElementChild;
    if(anchor&&anchor.parentNode)anchor.insertAdjacentElement('afterend',host);else card.appendChild(host);
    return host;
  }

  async function loadByOfferId(host,offerId){
    var client=await getClient();
    if(!client||typeof client.rpc!=='function')return;
    host.innerHTML='<div class="kg-dealer-trust-loading">Telefoncu güven bilgisi yükleniyor…</div>';
    var res=await client.rpc('get_dealer_offer_trust',{p_offer_id:offerId});
    if(res&&res.error){host.innerHTML='';return;}
    var row=Array.isArray(res&&res.data)?res.data[0]:res&&res.data;
    if(row)renderHost(host,row);else host.innerHTML='';
  }

  async function loadByDealerId(host,dealerId){
    if(window.KGMarketplaceSupabase&&typeof window.KGMarketplaceSupabase.getTrustProfile==='function'){
      try{var profile=await window.KGMarketplaceSupabase.getTrustProfile(dealerId);if(profile)renderHost(host,profile);return;}catch(e){}
    }
    var client=await getClient();
    if(!client||typeof client.rpc!=='function')return;
    host.innerHTML='<div class="kg-dealer-trust-loading">Telefoncu güven bilgisi yükleniyor…</div>';
    var res=await client.rpc('get_public_trust_profile',{p_user_id:dealerId});
    if(res&&res.error){host.innerHTML='';return;}
    var row=Array.isArray(res&&res.data)?res.data[0]:res&&res.data;
    if(row)renderHost(host,row);else host.innerHTML='';
  }

  function profileFromDataset(card){
    var d=card.dataset||{};
    if(d.trustScore===undefined&&d.dealerTrustScore===undefined)return null;
    return {
      trust_score:d.dealerTrustScore||d.trustScore,
      trust_label:d.dealerTrustLabel||d.trustLabel||'',
      dealer_verified:d.dealerVerified==='true'||d.dealerVerified==='1',
      completed_transaction_count:d.completedTransactionCount||0,
      positive_signal_count:d.positiveSignalCount||0,
      negative_signal_count:d.negativeSignalCount||0
    };
  }

  function decorate(card,row){
    if(!card)return;
    ensureStyle();
    if(row&&typeof row==='object'){
      if(row.offer_id&&!card.dataset.offerId)card.dataset.offerId=row.offer_id;
      if(row.dealer_user_id&&!card.dataset.dealerUserId)card.dataset.dealerUserId=row.dealer_user_id;
      if(row.trust_score!==undefined){
        renderHost(trustHost(card),row);
        return;
      }
    }
    var host=trustHost(card);
    if(host.dataset.kgDealerTrustReady==='1'||host.dataset.kgDealerTrustLoading==='1')return;
    var direct=profileFromDataset(card);
    if(direct){renderHost(host,direct);return;}
    var offerId=card.dataset.offerId||card.getAttribute('data-offer-id');
    var dealerId=card.dataset.dealerUserId||card.dataset.dealerId||card.dataset.offerUserId||card.getAttribute('data-dealer-user-id')||card.getAttribute('data-dealer-id');
    host.dataset.kgDealerTrustLoading='1';
    if(offerId)loadByOfferId(host,offerId).finally(function(){delete host.dataset.kgDealerTrustLoading;});
    else if(dealerId)loadByDealerId(host,dealerId).finally(function(){delete host.dataset.kgDealerTrustLoading;});
    else delete host.dataset.kgDealerTrustLoading;
  }

  function scan(){
    ensureStyle();
    var selectors='[data-offer-id],[data-dealer-user-id],[data-dealer-id],[data-offer-user-id],.kg-dealer-offer,.dealer-offer,.offer-card';
    Array.prototype.forEach.call(document.querySelectorAll(selectors),function(card){
      var text=String(card.textContent||'').toLocaleLowerCase('tr-TR');
      if(text.indexOf('teklif')===-1&&text.indexOf('telefoncu')===-1&&!card.dataset.offerId&&!card.dataset.dealerId&&!card.dataset.dealerUserId)return;
      decorate(card);
    });
  }

  window.KGDecorateDealerOffer=decorate;
  window.KGRenderDealerTrustOffer=function(card,row){decorate(card,row);};

  var observer=new MutationObserver(function(){scan();});
  function ready(){scan();observer.observe(document.documentElement,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
