(function(){
  "use strict";
  if(window.__KG_MARKETPLACE_TEST__) return;
  window.__KG_MARKETPLACE_TEST__=true;

  var style=document.createElement("style");
  style.textContent=`
    .kg-mp-home{max-width:1408px;margin:18px auto 26px;padding:0 30px}
    .kg-mp-home-card{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:26px;padding:24px 28px;border:1px solid #b7e8c9;border-radius:20px;background:radial-gradient(circle at 6% 0%,rgba(34,197,94,.16),transparent 35%),linear-gradient(135deg,#f6fff8,#fff 72%);box-shadow:0 10px 28px rgba(15,23,42,.06)}
    .kg-mp-home-card:after{content:"";position:absolute;right:-65px;top:-80px;width:230px;height:230px;border-radius:50%;background:rgba(34,197,94,.06);pointer-events:none}
    .kg-mp-badge{display:inline-flex;width:max-content;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;background:#dcfce7;color:#15803d;font-size:11px;font-weight:900;margin-bottom:8px}
    .kg-mp-home-copy strong{display:block;font-size:25px;line-height:1.13;letter-spacing:-.5px;color:#111827;margin-bottom:7px}.kg-mp-home-copy strong span{color:#16a34a}
    .kg-mp-home-copy p{max-width:760px;margin:0;color:#667085;font-size:13px;line-height:1.55}
    .kg-mp-benefits{display:flex;gap:18px;flex-wrap:wrap;margin-top:13px;color:#475467;font-size:11px;font-weight:800}.kg-mp-benefits span:before{content:"✓";margin-right:5px;color:#16a34a;font-weight:950}
    .kg-mp-home-action,.kg-mp-result-action,.kg-mp-nav-action{border:0;background:linear-gradient(135deg,#0fa94c,#19bd59);color:#fff;font-weight:900;cursor:pointer;box-shadow:0 9px 22px rgba(22,163,74,.18)}
    .kg-mp-home-action{position:relative;z-index:1;min-width:225px;padding:15px 19px;border-radius:13px;font-size:15px}.kg-mp-home-action small{display:block;font-size:10px;font-weight:650;opacity:.9;margin-top:3px}
    .kg-mp-result-action{width:100%;min-height:54px;margin-top:12px;padding:11px 14px;border-radius:11px;font-size:13px;display:none}.kg-mp-result-action.is-ready{display:block}
    .kg-mp-nav-action{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 13px;border-radius:10px;font-size:12px;text-decoration:none;white-space:nowrap;box-shadow:none}
    .kg-mp-home-action:hover,.kg-mp-result-action:hover,.kg-mp-nav-action:hover{filter:brightness(1.04);transform:translateY(-1px)}

    .kg-mp-overlay{position:fixed;inset:0;z-index:999999;background:rgba(7,20,38,.65);display:none;align-items:center;justify-content:center;padding:18px}.kg-mp-overlay.is-open{display:flex}
    .kg-mp-modal{width:min(790px,100%);max-height:92vh;overflow:auto;background:#fff;color:#111827;border:1px solid #e5e7eb;border-radius:20px;box-shadow:0 28px 80px rgba(2,6,23,.32)}
    .kg-mp-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;padding:20px 22px;border-bottom:1px solid #e5e7eb}.kg-mp-head h2{margin:0;font-size:23px;letter-spacing:-.4px}.kg-mp-head p{margin:5px 0 0;color:#667085;font-size:12px}
    .kg-mp-close{width:38px;height:38px;border:0;border-radius:10px;background:#f2f4f7;color:#344054;font-size:20px;cursor:pointer}.kg-mp-body{padding:20px 22px}
    .kg-mp-tabs{display:grid;grid-template-columns:1fr 1fr;background:#f2f4f7;border-radius:11px;padding:4px;margin-bottom:16px}.kg-mp-tab{border:0;background:transparent;border-radius:8px;padding:10px;font-weight:850;color:#667085;cursor:pointer}.kg-mp-tab.active{background:#fff;color:#111827;box-shadow:0 2px 8px rgba(15,23,42,.08)}
    .kg-mp-note{margin-bottom:15px;padding:11px 13px;border:1px solid #bbf7d0;border-radius:11px;background:#f0fdf4;color:#166534;font-size:12px;line-height:1.5}
    .kg-mp-category-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.kg-mp-category{border:1px solid #e5e7eb;border-radius:13px;background:#fff;padding:15px 8px;text-align:center;cursor:pointer;font:inherit}.kg-mp-category:hover{border-color:#86efac;background:#f7fff9}.kg-mp-category i{display:block;font-style:normal;font-size:25px;margin-bottom:7px}.kg-mp-category strong{display:block;font-size:12px}.kg-mp-category small{display:block;margin-top:3px;color:#667085;font-size:9px}
    .kg-mp-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.kg-mp-field{display:grid;gap:6px;margin-bottom:12px}.kg-mp-field label{font-size:12px;font-weight:850;color:#475467}.kg-mp-field input,.kg-mp-field select,.kg-mp-field textarea{width:100%;min-height:42px;padding:10px 12px;border:1px solid #d0d5dd;border-radius:9px;background:#fff;color:#101828;font:inherit}.kg-mp-field textarea{min-height:100px;resize:vertical}.kg-mp-field input:focus,.kg-mp-field select:focus,.kg-mp-field textarea:focus{outline:none;border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.10)}
    .kg-mp-actions{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap;margin-top:15px}.kg-mp-btn{border:0;border-radius:10px;padding:11px 15px;font-weight:900;cursor:pointer}.kg-mp-btn.primary{background:#16a34a;color:#fff}.kg-mp-btn.secondary{background:#f2f4f7;color:#344054}
    .kg-mp-device{padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#fbfcfe;margin-bottom:14px}.kg-mp-device h3{margin:0 0 5px;font-size:17px}.kg-mp-device p{margin:0;color:#667085;font-size:12px}
    .kg-mp-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.kg-mp-stat{padding:13px;border:1px solid #e5e7eb;border-radius:11px;background:#f8fafc;text-align:center}.kg-mp-stat strong{display:block;color:#15803d;font-size:20px}.kg-mp-disclaimer{font-size:11px;color:#667085;text-align:center;margin-top:10px}

    html[data-theme="dark"] .kg-mp-home-card{background:linear-gradient(135deg,#13271d,#172235 72%);border-color:#285e3e}html[data-theme="dark"] .kg-mp-home-copy strong{color:#edf3fb}html[data-theme="dark"] .kg-mp-home-copy p,html[data-theme="dark"] .kg-mp-benefits{color:#b7c3d5}
    html[data-theme="dark"] .kg-mp-modal{background:#172235;color:#edf3fb;border-color:#2d3c52}html[data-theme="dark"] .kg-mp-head{border-color:#2d3c52}html[data-theme="dark"] .kg-mp-head p{color:#b7c3d5}html[data-theme="dark"] .kg-mp-close,html[data-theme="dark"] .kg-mp-tabs,html[data-theme="dark"] .kg-mp-btn.secondary{background:#111c2d;color:#edf3fb}html[data-theme="dark"] .kg-mp-tab.active{background:#223048;color:#fff}
    html[data-theme="dark"] .kg-mp-field label{color:#d8e1ee}html[data-theme="dark"] .kg-mp-field input,html[data-theme="dark"] .kg-mp-field select,html[data-theme="dark"] .kg-mp-field textarea{background:#111c2d;border-color:#34445b;color:#edf3fb}html[data-theme="dark"] .kg-mp-device,html[data-theme="dark"] .kg-mp-stat,html[data-theme="dark"] .kg-mp-category{background:#111c2d;border-color:#2d3c52}html[data-theme="dark"] .kg-mp-category small{color:#b7c3d5}

    @media(max-width:1050px){.kg-mp-nav-action{display:none}}
    @media(max-width:900px){.kg-mp-home-card{grid-template-columns:1fr}.kg-mp-home-action{width:100%}.kg-mp-category-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:720px){.kg-mp-home{padding:0 12px;margin-top:12px}.kg-mp-home-card{padding:16px;border-radius:15px}.kg-mp-home-copy strong{font-size:19px}.kg-mp-benefits{gap:8px 13px}.kg-mp-grid,.kg-mp-summary{grid-template-columns:1fr}.kg-mp-actions{display:grid;grid-template-columns:1fr}.kg-mp-btn{width:100%}.kg-mp-category-grid{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);

  function qs(s,r){return (r||document).querySelector(s)}
  function qsa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function digits(v){var n=Number(String(v||"").replace(/[^0-9]/g,""));return Number.isFinite(n)?n:0}
  function currentPrice(){var e=qs("#mainPrice");return e?digits(e.textContent):0}
  function selectedText(id){var e=qs("#"+id);if(!e)return"";if(e.tagName==="SELECT"){var o=e.options[e.selectedIndex];return o?String(o.textContent||"").trim():""}return String(e.value||"").trim()}
  function context(){var generic=qs("#genericPanel")&&getComputedStyle(qs("#genericPanel")).display!=="none";return{brand:selectedText(generic?"genericBrand":"phoneBrand"),model:selectedText(generic?"genericModel":"model"),storage:selectedText(generic?"genericStorage":"storage"),price:currentPrice()}}
  function esc(v){return String(v==null?"":v).replace(/[&<>\"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]})}
  function tl(v){return v?Number(v).toLocaleString("tr-TR")+" TL":"—"}

  function ensureOverlay(){
    if(qs("#kgMpOverlay"))return qs("#kgMpOverlay");
    var o=document.createElement("div");o.id="kgMpOverlay";o.className="kg-mp-overlay";
    o.innerHTML='<section class="kg-mp-modal" role="dialog" aria-modal="true"><div class="kg-mp-head"><div><h2 id="kgMpTitle">Ücretsiz İlan Oluştur</h2><p id="kgMpSub"></p></div><button class="kg-mp-close" type="button" aria-label="Kapat">×</button></div><div class="kg-mp-body" id="kgMpBody"></div></section>';
    document.body.appendChild(o);qs(".kg-mp-close",o).addEventListener("click",close);o.addEventListener("click",function(e){if(e.target===o)close()});return o
  }
  function openOverlay(){ensureOverlay().classList.add("is-open");document.body.style.overflow="hidden"}
  function close(){var o=qs("#kgMpOverlay");if(o)o.classList.remove("is-open");document.body.style.overflow=""}

  var categories=[
    {key:"phone",icon:"📱",name:"Telefon",sub:"iPhone, Samsung, Xiaomi"},
    {key:"tablet",icon:"▣",name:"Tablet",sub:"iPad, Galaxy Tab"},
    {key:"computer",icon:"💻",name:"Bilgisayar",sub:"MacBook, Windows"},
    {key:"watch",icon:"⌚",name:"Akıllı Saat",sub:"Apple Watch ve diğerleri"},
    {key:"console",icon:"🎮",name:"Oyun Konsolu",sub:"PlayStation, Xbox"}
  ];

  function renderCategoryChoice(){
    openOverlay();qs("#kgMpTitle").textContent="Ne satmak istiyorsun?";qs("#kgMpSub").textContent="Önce cihazının değerini öğren; ilan bilgilerin otomatik doldurulsun.";
    var b=qs("#kgMpBody");b.innerHTML='<div class="kg-mp-note">Fiyat sorgulama üyeliksiz ve ücretsiz kalır. İlan yayınlamak istediğinde üyelik gerekir.</div><div class="kg-mp-category-grid">'+categories.map(function(c){return '<button type="button" class="kg-mp-category" data-category="'+c.key+'"><i>'+c.icon+'</i><strong>'+c.name+'</strong><small>'+c.sub+'</small></button>'}).join("")+'</div>';
    qsa(".kg-mp-category",b).forEach(function(btn){btn.addEventListener("click",function(){close();var card=qs('[data-category="'+btn.dataset.category+'"]');if(card)card.click();setTimeout(function(){var f=qs(".form-panel")||qs("#valuationArea")||qs(".layout");if(f)f.scrollIntoView({behavior:"smooth",block:"start"})},240)})})
  }

  function openAuth(){openOverlay();renderAuth("register")}
  function renderAuth(mode){
    qs("#kgMpTitle").textContent=mode==="register"?"Ücretsiz Üye Ol":"Giriş Yap";qs("#kgMpSub").textContent="Fiyat sorgulama üyeliksiz kalır; üyelik yalnızca ilan yayınlamak için gerekir.";
    var b=qs("#kgMpBody");b.innerHTML='<div class="kg-mp-tabs"><button class="kg-mp-tab '+(mode==="register"?"active":"")+'" data-mode="register" type="button">Üye Ol</button><button class="kg-mp-tab '+(mode==="login"?"active":"")+'" data-mode="login" type="button">Giriş Yap</button></div><div class="kg-mp-note">Bu test branch prototipidir. Henüz gerçek hesap oluşturmaz ve veritabanına kayıt yapmaz.</div><form id="kgMpAuth"><div class="kg-mp-field" '+(mode==="login"?'style="display:none"':'')+'><label>Ad Soyad</label><input value="Ahmet Kaya"></div><div class="kg-mp-field"><label>E-posta</label><input type="email" value="ahmet@example.com" required></div><div class="kg-mp-field"><label>Şifre</label><input type="password" value="12345678" minlength="6" required></div><div class="kg-mp-actions"><button type="button" class="kg-mp-btn secondary" data-close>Vazgeç</button><button type="submit" class="kg-mp-btn primary">'+(mode==="register"?"Üye Ol ve Devam Et":"Giriş Yap ve Devam Et")+'</button></div></form>';
    qsa(".kg-mp-tab",b).forEach(function(x){x.addEventListener("click",function(){renderAuth(x.dataset.mode)})});qs("[data-close]",b).addEventListener("click",close);qs("#kgMpAuth",b).addEventListener("submit",function(e){e.preventDefault();renderListing()})
  }

  function renderListing(){
    var c=context();qs("#kgMpTitle").textContent="İlanını Oluştur";qs("#kgMpSub").textContent="Değerleme bilgilerini otomatik taşıdık. Eksik alanları tamamla.";
    var b=qs("#kgMpBody");b.innerHTML='<div class="kg-mp-note">KaçaGider tahmini değeri satıcı ilan fiyatından ayrı kalır. Tahmini değer herhangi bir alıcı teklifine göre değişmez.</div><div class="kg-mp-device"><h3>'+esc([c.brand,c.model,c.storage].filter(Boolean).join(" ")||"Seçili cihaz")+'</h3><p>KaçaGider tahmini son kullanıcı değeri: <strong>'+tl(c.price)+'</strong></p></div><form id="kgMpListing"><div class="kg-mp-grid"><div class="kg-mp-field"><label>Marka</label><input value="'+esc(c.brand)+'" readonly></div><div class="kg-mp-field"><label>Model</label><input value="'+esc(c.model)+'" readonly></div><div class="kg-mp-field"><label>Hafıza</label><input value="'+esc(c.storage)+'" readonly></div><div class="kg-mp-field"><label>Şehir</label><select id="kgMpCity"><option>İstanbul</option><option>Ankara</option><option>İzmir</option><option>Bursa</option><option>Antalya</option></select></div><div class="kg-mp-field"><label>İlçe</label><input id="kgMpDistrict" value="Kadıköy" required></div><div class="kg-mp-field"><label>Satış Fiyatın (TL)</label><input id="kgMpSalePrice" type="number" min="1" value="'+(c.price||"")+'" required></div></div><div class="kg-mp-field"><label>Açıklama</label><textarea id="kgMpDescription">Cihaz temiz ve kullanıma hazırdır.</textarea></div><div class="kg-mp-field"><label>Fotoğraflar</label><input type="file" accept="image/*" multiple></div><div class="kg-mp-actions"><button type="button" class="kg-mp-btn secondary" id="kgMpBack">Geri</button><button type="submit" class="kg-mp-btn primary">İlan Önizlemesini Aç</button></div></form>';
    qs("#kgMpBack").addEventListener("click",function(){renderAuth("register")});qs("#kgMpListing").addEventListener("submit",function(e){e.preventDefault();renderPreview({brand:c.brand,model:c.model,storage:c.storage,price:c.price,city:qs("#kgMpCity").value,district:qs("#kgMpDistrict").value,salePrice:Number(qs("#kgMpSalePrice").value||0),description:qs("#kgMpDescription").value})})
  }

  function renderPreview(d){
    qs("#kgMpTitle").textContent="İlan Önizlemesi";qs("#kgMpSub").textContent="FAZ 1 akışının son adımı. Henüz gerçek ilan yayınlanmaz.";
    qs("#kgMpBody").innerHTML='<div class="kg-mp-note">KaçaGider tahmini değeri ile satıcının ilan fiyatı her zaman ayrı gösterilir.</div><div class="kg-mp-device"><h3>'+esc([d.brand,d.model,d.storage].filter(Boolean).join(" "))+'</h3><p>'+esc(d.city)+', '+esc(d.district)+'</p></div><div class="kg-mp-summary"><div class="kg-mp-stat"><strong>'+tl(d.price)+'</strong><span>KaçaGider tahmini</span></div><div class="kg-mp-stat"><strong>'+tl(d.salePrice)+'</strong><span>İlan fiyatı</span></div></div><div class="kg-mp-field"><label>Açıklama</label><textarea readonly>'+esc(d.description)+'</textarea></div><div class="kg-mp-actions"><button type="button" class="kg-mp-btn secondary" id="kgMpEdit">Düzenle</button><button type="button" class="kg-mp-btn primary" id="kgMpDone">Demo İlanı Tamamla</button></div><p class="kg-mp-disclaimer">KaçaGider alıcı ve satıcıyı buluşturur; bu test sürümü ödeme, mesaj veya gerçek ilan kaydı oluşturmaz.</p>';
    qs("#kgMpEdit").addEventListener("click",renderListing);qs("#kgMpDone").addEventListener("click",function(){alert("FAZ 1 ilan akışı başarıyla tamamlandı.");close()})
  }

  function installHome(){
    if(qs("#kgMpHome"))return;var home=qs("#viewHome");if(!home)return;var host=document.createElement("section");host.id="kgMpHome";host.className="kg-mp-home";
    host.innerHTML='<div class="kg-mp-home-card"><div class="kg-mp-home-copy"><span class="kg-mp-badge">✦ YENİ · ÜCRETSİZ İLAN</span><strong>Değerini öğren. <span>İlanını oluştur, alıcını bul.</span></strong><p>Telefon, tablet, bilgisayar, akıllı saat veya oyun konsolunun değerini hesapla; cihaz bilgilerin ilan formuna otomatik aktarılsın.</p><div class="kg-mp-benefits"><span>İlan vermek ücretsiz</span><span>Bilgiler otomatik aktarılır</span><span>KaçaGider fiyatı bağımsız kalır</span></div></div><button type="button" class="kg-mp-home-action">Ücretsiz İlan Ver →<small>Önce cihazının değerini öğren</small></button></div>';
    var grid=qs(".kg-approved-category-grid",home)||qs(".category-grid",home);var holder=grid?grid.parentElement:null;if(holder)holder.insertAdjacentElement("afterend",host);else{var hero=qs(".kg-approved-hero",home)||qs(".hero",home);if(hero)hero.insertAdjacentElement("afterend",host);else home.prepend(host)}
    qs(".kg-mp-home-action",host).addEventListener("click",renderCategoryChoice)
  }

  function installNav(){
    if(qs("#kgMpNavAction"))return;var nav=qs(".kg-main-nav")||qs(".main-nav")||qs("nav");if(!nav)return;var a=document.createElement("a");a.id="kgMpNavAction";a.href="#";a.className="kg-mp-nav-action";a.textContent="Ücretsiz İlan Ver";a.addEventListener("click",function(e){e.preventDefault();renderCategoryChoice()});nav.appendChild(a)
  }

  function installResult(){if(qs("#kgMpResultAction"))return;var card=qs(".price-card");if(!card)return;var b=document.createElement("button");b.id="kgMpResultAction";b.className="kg-mp-result-action";b.type="button";b.innerHTML='＋ Ücretsiz İlan Oluştur<br><small style="font-weight:650;opacity:.9">Değerleme bilgilerin otomatik aktarılsın</small>';card.appendChild(b);b.addEventListener("click",openAuth)}
  function sync(){installHome();installNav();installResult();var b=qs("#kgMpResultAction");if(b)b.classList.toggle("is-ready",currentPrice()>0)}

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",sync,{once:true});else sync();
  var mo=new MutationObserver(sync);mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  window.addEventListener("keydown",function(e){if(e.key==="Escape")close()});
})();