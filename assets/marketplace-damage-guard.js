(function(){
'use strict';
if(window.__KG_DEALER_DAMAGE_GUARD__)return;
window.__KG_DEALER_DAMAGE_GUARD__=true;

var state={deviceKey:'',hasDamage:'',cornersFile:null,cornersUrl:'',attested:false};
function q(s,r){return (r||document).querySelector(s);}
function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function revoke(){if(state.cornersUrl){try{URL.revokeObjectURL(state.cornersUrl);}catch(e){}state.cornersUrl='';}}
function resetForDevice(key){if(state.deviceKey===key)return;revoke();state={deviceKey:key,hasDamage:'',cornersFile:null,cornersUrl:'',attested:false};}
function validImage(file){return /^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type||'')||/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name||'');}
function fmt(bytes){if(!bytes)return'';return bytes<1048576?Math.max(1,Math.round(bytes/1024))+' KB':(bytes/1048576).toFixed(1)+' MB';}

function ensureStyle(){if(q('#kgDamageGuardStyle'))return;var s=document.createElement('style');s.id='kgDamageGuardStyle';s.textContent=''
+'.kg-dg-question{margin:14px 0;padding:14px;border:1px solid #dce4eb;border-radius:12px;background:#fbfcfd}.kg-dg-question strong{display:block;margin-bottom:5px;font-size:13px}.kg-dg-question p{margin:0 0 10px;color:#667085;font-size:11px;line-height:1.45}.kg-dg-options{display:grid;grid-template-columns:1fr 1fr;gap:8px}.kg-dg-option{display:flex;gap:8px;align-items:flex-start;padding:10px;border:1px solid #d0d5dd;border-radius:10px;background:#fff;font-size:12px;font-weight:800;cursor:pointer}.kg-dg-option input{margin-top:2px}.kg-dg-attest{display:flex;gap:9px;align-items:flex-start;margin-top:12px;padding:12px;border:1px solid #d0d5dd;border-radius:10px;background:#fff;color:#344054;font-size:11px;line-height:1.5}.kg-dg-attest input{margin-top:2px}.kg-dg-card{position:relative;min-height:185px;border:1.5px dashed #cbd5df;border-radius:14px;background:#f9fbfc;overflow:hidden}.kg-dg-card.has-photo{border-style:solid;border-color:#a7dcbc;background:#fff}.kg-dg-empty{min-height:185px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:18px;box-sizing:border-box}.kg-dg-title{font-size:13px;font-weight:900}.kg-dg-title em{font-style:normal;color:#d92d20}.kg-dg-hint{margin:5px 0 12px;color:#667085;font-size:11px}.kg-dg-pick{display:inline-flex;border:0;padding:9px 12px;border-radius:9px;background:#e9f8ef;color:#087a3c;font-size:11px;font-weight:900;cursor:pointer}.kg-dg-input{position:absolute;width:1px;height:1px;opacity:0;left:-9999px}.kg-dg-preview{position:relative;height:185px}.kg-dg-preview img{width:100%;height:100%;object-fit:cover}.kg-dg-overlay{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:center;padding:9px;background:linear-gradient(transparent,rgba(5,13,25,.82));color:#fff}.kg-dg-remove{border:0;border-radius:8px;padding:7px 9px;background:#fff;color:#172033;font-size:10px;font-weight:900;cursor:pointer}@media(max-width:640px){.kg-dg-options{grid-template-columns:1fr}.kg-dg-card,.kg-dg-empty,.kg-dg-preview{min-height:210px}.kg-dg-preview{height:210px}}';document.head.appendChild(s);}

function cornersMarkup(){
 if(state.cornersFile&&state.cornersUrl)return '<div class="kg-dg-card has-photo"><div class="kg-dg-preview"><img src="'+esc(state.cornersUrl)+'" alt="Köşeler ve kasa"><div class="kg-dg-overlay"><span><strong>Köşeler / yakın çekim</strong><br>'+esc(fmt(state.cornersFile.size))+'</span><button type="button" class="kg-dg-remove" id="kgDgCornersRemove">Sil</button></div></div></div>';
 return '<div class="kg-dg-card"><div class="kg-dg-empty"><div style="font-size:30px">📷</div><div class="kg-dg-title">Köşeler / yakın çekim <em>*</em></div><div class="kg-dg-hint">Dört köşe ve kasa kenarları net görünsün</div><button type="button" class="kg-dg-pick" id="kgDgCornersPick">Fotoğraf seç</button><input class="kg-dg-input" id="kgDgCorners" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"></div></div>';
}

function renderCorners(body){
 var wrap=q('#kgDgCornersWrap',body);if(!wrap)return;
 wrap.innerHTML=cornersMarkup();
 var pick=q('#kgDgCornersPick',wrap),inp=q('#kgDgCorners',wrap),rem=q('#kgDgCornersRemove',wrap);
 if(pick&&inp)pick.onclick=function(e){e.preventDefault();e.stopPropagation();inp.click();};
 if(inp)inp.onchange=function(){
   var file=inp.files&&inp.files[0];if(!file)return;
   if(!validImage(file)){alert('Yalnızca JPG, PNG, WEBP veya HEIC fotoğraf yükleyebilirsin.');inp.value='';return;}
   if(file.size>10*1024*1024){alert('Her fotoğraf en fazla 10 MB olabilir.');inp.value='';return;}
   revoke();state.cornersFile=file;state.cornersUrl=URL.createObjectURL(file);state.attested=false;renderCorners(body);sync(body);
 };
 if(rem)rem.onclick=function(e){e.preventDefault();e.stopPropagation();revoke();state.cornersFile=null;state.attested=false;renderCorners(body);sync(body);};
}

function countOriginal(slot){var card=q('.kg-photo-card[data-slot="'+slot+'"]');return !!(card&&card.classList.contains('has-photo'));}
function sync(body){
 var btn=q('#kgPhotoContinue',body),counter=q('.kg-photo-count',body),status=q('.kg-photo-status',body),damageCard=q('.kg-photo-card[data-slot="damage"]',body);
 if(!btn)return;
 var base=countOriginal('front')+countOriginal('back')+countOriginal('side');
 var damagePhoto=damageCard&&damageCard.classList.contains('has-photo');
 var total=state.hasDamage==='yes'?5:4;
 var done=base+(state.cornersFile?1:0)+(state.hasDamage==='yes'&&damagePhoto?1:0);
 var valid=!!state.hasDamage&&done===total&&state.attested;
 btn.disabled=!valid;
 var counterText=done+' / '+total+' zorunlu';if(counter&&counter.textContent!==counterText)counter.textContent=counterText;
 if(status){
   status.classList.toggle('ready',done===total&&!!state.hasDamage);
   var msg=!state.hasDamage?'Önce hasar durumunu seçmelisin.<br>JPG, PNG, WEBP, HEIC · fotoğraf başına en fazla 10 MB.':done===total?'✓ Gerekli fotoğraflar tamamlandı. Devam etmek için doğruluk onayını işaretle.<br>Teklif fiziksel kontrolden sonra kesinleşir.':'Tüm zorunlu fotoğrafları eklemelisin.<br>JPG, PNG, WEBP, HEIC · fotoğraf başına en fazla 10 MB.';
   if(status.innerHTML!==msg)status.innerHTML=msg;
 }
 if(damageCard){
   damageCard.style.display=state.hasDamage==='yes'?'':'none';
   var title=q('.kg-photo-title',damageCard);if(title&&state.hasDamage==='yes'&&title.textContent.indexOf('*')<0)title.innerHTML='Hasarlı bölge <em>*</em>';
   var hint=q('.kg-photo-hint',damageCard),hintText='Çizik, çatlak, ezik veya kırığı yakın çekim göster';if(hint&&state.hasDamage==='yes'&&hint.textContent!==hintText)hint.textContent=hintText;
 }
 var attest=q('#kgDgAttest input[type="checkbox"]',body);if(attest&&attest.checked!==state.attested)attest.checked=state.attested;
}

function ensureQuestion(body,grid){
 if(q('#kgDgQuestion',body))return;
 var box=document.createElement('div');box.id='kgDgQuestion';box.className='kg-dg-question';
 box.innerHTML='<strong>Cihazda çizik, çatlak, ezik veya kırık var mı? <span style="color:#d92d20">*</span></strong><p>Hasar varsa ilgili bölgenin yakın fotoğrafı zorunlu olur. “Hasar yok” seçsen de köşe/kasa yakın çekimi zorunludur.</p><div class="kg-dg-options"><label class="kg-dg-option"><input type="radio" name="kgDgHasDamage" value="yes" '+(state.hasDamage==='yes'?'checked':'')+'> Evet, hasar var</label><label class="kg-dg-option"><input type="radio" name="kgDgHasDamage" value="no" '+(state.hasDamage==='no'?'checked':'')+'> Hayır, görünür hasar yok</label></div>';
 grid.parentNode.insertBefore(box,grid);
 all('input[name="kgDgHasDamage"]',box).forEach(function(r){r.onchange=function(){state.hasDamage=r.value;state.attested=false;sync(body);};});
}
function ensureCorners(body,grid){
 if(q('#kgDgCornersWrap',body))return;
 var wrap=document.createElement('div');wrap.id='kgDgCornersWrap';grid.appendChild(wrap);renderCorners(body);
}
function ensureAttest(body){
 if(q('#kgDgAttest',body))return;
 var actions=q('.kg-dealer-actions',body);if(!actions)return;
 var label=document.createElement('label');label.id='kgDgAttest';label.className='kg-dg-attest';label.innerHTML='<input type="checkbox" '+(state.attested?'checked':'')+'><span>Verdiğim bilgilerin ve yüklediğim fotoğrafların güncel ve doğru olduğunu onaylıyorum. Eksik veya yanlış bilgi verilmesi halinde telefoncunun teklifini değiştirebileceğini kabul ediyorum.</span>';
 actions.parentNode.insertBefore(label,actions);
 q('input',label).onchange=function(){state.attested=this.checked;sync(body);};
}

function enhance(body){
 var step=q('.kg-dealer-step',body);if(!step||String(step.textContent||'').indexOf('Adım 2 / Fotoğraflar')<0)return;
 var device=q('.kg-dealer-device',body),key=String(device&&device.textContent||'').trim();resetForDevice(key);ensureStyle();
 var grid=q('.kg-photo-grid',body);if(!grid)return;
 ensureQuestion(body,grid);ensureCorners(body,grid);ensureAttest(body);sync(body);
}

function watch(){var root=q('#kgDealerP1Body');if(!root){setTimeout(watch,300);return;}var timer=null;function run(){clearTimeout(timer);timer=setTimeout(function(){enhance(root);},20);}new MutationObserver(run).observe(root,{childList:true,subtree:true});run();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
})();
