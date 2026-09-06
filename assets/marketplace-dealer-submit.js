(function(){
'use strict';
if(window.__KG_DEALER_SUBMIT__)return;
window.__KG_DEALER_SUBMIT__=true;

var submitting=false;
var RESUME_KEY='kgDealerResumeAfterLogin';

function q(s,r){return (r||document).querySelector(s);}
function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

function getDraft(){
  try{return JSON.parse(sessionStorage.getItem('kgDealerRequestDraft')||'{}')||{};}catch(e){return{};}
}
function selectedDamage(){var r=q('input[name="kgDgHasDamage"]:checked');return r?r.value:'';}
function attested(){var c=q('#kgDgAttest input[type="checkbox"]');return !!(c&&c.checked);}
function previewSrc(selector){var img=q(selector);return img&&img.src?img.src:'';}
function photoSrc(slot){return previewSrc('.kg-photo-card[data-slot="'+slot+'"].has-photo img');}

function extensionFor(type){
  type=String(type||'').toLowerCase();
  if(type==='image/png')return'png';
  if(type==='image/webp')return'webp';
  if(type==='image/heic')return'heic';
  if(type==='image/heif')return'heif';
  return'jpg';
}

async function fileFromPreview(src,name){
  if(!src)throw new Error('Zorunlu fotoğraflardan biri okunamadı.');
  var response=await fetch(src);
  if(!response.ok)throw new Error('Fotoğraf okunamadı. Lütfen yeniden seç.');
  var blob=await response.blob();
  var type=blob.type||'image/jpeg';
  return new File([blob],name+'.'+extensionFor(type),{type:type});
}

async function collectPhotos(hasDamage){
  var sources={
    front:photoSrc('front'),
    back:photoSrc('back'),
    side:photoSrc('side'),
    corners:previewSrc('#kgDgCornersWrap img'),
    damage:hasDamage?photoSrc('damage'):''
  };
  var required=hasDamage?['front','back','side','corners','damage']:['front','back','side','corners'];
  for(var i=0;i<required.length;i++)if(!sources[required[i]])throw new Error('Tüm zorunlu fotoğrafları eklemelisin.');
  var out={};
  for(var j=0;j<required.length;j++){
    var key=required[j];
    out[key]=await fileFromPreview(sources[key],key);
  }
  return out;
}

function showError(message){
  var body=q('#kgDealerP1Body');
  if(!body){alert(message);return;}
  var err=q('#kgPhotoError',body);
  if(!err){err=document.createElement('div');err.id='kgPhotoError';err.className='kg-dealer-error';var actions=q('.kg-dealer-actions',body);if(actions)actions.parentNode.insertBefore(err,actions);else body.appendChild(err);}
  err.textContent=message;
  err.classList.add('show');
  try{err.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(e){}
}

function triggerLogin(){
  try{sessionStorage.setItem(RESUME_KEY,'1');}catch(e){}
  if(window.KGDealerSellPhase1&&typeof window.KGDealerSellPhase1.close==='function')window.KGDealerSellPhase1.close();
  setTimeout(function(){
    var b=q('#kgAccountSessionAction');
    if(!b){
      b=all('button,a').find(function(el){return /giriş yap/i.test(String(el.textContent||''))&&!el.closest('#kgDealerP1');});
    }
    if(b&&typeof b.click==='function')b.click();
    else alert('Telefonculardan teklif almak için önce KaçaGider hesabına giriş yapmalısın.');
  },120);
}

function renderSuccess(result){
  var body=q('#kgDealerP1Body');
  if(!body)return;
  var request=result&&result.request||{};
  var count=Number(result&&result.photoCount||0);
  body.innerHTML=''
    +'<div class="kg-dealer-step">Adım 3 / Talep oluşturuldu</div>'
    +'<h2>Teklif talebin kaydedildi ✓</h2>'
    +'<p>Cihaz bilgilerin ve fotoğrafların güvenli şekilde kaydedildi.</p>'
    +'<div class="kg-dealer-device">Talep No: <strong>'+esc(request.request_code||'')+'</strong></div>'
    +'<div class="kg-dealer-info"><strong>'+count+' fotoğraf özel alanda saklanıyor.</strong><br>Fotoğrafların herkese açık değildir. Telefoncu paneli bağlandığında yalnızca yetkili ve doğrulanmış telefoncular teklif sürecinde erişebilecek.</div>'
    +'<div class="kg-photo-status ready">✓ Talep durumu: Teklif almaya hazır.<br>KaçaGider alış fiyatı belirlemez; alış tekliflerini telefoncular verecek.</div>'
    +'<div class="kg-dealer-actions"><button type="button" class="kg-dealer-btn primary" id="kgDealerDone">Tamam</button></div>';
  var done=q('#kgDealerDone',body);if(done)done.onclick=function(){if(window.KGDealerSellPhase1)window.KGDealerSellPhase1.close();};
  try{sessionStorage.removeItem('kgDealerRequestDraft');}catch(e){}
  try{if(typeof window.gtag==='function')window.gtag('event','dealer_sell_request_created',{request_code:request.request_code||'',photo_count:count});}catch(e){}
}

async function submitFromPhotoStep(button){
  if(submitting)return;
  var damageValue=selectedDamage();
  if(!damageValue){showError('Önce cihazda görünür hasar olup olmadığını seçmelisin.');return;}
  if(!attested()){showError('Bilgi ve fotoğraf doğruluğu onayını işaretlemelisin.');return;}
  var backend=window.KGDealerSellBackend;
  if(!backend){showError('Teklif sistemi yüklenemedi. Sayfayı yenileyip tekrar dene.');return;}

  submitting=true;
  var oldText=button.textContent;
  button.disabled=true;
  button.textContent='Talep oluşturuluyor...';
  try{
    var user=await backend.getUser();
    if(!user){submitting=false;button.disabled=false;button.textContent=oldText;triggerLogin();return;}
    var hasDamage=damageValue==='yes';
    var photos=await collectPhotos(hasDamage);
    var details=[];
    try{if(typeof window.KGMarketplaceCollectDetails==='function'){var d=window.KGMarketplaceCollectDetails();if(Array.isArray(d))details=d;}}catch(e){}
    var result=await backend.submitRequest({draft:getDraft(),hasDamage:hasDamage,attested:true,photos:photos,details:details});
    renderSuccess(result);
  }catch(error){
    var msg=error&&error.message?error.message:'Talep oluşturulamadı. Lütfen tekrar dene.';
    if(error&&error.code==='AUTH_REQUIRED'){triggerLogin();}
    else showError(msg);
    button.disabled=false;
    button.textContent=oldText;
  }finally{submitting=false;}
}

function onClick(e){
  var button=e.target&&e.target.closest?e.target.closest('#kgPhotoContinue'):null;
  if(!button||button.disabled)return;
  var step=q('.kg-dealer-step',q('#kgDealerP1Body'));
  if(!step||String(step.textContent||'').indexOf('Adım 2 / Fotoğraflar')<0)return;
  e.preventDefault();
  e.stopPropagation();
  if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
  submitFromPhotoStep(button);
}

document.addEventListener('click',onClick,true);

async function installResume(){
  try{
    var backend=window.KGDealerSellBackend;if(!backend)return;
    var c=await backend.client();
    if(!c||!c.auth||typeof c.auth.onAuthStateChange!=='function')return;
    c.auth.onAuthStateChange(function(event,session){
      if(event!=='SIGNED_IN'||!session||!session.user)return;
      var resume='';try{resume=sessionStorage.getItem(RESUME_KEY)||'';}catch(e){}
      if(!resume)return;
      try{sessionStorage.removeItem(RESUME_KEY);}catch(e){}
      setTimeout(function(){if(window.KGDealerSellPhase1&&typeof window.KGDealerSellPhase1.open==='function')window.KGDealerSellPhase1.open();},450);
    });
  }catch(e){console.warn('KaçaGider teklif talebi oturum takibi:',e);}
}
setTimeout(installResume,400);
})();
