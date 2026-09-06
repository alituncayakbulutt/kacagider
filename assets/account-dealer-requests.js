(function(){
'use strict';
if(window.__KG_ACCOUNT_DEALER_REQUESTS__)return;
window.__KG_ACCOUNT_DEALER_REQUESTS__=true;

var BUCKET='dealer-sell-images';
var TABLE='dealer_sell_requests';
var PHOTO_TABLE='dealer_sell_request_photos';
var api=null,client=null,user=null,rows=[];

function q(s,r){return (r||document).querySelector(s);}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function money(v){var n=Number(v||0);return n?n.toLocaleString('tr-TR')+' TL':'—';}
function date(v){try{return new Date(v).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});}catch(e){return '—';}}
function statusLabel(v){return {draft:'Taslak',open:'Teklif bekliyor',offer_received:'Teklif geldi',accepted:'Teklif kabul edildi',completed:'Satış tamamlandı',cancelled:'İptal edildi'}[v]||v||'—';}
function statusClass(v){return (v==='open'||v==='offer_received'||v==='accepted'||v==='completed')?'':' off';}
function damageLabel(v){return v?'Hasar beyan edildi':'Görünür hasar yok';}
function warrantyLabel(v){return {var:'Garanti devam ediyor',yok:'Garanti yok',bilmiyorum:'Garanti bilinmiyor'}[v]||'—';}
function boxLabel(v){return {ikisi:'Kutu ve fatura var',kutu:'Sadece kutu var',fatura:'Sadece fatura var',yok:'Kutu / fatura yok'}[v]||'—';}
function photoTypeLabel(v){return {front:'Ön yüz',back:'Arka yüz',side:'Yan / kasa',corners:'Köşeler / yakın çekim',damage:'Hasar detayı'}[v]||v;}

function ensureStyle(){
 if(q('#kgDealerAccountStyle'))return;
 var s=document.createElement('style');s.id='kgDealerAccountStyle';s.textContent=''
 +'.kg-dealer-account-intro{padding:12px 18px;background:#f0fff6;border-bottom:1px solid #d9f2e3;color:#176b3a;font-size:11px;line-height:1.5}'
 +'.kg-dealer-modal{position:fixed;inset:0;z-index:1000020;background:rgba(7,20,38,.72);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box}'
 +'.kg-dealer-modal-card{width:min(820px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:18px;box-shadow:0 28px 80px rgba(2,6,23,.35);padding:22px;box-sizing:border-box;color:#172033;position:relative}'
 +'.kg-dealer-modal-close{position:absolute;right:14px;top:14px;width:36px;height:36px;border:0;border-radius:10px;background:#f2f4f7;font-size:20px;cursor:pointer}'
 +'.kg-dealer-modal-card h2{margin:0 44px 5px 0;font-size:22px}.kg-dealer-modal-sub{color:#667085;font-size:12px;margin-bottom:15px}'
 +'.kg-dealer-detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0}.kg-dealer-detail-item{padding:11px;border:1px solid #e1e7ef;border-radius:11px;background:#f8fafc}.kg-dealer-detail-item span{display:block;color:#7b8798;font-size:10px}.kg-dealer-detail-item strong{display:block;margin-top:4px;font-size:12px}'
 +'.kg-dealer-photos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}.kg-dealer-photo{overflow:hidden;border:1px solid #e1e7ef;border-radius:12px;background:#f8fafc}.kg-dealer-photo img{display:block;width:100%;aspect-ratio:1.15;object-fit:cover;background:#eef2f6}.kg-dealer-photo span{display:block;padding:8px 10px;font-size:10px;font-weight:850;color:#475467}'
 +'.kg-dealer-modal-note{margin-top:14px;padding:11px 12px;border-radius:10px;background:#f0fff6;color:#176b3a;font-size:11px;line-height:1.5}.kg-dealer-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.kg-dealer-modal-actions button{min-height:39px;border:1px solid #dfe5ee;border-radius:10px;background:#fff;padding:0 13px;font-weight:850;cursor:pointer}.kg-dealer-modal-actions .danger{color:#b42318}.kg-dealer-request-code{font-size:10px;color:#667085;margin-top:4px}'
 +'@media(max-width:720px){.kg-dealer-detail-grid{grid-template-columns:1fr 1fr}.kg-dealer-photos{grid-template-columns:1fr 1fr}.kg-dealer-modal-card{padding:18px}}@media(max-width:480px){.kg-dealer-detail-grid,.kg-dealer-photos{grid-template-columns:1fr}.kg-dealer-modal{padding:10px}.kg-dealer-modal-card{max-height:calc(100dvh - 20px)}}';
 document.head.appendChild(s);
}

function ensureUI(){
 ensureStyle();
 var stats=q('.kg-account-stats');
 if(stats&&!q('#kgCountDealerRequests')){var stat=document.createElement('div');stat.className='kg-account-stat';stat.innerHTML='<span>Telefoncuya Sat</span><strong id="kgCountDealerRequests">0</strong><small>Teklif taleplerin</small>';stats.appendChild(stat);}
 var tabs=q('.kg-account-tabs');
 if(tabs&&!q('[data-tab="dealer-requests"]',tabs)){var btn=document.createElement('button');btn.type='button';btn.className='kg-account-tabbtn';btn.dataset.tab='dealer-requests';btn.textContent='Telefoncuya Sat';tabs.appendChild(btn);btn.addEventListener('click',function(){qa('.kg-account-tabbtn').forEach(function(x){x.classList.toggle('active',x===btn);});qa('.kg-account-panel').forEach(function(p){p.classList.toggle('active',p.dataset.panel==='dealer-requests');});load();});}
 var content=q('#kgAccountContent');
 if(content&&!q('[data-panel="dealer-requests"]',content)){var sec=document.createElement('section');sec.className='kg-account-panel';sec.dataset.panel='dealer-requests';sec.innerHTML='<div class="kg-account-card"><div class="kg-account-cardhead"><h2>Telefoncuya Sat Taleplerim</h2><span>Cihazın için açtığın alış teklif talepleri</span></div><div class="kg-dealer-account-intro">Fotoğrafların herkese açık değildir. Şu anda yalnızca sen ve KaçaGider yöneticileri erişebilir. Telefoncu paneli devreye alındığında yalnızca yetkili telefoncular teklif sürecinde görüntüleyebilecek.</div><div id="kgDealerRequestList" class="kg-account-list"><div class="kg-account-loading">Talepler yükleniyor…</div></div></div>';content.appendChild(sec);}
}

async function waitBackend(tries){
 tries=tries||0;
 if(window.KGMarketplaceSupabase)return window.KGMarketplaceSupabase;
 if(tries>120)throw new Error('Üyelik sistemi yüklenemedi.');
 await new Promise(function(r){setTimeout(r,50);});return waitBackend(tries+1);
}

async function load(){
 if(!user||!client)return;
 var box=q('#kgDealerRequestList');if(!box)return;
 box.innerHTML='<div class="kg-account-loading">Talepler yükleniyor…</div>';
 var r=await client.from(TABLE).select('id,request_code,brand,model,storage,market_value,city,district,battery,warranty,box_invoice,notes,has_damage,status,created_at,updated_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);
 if(r.error){box.innerHTML='<div class="kg-account-empty"><strong>Talepler yüklenemedi</strong>Lütfen sayfayı yenileyip tekrar dene.</div>';return;}
 rows=r.data||[];var count=q('#kgCountDealerRequests');if(count)count.textContent=String(rows.length);
 if(!rows.length){box.innerHTML='<div class="kg-account-empty"><strong>Henüz teklif talebin yok</strong>Bir cihazın değerini hesapladıktan sonra “Telefoncuya Sat” ile telefonculardan teklif talebi oluşturabilirsin.</div>';return;}
 box.innerHTML=rows.map(function(x){var canCancel=x.status==='open'||x.status==='offer_received';return '<div class="kg-account-row"><div class="kg-account-row-main"><strong>'+esc(x.brand+' '+x.model)+'</strong><span>'+esc([x.storage,x.city&&x.district?x.city+' / '+x.district:x.city].filter(Boolean).join(' • '))+' • '+esc(date(x.created_at))+'</span><div class="kg-dealer-request-code">Talep No: '+esc(x.request_code)+'</div></div><div class="kg-account-price"><strong>'+esc(money(x.market_value))+'</strong><span>KaçaGider piyasa değeri</span></div><div class="kg-account-meta-wrap"><span class="kg-account-status'+statusClass(x.status)+'">'+esc(statusLabel(x.status))+'</span><span class="kg-account-meta">'+esc(damageLabel(x.has_damage))+'</span></div><div class="kg-account-actions"><button type="button" class="primary" data-dealer-detail="'+esc(x.id)+'">Detayları Gör</button>'+(canCancel?'<button type="button" class="danger" data-dealer-cancel="'+esc(x.id)+'">Talebi İptal Et</button>':'')+'</div></div>';}).join('');
 qa('[data-dealer-detail]',box).forEach(function(b){b.onclick=function(){var x=rows.find(function(r){return r.id===b.dataset.dealerDetail;});if(x)openDetail(x);};});
 qa('[data-dealer-cancel]',box).forEach(function(b){b.onclick=async function(){var x=rows.find(function(r){return r.id===b.dataset.dealerCancel;});if(!x||!confirm('Bu telefoncu teklif talebini iptal etmek istiyor musun?'))return;b.disabled=true;var u=await client.from(TABLE).update({status:'cancelled',updated_at:new Date().toISOString()}).eq('id',x.id).eq('user_id',user.id);if(u.error){alert('Talep iptal edilemedi. Lütfen tekrar dene.');b.disabled=false;return;}await load();};});
}

async function signedPhotos(requestId){
 var r=await client.from(PHOTO_TABLE).select('photo_type,object_path,sort_order').eq('request_id',requestId).eq('user_id',user.id).order('sort_order',{ascending:true});
 if(r.error)throw r.error;
 var list=r.data||[];var out=[];
 for(var i=0;i<list.length;i++){
  var s=await client.storage.from(BUCKET).createSignedUrl(list[i].object_path,900);
  if(!s.error&&s.data&&s.data.signedUrl)out.push({type:list[i].photo_type,url:s.data.signedUrl});
 }
 return out;
}

async function openDetail(x){
 var o=document.createElement('div');o.className='kg-dealer-modal';o.innerHTML='<section class="kg-dealer-modal-card"><button type="button" class="kg-dealer-modal-close" aria-label="Kapat">×</button><h2>'+esc(x.brand+' '+x.model+(x.storage?' '+x.storage:''))+'</h2><div class="kg-dealer-modal-sub">Talep No: '+esc(x.request_code)+' · '+esc(date(x.created_at))+'</div><div class="kg-dealer-detail-grid"><div class="kg-dealer-detail-item"><span>Durum</span><strong>'+esc(statusLabel(x.status))+'</strong></div><div class="kg-dealer-detail-item"><span>KaçaGider piyasa değeri</span><strong>'+esc(money(x.market_value))+'</strong></div><div class="kg-dealer-detail-item"><span>Konum</span><strong>'+esc([x.city,x.district].filter(Boolean).join(' / '))+'</strong></div><div class="kg-dealer-detail-item"><span>Hasar beyanı</span><strong>'+esc(damageLabel(x.has_damage))+'</strong></div><div class="kg-dealer-detail-item"><span>Pil sağlığı</span><strong>'+(x.battery?esc(x.battery+'%'):'—')+'</strong></div><div class="kg-dealer-detail-item"><span>Garanti</span><strong>'+esc(warrantyLabel(x.warranty))+'</strong></div><div class="kg-dealer-detail-item"><span>Kutu / fatura</span><strong>'+esc(boxLabel(x.box_invoice))+'</strong></div><div class="kg-dealer-detail-item"><span>Not</span><strong>'+esc(x.notes||'—')+'</strong></div></div><h3 style="margin:18px 0 8px;font-size:15px">Yüklediğin fotoğraflar</h3><div id="kgDealerPhotoGrid" class="kg-dealer-photos"><div class="kg-account-loading">Fotoğraflar yükleniyor…</div></div><div class="kg-dealer-modal-note">Bu fotoğraflar özel alanda saklanır. Teklifler telefoncu paneli devreye girdiğinde bu talep ekranında ayrı olarak gösterilecek.</div><div class="kg-dealer-modal-actions"><button type="button" data-close-detail>Kapat</button></div></section>';document.body.appendChild(o);
 function close(){o.remove();}
 q('.kg-dealer-modal-close',o).onclick=close;q('[data-close-detail]',o).onclick=close;o.onclick=function(e){if(e.target===o)close();};
 var grid=q('#kgDealerPhotoGrid',o);
 try{var photos=await signedPhotos(x.id);grid.innerHTML=photos.length?photos.map(function(p){return '<div class="kg-dealer-photo"><img src="'+esc(p.url)+'" alt="'+esc(photoTypeLabel(p.type))+'"><span>'+esc(photoTypeLabel(p.type))+'</span></div>';}).join(''):'<div class="kg-account-empty"><strong>Fotoğraf bulunamadı</strong>Bu talep için kayıtlı fotoğraf yok.</div>';}
 catch(e){grid.innerHTML='<div class="kg-account-empty"><strong>Fotoğraflar yüklenemedi</strong>Lütfen tekrar dene.</div>';}
}

async function boot(){
 try{
  ensureUI();api=await waitBackend(0);await api.ready;user=await api.getUser();if(!user)return;client=await api.init();ensureUI();await load();
  if(client&&client.auth&&typeof client.auth.onAuthStateChange==='function')client.auth.onAuthStateChange(function(event,session){if(event==='SIGNED_IN'&&session&&session.user){user=session.user;load();}});
 }catch(e){console.warn('KaçaGider Telefoncuya Sat hesap paneli:',e);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();