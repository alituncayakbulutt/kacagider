(function(){
  'use strict';

  var STORAGE_KEY='kg-saved-valuations-v2';
  var lastRenderedPrice='';
  var membershipPromise=null;
  var autoSaveTimer=null;
  var lastCloudSignature='';

  function moneyNumber(text){
    var cleaned=String(text||'').replace(/[^0-9]/g,'');
    return cleaned ? Number(cleaned) : 0;
  }

  function formatTL(value){
    if(!Number.isFinite(value)||value<=0) return '—';
    return Math.round(value).toLocaleString('tr-TR')+' TL';
  }

  function loadFixedScript(src,id){
    return new Promise(function(resolve,reject){
      var existing=document.getElementById(id);
      if(existing){if(existing.dataset.loaded==='1')return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return;}
      var s=document.createElement('script');s.id=id;s.src=src;s.async=true;s.addEventListener('load',function(){s.dataset.loaded='1';resolve();},{once:true});s.addEventListener('error',reject,{once:true});document.head.appendChild(s);
    });
  }

  async function membershipApi(){
    if(membershipPromise) return membershipPromise;
    membershipPromise=(async function(){
      if(!window.KGMarketplaceSupabase) await loadFixedScript('/assets/supabase-marketplace.js?v=20260904-phase3','kgPhase3Supabase');
      var api=window.KGMarketplaceSupabase;if(!api)throw new Error('Üyelik sistemi yüklenemedi.');await api.ready;return api;
    })();
    return membershipPromise;
  }

  function ensureAccountNav(){
    if(window.__KG_ACCOUNT_SESSION_NAV__)return;
    loadFixedScript('/assets/account-session-nav.js?v=20260904-phase3','kgPhase3AccountNav').then(function(){setTimeout(enhanceAccountButton,500);setTimeout(enhanceAccountButton,1400);}).catch(function(){});
  }

  async function enhanceAccountButton(){
    try{
      var api=await membershipApi(),user=await api.getUser();if(!user)return;
      var b=document.getElementById('kgAccountSessionAction')||document.getElementById('kgHeaderAccountAction');if(!b)return;
      b.textContent='Hesabım';b.setAttribute('aria-label','KaçaGider hesabını aç');b.onclick=function(){location.href='/hesabim/';};
    }catch(_e){}
  }

  function addStyles(){
    if(document.getElementById('kgResultV2Style')) return;
    var style=document.createElement('style');
    style.id='kgResultV2Style';
    style.textContent=''
      +'.kg-result-v2{padding:17px 18px!important;overflow:hidden}'
      +'.kg-result-v2-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}'
      +'.kg-result-v2-head strong{font-size:15px;color:#172033}.kg-result-v2-badge{font-size:10px;font-weight:900;color:#087a37;background:#eafbf1;border:1px solid #c5ecd4;border-radius:999px;padding:5px 8px}'
      +'.kg-result-v2-range{padding:13px 14px;border-radius:12px;background:linear-gradient(120deg,#f2fff7,#f7fbff);border:1px solid #d6eadf;margin-bottom:12px}'
      +'.kg-result-v2-range span{display:block;color:#667085;font-size:11px;font-weight:750;margin-bottom:4px}.kg-result-v2-range strong{display:block;color:#0b7a38;font-size:20px;letter-spacing:-.3px}'
      +'.kg-result-v2-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:11px}.kg-result-v2-cell{padding:10px 11px;border:1px solid #e5e9ef;border-radius:11px;background:#fbfcfe}.kg-result-v2-cell span{display:block;color:#7b8798;font-size:10px;margin-bottom:3px}.kg-result-v2-cell strong{display:block;color:#27334a;font-size:12px;line-height:1.35}'
      +'.kg-result-v2-confidence{padding:11px 12px;border-radius:11px;background:#f8fafc;border:1px solid #e5e9ef;color:#526076;font-size:11px;line-height:1.5;margin-bottom:12px}.kg-result-v2-confidence strong{color:#27334a}'
      +'.kg-result-v2-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.kg-result-v2-btn{min-height:41px;border-radius:10px;border:1px solid #d9e0e8;background:#fff;color:#253047;font:inherit;font-size:11.5px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px}.kg-result-v2-btn:hover{border-color:#8ed5aa;background:#f7fff9}.kg-result-v2-btn.primary{background:#0b1628;color:#fff;border-color:#0b1628}.kg-result-v2-btn.primary:hover{background:#087a37;border-color:#087a37}'
      +'.kg-result-v2-status{min-height:16px;margin-top:8px;text-align:center;color:#667085;font-size:10.5px;line-height:1.35}'
      +'.kg-result-v2-empty{display:none}'
      +'.factors .kg-result-v2-factor-help{margin:-4px 0 10px;color:#7b8798;font-size:10.5px;line-height:1.45}'
      +'@media(max-width:430px){.kg-result-v2-grid,.kg-result-v2-actions{grid-template-columns:1fr}.kg-result-v2-range strong{font-size:18px}}';
    document.head.appendChild(style);
  }

  function ensurePanel(){
    var side=document.querySelector('#viewHome .side');
    var priceCard=side&&side.querySelector('.price-card');
    var prices=side&&side.querySelector('.panel.prices');
    if(!side||!priceCard||!prices) return null;
    var panel=document.getElementById('kgResultV2');
    if(!panel){
      panel=document.createElement('div');
      panel.id='kgResultV2';
      panel.className='panel kg-result-v2';
      panel.innerHTML=''
        +'<div class="kg-result-v2-head"><strong>Sonuç Özeti</strong><span class="kg-result-v2-badge">V2</span></div>'
        +'<div class="kg-result-v2-range"><span>Tahmini satış aralığı</span><strong id="kgResultRange">—</strong></div>'
        +'<div class="kg-result-v2-grid">'
        +'<div class="kg-result-v2-cell"><span>Hesaplama zamanı</span><strong id="kgResultUpdated">—</strong></div>'
        +'<div class="kg-result-v2-cell"><span>Veri kapsamı</span><strong id="kgResultDataCount">—</strong></div>'
        +'</div>'
        +'<div class="kg-result-v2-confidence" id="kgResultConfidence"><strong>Güven skoru</strong><br>Fiyat hesaplandığında güven seviyesi burada açıklanacak.</div>'
        +'<div class="kg-result-v2-actions">'
        +'<button type="button" class="kg-result-v2-btn" id="kgResultShare">↗ Paylaş</button>'
        +'<button type="button" class="kg-result-v2-btn primary" id="kgResultSave">♡ Sonucu Kaydet</button>'
        +'<button type="button" class="kg-result-v2-btn" id="kgResultAlert">🔔 Fiyat Alarmı</button>'
        +'</div>'
        +'<div class="kg-result-v2-status" id="kgResultStatus" aria-live="polite"></div>';
      prices.insertAdjacentElement('beforebegin',panel);
      bindActions(panel);
    }

    var factors=side.querySelector('.panel.factors');
    if(factors&&!factors.querySelector('.kg-result-v2-factor-help')){
      var h=factors.querySelector('h3');
      if(h){
        h.textContent='Fiyatı Etkileyen Faktörler';
        var p=document.createElement('p');
        p.className='kg-result-v2-factor-help';
        p.textContent='Cihaz durumundaki seçimlerin tahmini değere nasıl yansıdığını burada görebilirsin.';
        h.insertAdjacentElement('afterend',p);
      }
    }
    return panel;
  }

  function observationText(){
    var trust=document.querySelector('#viewHome .trust p');
    var text=trust ? trust.textContent||'' : '';
    var match=text.match(/([0-9]+)\s+doğrulanmış piyasa gözlemi/i);
    if(match&&Number(match[1])>0) return Number(match[1]).toLocaleString('tr-TR')+' doğrulanmış gözlem';
    if(/Türkiye ikinci el piyasası/i.test(text)) return 'Türkiye 2. el piyasa analizi';
    return 'Piyasa verisi + cihaz kondisyonu';
  }

  function confidenceExplanation(score){
    score=Number(score)||0;
    if(score>=85) return '<strong>Yüksek güven ('+Math.round(score)+'/100)</strong><br>Mevcut veri kapsamı ve model eşleşmesi güçlü. Yine de sonuç tahmini piyasa değeridir; gerçek satış fiyatı ilana ve alıcı talebine göre değişebilir.';
    if(score>=70) return '<strong>İyi güven ('+Math.round(score)+'/100)</strong><br>Fiyat için yeterli piyasa sinyali var. Kondisyon ve bölgesel talep gerçek satış fiyatında fark oluşturabilir.';
    if(score>0) return '<strong>Sınırlı güven ('+Math.round(score)+'/100)</strong><br>Bu model veya varyant için veri kapsamı daha sınırlı. Sonucu kesin satış fiyatı yerine referans aralık olarak kullanmanı öneririz.';
    return '<strong>Güven skoru</strong><br>Fiyat hesaplandığında güven seviyesi burada açıklanacak.';
  }

  function currentSnapshot(){
    var main=document.getElementById('mainPrice');
    var quick=document.getElementById('quickPrice');
    var listing=document.getElementById('listingPrice');
    var scoreEl=document.getElementById('trustScore');
    var mainValue=moneyNumber(main&&main.textContent);
    var quickValue=moneyNumber(quick&&quick.textContent);
    var listingValue=moneyNumber(listing&&listing.textContent);
    var score=Number(String(scoreEl&&scoreEl.textContent||'').replace(',','.'))||0;
    return {main:mainValue,quick:quickValue,listing:listingValue,score:score};
  }

  function selectedText(id){var el=document.getElementById(id);if(!el)return '';if(el.tagName==='SELECT'){var o=el.options[el.selectedIndex];return o?String(o.textContent||'').trim():'';}return String(el.value||'').trim();}
  function currentCategory(){var active=document.querySelector('.category-card.active[data-category],.kg-approved-card.active[data-category],[data-category].active'),raw=active&&active.dataset?active.dataset.category:'';var map={phone:'phone',telefon:'phone',tablet:'tablet',computer:'computer',bilgisayar:'computer',watch:'watch','akilli-saat':'watch',console:'console','oyun-konsolu':'console'};if(map[raw])return map[raw];var n=document.getElementById('selectedCategoryName'),t=String(n&&n.textContent||'').trim();return {'Telefon':'phone','Tablet':'tablet','Bilgisayar':'computer','Akıllı Saat':'watch','Oyun Konsolu':'console'}[t]||'phone';}
  function valuationPayload(snap,user){var cat=currentCategory(),generic=cat!=='phone',details=[];try{if(typeof window.KGMarketplaceCollectDetails==='function')details=window.KGMarketplaceCollectDetails()||[];}catch(_e){}return {user_id:user.id,category:cat,brand:selectedText(generic?'genericBrand':'phoneBrand'),model:selectedText(generic?'genericModel':'model'),storage:selectedText(generic?'genericStorage':'storage')||null,estimated_price:snap.main||null,quick_sale_price:snap.quick||null,listing_price:snap.listing||null,confidence_score:snap.score?Math.min(100,Math.round(snap.score)):null,details:{conditions:Array.isArray(details)?details:[]}};}
  function payloadValid(p){return !!(p&&p.brand&&p.model&&p.estimated_price);}
  function cloudSignature(p){return [p.category,p.brand,p.model,p.storage||'',p.estimated_price,p.quick_sale_price||'',p.listing_price||'',p.confidence_score||''].join('|');}

  function setStatus(text){
    var el=document.getElementById('kgResultStatus');
    if(el){
      el.textContent=text||'';
      if(text) setTimeout(function(){if(el.textContent===text) el.textContent='';},3200);
    }
  }

  async function saveCloudValuation(silent){
    try{
      var api=await membershipApi(),user=await api.getUser();if(!user)return false;
      var snap=currentSnapshot(),payload=valuationPayload(snap,user);if(!payloadValid(payload))return false;
      var sig=cloudSignature(payload);if(sig===lastCloudSignature){if(!silent)setStatus('Bu sonuç hesabında zaten kayıtlı.');return true;}
      var client=await api.init(),r=await client.from('user_valuations').insert(payload);if(r.error)throw r.error;
      lastCloudSignature=sig;if(!silent)setStatus('Sonuç hesabına kaydedildi.');
      if(typeof window.gtag==='function')window.gtag('event','valuation_saved',{category:payload.category,brand:payload.brand,model:payload.model,auto_save:silent?1:0});
      return true;
    }catch(_e){if(!silent)setStatus('Bu cihazda kaydedildi; hesap kaydı tamamlanamadı.');return false;}
  }

  function scheduleAutoCloudSave(){clearTimeout(autoSaveTimer);autoSaveTimer=setTimeout(function(){saveCloudValuation(true);},900);}

  async function savePriceAlert(){
    var snap=currentSnapshot();if(!snap.main){setStatus('Önce cihaz değerini hesapla.');return;}
    try{
      var api=await membershipApi(),user=await api.getUser();if(!user){setStatus('Fiyat alarmı için önce giriş yap.');ensureAccountNav();return;}
      var payload=valuationPayload(snap,user);if(!payloadValid(payload)){setStatus('Cihaz bilgileri tamamlanmadı.');return;}
      var client=await api.init(),r=await client.from('price_alerts').upsert({user_id:user.id,category:payload.category,brand:payload.brand,model:payload.model,storage:payload.storage,baseline_price:payload.estimated_price,target_price:payload.estimated_price,is_active:true,updated_at:new Date().toISOString()},{onConflict:'user_id,category,brand,model,storage'});if(r.error)throw r.error;
      setStatus('Fiyat alarmı açıldı. Hesabım bölümünden yönetebilirsin.');if(typeof window.gtag==='function')window.gtag('event','price_alert_created',{category:payload.category,brand:payload.brand,model:payload.model});
    }catch(_e){setStatus('Fiyat alarmı oluşturulamadı.');}
  }

  function render(){
    addStyles();
    var panel=ensurePanel();
    if(!panel) return;
    var snap=currentSnapshot();
    var active=snap.main>0;
    panel.style.display=active?'block':'none';
    if(!active){ lastRenderedPrice=''; return; }

    var low=snap.quick>0?snap.quick:Math.round(snap.main*.94);
    var high=snap.listing>0?snap.listing:Math.round(snap.main*1.075);
    document.getElementById('kgResultRange').textContent=formatTL(low)+' – '+formatTL(high);
    document.getElementById('kgResultDataCount').textContent=observationText();
    document.getElementById('kgResultConfidence').innerHTML=confidenceExplanation(snap.score);

    var priceKey=String(snap.main)+'|'+String(snap.quick)+'|'+String(snap.listing)+'|'+String(snap.score);
    if(priceKey!==lastRenderedPrice){
      lastRenderedPrice=priceKey;
      var now=new Date();
      document.getElementById('kgResultUpdated').textContent=now.toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric'})+' '+now.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
      scheduleAutoCloudSave();
    }
  }

  function savedResults(){
    try{
      var value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
      return Array.isArray(value)?value:[];
    }catch(_e){return [];}
  }

  function saveResult(){
    var snap=currentSnapshot();
    if(!snap.main){setStatus('Önce cihaz değerini hesapla.');return;}
    var results=savedResults();
    results.unshift({value:snap.main,quick:snap.quick,listing:snap.listing,confidence:snap.score,saved_at:new Date().toISOString(),path:location.pathname});
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify(results.slice(0,20)));
      setStatus('Sonuç kaydedildi.');
      var btn=document.getElementById('kgResultSave');
      if(btn){btn.textContent='✓ Kaydedildi';setTimeout(function(){btn.textContent='♡ Sonucu Kaydet';},2200);}
      saveCloudValuation(false);
      if(typeof window.gtag==='function') window.gtag('event','valuation_result_saved',{value:Math.round(snap.main),confidence:Math.round(snap.score)});
    }catch(_e){setStatus('Sonuç kaydedilemedi.');}
  }

  async function shareResult(){
    var snap=currentSnapshot();
    if(!snap.main){setStatus('Önce cihaz değerini hesapla.');return;}
    var low=snap.quick||Math.round(snap.main*.94);
    var high=snap.listing||Math.round(snap.main*1.075);
    var text='KaçaGider tahmini piyasa değeri: '+formatTL(snap.main)+'. Tahmini satış aralığı: '+formatTL(low)+' – '+formatTL(high)+'.';
    var payload={title:'KaçaGider Sonucum',text:text,url:'https://kacagider.com.tr/'};
    try{
      if(navigator.share){await navigator.share(payload);setStatus('Paylaşım ekranı açıldı.');}
      else if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(text+' https://kacagider.com.tr/');setStatus('Sonuç panoya kopyalandı.');}
      else{setStatus('Paylaşım bu tarayıcıda desteklenmiyor.');}
      if(typeof window.gtag==='function') window.gtag('event','valuation_result_shared',{value:Math.round(snap.main)});
    }catch(_e){setStatus('Paylaşım iptal edildi.');}
  }

  function bindActions(panel){
    var share=panel.querySelector('#kgResultShare');
    var save=panel.querySelector('#kgResultSave');
    var alert=panel.querySelector('#kgResultAlert');
    if(share) share.addEventListener('click',shareResult);
    if(save) save.addEventListener('click',saveResult);
    if(alert) alert.addEventListener('click',savePriceAlert);
  }

  function boot(){
    addStyles();
    ensurePanel();
    render();
    membershipApi().then(function(){ensureAccountNav();setTimeout(enhanceAccountButton,900);}).catch(function(){});
    var ids=['mainPrice','quickPrice','listingPrice','trustScore'];
    ids.forEach(function(id){var el=document.getElementById(id);if(el){new MutationObserver(render).observe(el,{childList:true,characterData:true,subtree:true});}});
    var trust=document.querySelector('#viewHome .trust p');
    if(trust){new MutationObserver(render).observe(trust,{childList:true,characterData:true,subtree:true});}
    setTimeout(render,300);setTimeout(render,900);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();