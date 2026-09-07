(function(){
'use strict';
if(window.KGDealerSellPhase1)return;

var photoFiles={front:null,back:null,side:null,damage:null};
var photoUrls={front:'',back:'',side:'',damage:''};
var photoSpecs=[
  {key:'front',title:'Ön yüz',hint:'Ekran tamamen görünsün',required:true},
  {key:'back',title:'Arka yüz',hint:'Kamera ve arka kapak görünsün',required:true},
  {key:'side',title:'Yan / kasa',hint:'Kasa ve kenarlar net görünsün',required:true},
  {key:'damage',title:'Hasar detayı',hint:'Çizik, ezik veya çatlak varsa ekle',required:false}
];

function q(s,r){return (r||document).querySelector(s);}
function val(id){
  var e=q('#'+id);
  if(!e)return'';
  if(e.tagName==='SELECT'){
    var o=e.options[e.selectedIndex];
    return o?String(o.textContent||'').trim():'';
  }
  return String(e.value||e.textContent||'').trim();
}
function price(){
  var e=q('#mainPrice');
  return Number(String(e&&e.textContent||'').replace(/[^0-9]/g,''))||0;
}
function device(){
  return [val('phoneBrand'),val('model'),val('storage')].filter(Boolean).join(' ');
}
function isIphone(){
  return /apple|iphone/i.test([val('phoneBrand'),val('model')].join(' '));
}
function esc(v){
  return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
}
function close(){
  var o=q('#kgDealerP1');
  if(o)o.classList.remove('open');
  document.body.style.overflow='';
}
function getDraft(){
  var saved={};
  try{saved=JSON.parse(sessionStorage.getItem('kgDealerRequestDraft')||'{}')||{};}catch(e){}
  return saved;
}
function saveDraft(draft){
  try{sessionStorage.setItem('kgDealerRequestDraft',JSON.stringify(draft));}catch(e){}
}
function ensureStyle(){
  if(q('#kgDealerP1Style'))return;
  var s=document.createElement('style');
  s.id='kgDealerP1Style';
  s.textContent=''
    +'.kg-dealer-p1{position:fixed;inset:0;z-index:1000001;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(7,20,38,.68)}'
    +'.kg-dealer-p1.open{display:flex}.kg-dealer-p1-card{position:relative;width:min(640px,100%);max-height:min(800px,92vh);overflow:auto;padding:22px;border-radius:18px;background:#fff;color:#172033;box-shadow:0 28px 80px rgba(2,6,23,.32)}'
    +'.kg-dealer-p1-card h2{margin:0 38px 6px 0;font-size:22px}.kg-dealer-p1-card>p{margin:0 0 14px;color:#667085;font-size:12px;line-height:1.55}'
    +'.kg-dealer-x{position:absolute;right:16px;top:14px;width:34px;height:34px;border:0;border-radius:9px;background:#f2f4f7;color:#344054;font-size:21px;line-height:1;cursor:pointer}'
    +'.kg-dealer-device{padding:12px;border:1px solid #dce4eb;border-radius:11px;background:#f8fafc;font-size:12px;font-weight:850}'
    +'.kg-dealer-info{margin-top:10px;padding:12px;border:1px solid #bde7cd;border-radius:11px;background:#f3fff7;color:#175c34;font-size:11px;line-height:1.55}'
    +'.kg-dealer-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:16px}.kg-dealer-btn{border:0;border-radius:10px;padding:11px 15px;font-weight:900;cursor:pointer}.kg-dealer-btn.primary{background:#0aa64f;color:#fff}.kg-dealer-btn.primary:disabled{opacity:.45;cursor:not-allowed}.kg-dealer-btn.secondary{background:#eef2f6;color:#172033}'
    +'.kg-dealer-form{margin-top:14px}.kg-dealer-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.kg-dealer-field{display:flex;flex-direction:column;gap:6px}.kg-dealer-field.full{grid-column:1/-1}.kg-dealer-field label{font-size:12px;font-weight:850;color:#344054}.kg-dealer-field input,.kg-dealer-field select,.kg-dealer-field textarea{width:100%;box-sizing:border-box;border:1px solid #d0d5dd;border-radius:10px;background:#fff;color:#172033;padding:11px 12px;font:inherit;font-size:13px;outline:none}.kg-dealer-field input:focus,.kg-dealer-field select:focus,.kg-dealer-field textarea:focus{border-color:#0aa64f;box-shadow:0 0 0 3px rgba(10,166,79,.10)}.kg-dealer-field textarea{min-height:82px;resize:vertical}.kg-dealer-required{color:#d92d20}.kg-dealer-error{display:none;margin-top:10px;padding:10px 12px;border-radius:9px;background:#fff1f0;color:#b42318;font-size:12px;font-weight:700}.kg-dealer-error.show{display:block}.kg-dealer-step{margin:2px 0 12px;color:#0a8f45;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.04em}.kg-dealer-hint{margin-top:10px;color:#667085;font-size:11px;line-height:1.5}'
    +'.kg-photo-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0 10px}.kg-photo-count{padding:6px 9px;border-radius:999px;background:#eefaf3;color:#087a3c;font-size:11px;font-weight:900;white-space:nowrap}.kg-photo-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.kg-photo-card{position:relative;min-height:185px;border:1.5px dashed #cbd5df;border-radius:14px;background:#f9fbfc;overflow:hidden}.kg-photo-card.has-photo{border-style:solid;border-color:#a7dcbc;background:#fff}.kg-photo-empty{min-height:185px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:18px;box-sizing:border-box}.kg-photo-icon{font-size:30px;line-height:1;margin-bottom:10px}.kg-photo-title{font-size:13px;font-weight:900;color:#172033}.kg-photo-title em{font-style:normal;color:#d92d20}.kg-photo-hint{margin:5px 0 12px;color:#667085;font-size:11px;line-height:1.4}.kg-photo-pick{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:9px;padding:9px 12px;background:#e9f8ef;color:#087a3c;font-size:11px;font-weight:900;cursor:pointer}.kg-photo-input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.kg-photo-preview{position:relative;height:185px;background:#eef2f6}.kg-photo-preview img{display:block;width:100%;height:100%;object-fit:cover}.kg-photo-overlay{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px;background:linear-gradient(transparent,rgba(5,13,25,.82));color:#fff}.kg-photo-overlay strong{font-size:11px}.kg-photo-tools{display:flex;gap:6px}.kg-photo-tool{border:0;border-radius:8px;padding:7px 9px;background:rgba(255,255,255,.93);color:#172033;font-size:10px;font-weight:900;cursor:pointer}.kg-photo-status{margin-top:12px;padding:11px 12px;border-radius:10px;background:#f8fafc;color:#475467;font-size:11px;line-height:1.5}.kg-photo-status.ready{background:#f0fff6;color:#176b3a}.kg-photo-size{font-size:10px;font-weight:600;opacity:.88}'
    +'@media(max-width:640px){.kg-dealer-p1-card{padding:18px}.kg-dealer-form-grid,.kg-photo-grid{grid-template-columns:1fr}.kg-dealer-field.full{grid-column:auto}.kg-dealer-actions{flex-direction:column-reverse}.kg-dealer-btn{width:100%}.kg-photo-card,.kg-photo-empty,.kg-photo-preview{min-height:210px}.kg-photo-preview{height:210px}}';
  document.head.appendChild(s);
}
function shell(){
  var o=q('#kgDealerP1');
  if(o)return o;
  o=document.createElement('div');
  o.id='kgDealerP1';
  o.className='kg-dealer-p1';
  o.innerHTML='<div class="kg-dealer-p1-card"><button type="button" class="kg-dealer-x" aria-label="Kapat">×</button><div id="kgDealerP1Body"></div></div>';
  document.body.appendChild(o);
  q('.kg-dealer-x',o).onclick=close;
  o.onclick=function(e){if(e.target===o)close();};
  return o;
}
function renderIntro(){
  var o=shell(),amount=price(),body=q('#kgDealerP1Body',o);
  body.innerHTML=''
    +'<h2>Telefonculardan teklif al</h2>'
    +'<p>Doğrulanmış telefoncular cihazın için kendi alış tekliflerini verecek.</p>'
    +'<div class="kg-dealer-device">'+esc(device())+' · KaçaGider piyasa değeri: '+amount.toLocaleString('tr-TR')+' TL</div>'
    +'<div class="kg-dealer-info"><strong>KaçaGider alış fiyatı belirlemez.</strong><br>Teklifleri telefoncular verir. Teklif almak ücretsizdir ve hiçbir teklifi kabul etmek zorunda değilsin. İletişim bilgilerin yalnızca bir teklifi kabul ettiğinde açılır.</div>'
    +'<div class="kg-dealer-actions"><button type="button" class="kg-dealer-btn primary" id="kgDealerContinue">Devam Et →</button></div>';
  q('#kgDealerContinue',body).onclick=renderDetails;
}
function renderDetails(){
  var o=shell(),body=q('#kgDealerP1Body',o),iphone=isIphone();
  var saved=getDraft();
  body.innerHTML=''
    +'<div class="kg-dealer-step">Adım 1 / Teklif talebi</div>'
    +'<h2>Cihaz bilgilerini tamamla</h2>'
    +'<p>Değerlemede verdiğin cihaz bilgilerini tekrar sormuyoruz. Telefoncuların teklif verebilmesi için yalnızca eksik bilgileri tamamla.</p>'
    +'<div class="kg-dealer-device">'+esc(device())+'</div>'
    +'<form class="kg-dealer-form" id="kgDealerDetailsForm">'
      +'<div class="kg-dealer-form-grid">'
        +'<div class="kg-dealer-field"><label for="kgDealerCity">İl <span class="kg-dealer-required">*</span></label><input id="kgDealerCity" name="city" autocomplete="address-level1" placeholder="Örn. İstanbul" value="'+esc(saved.city)+'" required></div>'
        +'<div class="kg-dealer-field"><label for="kgDealerDistrict">İlçe <span class="kg-dealer-required">*</span></label><input id="kgDealerDistrict" name="district" autocomplete="address-level2" placeholder="Örn. Bayrampaşa" value="'+esc(saved.district)+'" required></div>'
        +(iphone?'<div class="kg-dealer-field"><label for="kgDealerBattery">Pil sağlığı (%)</label><input id="kgDealerBattery" name="battery" type="number" inputmode="numeric" min="1" max="100" placeholder="Örn. 86" value="'+esc(saved.battery)+'"></div>':'')
        +'<div class="kg-dealer-field"><label for="kgDealerWarranty">Garanti durumu</label><select id="kgDealerWarranty" name="warranty"><option value="">Seçiniz</option><option value="var">Devam ediyor</option><option value="yok">Garanti yok</option><option value="bilmiyorum">Bilmiyorum</option></select></div>'
        +'<div class="kg-dealer-field"><label for="kgDealerBox">Kutu / fatura</label><select id="kgDealerBox" name="boxInvoice"><option value="">Seçiniz</option><option value="ikisi">Kutu ve fatura var</option><option value="kutu">Sadece kutu var</option><option value="fatura">Sadece fatura var</option><option value="yok">İkisi de yok</option></select></div>'
        +'<div class="kg-dealer-field full"><label for="kgDealerNotes">Telefoncunun bilmesi gereken başka bir durum var mı?</label><textarea id="kgDealerNotes" name="notes" maxlength="500" placeholder="Örn. kasada küçük ezik var, kamera ve Face ID sorunsuz...">'+esc(saved.notes)+'</textarea></div>'
      +'</div>'
      +'<div class="kg-dealer-error" id="kgDealerError">İl ve ilçe bilgilerini doldurmalısın.</div>'
      +'<div class="kg-dealer-hint">Sonraki adımda cihazın ön, arka ve yan/kasa fotoğraflarını ekleyeceğiz.</div>'
      +'<div class="kg-dealer-actions"><button type="button" class="kg-dealer-btn secondary" id="kgDealerBack">← Geri</button><button type="submit" class="kg-dealer-btn primary">Fotoğraflara Geç →</button></div>'
    +'</form>';
  if(saved.warranty)q('#kgDealerWarranty',body).value=saved.warranty;
  if(saved.boxInvoice)q('#kgDealerBox',body).value=saved.boxInvoice;
  q('#kgDealerBack',body).onclick=renderIntro;
  q('#kgDealerDetailsForm',body).onsubmit=function(e){
    e.preventDefault();
    var city=q('#kgDealerCity',body).value.trim();
    var district=q('#kgDealerDistrict',body).value.trim();
    var err=q('#kgDealerError',body);
    if(!city||!district){err.classList.add('show');return;}
    err.classList.remove('show');
    var draft={
      city:city,
      district:district,
      battery:iphone&&q('#kgDealerBattery',body)?q('#kgDealerBattery',body).value.trim():'',
      warranty:q('#kgDealerWarranty',body).value,
      boxInvoice:q('#kgDealerBox',body).value,
      notes:q('#kgDealerNotes',body).value.trim(),
      brand:val('phoneBrand'),model:val('model'),storage:val('storage'),marketPrice:price()
    };
    saveDraft(draft);
    renderPhotos();
  };
}
function setPhoto(key,file){
  if(photoUrls[key]){
    try{URL.revokeObjectURL(photoUrls[key]);}catch(e){}
    photoUrls[key]='';
  }
  photoFiles[key]=file||null;
  if(file)photoUrls[key]=URL.createObjectURL(file);
}
function formatBytes(bytes){
  if(!bytes)return'';
  if(bytes<1024*1024)return Math.max(1,Math.round(bytes/1024))+' KB';
  return (bytes/(1024*1024)).toFixed(1)+' MB';
}
function requiredPhotoCount(){
  return ['front','back','side'].filter(function(k){return !!photoFiles[k];}).length;
}
function photoCard(spec){
  var file=photoFiles[spec.key],url=photoUrls[spec.key];
  if(file&&url){
    return '<div class="kg-photo-card has-photo" data-slot="'+spec.key+'">'
      +'<div class="kg-photo-preview"><img src="'+esc(url)+'" alt="'+esc(spec.title)+' fotoğrafı">'
      +'<div class="kg-photo-overlay"><div><strong>'+esc(spec.title)+'</strong><div class="kg-photo-size">'+esc(formatBytes(file.size))+'</div></div>'
      +'<div class="kg-photo-tools"><label class="kg-photo-tool" for="kgPhoto_'+spec.key+'">Değiştir</label><button type="button" class="kg-photo-tool kg-photo-remove" data-remove="'+spec.key+'">Sil</button></div></div></div>'
      +'<input class="kg-photo-input" id="kgPhoto_'+spec.key+'" data-photo="'+spec.key+'" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif">'
      +'</div>';
  }
  return '<div class="kg-photo-card" data-slot="'+spec.key+'"><div class="kg-photo-empty">'
    +'<div class="kg-photo-icon">📷</div><div class="kg-photo-title">'+esc(spec.title)+(spec.required?' <em>*</em>':'')+'</div>'
    +'<div class="kg-photo-hint">'+esc(spec.hint)+'</div><label class="kg-photo-pick" for="kgPhoto_'+spec.key+'">Fotoğraf seç</label>'
    +'<input class="kg-photo-input" id="kgPhoto_'+spec.key+'" data-photo="'+spec.key+'" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif">'
    +'</div></div>';
}
function renderPhotos(){
  var o=shell(),body=q('#kgDealerP1Body',o),draft=getDraft();
  var count=requiredPhotoCount();
  body.innerHTML=''
    +'<div class="kg-dealer-step">Adım 2 / Fotoğraflar</div>'
    +'<h2>Cihazın fotoğraflarını ekle</h2>'
    +'<p>Telefoncuların cihazı daha doğru değerlendirebilmesi için net ve güncel fotoğraflar yükle. İlk 3 fotoğraf zorunludur.</p>'
    +'<div class="kg-dealer-device">'+esc(device())+(draft.city?' · '+esc(draft.city)+' / '+esc(draft.district):'')+'</div>'
    +'<div class="kg-photo-head"><strong>Fotoğraflar</strong><span class="kg-photo-count">'+count+' / 3 zorunlu</span></div>'
    +'<div class="kg-photo-grid">'+photoSpecs.map(photoCard).join('')+'</div>'
    +'<div class="kg-dealer-error" id="kgPhotoError">Ön, arka ve yan/kasa fotoğraflarının üçünü de eklemelisin.</div>'
    +'<div class="kg-photo-status '+(count===3?'ready':'')+'">'+(count===3?'✓ Zorunlu fotoğraflar tamamlandı. İstersen hasar detayı da ekleyebilirsin.':'Ön, arka ve yan/kasa fotoğraflarını eklediğinde devam edebilirsin.')+'<br>Desteklenen biçimler: JPG, PNG, WEBP, HEIC. Fotoğraf başına en fazla 10 MB.</div>'
    +'<div class="kg-dealer-actions"><button type="button" class="kg-dealer-btn secondary" id="kgPhotoBack">← Bilgileri Düzenle</button><button type="button" class="kg-dealer-btn primary" id="kgPhotoContinue" '+(count===3?'':'disabled')+'>Fotoğrafları Onayla →</button></div>';

  Array.prototype.forEach.call(body.querySelectorAll('[data-photo]'),function(input){
    input.onchange=function(){
      var file=input.files&&input.files[0];
      if(!file)return;
      var err=q('#kgPhotoError',body);
      var allowed=/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type||'')||/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name||'');
      if(!allowed){err.textContent='Yalnızca JPG, PNG, WEBP veya HEIC fotoğraf yükleyebilirsin.';err.classList.add('show');input.value='';return;}
      if(file.size>10*1024*1024){err.textContent='Her fotoğraf en fazla 10 MB olabilir.';err.classList.add('show');input.value='';return;}
      setPhoto(input.getAttribute('data-photo'),file);
      renderPhotos();
    };
  });
  Array.prototype.forEach.call(body.querySelectorAll('[data-remove]'),function(btn){
    btn.onclick=function(){setPhoto(btn.getAttribute('data-remove'),null);renderPhotos();};
  });
  q('#kgPhotoBack',body).onclick=renderDetails;
  q('#kgPhotoContinue',body).onclick=function(){
    if(requiredPhotoCount()<3){var err=q('#kgPhotoError',body);err.textContent='Ön, arka ve yan/kasa fotoğraflarının üçünü de eklemelisin.';err.classList.add('show');return;}
    renderPhotoReady(draft);
  };
}
function renderPhotoReady(draft){
  var o=shell(),body=q('#kgDealerP1Body',o),total=Object.keys(photoFiles).filter(function(k){return !!photoFiles[k];}).length;
  body.innerHTML=''
    +'<div class="kg-dealer-step">Adım 2 tamamlandı</div>'
    +'<h2>Fotoğraflar hazır</h2>'
    +'<p>'+esc(draft.city||'')+' / '+esc(draft.district||'')+' için teklif talebine '+total+' cihaz fotoğrafı eklendi.</p>'
    +'<div class="kg-dealer-device">'+esc(device())+'</div>'
    +'<div class="kg-dealer-info"><strong>Talep henüz telefonculara gönderilmedi.</strong><br>Fotoğraflar şu anda yalnızca bu sayfadaki geçici taslakta tutuluyor. Sonraki adımda iletişim/teklif talebi onayı ve sunucuya güvenli yükleme bağlantısını ekleyeceğiz.</div>'
    +'<div class="kg-dealer-actions"><button type="button" class="kg-dealer-btn secondary" id="kgPhotosEdit">← Fotoğrafları Düzenle</button><button type="button" class="kg-dealer-btn primary" id="kgPhotosNext">Devam Et →</button></div>';
  q('#kgPhotosEdit',body).onclick=renderPhotos;
  q('#kgPhotosNext',body).onclick=function(){alert('Sonraki adım: teklif talebi onayı ve fotoğrafların güvenli olarak sunucuya yüklenmesi.');};
}
function open(){
  var amount=price();
  if(!amount){alert('Önce cihazının piyasa değerini hesapla.');return;}
  ensureStyle();
  shell();
  renderIntro();
  var o=q('#kgDealerP1');
  o.classList.add('open');
  document.body.style.overflow='hidden';
}
window.KGDealerSellPhase1={open:open,close:close};
})();