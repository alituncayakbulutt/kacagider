(function(){
"use strict";
if(window.__KG_MARKETPLACE_V4__) return;
window.__KG_MARKETPLACE_V4__=true;

var photos=[];
var pending=null;
var priceObserver=null;
var modalScrollY=0;
var COLORS=["Siyah","Beyaz","Gri","Gümüş","Altın","Mavi","Yeşil","Kırmızı","Mor","Pembe","Turuncu","Sarı","Diğer"];
var CATEGORIES=[["phone","📱","Telefon"],["tablet","▣","Tablet"],["computer","💻","Bilgisayar"],["watch","⌚","Akıllı Saat"],["console","🎮","Oyun Konsolu"]];

function q(s,r){return (r||document).querySelector(s);}
function qa(s,r){return Array.from((r||document).querySelectorAll(s));}
function esc(v){return String(v||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c];});}
function num(v){return Number(String(v||"").replace(/[^0-9]/g,""))||0;}
function money(v){return Number(v||0).toLocaleString("tr-TR")+" TL";}
function value(id){var e=q("#"+id);if(!e)return"";if(e.tagName==="SELECT"){var o=e.options[e.selectedIndex];return o?String(o.textContent||"").trim():"";}return String(e.value||"").trim();}
function price(){var e=q("#mainPrice");return e?num(e.textContent):0;}
function categoryKey(){
  var active=q('.category-card.active[data-category],.kg-approved-card.active[data-category],[data-category].active');
  var key=active&&active.dataset?active.dataset.category:"";
  var map={phone:"phone",telefon:"phone",tablet:"tablet",computer:"computer",bilgisayar:"computer",watch:"watch","akilli-saat":"watch",console:"console","oyun-konsolu":"console"};
  if(map[key])return map[key];
  var label=value("selectedCategoryName")||(q("#selectedCategoryName")?q("#selectedCategoryName").textContent.trim():"");
  return {"Telefon":"phone","Tablet":"tablet","Bilgisayar":"computer","Akıllı Saat":"watch","Oyun Konsolu":"console"}[label]||"phone";
}
function categoryLabel(k){return {phone:"Telefon",tablet:"Tablet",computer:"Bilgisayar",watch:"Akıllı Saat",console:"Oyun Konsolu"}[k]||"Telefon";}
function fallbackDetails(){
  var out=[];function add(l,v){v=String(v||"").trim();if(v&&v!=="Seçiniz")out.push({label:l,value:v});}
  if(categoryKey()==="phone"){
    add("Pil Sağlığı",value("battery"));add("Ekran Durumu",value("screen"));add("Face ID",value("faceid"));
    [["deviceRegistration","Cihaz Kaydı"],["scratchCount","Çizik Sayısı"],["scratchDepth","Çizik Derinliği"],["protector","Piksel Atması"],["dent","Kasa Ezik / Darbe"],["surface","Kasa Yüzeyi"],["corners","Köşeler"],["backGlass","Arka Cam Durumu"]].forEach(function(x){var a=q('[data-group="'+x[0]+'"] .option.active');if(a)add(x[1],a.textContent);});
    try{if(typeof window.getChangedPartsSummary==="function")add("Değişen Parça / İşlem Geçmişi",window.getChangedPartsSummary());}catch(_e){}
  }else{
    add("Kondisyon",value("genericCondition"));add("Çalışma Durumu",value("genericWorking"));add("Kutu / Aksesuar",value("genericAccessories"));
  }
  return out;
}
function context(){
  var key=categoryKey(),generic=key!=="phone";
  var details=typeof window.KGMarketplaceCollectDetails==="function"?window.KGMarketplaceCollectDetails():fallbackDetails();
  return {category:key,categoryLabel:categoryLabel(key),brand:value(generic?"genericBrand":"phoneBrand"),model:value(generic?"genericModel":"model"),storage:value(generic?"genericStorage":"storage"),marketValue:price(),details:details};
}

function style(){
  if(q("#kgMarketplaceV4Style"))return;
  var s=document.createElement("style");s.id="kgMarketplaceV4Style";s.textContent=`
  .kg-mp-overlay{position:fixed;inset:0;z-index:999999;background:rgba(7,20,38,.68);display:none;align-items:center;justify-content:center;padding:18px}.kg-mp-overlay.open{display:flex}.kg-mp-modal{width:min(820px,100%);max-height:92vh;overflow:auto;background:#fff;color:#111827;border-radius:20px;box-shadow:0 28px 80px rgba(2,6,23,.32)}.kg-mp-head{display:flex;justify-content:space-between;gap:15px;padding:20px 22px;border-bottom:1px solid #e5e7eb}.kg-mp-head h2{margin:0;font-size:23px}.kg-mp-head p{margin:5px 0 0;color:#667085;font-size:12px}.kg-mp-close{width:38px;height:38px;border:0;border-radius:10px;background:#f2f4f7;font-size:20px;cursor:pointer}.kg-mp-body{padding:20px 22px}.kg-mp-note{margin-bottom:15px;padding:11px 13px;border:1px solid #bbf7d0;border-radius:11px;background:#f0fdf4;color:#166534;font-size:12px;line-height:1.5}.kg-mp-note.error{border-color:#fecaca;background:#fff1f2;color:#b42318}.kg-mp-tabs{display:grid;grid-template-columns:1fr 1fr;background:#f2f4f7;border-radius:11px;padding:4px;margin-bottom:15px}.kg-mp-tab{border:0;background:transparent;border-radius:8px;padding:10px;font-weight:850;color:#667085;cursor:pointer}.kg-mp-tab.active{background:#fff;color:#111827}.kg-mp-category-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.kg-mp-category{border:1px solid #e5e7eb;border-radius:13px;background:#fff;padding:15px 8px;text-align:center;cursor:pointer}.kg-mp-category i{display:block;font-style:normal;font-size:25px;margin-bottom:7px}.kg-mp-category strong{display:block;font-size:12px}.kg-mp-category small{display:block;color:#667085;font-size:9px;margin-top:3px}.kg-mp-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.kg-mp-field{display:grid;gap:6px;margin-bottom:12px}.kg-mp-field label{font-size:12px;font-weight:850;color:#475467}.kg-mp-field input,.kg-mp-field select,.kg-mp-field textarea{width:100%;min-height:42px;padding:10px 12px;border:1px solid #d0d5dd;border-radius:9px;background:#fff;color:#101828;font:inherit}.kg-mp-field textarea{min-height:100px}.kg-mp-field small{font-size:10px;color:#667085}.kg-mp-upload{border:1px dashed #98a2b3;border-radius:12px;padding:14px;background:#fbfcfe}.kg-mp-photo-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:10px}.kg-mp-photo{position:relative;aspect-ratio:1;border-radius:9px;overflow:hidden;border:1px solid #e5e7eb;background:#eef2f6}.kg-mp-photo img{width:100%;height:100%;object-fit:cover}.kg-mp-photo button{position:absolute;right:4px;top:4px;width:24px;height:24px;border:0;border-radius:50%;background:rgba(15,23,42,.8);color:#fff;cursor:pointer}.kg-mp-actions{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap;margin-top:15px}.kg-mp-btn{border:0;border-radius:10px;padding:11px 15px;font-weight:900;cursor:pointer}.kg-mp-btn.primary{background:#16a34a;color:#fff}.kg-mp-btn.secondary{background:#f2f4f7;color:#344054}.kg-mp-btn:disabled{opacity:.55;cursor:not-allowed}.kg-mp-device{padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#fbfcfe;margin-bottom:14px}.kg-mp-device h3{margin:0 0 5px}.kg-mp-device p{margin:0;color:#667085;font-size:12px}.kg-mp-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.kg-mp-stat{padding:13px;border:1px solid #e5e7eb;border-radius:11px;background:#f8fafc;text-align:center}.kg-mp-stat strong{display:block;color:#15803d;font-size:20px}.kg-mp-result-action{width:100%;min-height:52px;margin-top:12px;padding:11px 14px;border:0;border-radius:11px;background:#16a34a;color:#fff;font-size:13px;font-weight:900;cursor:pointer;display:none}.kg-mp-result-action.ready{display:block}.kg-mp-card-action{position:absolute;top:18px;left:50%;transform:translateX(-50%);z-index:5;display:inline-flex;align-items:center;justify-content:center;min-width:132px;height:34px;padding:0 15px;border-radius:10px;background:#16a34a;color:#fff;font-size:12px;font-weight:900;white-space:nowrap;cursor:pointer}.kg-mp-card-ready{position:relative!important;padding-top:62px!important}@media(max-width:720px){.kg-mp-grid,.kg-mp-summary{grid-template-columns:1fr}.kg-mp-category-grid{grid-template-columns:repeat(2,1fr)}.kg-mp-photo-grid{grid-template-columns:repeat(3,1fr)}}`;
  document.head.appendChild(s);
}
function overlay(){var o=q("#kgMpOverlay");if(o)return o;o=document.createElement("div");o.id="kgMpOverlay";o.className="kg-mp-overlay";o.innerHTML='<section class="kg-mp-modal"><div class="kg-mp-head"><div><h2 id="kgMpTitle"></h2><p id="kgMpSub"></p></div><button type="button" class="kg-mp-close" aria-label="Kapat">×</button></div><div class="kg-mp-body" id="kgMpBody"></div></section>';document.body.appendChild(o);q(".kg-mp-close",o).onclick=close;o.addEventListener("click",function(e){if(e.target===o)close();});return o;}
function open(){modalScrollY=window.scrollY||window.pageYOffset||0;overlay().classList.add("open");document.body.style.overflow="hidden";}
function close(){var o=q("#kgMpOverlay");if(o)o.classList.remove("open");document.body.style.overflow="";}
function modal(title,sub,body){open();q("#kgMpTitle").textContent=title;q("#kgMpSub").textContent=sub||"";q("#kgMpBody").innerHTML=body;}

function ensureBackend(){
  if(window.KGMarketplaceSupabase)return Promise.resolve(window.KGMarketplaceSupabase);
  return new Promise(function(resolve,reject){
    var existing=q('script[data-kg-marketplace-backend]');
    if(!existing){existing=document.createElement("script");existing.src="/assets/supabase-marketplace.js";existing.async=true;existing.dataset.kgMarketplaceBackend="1";document.head.appendChild(existing);}
    var tries=0,t=setInterval(function(){tries++;if(window.KGMarketplaceSupabase){clearInterval(t);resolve(window.KGMarketplaceSupabase);}else if(tries>=100){clearInterval(t);reject(new Error("Marketplace veri katmanı yüklenemedi."));}},50);
    existing.addEventListener("error",function(){clearInterval(t);reject(new Error("Marketplace veri katmanı yüklenemedi."));},{once:true});
  });
}
function selectCategory(key){
  var card=q('[data-category="'+key+'"]'),view=q("#viewHome"),valuation=q("#valuationArea"),selected=q("#selectedCategoryName");
  var labels={phone:"Telefon",tablet:"Tablet",computer:"Bilgisayar",watch:"Akıllı Saat",console:"Oyun Konsolu"};
  var same=view&&view.classList.contains("category-selected")&&valuation&&getComputedStyle(valuation).display!=="none"&&selected&&String(selected.textContent||"").trim()===labels[key];
  if(same){
    var html=document.documentElement,previous=html.style.scrollBehavior;
    html.style.scrollBehavior="auto";
    window.scrollTo(0,modalScrollY);
    html.style.scrollBehavior=previous;
    return;
  }
  if(card)card.click();
}
function choose(){modal("Ne satmak istiyorsun?","Önce cihazının güncel piyasa değerini öğren.",'<div class="kg-mp-note">Piyasa değeri sorgulama ücretsizdir. İlan yayınlamak için üyelik gerekir.</div><div class="kg-mp-category-grid">'+CATEGORIES.map(function(c){return '<button type="button" class="kg-mp-category" data-cat="'+c[0]+'"><i>'+c[1]+'</i><strong>'+c[2]+'</strong><small>Değerini öğren</small></button>';}).join("")+'</div>');qa("[data-cat]",q("#kgMpBody")).forEach(function(b){b.onclick=function(){close();selectCategory(b.dataset.cat);};});}

async function beginListing(c){pending=c||context();if(!pending.marketValue){alert("Önce cihazının piyasa değerini hesapla.");return;}try{var api=await ensureBackend();await api.ready;var user=await api.getUser();if(user){listing(pending);return;}auth("register");}catch(e){alert("İlan sistemi bağlanırken hata oluştu: "+(e.message||e));}}
function auth(mode){
  var register=mode!=="login";
  modal(register?"Ücretsiz Üye Ol":"Giriş Yap","İlan yayınlamak ve ilanlarını yönetmek için hesabını kullan.",'<div class="kg-mp-tabs"><button type="button" class="kg-mp-tab '+(register?"active":"")+'" data-mode="register">Üye Ol</button><button type="button" class="kg-mp-tab '+(!register?"active":"")+'" data-mode="login">Giriş Yap</button></div><div id="kgAuthNote" class="kg-mp-note">E-posta adresin hesap doğrulama ve güvenli giriş için kullanılır.</div><form id="kgMpAuth">'+(register?'<div class="kg-mp-field"><label>Ad Soyad</label><input id="kgAuthName" autocomplete="name" required></div>':"")+'<div class="kg-mp-field"><label>E-posta</label><input id="kgAuthEmail" type="email" autocomplete="email" required></div><div class="kg-mp-field"><label>Şifre</label><input id="kgAuthPassword" type="password" minlength="8" autocomplete="'+(register?"new-password":"current-password")+'" required><small>En az 8 karakter.</small></div><div class="kg-mp-actions"><button type="submit" class="kg-mp-btn primary" id="kgAuthSubmit">'+(register?"Ücretsiz Üye Ol":"Giriş Yap")+'</button></div></form>');
  qa("[data-mode]",q("#kgMpBody")).forEach(function(b){b.onclick=function(){auth(b.dataset.mode);};});
  q("#kgMpAuth").onsubmit=async function(e){e.preventDefault();var submit=q("#kgAuthSubmit"),note=q("#kgAuthNote");submit.disabled=true;try{var api=await ensureBackend();await api.ready;var result=register?await api.signUp({fullName:value("kgAuthName"),email:value("kgAuthEmail"),password:value("kgAuthPassword")}):await api.signIn({email:value("kgAuthEmail"),password:value("kgAuthPassword")});if(result&&result.error)throw result.error;if(register&&!(result.data&&result.data.session)){note.textContent="Üyeliğin oluşturuldu. E-postana gelen doğrulama bağlantısını aç, ardından Giriş Yap sekmesinden devam et.";submit.disabled=false;return;}listing(pending||context());}catch(err){note.className="kg-mp-note error";note.textContent=err.message||"Giriş işlemi tamamlanamadı.";submit.disabled=false;}};
}
function resize(file){return new Promise(function(resolve,reject){if(!/^image\/(jpeg|png|webp)$/i.test(file.type)){reject(new Error("Geçersiz görsel"));return;}var r=new FileReader();r.onerror=reject;r.onload=function(){var img=new Image();img.onerror=reject;img.onload=function(){var max=1400,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale)),c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);resolve(c.toDataURL("image/jpeg",.78));};img.src=r.result;};r.readAsDataURL(file);});}
function renderPhotos(){var host=q("#kgPhotoPreview");if(!host)return;host.innerHTML=photos.map(function(src,i){return '<div class="kg-mp-photo"><img src="'+src+'" alt="İlan fotoğrafı '+(i+1)+'"><button type="button" data-rm="'+i+'">×</button></div>';}).join("");qa("[data-rm]",host).forEach(function(b){b.onclick=function(){photos.splice(Number(b.dataset.rm),1);renderPhotos();};});}
function listing(c,old){c=c||context();old=old||{};photos=Array.isArray(old.photos)?old.photos.slice(0,5):photos.slice(0,5);var opts='<option value="">Renk seçiniz</option>'+COLORS.map(function(x){return '<option value="'+esc(x)+'" '+(old.color===x?"selected":"")+'>'+esc(x)+'</option>';}).join("");modal("İlanını Oluştur","Değerleme bilgilerin otomatik taşındı.",'<div class="kg-mp-note">KaçaGider piyasa değeri ile ilan fiyatın ayrı tutulur.</div><div class="kg-mp-device"><h3>'+esc([c.brand,c.model,c.storage].filter(Boolean).join(" "))+'</h3><p>KaçaGider piyasa değeri: <strong>'+money(c.marketValue)+'</strong></p></div><form id="kgMpListing"><div class="kg-mp-grid"><div class="kg-mp-field"><label>Şehir</label><input id="kgCity" value="'+esc(old.city||"")+'" required></div><div class="kg-mp-field"><label>İlçe</label><input id="kgDistrict" value="'+esc(old.district||"")+'" required></div><div class="kg-mp-field"><label>Renk</label><select id="kgColor" required>'+opts+'</select></div><div class="kg-mp-field"><label>Satış Fiyatın</label><input id="kgSale" type="number" min="1" value="'+esc(old.salePrice||c.marketValue||"")+'" required></div><div class="kg-mp-field"><label>İletişim Telefonu</label><input id="kgPhone" type="tel" value="'+esc(old.contactPhone||"")+'" placeholder="05xx xxx xx xx" required></div></div><div class="kg-mp-field"><label>Fotoğraflar</label><div class="kg-mp-upload"><input id="kgPhotos" type="file" accept="image/jpeg,image/png,image/webp" multiple><small>En fazla 5 fotoğraf; yüklemeden önce optimize edilir.</small><div class="kg-mp-photo-grid" id="kgPhotoPreview"></div></div></div><div class="kg-mp-field"><label>Açıklama</label><textarea id="kgDesc">'+esc(old.description||"")+'</textarea></div><div class="kg-mp-actions"><button type="submit" class="kg-mp-btn primary">İlan Önizlemesini Aç</button></div></form>');renderPhotos();q("#kgPhotos").onchange=async function(e){var files=Array.from(e.target.files||[]).slice(0,Math.max(0,5-photos.length));for(var i=0;i<files.length;i++){try{photos.push(await resize(files[i]));}catch(_e){}}renderPhotos();e.target.value="";};q("#kgMpListing").onsubmit=function(e){e.preventDefault();preview(c);};}
function listingData(c){return {category:c.category,brand:c.brand,model:c.model,storage:c.storage,marketValue:c.marketValue,salePrice:num(q("#kgSale").value),city:value("kgCity"),district:value("kgDistrict"),color:value("kgColor"),contactPhone:value("kgPhone"),description:value("kgDesc"),details:Array.isArray(c.details)?c.details:[],photos:photos.slice(0,5)};}
function preview(c){var d=listingData(c);if(!d.salePrice||!d.city||!d.district||!d.color||!d.contactPhone){alert("Lütfen zorunlu ilan bilgilerini tamamla.");return;}modal("İlan Önizlemesi","Bilgileri kontrol et ve yayınla.",(d.photos[0]?'<div style="margin-bottom:12px"><img src="'+d.photos[0]+'" alt="" style="width:100%;max-height:280px;object-fit:contain;border-radius:12px;background:#f2f4f7"></div>':"")+'<div class="kg-mp-device"><h3>'+esc([d.brand,d.model,d.storage].filter(Boolean).join(" "))+'</h3><p>'+esc([d.color,d.city,d.district].join(" · "))+'</p></div><div class="kg-mp-summary"><div class="kg-mp-stat"><strong>'+money(d.marketValue)+'</strong><span>KaçaGider piyasa değeri</span></div><div class="kg-mp-stat"><strong>'+money(d.salePrice)+'</strong><span>İlan fiyatı</span></div></div><div id="kgPublishNote"></div><div class="kg-mp-actions"><button type="button" class="kg-mp-btn secondary" id="kgEdit">Düzenle</button><button type="button" class="kg-mp-btn primary" id="kgPublish">İlanı Yayınla</button></div>');q("#kgEdit").onclick=function(){listing(c,d);};q("#kgPublish").onclick=async function(){var b=this,n=q("#kgPublishNote");b.disabled=true;b.textContent="Yayınlanıyor…";try{var api=await ensureBackend();await api.ready;var published=await api.publishListing(d);if(typeof window.gtag==="function")window.gtag("event","listing_published",{listing_id:published.id,category:d.category,brand:d.brand,model:d.model,storage:d.storage,seller_price:d.salePrice,market_value:d.marketValue,currency:"TRY"});location.href="/ilan/?id="+encodeURIComponent(published.id);}catch(err){console.error(err);n.className="kg-mp-note error";n.textContent=err.message||"İlan yayınlanamadı.";b.disabled=false;b.textContent="İlanı Yayınla";}};}

function installCards(){var home=q("#viewHome")||document;qa(".kg-approved-category-grid [data-category],.category-grid [data-category]",home).forEach(function(card){if(q(".kg-mp-card-action",card))return;card.classList.add("kg-mp-card-ready");var a=document.createElement("span");a.className="kg-mp-card-action";a.textContent="Ücretsiz İlan Ver";a.tabIndex=0;a.setAttribute("role","button");function go(e){e.preventDefault();e.stopPropagation();selectCategory(card.dataset.category);}a.onclick=go;a.onkeydown=function(e){if(e.key==="Enter"||e.key===" ")go(e);};card.insertBefore(a,card.firstChild);});}
function updateResult(){var b=q("#kgMpResultAction");if(b)b.classList.toggle("ready",price()>0);}
function installResult(){var card=q(".price-card");if(!card)return;var b=q("#kgMpResultAction");if(!b){b=document.createElement("button");b.id="kgMpResultAction";b.type="button";b.className="kg-mp-result-action";b.textContent="Ücretsiz İlan Oluştur →";b.onclick=function(){beginListing(context());};card.appendChild(b);}updateResult();var p=q("#mainPrice");if(p){priceObserver=new MutationObserver(updateResult);priceObserver.observe(p,{childList:true,characterData:true,subtree:true});}}
function boot(){style();installCards();installResult();ensureBackend().catch(function(e){console.warn("KaçaGider marketplace:",e);});}
window.KGMarketplaceUI={choose:choose,beginListing:beginListing,selectCategory:selectCategory,refresh:updateResult};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
