(function(){
"use strict";
if(window.__KG_MARKETPLACE_TEST__)return;window.__KG_MARKETPLACE_TEST__=true;

var style=document.createElement("style");style.textContent=`
.kg-mp-home{max-width:1408px;margin:12px auto 18px;padding:0 30px}.kg-mp-home-card{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:24px;padding:18px 24px;border:1px solid #b7e8c9;border-radius:18px;background:linear-gradient(135deg,#f4fff7,#fff 72%);box-shadow:0 8px 24px rgba(15,23,42,.06)}.kg-mp-badge{display:inline-flex;padding:5px 9px;border-radius:999px;background:#dcfce7;color:#15803d;font-size:10px;font-weight:900;margin-bottom:6px}.kg-mp-home-copy strong{display:block;font-size:21px;line-height:1.15;color:#111827;margin-bottom:5px}.kg-mp-home-copy strong span{color:#16a34a}.kg-mp-home-copy p{margin:0;color:#667085;font-size:12px;line-height:1.45}.kg-mp-listings-link{display:inline-block;margin-top:8px;color:#087735;font-size:11px;font-weight:900;text-decoration:none}.kg-mp-home-action,.kg-mp-result-action{border:0;background:linear-gradient(135deg,#0fa94c,#19bd59);color:#fff;font-weight:900;cursor:pointer}.kg-mp-home-action{min-width:210px;padding:14px 18px;border-radius:12px;font-size:14px;box-shadow:0 8px 20px rgba(22,163,74,.18)}.kg-mp-home-action small{display:block;font-size:9px;font-weight:650;opacity:.9;margin-top:2px}.kg-mp-result-action{width:100%;min-height:52px;margin-top:12px;padding:11px 14px;border-radius:11px;font-size:13px;display:none}.kg-mp-result-action.is-ready{display:block}.kg-mp-card-action{position:absolute;top:18px;left:50%;transform:translateX(-50%);z-index:5;display:inline-flex;align-items:center;justify-content:center;min-width:132px;height:34px;padding:0 15px;border-radius:10px;background:linear-gradient(135deg,#0fa94c,#19bd59);color:#fff;font-size:12px;font-weight:900;line-height:1;box-shadow:0 7px 18px rgba(22,163,74,.18);white-space:nowrap;cursor:pointer}.kg-mp-card-ready{position:relative!important;padding-top:62px!important}.kg-mp-card-ready img{display:block!important;width:auto!important;max-width:88%!important;height:clamp(190px,18vw,270px)!important;max-height:none!important;margin:0 auto 18px!important;object-fit:contain!important;object-position:center!important}.kg-mp-card-ready .kg-approved-card-media,.kg-mp-card-ready .category-image,.kg-mp-card-ready .category-media{min-height:clamp(205px,19vw,285px)!important;display:flex!important;align-items:flex-end!important;justify-content:center!important}.kg-mp-overlay{position:fixed;inset:0;z-index:999999;background:rgba(7,20,38,.65);display:none;align-items:center;justify-content:center;padding:18px}.kg-mp-overlay.is-open{display:flex}.kg-mp-modal{width:min(820px,100%);max-height:92vh;overflow:auto;background:#fff;color:#111827;border:1px solid #e5e7eb;border-radius:20px;box-shadow:0 28px 80px rgba(2,6,23,.32)}.kg-mp-head{display:flex;justify-content:space-between;gap:18px;padding:20px 22px;border-bottom:1px solid #e5e7eb}.kg-mp-head h2{margin:0;font-size:23px}.kg-mp-head p{margin:5px 0 0;color:#667085;font-size:12px}.kg-mp-close{width:38px;height:38px;border:0;border-radius:10px;background:#f2f4f7;font-size:20px;cursor:pointer}.kg-mp-body{padding:20px 22px}.kg-mp-tabs{display:grid;grid-template-columns:1fr 1fr;background:#f2f4f7;border-radius:11px;padding:4px;margin-bottom:16px}.kg-mp-tab{border:0;background:transparent;border-radius:8px;padding:10px;font-weight:850;color:#667085;cursor:pointer}.kg-mp-tab.active{background:#fff;color:#111827}.kg-mp-note{margin-bottom:15px;padding:11px 13px;border:1px solid #bbf7d0;border-radius:11px;background:#f0fdf4;color:#166534;font-size:12px;line-height:1.5}.kg-mp-note.error{border-color:#fecaca;background:#fff1f2;color:#b42318}.kg-mp-category-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.kg-mp-category{border:1px solid #e5e7eb;border-radius:13px;background:#fff;padding:15px 8px;text-align:center;cursor:pointer}.kg-mp-category i{display:block;font-style:normal;font-size:25px;margin-bottom:7px}.kg-mp-category strong{display:block;font-size:12px}.kg-mp-category small{display:block;margin-top:3px;color:#667085;font-size:9px}.kg-mp-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.kg-mp-field{display:grid;gap:6px;margin-bottom:12px}.kg-mp-field label{font-size:12px;font-weight:850;color:#475467}.kg-mp-field input,.kg-mp-field select,.kg-mp-field textarea{width:100%;min-height:42px;padding:10px 12px;border:1px solid #d0d5dd;border-radius:9px;background:#fff;color:#101828;font:inherit}.kg-mp-field textarea{min-height:100px}.kg-mp-field small{color:#667085;font-size:10px;line-height:1.4}.kg-mp-upload{border:1px dashed #98a2b3;border-radius:12px;padding:14px;background:#fbfcfe}.kg-mp-upload input{border:0;padding:0;min-height:auto}.kg-mp-upload small{display:block;margin-top:7px;color:#667085}.kg-mp-photo-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:10px}.kg-mp-photo{position:relative;aspect-ratio:1;border-radius:9px;overflow:hidden;background:#eef2f6;border:1px solid #e5e7eb}.kg-mp-photo img{width:100%;height:100%;object-fit:cover}.kg-mp-photo button{position:absolute;right:4px;top:4px;width:24px;height:24px;border:0;border-radius:50%;background:rgba(15,23,42,.78);color:#fff;cursor:pointer}.kg-mp-actions{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap;margin-top:15px}.kg-mp-btn{border:0;border-radius:10px;padding:11px 15px;font-weight:900;cursor:pointer}.kg-mp-btn.primary{background:#16a34a;color:#fff}.kg-mp-btn.secondary{background:#f2f4f7;color:#344054}.kg-mp-btn:disabled{opacity:.55;cursor:not-allowed}.kg-mp-device{padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#fbfcfe;margin-bottom:14px}.kg-mp-device h3{margin:0 0 5px}.kg-mp-device p{margin:0;color:#667085;font-size:12px}.kg-mp-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.kg-mp-stat{padding:13px;border:1px solid #e5e7eb;border-radius:11px;background:#f8fafc;text-align:center}.kg-mp-stat strong{display:block;color:#15803d;font-size:20px}.kg-mp-disclaimer{font-size:11px;color:#667085;text-align:center;margin-top:10px}#kgMpNavAction{display:none!important}@media(max-width:900px){.kg-mp-home-card{grid-template-columns:1fr}.kg-mp-home-action{width:100%}.kg-mp-category-grid{grid-template-columns:repeat(2,1fr)}.kg-mp-card-ready img{height:220px!important}}@media(max-width:720px){.kg-mp-home{padding:0 12px}.kg-mp-grid,.kg-mp-summary{grid-template-columns:1fr}.kg-mp-card-action{top:14px;min-width:120px;height:32px;font-size:11px}.kg-mp-card-ready{padding-top:56px!important}.kg-mp-card-ready img{height:190px!important;max-width:90%!important}.kg-mp-photo-grid{grid-template-columns:repeat(3,1fr)}}
`;document.head.appendChild(style);

function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.from((r||document).querySelectorAll(s))}
function num(v){return Number(String(v||"").replace(/[^0-9]/g,""))||0}
function price(){var e=q("#mainPrice");return e?num(e.textContent):0}
function val(id){var e=q("#"+id);if(!e)return"";if(e.tagName==="SELECT"){var o=e.options[e.selectedIndex];return o?o.textContent.trim():""}return String(e.value||"").trim()}
function rawVal(id){var e=q("#"+id);return e?String(e.value||"").trim():""}
function esc(v){return String(v||"").replace(/[&<>\"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]})}
function tl(v){return v?Number(v).toLocaleString("tr-TR")+" TL":"—"}

function categoryKey(){
  var active=q('.category-card.active[data-category],.kg-approved-card.active[data-category],[data-category].active');
  var key=active&&active.dataset?active.dataset.category:'';
  var map={phone:'phone',telefon:'phone',tablet:'tablet',computer:'computer',bilgisayar:'computer',watch:'watch','akilli-saat':'watch',console:'console','oyun-konsolu':'console'};
  if(map[key])return map[key];
  var n=q('#selectedCategoryName');var text=n?String(n.textContent||'').trim():'';
  return {'Telefon':'phone','Tablet':'tablet','Bilgisayar':'computer','Akıllı Saat':'watch','Oyun Konsolu':'console'}[text]||'phone';
}
function categoryLabel(){return {phone:'Telefon',tablet:'Tablet',computer:'Bilgisayar',watch:'Akıllı Saat',console:'Oyun Konsolu'}[categoryKey()]||'Telefon'}
function activeText(group){var e=q('[data-group="'+group+'"] .option.active');return e?String(e.textContent||'').trim():''}
function changedPartsText(){try{if(typeof window.getChangedPartsSummary==='function'){var s=window.getChangedPartsSummary();if(s)return s}}catch(e){}var rows=qa('#partsSelector .parts-row');if(!rows.length)return'';return rows.map(function(row){var p=q('.part-select',row),qq=q('.part-quality',row);if(!p||!p.value)return'';var pt=p.options[p.selectedIndex]?p.options[p.selectedIndex].text.trim():'';if(p.value==='none')return'Değişen yok';var qt=qq&&qq.options[qq.selectedIndex]?qq.options[qq.selectedIndex].text.trim():'';return[pt,qt].filter(Boolean).join(' · ')}).filter(Boolean).join(' | ')}
function collectDetails(){
  var out=[];function add(label,value){value=String(value||'').trim();if(!value||value==='Seçiniz')return;out.push({label:label,value:value})}
  if(categoryKey()==='phone'){
    add('Pil Sağlığı',val('battery'));add('Ekran Durumu',val('screen'));add('Face ID',val('faceid'));add('Cihaz Kaydı',activeText('deviceRegistration'));add('Değişen Parça / İşlem Geçmişi',changedPartsText());add('Çizik Sayısı',activeText('scratchCount'));add('Çizik Derinliği',activeText('scratchDepth'));add('Piksel Atması',activeText('protector'));add('Kasa Ezik / Darbe',activeText('dent'));add('Kasa Yüzeyi',activeText('surface'));add('Köşeler',activeText('corners'));add('Arka Cam Durumu',activeText('backGlass'));
  }else{
    add('Kondisyon',val('genericCondition'));add('Çalışma Durumu',val('genericWorking'));add('Kutu / Aksesuar',val('genericAccessories'));
  }
  return out;
}
function ctx(){
  var generic=categoryKey()!=='phone';
  return{category:categoryKey(),categoryLabel:categoryLabel(),brand:val(generic?'genericBrand':'phoneBrand'),model:val(generic?'genericModel':'model'),storage:val(generic?'genericStorage':'storage'),price:price(),details:collectDetails()}
}

function ensureBackend(){
  if(window.KGMarketplaceSupabase)return Promise.resolve(window.KGMarketplaceSupabase);
  return new Promise(function(resolve,reject){
    var existing=q('script[data-kg-marketplace-backend]');
    function ready(){if(window.KGMarketplaceSupabase)resolve(window.KGMarketplaceSupabase);else reject(new Error('Marketplace veri katmanı yüklenemedi.'))}
    if(existing){existing.addEventListener('load',ready,{once:true});existing.addEventListener('error',function(){reject(new Error('Marketplace veri katmanı yüklenemedi.'))},{once:true});return}
    var s=document.createElement('script');s.src='/assets/supabase-marketplace.js';s.async=true;s.dataset.kgMarketplaceBackend='1';s.onload=ready;s.onerror=function(){reject(new Error('Marketplace veri katmanı yüklenemedi.'))};document.head.appendChild(s);
  })
}

function overlay(){if(q("#kgMpOverlay"))return q("#kgMpOverlay");var o=document.createElement("div");o.id="kgMpOverlay";o.className="kg-mp-overlay";o.innerHTML='<section class="kg-mp-modal"><div class="kg-mp-head"><div><h2 id="kgMpTitle"></h2><p id="kgMpSub"></p></div><button class="kg-mp-close">×</button></div><div class="kg-mp-body" id="kgMpBody"></div></section>';document.body.appendChild(o);q(".kg-mp-close",o).onclick=close;o.onclick=function(e){if(e.target===o)close()};return o}
function open(){overlay().classList.add("is-open");document.body.style.overflow="hidden"}
function close(){var o=q("#kgMpOverlay");if(o)o.classList.remove("is-open");document.body.style.overflow=""}

var cats=[['phone','📱','Telefon'],['tablet','▣','Tablet'],['computer','💻','Bilgisayar'],['watch','⌚','Akıllı Saat'],['console','🎮','Oyun Konsolu']];
function choose(){open();q("#kgMpTitle").textContent="Ne satmak istiyorsun?";q("#kgMpSub").textContent="Önce cihazının güncel piyasa değerini öğren; ilan bilgilerin otomatik doldurulsun.";q("#kgMpBody").innerHTML='<div class="kg-mp-note">Piyasa değeri sorgulama ücretsizdir. İlan yayınlamak için üyelik gerekir.</div><div class="kg-mp-category-grid">'+cats.map(function(c){return'<button class="kg-mp-category" data-k="'+c[0]+'"><i>'+c[1]+'</i><strong>'+c[2]+'</strong><small>Değerini öğren</small></button>'}).join('')+'</div>';qa('.kg-mp-category',q('#kgMpBody')).forEach(function(b){b.onclick=function(){close();selectCategory(b.dataset.k)}})}
function selectCategory(key){var card=q('[data-category="'+key+'"]');if(card)card.click();setTimeout(function(){var f=q('.form-panel')||q('#valuationArea')||q('.layout');if(f)f.scrollIntoView({behavior:'smooth',block:'start'})},220)}

var pendingContext=null;
async function beginListing(c){
  pendingContext=c||ctx();
  try{
    var api=await ensureBackend();
    await api.ready;
    var user=await api.getUser();
    if(user){listing(pendingContext);return}
    auth('register',pendingContext);
  }catch(error){alert('İlan sistemi bağlanırken hata oluştu: '+(error.message||error))}
}

function auth(mode,c){
  pendingContext=c||pendingContext||ctx();
  open();mode=mode||'register';
  q('#kgMpTitle').textContent=mode==='register'?'Ücretsiz Üye Ol':'Giriş Yap';
  q('#kgMpSub').textContent='Üyelik yalnızca ilan yayınlamak ve kendi ilanlarını yönetmek için gerekir.';
  q('#kgMpBody').innerHTML='<div class="kg-mp-tabs"><button class="kg-mp-tab '+(mode==='register'?'active':'')+'" type="button" data-m="register">Üye Ol</button><button class="kg-mp-tab '+(mode==='login'?'active':'')+'" type="button" data-m="login">Giriş Yap</button></div><div id="kgAuthNote" class="kg-mp-note">E-posta adresin hesabını doğrulamak ve güvenli giriş yapmak için kullanılır.</div><form id="kgMpAuth">'+(mode==='register'?'<div class="kg-mp-field"><label>Ad Soyad</label><input id="kgAuthName" autocomplete="name" required></div>':'')+'<div class="kg-mp-field"><label>E-posta</label><input id="kgAuthEmail" type="email" autocomplete="email" required></div><div class="kg-mp-field"><label>Şifre</label><input id="kgAuthPassword" type="password" minlength="8" autocomplete="'+(mode==='register'?'new-password':'current-password')+'" required><small>En az 8 karakter kullan.</small></div><div class="kg-mp-actions"><button type="submit" class="kg-mp-btn primary" id="kgAuthSubmit">'+(mode==='register'?'Ücretsiz Üye Ol':'Giriş Yap')+'</button></div></form>';
  qa('.kg-mp-tab',q('#kgMpBody')).forEach(function(b){b.onclick=function(){auth(b.dataset.m,pendingContext)}});
  q('#kgMpAuth').onsubmit=async function(e){
    e.preventDefault();
    var submit=q('#kgAuthSubmit'),note=q('#kgAuthNote');submit.disabled=true;note.classList.remove('error');note.textContent='İşlem yapılıyor…';
    try{
      var api=await ensureBackend();await api.ready;
      var email=rawVal('kgAuthEmail'),password=rawVal('kgAuthPassword');
      if(mode==='register'){
        var result=await api.signUp({fullName:rawVal('kgAuthName'),email:email,password:password});
        if(result.error)throw result.error;
        if(result.data&&result.data.session){listing(pendingContext);return}
        note.textContent='Doğrulama bağlantısını e-posta adresine gönderdik. E-postanı doğruladıktan sonra Giriş Yap sekmesinden devam et.';
        submit.textContent='E-posta Gönderildi';
        return;
      }
      var login=await api.signIn({email:email,password:password});if(login.error)throw login.error;listing(pendingContext);
    }catch(error){note.classList.add('error');note.textContent=error.message||'Giriş işlemi tamamlanamadı.';submit.disabled=false}
  };
}

var COLORS=['Siyah','Beyaz','Gri','Gümüş','Altın','Mavi','Yeşil','Kırmızı','Mor','Pembe','Turuncu','Sarı','Diğer'];
var CITIES=['Adana','Adıyaman','Afyonkarahisar','Ağrı','Aksaray','Amasya','Ankara','Antalya','Ardahan','Artvin','Aydın','Balıkesir','Bartın','Batman','Bayburt','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Iğdır','Isparta','İstanbul','İzmir','Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kırıkkale','Kırklareli','Kırşehir','Kilis','Kocaeli','Konya','Kütahya','Malatya','Manisa','Mardin','Mersin','Muğla','Muş','Nevşehir','Niğde','Ordu','Osmaniye','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Şanlıurfa','Şırnak','Tekirdağ','Tokat','Trabzon','Tunceli','Uşak','Van','Yalova','Yozgat','Zonguldak'];
var photoDraft=[];
function resizeImage(file){return new Promise(function(resolve,reject){var reader=new FileReader();reader.onerror=reject;reader.onload=function(){var img=new Image();img.onerror=reject;img.onload=function(){var max=1400,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.round(img.width*scale),h=Math.round(img.height*scale),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);resolve(canvas.toDataURL('image/jpeg',.78))};img.src=reader.result};reader.readAsDataURL(file)})}
function renderPhotoDraft(){var host=q('#kgPhotoPreview');if(!host)return;host.innerHTML=photoDraft.map(function(src,i){return'<div class="kg-mp-photo"><img src="'+src+'" alt="İlan fotoğrafı"><button type="button" data-remove="'+i+'">×</button></div>'}).join('');qa('[data-remove]',host).forEach(function(b){b.onclick=function(){photoDraft.splice(Number(b.dataset.remove),1);renderPhotoDraft()}})}

function listing(c,existing){
  open();c=c||ctx();existing=existing||{};pendingContext=c;photoDraft=Array.isArray(existing.photos)?existing.photos.slice(0,5):[];
  q('#kgMpTitle').textContent='İlanını Oluştur';q('#kgMpSub').textContent='Değerleme bilgilerin otomatik taşındı.';
  var colorOptions='<option value="">Renk seçiniz</option>'+COLORS.map(function(x){return'<option '+(existing.color===x?'selected':'')+'>'+x+'</option>'}).join('');
  var cityOptions='<option value="">Şehir seçiniz</option>'+CITIES.map(function(x){return'<option '+(existing.city===x?'selected':'')+'>'+x+'</option>'}).join('');
  q('#kgMpBody').innerHTML='<div class="kg-mp-note">KaçaGider piyasa değeri satıcının ilan fiyatından bağımsız gösterilir.</div><div class="kg-mp-device"><h3>'+esc([c.brand,c.model,c.storage].filter(Boolean).join(' '))+'</h3><p>KaçaGider piyasa değeri: <strong>'+tl(c.price)+'</strong></p></div><form id="kgMpListing"><div class="kg-mp-grid"><div class="kg-mp-field"><label>Şehir</label><select id="kgCity" required>'+cityOptions+'</select></div><div class="kg-mp-field"><label>İlçe</label><input id="kgDistrict" value="'+esc(existing.district||'')+'" required></div><div class="kg-mp-field"><label>Renk</label><select id="kgColor" required>'+colorOptions+'</select></div><div class="kg-mp-field"><label>Satış Fiyatın</label><input id="kgSale" type="number" min="1" value="'+esc(existing.salePrice||c.price||'')+'" required></div><div class="kg-mp-field"><label>İletişim Telefonu</label><input id="kgPhone" type="tel" inputmode="tel" value="'+esc(existing.contactPhone||'')+'" placeholder="05xx xxx xx xx" required><small>İlan detayında alıcıların sana ulaşabilmesi için gösterilir.</small></div></div><div class="kg-mp-field"><label>Fotoğraflar</label><div class="kg-mp-upload"><input id="kgPhotos" type="file" accept="image/jpeg,image/png,image/webp" multiple><small>En fazla 5 fotoğraf. Görseller yükleme öncesi küçültülür ve güvenli depolamaya gönderilir.</small><div class="kg-mp-photo-grid" id="kgPhotoPreview"></div></div></div><div class="kg-mp-field"><label>Açıklama</label><textarea id="kgDesc" required>'+esc(existing.description||'')+'</textarea></div><div class="kg-mp-actions"><button class="kg-mp-btn primary">İlan Önizlemesini Aç</button></div></form>';
  renderPhotoDraft();
  q('#kgPhotos').onchange=async function(e){var files=Array.from(e.target.files||[]).filter(function(f){return ['image/jpeg','image/png','image/webp'].includes(f.type)}).slice(0,5-photoDraft.length);for(var i=0;i<files.length;i++){try{photoDraft.push(await resizeImage(files[i]))}catch(err){}}renderPhotoDraft();e.target.value=''};
  q('#kgMpListing').onsubmit=function(e){e.preventDefault();preview(c)};
}

function preview(c){
  var data={category:c.category,categoryLabel:c.categoryLabel,brand:c.brand,model:c.model,storage:c.storage,marketValue:c.price,salePrice:num(q('#kgSale').value),city:q('#kgCity').value,district:q('#kgDistrict').value,color:q('#kgColor').value,contactPhone:q('#kgPhone').value,description:q('#kgDesc').value,details:Array.isArray(c.details)?c.details:[],photos:photoDraft.slice(0,5)};
  q('#kgMpTitle').textContent='İlan Önizlemesi';q('#kgMpSub').textContent='Bilgileri kontrol et; ardından ilanını yayınla.';
  var thumb=data.photos[0]?'<div style="margin:0 0 12px"><img src="'+data.photos[0]+'" style="width:100%;max-height:260px;object-fit:contain;border-radius:12px;background:#f2f4f7"></div>':'';
  q('#kgMpBody').innerHTML=thumb+'<div class="kg-mp-device"><h3>'+esc([data.brand,data.model,data.storage].filter(Boolean).join(' '))+'</h3><p>'+esc(data.color)+' · '+esc(data.city)+', '+esc(data.district)+'</p></div><div class="kg-mp-summary"><div class="kg-mp-stat"><strong>'+tl(data.marketValue)+'</strong><span>KaçaGider piyasa değeri</span></div><div class="kg-mp-stat"><strong>'+tl(data.salePrice)+'</strong><span>İlan fiyatı</span></div></div><div id="kgPublishNote" class="kg-mp-note">Yayınladığında ilan tüm ziyaretçiler tarafından görülebilir.</div><div class="kg-mp-actions"><button type="button" class="kg-mp-btn secondary" id="kgMpEdit">Düzenle</button><button type="button" class="kg-mp-btn primary" id="kgMpPublish">İlanı Yayınla</button></div><p class="kg-mp-disclaimer">İlan fotoğrafları KaçaGider güvenli depolamasında saklanır.</p>';
  q('#kgMpEdit').onclick=function(){listing(c,data)};q('#kgMpPublish').onclick=function(){publishListing(data)};
}

async function publishListing(data){
  var button=q('#kgMpPublish'),note=q('#kgPublishNote');button.disabled=true;button.textContent='Yayınlanıyor…';note.classList.remove('error');note.textContent='İlan ve fotoğraflar yükleniyor…';
  try{
    var api=await ensureBackend();await api.ready;var listingRow=await api.publishListing(data);note.textContent='İlan yayınlandı. İlanlar sayfasına yönlendiriliyorsun…';setTimeout(function(){window.location.href='/ilanlar/?published='+encodeURIComponent(listingRow.id)},450);
  }catch(error){note.classList.add('error');note.textContent=error.message||'İlan yayınlanamadı.';button.disabled=false;button.textContent='İlanı Yayınla'}
}

function installHome(){if(q('#kgMpHome'))return;var home=q('#viewHome');if(!home)return;var grid=q('.kg-approved-category-grid',home)||q('.category-grid',home);if(!grid)return;var host=document.createElement('section');host.id='kgMpHome';host.className='kg-mp-home';host.innerHTML='<div class="kg-mp-home-card"><div class="kg-mp-home-copy"><span class="kg-mp-badge">ÜCRETSİZ İLAN</span><strong>Değerini öğren. <span>Doğru fiyata sat.</span></strong><p>Cihazının güncel piyasa değerini öğren; bilgilerin ilan formuna otomatik aktarılsın.</p><a class="kg-mp-listings-link" href="/ilanlar/">Yayındaki ilanları gör →</a></div><button class="kg-mp-home-action">Ücretsiz İlan Ver →<small>Önce cihazının değerini öğren</small></button></div>';grid.insertAdjacentElement('beforebegin',host);q('.kg-mp-home-action',host).onclick=choose}
function installCardActions(){var home=q('#viewHome')||document;qa('.kg-approved-category-grid [data-category],.category-grid [data-category]',home).forEach(function(card){if(card.querySelector('.kg-mp-card-action'))return;card.classList.add('kg-mp-card-ready');var action=document.createElement('span');action.className='kg-mp-card-action';action.textContent='Ücretsiz İlan Ver';action.setAttribute('role','button');action.setAttribute('tabindex','0');function go(e){e.preventDefault();e.stopPropagation();selectCategory(card.dataset.category)}action.addEventListener('click',go);action.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')go(e)});card.insertBefore(action,card.firstChild)})}
function removeNavAction(){var a=q('#kgMpNavAction');if(a)a.remove()}
function installResult(){if(q('#kgMpResultAction'))return;var card=q('.price-card');if(!card)return;var b=document.createElement('button');b.id='kgMpResultAction';b.className='kg-mp-result-action';b.textContent='Ücretsiz İlan Oluştur →';b.onclick=function(){beginListing(ctx())};card.appendChild(b)}
function sync(){installHome();removeNavAction();installCardActions();installResult();var b=q('#kgMpResultAction');if(b)b.classList.toggle('is-ready',price()>0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
ensureBackend().catch(function(error){console.error('KaçaGider marketplace backend:',error)});
})();