(function(){
'use strict';
var api=window.KGMarketplaceSupabase;
function fmtPrice(v){var n=Number(v||0);return n?n.toLocaleString('tr-TR')+' TL':'—';}
function fmtDate(v){try{return new Date(v).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric'});}catch(_e){return '—';}}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function q(id){return document.getElementById(id);}
function setCount(id,n){var el=q(id);if(el)el.textContent=String(n||0);}
function empty(text){return '<div class="kg-account-empty"><strong>Henüz kayıt yok</strong>'+esc(text)+'</div>';}
function note(msg,isError){var el=q('kgAccountDashNote');if(!el)return;el.textContent=msg||'';el.className='kg-account-note'+(isError?' error':'');el.style.display=msg?'block':'none';if(msg)setTimeout(function(){if(el.textContent===msg)el.style.display='none';},3500);}
function setTab(name){document.querySelectorAll('.kg-account-tabbtn').forEach(function(b){b.classList.toggle('active',b.dataset.tab===name);});document.querySelectorAll('.kg-account-panel').forEach(function(p){p.classList.toggle('active',p.dataset.panel===name);});}
function bindTabs(){document.querySelectorAll('.kg-account-tabbtn').forEach(function(b){if(b.dataset.kgBound)return;b.dataset.kgBound='1';b.addEventListener('click',function(){setTab(b.dataset.tab);});});}
async function client(){if(!api)throw new Error('Üyelik sistemi yüklenemedi.');return api.init();}

function ensureSalesUI(){
  var stats=document.querySelector('.kg-account-stats');
  if(stats&&!q('kgCountSales')){var stat=document.createElement('div');stat.className='kg-account-stat';stat.innerHTML='<span>Satışlarım</span><strong id="kgCountSales">0</strong><small>Gerçek satış</small>';stats.appendChild(stat);}
  var tabs=document.querySelector('.kg-account-tabs');
  if(tabs&&!tabs.querySelector('[data-tab="sales"]')){var btn=document.createElement('button');btn.className='kg-account-tabbtn';btn.dataset.tab='sales';btn.type='button';btn.textContent='Satış Geçmişim';tabs.appendChild(btn);}
  var content=q('kgAccountContent');
  if(content&&!content.querySelector('[data-panel="sales"]')){var sec=document.createElement('section');sec.className='kg-account-panel';sec.dataset.panel='sales';sec.innerHTML='<div class="kg-account-card"><div class="kg-account-cardhead"><h2>Satış Geçmişim</h2><span>Gerçekleşen satışların</span></div><div id="kgSaleList" class="kg-account-list"></div></div>';content.appendChild(sec);}
  bindTabs();
}

async function syncLegacyFavorites(c,user){
  var ids=[];try{ids=JSON.parse(localStorage.getItem('kg_marketplace_favorites_v1')||'[]');}catch(_e){}
  if(!Array.isArray(ids)||!ids.length)return;
  var current=await c.from('user_favorites').select('listing_id').eq('user_id',user.id);
  if(current.error)return;
  var have=new Set((current.data||[]).map(function(x){return x.listing_id;}));
  var missing=ids.filter(function(id){return id&&!have.has(id);});
  if(!missing.length)return;
  var rows=missing.map(function(id){return {user_id:user.id,listing_id:id};});
  await c.from('user_favorites').upsert(rows,{onConflict:'user_id,listing_id'});
}

async function createSale(c,user,payload){
  var price=prompt('Gerçek satış fiyatını TL olarak gir:',String(Math.round(Number(payload.estimated_price||0)||0)));
  if(price===null)return false;
  var salePrice=Number(String(price).replace(/[^0-9]/g,''));if(!salePrice){note('Geçerli bir satış fiyatı gir.',true);return false;}
  var soldDate=prompt('Satış tarihi (YYYY-AA-GG):',new Date().toISOString().slice(0,10));if(soldDate===null)return false;
  var d=new Date(soldDate+'T12:00:00+03:00');if(Number.isNaN(d.getTime())){note('Satış tarihi geçerli değil.',true);return false;}
  var row={user_id:user.id,valuation_id:payload.valuation_id||null,listing_id:payload.listing_id||null,category:payload.category,brand:payload.brand,model:payload.model,storage:payload.storage||null,estimated_price:payload.estimated_price||null,sale_price:salePrice,sold_at:d.toISOString()};
  var r=await c.from('user_sales').insert(row);if(r.error){note('Satış kaydedilemedi.',true);return false;}
  note('Satış geçmişine kaydedildi.');return true;
}

function alertModeLabel(x){if(x.notification_mode==='weekly')return 'Haftalık özet';if(x.notification_mode==='target')return 'Hedef fiyat';return 'Belirgin değişim · %'+Number(x.threshold_pct||5);}
function fmtCheck(v){if(!v)return 'Henüz kontrol edilmedi';try{return 'Son kontrol '+new Date(v).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}catch(_e){return 'Henüz kontrol edilmedi';}}
function ensureAlertEditorStyles(){if(q('kgAlertEditorStyle'))return;var st=document.createElement('style');st.id='kgAlertEditorStyle';st.textContent='.kg-alert-editor-overlay{position:fixed;inset:0;z-index:1000010;background:rgba(7,20,38,.72);display:flex;align-items:center;justify-content:center;padding:18px}.kg-alert-editor{width:min(480px,100%);background:#fff;border-radius:18px;padding:22px;box-shadow:0 28px 80px rgba(2,6,23,.32)}.kg-alert-editor h2{margin:0 0 7px}.kg-alert-editor p{color:#667085;font-size:13px;line-height:1.5;margin:0 0 16px}.kg-alert-editor label{display:block;font-size:12px;font-weight:850;margin:12px 0 6px}.kg-alert-editor select,.kg-alert-editor input{width:100%;min-height:44px;border:1px solid #d0d5dd;border-radius:10px;padding:9px 11px;background:#fff}.kg-alert-editor small{display:block;color:#7b8798;margin-top:6px;line-height:1.4}.kg-alert-editor-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:18px}.kg-alert-editor-actions button{border:0;border-radius:10px;padding:11px 15px;font-weight:850;cursor:pointer}.kg-alert-editor-actions .primary{background:#10b956;color:#fff}.kg-alert-live{display:block;color:#087a37;font-size:11px;font-weight:750;margin-top:4px}.kg-alert-sub{display:block;color:#667085;font-size:10.5px;margin-top:3px}';document.head.appendChild(st);}
function openAlertEditor(c,user,x){ensureAlertEditorStyles();var o=document.createElement('div');o.className='kg-alert-editor-overlay';o.innerHTML='<div class="kg-alert-editor"><h2>Fiyat Alarmını Düzenle</h2><p>'+esc(x.brand+' '+x.model+(x.storage?' · '+x.storage:''))+'</p><label>Bildirim türü</label><select id="kgAlertMode"><option value="significant">Belirgin fiyat değişiminde</option><option value="weekly">Haftalık fiyat özeti</option><option value="target">Hedef fiyata ulaştığında</option></select><label>Değişim eşiği (%)</label><input id="kgAlertThreshold" type="number" min="1" max="50" step="1" value="'+esc(x.threshold_pct||5)+'"><small>Belirgin değişim seçeneğinde fiyat bu oran kadar yükselir veya düşerse bildirim hazırlanır.</small><label>Hedef fiyat (TL)</label><input id="kgAlertTarget" type="number" min="1" step="100" value="'+esc(Math.round(Number(x.target_price||x.baseline_price||0)))+'"><small>Hedef fiyat seçeneğinde değer bu tutara veya altına indiğinde alarm tetiklenir.</small><div class="kg-alert-editor-actions"><button type="button" data-alert-cancel>Vazgeç</button><button type="button" class="primary" data-alert-save>Kaydet</button></div></div>';document.body.appendChild(o);var mode=q('kgAlertMode'),thr=q('kgAlertThreshold'),target=q('kgAlertTarget');mode.value=x.notification_mode||'significant';function sync(){thr.disabled=mode.value!=='significant';target.disabled=mode.value!=='target';}mode.addEventListener('change',sync);sync();o.addEventListener('click',function(e){if(e.target===o||e.target.closest('[data-alert-cancel]'))o.remove();});o.querySelector('[data-alert-save]').addEventListener('click',async function(){var m=mode.value,t=Math.max(1,Math.min(50,Number(thr.value||5))),tp=Number(target.value||0);if(m==='target'&&!tp){note('Hedef fiyat için geçerli bir tutar gir.',true);return;}var d=await c.from('price_alerts').update({notification_mode:m,threshold_pct:t,target_price:tp||x.target_price||x.baseline_price,is_active:true,last_checked_at:null,last_status:'waiting',last_error:null,updated_at:new Date().toISOString()}).eq('id',x.id).eq('user_id',user.id);if(d.error){note('Alarm ayarları kaydedilemedi.',true);return;}o.remove();note('Fiyat alarmı güncellendi.');if(typeof window.gtag==='function')window.gtag('event','price_alert_updated',{notification_mode:m,threshold_pct:t});await loadAlerts(c,user);});}

async function loadValuations(c,user){
  var r=await c.from('user_valuations').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);if(r.error)throw r.error;
  var rows=r.data||[];setCount('kgCountValuations',rows.length);var box=q('kgValuationList');if(!box)return;
  box.innerHTML=rows.length?rows.map(function(x){return '<div class="kg-account-row"><div class="kg-account-row-main"><strong>'+esc(x.brand+' '+x.model)+'</strong><span>'+esc([x.category,x.storage].filter(Boolean).join(' • '))+' • '+fmtDate(x.created_at)+'</span></div><div class="kg-account-price"><strong>'+fmtPrice(x.estimated_price)+'</strong><span>Tahmini değer</span></div><div class="kg-account-meta-wrap"><span class="kg-account-status">Güven '+esc(x.confidence_score==null?'—':x.confidence_score+'/100')+'</span></div><div class="kg-account-actions"><button type="button" class="primary" data-alert-from="'+esc(x.id)+'">Fiyat alarmı</button><button type="button" data-sale-valuation="'+esc(x.id)+'">Sattım</button><button type="button" class="danger" data-delete-valuation="'+esc(x.id)+'">Sil</button></div></div>';}).join(''):empty('Hesabına kaydettiğin fiyat sonuçları burada görünecek.');
  box.querySelectorAll('[data-delete-valuation]').forEach(function(b){b.addEventListener('click',async function(){if(!confirm('Bu değerleme kaydını silmek istiyor musun?'))return;var d=await c.from('user_valuations').delete().eq('id',b.dataset.deleteValuation).eq('user_id',user.id);if(d.error)return note('Kayıt silinemedi.',true);await loadValuations(c,user);});});
  box.querySelectorAll('[data-alert-from]').forEach(function(b){b.addEventListener('click',async function(){var x=rows.find(function(v){return v.id===b.dataset.alertFrom;});if(!x)return;var payload={user_id:user.id,category:x.category,brand:x.brand,model:x.model,storage:x.storage||null,baseline_price:x.estimated_price||null,target_price:x.estimated_price||null,current_price:x.estimated_price||null,notification_mode:'significant',threshold_pct:5,is_active:true,last_checked_at:null,last_status:'waiting',last_error:null,updated_at:new Date().toISOString()};var d=await c.from('price_alerts').upsert(payload,{onConflict:'user_id,category,brand,model,storage'});if(d.error){note('Fiyat alarmı oluşturulamadı.',true);return;}note('Fiyat alarmı açıldı.');await loadAlerts(c,user);setTab('alerts');});});
  box.querySelectorAll('[data-sale-valuation]').forEach(function(b){b.addEventListener('click',async function(){var x=rows.find(function(v){return v.id===b.dataset.saleValuation;});if(!x)return;var ok=await createSale(c,user,{valuation_id:x.id,category:x.category,brand:x.brand,model:x.model,storage:x.storage,estimated_price:x.estimated_price});if(ok){await loadSales(c,user);setTab('sales');}});});
}

async function loadListings(c,user){
  var r=await c.from('listings').select('id,category,brand,model,storage,seller_price,market_value,status,created_at,sold_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);if(r.error)throw r.error;
  var rows=r.data||[];setCount('kgCountListings',rows.length);var box=q('kgListingList');if(!box)return;
  box.innerHTML=rows.length?rows.map(function(x){var actions='<a href="/ilan/?id='+encodeURIComponent(x.id)+'">İlanı aç</a>';if(x.status!=='sold')actions+='<button type="button" class="primary" data-sold-listing="'+esc(x.id)+'">Satıldı</button>';if(x.status!=='archived'&&x.status!=='sold')actions+='<button type="button" data-archive-listing="'+esc(x.id)+'">Kaldır</button>';return '<div class="kg-account-row"><div class="kg-account-row-main"><strong>'+esc(x.brand+' '+x.model)+'</strong><span>'+esc([x.category,x.storage].filter(Boolean).join(' • '))+' • '+fmtDate(x.created_at)+'</span></div><div class="kg-account-price"><strong>'+fmtPrice(x.seller_price)+'</strong><span>İlan fiyatı</span></div><div class="kg-account-meta-wrap"><span class="kg-account-status '+(x.status==='published'?'':'off')+'">'+esc(x.status||'—')+'</span></div><div class="kg-account-actions">'+actions+'</div></div>';}).join(''):empty('Yayınladığın ilanlar burada görünecek.');
  box.querySelectorAll('[data-archive-listing]').forEach(function(b){b.addEventListener('click',async function(){if(!confirm('Bu ilanı yayından kaldırmak istiyor musun?'))return;var d=await c.from('listings').update({status:'archived',updated_at:new Date().toISOString()}).eq('id',b.dataset.archiveListing).eq('user_id',user.id);if(d.error)return note('İlan kaldırılamadı.',true);note('İlan yayından kaldırıldı.');await loadListings(c,user);});});
  box.querySelectorAll('[data-sold-listing]').forEach(function(b){b.addEventListener('click',async function(){var x=rows.find(function(v){return v.id===b.dataset.soldListing;});if(!x)return;var ok=await createSale(c,user,{listing_id:x.id,category:x.category,brand:x.brand,model:x.model,storage:x.storage,estimated_price:x.market_value});if(!ok)return;var soldAt=new Date().toISOString();var d=await c.from('listings').update({status:'sold',sold_at:soldAt,updated_at:soldAt}).eq('id',x.id).eq('user_id',user.id);if(d.error)note('Satış kaydedildi ancak ilan durumu güncellenemedi.',true);await Promise.all([loadListings(c,user),loadSales(c,user)]);setTab('sales');});});
}

async function loadFavorites(c,user){
  var r=await c.from('user_favorites').select('id,listing_id,created_at,listings(id,brand,model,storage,seller_price,market_value,status)').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);if(r.error)throw r.error;
  var rows=r.data||[];setCount('kgCountFavorites',rows.length);var box=q('kgFavoriteList');if(!box)return;
  box.innerHTML=rows.length?rows.map(function(x){var l=x.listings||{};return '<div class="kg-account-row"><div class="kg-account-row-main"><strong>'+esc((l.brand||'')+' '+(l.model||''))+'</strong><span>'+esc(l.storage||'')+' • '+fmtDate(x.created_at)+'</span></div><div class="kg-account-price"><strong>'+fmtPrice(l.seller_price)+'</strong><span>İlan fiyatı</span></div><div class="kg-account-meta-wrap"><span class="kg-account-status '+(l.status==='published'?'':'off')+'">'+esc(l.status||'—')+'</span></div><div class="kg-account-actions"><a href="/ilan/?id='+encodeURIComponent(l.id||x.listing_id)+'">Aç</a><button type="button" class="danger" data-del-fav="'+esc(x.id)+'">Kaldır</button></div></div>';}).join(''):empty('Favoriye eklediğin ilanlar burada görünecek.');
  box.querySelectorAll('[data-del-fav]').forEach(function(b){b.addEventListener('click',async function(){var d=await c.from('user_favorites').delete().eq('id',b.dataset.delFav).eq('user_id',user.id);if(d.error)return note('Favori kaldırılamadı.',true);await loadFavorites(c,user);});});
}

async function loadAlerts(c,user){
  var r=await c.from('price_alerts').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);if(r.error)throw r.error;
  var rows=r.data||[];setCount('kgCountAlerts',rows.filter(function(x){return x.is_active;}).length);var box=q('kgAlertList');if(!box)return;
  box.innerHTML=rows.length?rows.map(function(x){var current=Number(x.current_price||0),change=Number(x.last_change_pct||0),changeText=Number.isFinite(change)&&x.last_checked_at?((change>0?'+':'')+change.toFixed(1)+'%'):'';return '<div class="kg-account-row"><div class="kg-account-row-main"><strong>'+esc(x.brand+' '+x.model)+'</strong><span>'+esc([x.category,x.storage].filter(Boolean).join(' • '))+' • '+fmtDate(x.created_at)+'</span><span class="kg-alert-sub">'+esc(alertModeLabel(x))+' · '+esc(fmtCheck(x.last_checked_at))+'</span></div><div class="kg-account-price"><strong>'+fmtPrice(current||x.baseline_price)+'</strong><span>'+(current?'Güncel takip değeri':'Başlangıç değeri')+'</span>'+(changeText?'<small class="kg-alert-live">'+esc(changeText)+'</small>':'')+'</div><div class="kg-account-meta-wrap"><span class="kg-account-status '+(x.is_active?'':'off')+'">'+(x.is_active?'Aktif':'Kapalı')+'</span></div><div class="kg-account-actions"><button type="button" class="primary" data-edit-alert="'+esc(x.id)+'">Ayarla</button><button type="button" data-toggle-alert="'+esc(x.id)+'" data-active="'+(x.is_active?'1':'0')+'">'+(x.is_active?'Kapat':'Aç')+'</button><button type="button" class="danger" data-del-alert="'+esc(x.id)+'">Sil</button></div></div>';}).join(''):empty('Kaydettiğin bir değerlemeden fiyat alarmı oluşturabilirsin.');
  box.querySelectorAll('[data-edit-alert]').forEach(function(b){b.addEventListener('click',function(){var x=rows.find(function(v){return v.id===b.dataset.editAlert;});if(x)openAlertEditor(c,user,x);});});
  box.querySelectorAll('[data-toggle-alert]').forEach(function(b){b.addEventListener('click',async function(){var active=b.dataset.active==='1';var d=await c.from('price_alerts').update({is_active:!active,last_checked_at:null,updated_at:new Date().toISOString()}).eq('id',b.dataset.toggleAlert).eq('user_id',user.id);if(d.error)return note('Alarm güncellenemedi.',true);await loadAlerts(c,user);});});
  box.querySelectorAll('[data-del-alert]').forEach(function(b){b.addEventListener('click',async function(){if(!confirm('Bu fiyat alarmını silmek istiyor musun?'))return;var d=await c.from('price_alerts').delete().eq('id',b.dataset.delAlert).eq('user_id',user.id);if(d.error)return note('Alarm silinemedi.',true);await loadAlerts(c,user);});});
}

async function loadSales(c,user){
  var r=await c.from('user_sales').select('*').eq('user_id',user.id).order('sold_at',{ascending:false}).limit(50);if(r.error)throw r.error;
  var rows=r.data||[];setCount('kgCountSales',rows.length);var box=q('kgSaleList');if(!box)return;
  box.innerHTML=rows.length?rows.map(function(x){var diff=Number(x.estimated_price||0)&&Number(x.sale_price||0)?Math.round(((Number(x.sale_price)-Number(x.estimated_price))/Number(x.estimated_price))*100):null;var badge=diff==null?'Satıldı':(diff===0?'Tahmine eşit':(diff>0?'Tahminin %'+diff+' üstü':'Tahminin %'+Math.abs(diff)+' altı'));return '<div class="kg-account-row"><div class="kg-account-row-main"><strong>'+esc(x.brand+' '+x.model)+'</strong><span>'+esc([x.category,x.storage].filter(Boolean).join(' • '))+' • '+fmtDate(x.sold_at)+'</span></div><div class="kg-account-price"><strong>'+fmtPrice(x.sale_price)+'</strong><span>Gerçek satış fiyatı</span></div><div class="kg-account-meta-wrap"><span class="kg-account-status">'+esc(badge)+'</span></div><div class="kg-account-actions"><button type="button" class="danger" data-delete-sale="'+esc(x.id)+'">Sil</button></div></div>';}).join(''):empty('Cihazını sattığında gerçek satış fiyatını burada saklayabilirsin.');
  box.querySelectorAll('[data-delete-sale]').forEach(function(b){b.addEventListener('click',async function(){if(!confirm('Bu satış kaydını silmek istiyor musun?'))return;var d=await c.from('user_sales').delete().eq('id',b.dataset.deleteSale).eq('user_id',user.id);if(d.error)return note('Satış kaydı silinemedi.',true);await loadSales(c,user);});});
}

async function start(){
  ensureSalesUI();
  try{
    if(!api)throw new Error('Oturum sistemi yüklenemedi.');var user=await api.getUser();if(!user){q('kgAccountLoginNeeded').classList.add('show');return;}
    q('kgAccountBody').classList.add('show');q('kgAccountUserName').textContent=(user.user_metadata&&user.user_metadata.full_name)||'KaçaGider Üyesi';q('kgAccountUserEmail').textContent=user.email||'';
    var c=await client();await syncLegacyFavorites(c,user);await Promise.all([loadValuations(c,user),loadListings(c,user),loadFavorites(c,user),loadAlerts(c,user),loadSales(c,user)]);
    q('kgAccountLoading').style.display='none';q('kgAccountContent').style.display='block';
    var logout=q('kgAccountLogout');if(logout)logout.addEventListener('click',async function(){await api.signOut();location.href='/';});
  }catch(e){note(e&&e.message?e.message:'Hesap bilgileri yüklenemedi.',true);var loading=q('kgAccountLoading');if(loading)loading.style.display='none';}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();