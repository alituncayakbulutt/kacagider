(function(){
'use strict';
if(window.KGDealerSellPhase1)return;

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
function ensureStyle(){
  if(q('#kgDealerP1Style'))return;
  var s=document.createElement('style');
  s.id='kgDealerP1Style';
  s.textContent=''
    +'.kg-dealer-p1{position:fixed;inset:0;z-index:1000001;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(7,20,38,.68)}'
    +'.kg-dealer-p1.open{display:flex}.kg-dealer-p1-card{position:relative;width:min(600px,100%);max-height:min(760px,92vh);overflow:auto;padding:22px;border-radius:18px;background:#fff;color:#172033;box-shadow:0 28px 80px rgba(2,6,23,.32)}'
    +'.kg-dealer-p1-card h2{margin:0 38px 6px 0;font-size:22px}.kg-dealer-p1-card>p{margin:0 0 14px;color:#667085;font-size:12px;line-height:1.55}'
    +'.kg-dealer-x{position:absolute;right:16px;top:14px;width:34px;height:34px;border:0;border-radius:9px;background:#f2f4f7;color:#344054;font-size:21px;line-height:1;cursor:pointer}'
    +'.kg-dealer-device{padding:12px;border:1px solid #dce4eb;border-radius:11px;background:#f8fafc;font-size:12px;font-weight:850}'
    +'.kg-dealer-info{margin-top:10px;padding:12px;border:1px solid #bde7cd;border-radius:11px;background:#f3fff7;color:#175c34;font-size:11px;line-height:1.55}'
    +'.kg-dealer-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:16px}.kg-dealer-btn{border:0;border-radius:10px;padding:11px 15px;font-weight:900;cursor:pointer}.kg-dealer-btn.primary{background:#0aa64f;color:#fff}.kg-dealer-btn.secondary{background:#eef2f6;color:#172033}'
    +'.kg-dealer-form{margin-top:14px}.kg-dealer-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.kg-dealer-field{display:flex;flex-direction:column;gap:6px}.kg-dealer-field.full{grid-column:1/-1}.kg-dealer-field label{font-size:12px;font-weight:850;color:#344054}.kg-dealer-field input,.kg-dealer-field select,.kg-dealer-field textarea{width:100%;box-sizing:border-box;border:1px solid #d0d5dd;border-radius:10px;background:#fff;color:#172033;padding:11px 12px;font:inherit;font-size:13px;outline:none}.kg-dealer-field input:focus,.kg-dealer-field select:focus,.kg-dealer-field textarea:focus{border-color:#0aa64f;box-shadow:0 0 0 3px rgba(10,166,79,.10)}.kg-dealer-field textarea{min-height:82px;resize:vertical}.kg-dealer-required{color:#d92d20}.kg-dealer-error{display:none;margin-top:10px;padding:10px 12px;border-radius:9px;background:#fff1f0;color:#b42318;font-size:12px;font-weight:700}.kg-dealer-error.show{display:block}.kg-dealer-step{margin:2px 0 12px;color:#0a8f45;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.04em}.kg-dealer-hint{margin-top:10px;color:#667085;font-size:11px;line-height:1.5}'
    +'@media(max-width:640px){.kg-dealer-p1-card{padding:18px}.kg-dealer-form-grid{grid-template-columns:1fr}.kg-dealer-field.full{grid-column:auto}.kg-dealer-actions{flex-direction:column-reverse}.kg-dealer-btn{width:100%}}';
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
  var saved={};
  try{saved=JSON.parse(sessionStorage.getItem('kgDealerRequestDraft')||'{}')||{};}catch(e){}
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
    try{sessionStorage.setItem('kgDealerRequestDraft',JSON.stringify(draft));}catch(x){}
    renderPhotoPlaceholder(draft);
  };
}
function renderPhotoPlaceholder(draft){
  var o=shell(),body=q('#kgDealerP1Body',o);
  body.innerHTML=''
    +'<div class="kg-dealer-step">Adım 2 / Fotoğraflar</div>'
    +'<h2>Bilgiler hazır</h2>'
    +'<p>'+esc(draft.city)+' / '+esc(draft.district)+' konumu kaydedildi. Şimdi cihaz fotoğrafları adımına geçmeye hazırız.</p>'
    +'<div class="kg-dealer-device">'+esc(device())+'</div>'
    +'<div class="kg-dealer-info"><strong>Bu ekranda talep henüz telefonculara gönderilmedi.</strong><br>Bir sonraki geliştirme adımında en az 3 cihaz fotoğrafını ekleyip talebi oluşturacağız.</div>'
    +'<div class="kg-dealer-actions"><button type="button" class="kg-dealer-btn secondary" id="kgDealerEdit">← Bilgileri Düzenle</button></div>';
  q('#kgDealerEdit',body).onclick=renderDetails;
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