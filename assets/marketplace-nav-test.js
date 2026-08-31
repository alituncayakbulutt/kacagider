(function(){
"use strict";
if(window.__KG_MARKETPLACE_NAV_V4__) return;
window.__KG_MARKETPLACE_NAV_V4__=true;

var sliderTimer=0;
var sliderIndex=0;
var accountAuthWatchInstalled=false;

function installStyle(){
  if(document.getElementById("kgNavV4Style")) return;
  var s=document.createElement("style");
  s.id="kgNavV4Style";
  s.textContent=`
  .kg-approved-topbar{position:sticky!important;top:0!important;z-index:1000!important;background:#071426!important;border:0!important;box-shadow:0 2px 10px rgba(7,20,38,.12)!important}
  .kg-approved-topbar .kg-topbar-inner{max-width:1480px!important;min-height:88px!important;margin:0 auto!important;padding:12px 30px!important;display:grid!important;grid-template-columns:240px minmax(360px,1fr) auto!important;gap:22px!important;align-items:center!important}
  .kg-approved-topbar .kg-brand{border:0!important;padding:0!important;color:#fff!important;text-decoration:none!important}
  .kg-approved-topbar .kg-brand-main{font-size:36px!important;color:#fff!important}.kg-approved-topbar .kg-brand-main span{color:#22c55e!important}
  .kg-approved-topbar .kg-brand small{color:#fff!important}.kg-approved-topbar .kg-brand-tagline{color:#b8c7d9!important}
  .kg-v4-search{height:54px;display:flex;align-items:center;gap:10px;padding:0 14px 0 17px;border-radius:14px;background:#fff;border:1px solid #e5e7eb;box-shadow:0 4px 14px rgba(2,6,23,.08)}
  .kg-v4-search span{color:#64748b;font-size:18px}.kg-v4-search input{width:100%!important;height:48px!important;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;color:#172033!important;font-size:14px!important;font-weight:650!important;padding:0!important}
  .kg-v4-search button{height:36px;border:0;border-radius:10px;padding:0 14px;background:#eefbf4;color:#087a37;font-weight:900;cursor:pointer}
  .kg-approved-topbar .kg-topbar-actions{display:flex!important;align-items:center!important;gap:10px!important}
  .kg-v4-action{height:46px;display:inline-flex;align-items:center;justify-content:center;padding:0 16px;border-radius:12px;text-decoration:none;font-size:13px;font-weight:900;white-space:nowrap;cursor:pointer}
  .kg-v4-action.listings,.kg-v4-action.account{color:#fff;border:1px solid #536278;background:rgba(255,255,255,.04)}
  .kg-v4-action.account:hover,.kg-v4-action.listings:hover{background:rgba(255,255,255,.10)}
  .kg-v4-action.account:disabled{opacity:.65;cursor:wait}
  .kg-v4-action.sell{color:#fff;border:1px solid #16a34a;background:#16a34a;box-shadow:0 8px 18px rgba(22,163,74,.20)}
  .kg-approved-topbar .kg-theme-btn{width:46px!important;height:46px!important;border-radius:12px!important}
  .kg-v4-subbar{width:100%;background:#fff;border-bottom:1px solid #e5e7eb;box-shadow:0 3px 10px rgba(15,23,42,.05)}
  .kg-v4-subbar-inner{max-width:1480px;min-height:60px;margin:0 auto;padding:0 26px;display:flex;align-items:center;justify-content:center}
  .kg-v4-subbar .kg-main-nav{display:flex!important;align-items:center!important;justify-content:center!important;gap:34px!important;width:100%!important;white-space:nowrap!important}
  .kg-v4-subbar .kg-main-nav a{padding:20px 0 18px!important;color:#253047!important;font-size:14px!important;font-weight:800!important;text-decoration:none!important;position:relative!important}
  .kg-v4-subbar .kg-main-nav a:hover,.kg-v4-subbar .kg-main-nav a.active{color:#15803d!important}
  .kg-v4-subbar .kg-main-nav a.active:after{content:"";position:absolute;left:0;right:0;bottom:9px;height:3px;border-radius:9px;background:#16a34a}
  .kg-account-direct-overlay{position:fixed;inset:0;z-index:1000005;background:rgba(7,20,38,.74);display:flex;align-items:center;justify-content:center;padding:18px;overflow-y:auto}
  .kg-account-direct-card{width:min(430px,100%);background:#fff;color:#101828;border-radius:18px;padding:22px;box-shadow:0 28px 80px rgba(2,6,23,.35);position:relative;box-sizing:border-box}
  .kg-account-direct-card h2{margin:0 0 6px;font-size:24px}.kg-account-direct-card p{margin:0 0 16px;color:#667085;font-size:13px;line-height:1.5}
  .kg-account-direct-close{position:absolute;right:14px;top:14px;width:34px;height:34px;border:0;border-radius:9px;background:#f2f4f7;font-size:20px;cursor:pointer}
  .kg-account-direct-tabs{display:grid;grid-template-columns:1fr 1fr;background:#f2f4f7;border-radius:11px;padding:4px;margin:0 0 14px}
  .kg-account-direct-tab{border:0;background:transparent;border-radius:8px;padding:10px;font-weight:850;color:#667085;cursor:pointer}
  .kg-account-direct-tab.active{background:#fff;color:#111827;box-shadow:0 1px 3px rgba(15,23,42,.08)}
  .kg-account-direct-google{width:100%;min-height:46px;border:1px solid #d0d5dd;border-radius:10px;background:#fff;color:#1d2939;font-weight:850;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}
  .kg-account-direct-google b{width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;border:1px solid #e5e7eb;color:#4285f4;background:#fff;font-family:Arial,sans-serif}
  .kg-account-direct-divider{display:flex;align-items:center;gap:10px;color:#98a2b3;font-size:11px;font-weight:750;margin:14px 0}.kg-account-direct-divider:before,.kg-account-direct-divider:after{content:"";height:1px;background:#e5e7eb;flex:1}
  .kg-account-direct-field{display:grid;gap:6px;margin-bottom:12px}.kg-account-direct-field label{font-size:12px;font-weight:850;color:#475467}.kg-account-direct-field input{width:100%;min-height:44px;border:1px solid #d0d5dd;border-radius:10px;padding:10px 12px;font:inherit;box-sizing:border-box}
  .kg-account-direct-field small{font-size:11px;color:#667085}
  .kg-account-direct-submit{width:100%;min-height:46px;border:0;border-radius:10px;background:#16a34a;color:#fff;font-weight:900;cursor:pointer}.kg-account-direct-submit:disabled,.kg-account-direct-google:disabled{opacity:.6;cursor:wait}
  .kg-account-direct-note{display:none;margin:0 0 12px;padding:10px 12px;border-radius:10px;background:#f0fdf4;color:#166534;font-size:12px}.kg-account-direct-note.show{display:block}.kg-account-direct-note.error{background:#fff1f2;color:#b42318}
  .kg-account-direct-forgot{margin-top:10px;border:0;background:transparent;padding:0;color:#087a37;font-size:11px;font-weight:850;cursor:pointer}
  #viewHome:not(.category-selected)>.hero,#viewHome:not(.category-selected)>.kg-approved-hero{display:none!important}
  #viewHome.category-selected #kgV4Slider{display:none!important}
  #kgV4Slider{max-width:1408px;margin:28px auto 26px;padding:0 30px;position:relative}
  .kg-v4-shell{position:relative;height:334px;border:1px solid #dce7e1;border-radius:26px;overflow:hidden;background:linear-gradient(118deg,#f7fff9 0%,#f4f8fb 55%,#edf5f0 100%);box-shadow:0 18px 42px rgba(15,23,42,.08)}
  .kg-v4-slide{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1.18fr) minmax(360px,.82fr);align-items:center;gap:30px;padding:38px 58px;opacity:0;visibility:hidden;pointer-events:none;transform:translateX(12px);transition:opacity .35s ease,transform .35s ease}
  .kg-v4-slide.active{opacity:1;visibility:visible;pointer-events:auto;transform:none}
  .kg-v4-copy{max-width:720px}.kg-v4-eyebrow{display:inline-flex;align-items:center;gap:7px;margin-bottom:11px;padding:6px 10px;border-radius:999px;background:#e9faef;color:#087a37;font-size:10px;font-weight:950;letter-spacing:.45px}
  .kg-v4-copy h1,.kg-v4-copy h2{margin:0!important;max-width:760px!important;text-align:left!important;color:#0b1628!important;font-size:42px!important;line-height:1.04!important;letter-spacing:-1.25px!important;font-weight:950!important}
  .kg-v4-copy h1 span,.kg-v4-copy h2 span{color:#16a34a!important}
  .kg-v4-copy p{margin:14px 0 0!important;max-width:680px!important;text-align:left!important;color:#667085!important;font-size:15px!important;line-height:1.55!important}
  .kg-v4-actions{display:flex;gap:11px;flex-wrap:wrap;margin-top:22px}.kg-v4-btn{min-height:48px;padding:0 19px;border-radius:13px;border:1px solid #cfd9d5;background:#fff;color:#142033;font-size:14px;font-weight:900;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.kg-v4-btn.primary{background:#16a34a;border-color:#16a34a;color:#fff}
  .kg-v4-visual{position:relative;height:252px;display:flex;align-items:center;justify-content:center}.kg-v4-card{position:relative;width:min(330px,92%);height:246px;border-radius:25px;border:1px solid rgba(255,255,255,.95);background:rgba(255,255,255,.84);box-shadow:0 22px 46px rgba(15,23,42,.13);display:flex;align-items:center;justify-content:center;overflow:hidden}.kg-v4-card img{width:82%;height:82%;object-fit:contain}.kg-v4-badge{position:absolute;right:1%;top:7%;padding:8px 11px;border-radius:999px;background:#fff;color:#087a37;border:1px solid #e4ece8;font-size:10px;font-weight:950}.kg-v4-stat{position:absolute;left:-5%;bottom:2%;min-width:190px;padding:12px 14px;border-radius:15px;background:#071426;color:#fff}.kg-v4-stat small{display:block;color:#b9c7d8;font-size:9px;font-weight:750;margin-bottom:3px}.kg-v4-stat strong{display:block;color:#4ade80;font-size:14px;font-weight:950}
  .kg-v4-arrow{position:absolute;top:50%;z-index:5;width:42px;height:42px;margin-top:-21px;border:1px solid #d9e3df;border-radius:50%;background:#fff;color:#142033;box-shadow:0 8px 20px rgba(15,23,42,.1);font-size:24px;line-height:1;cursor:pointer}.kg-v4-arrow.prev{left:14px}.kg-v4-arrow.next{right:14px}.kg-v4-dots{position:absolute;z-index:6;left:50%;bottom:15px;transform:translateX(-50%);display:flex;gap:7px}.kg-v4-dot{width:8px;height:8px;border:0;padding:0;border-radius:999px;background:#aab6b0;cursor:pointer}.kg-v4-dot.active{width:27px;background:#16a34a}
  @media(max-width:1120px){.kg-approved-topbar .kg-topbar-inner{grid-template-columns:205px minmax(280px,1fr) auto!important;gap:15px!important;padding:11px 18px!important}.kg-approved-topbar .kg-brand-main{font-size:31px!important}.kg-v4-subbar .kg-main-nav{gap:22px!important}.kg-v4-subbar .kg-main-nav a{font-size:13px!important}.kg-v4-action{padding:0 12px;font-size:12px}}
  @media(max-width:900px){.kg-approved-topbar .kg-topbar-inner{grid-template-columns:1fr auto!important;grid-template-areas:"brand actions" "search search"!important;gap:10px!important;padding:10px 14px!important}.kg-approved-topbar .kg-brand{grid-area:brand}.kg-v4-search{grid-area:search;height:48px}.kg-approved-topbar .kg-topbar-actions{grid-area:actions}.kg-v4-action.listings{display:none}.kg-v4-action.account,.kg-v4-action.sell{height:42px;padding:0 11px;font-size:11px}.kg-v4-subbar{display:none}.kg-approved-topbar.menu-open .kg-v4-subbar{display:block!important;position:absolute;left:0;right:0;top:100%}.kg-approved-topbar.menu-open .kg-v4-subbar .kg-main-nav{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:0!important;padding:8px 12px!important}.kg-approved-topbar.menu-open .kg-v4-subbar .kg-main-nav a{padding:13px 10px!important}.kg-v4-shell{height:570px}.kg-v4-slide{grid-template-columns:1fr;padding:30px 42px 48px;gap:18px}.kg-v4-copy{text-align:center;margin:auto}.kg-v4-copy h1,.kg-v4-copy h2,.kg-v4-copy p{text-align:center!important}.kg-v4-actions{justify-content:center}.kg-v4-visual{height:205px}.kg-v4-card{height:200px}.kg-v4-copy h1,.kg-v4-copy h2{font-size:35px!important}}
  @media(max-width:600px){#kgV4Slider{padding:0 10px;margin:15px auto 20px}.kg-v4-shell{height:590px;border-radius:20px}.kg-v4-slide{padding:26px 24px 48px}.kg-v4-copy h1,.kg-v4-copy h2{font-size:30px!important}.kg-v4-copy p{font-size:14px!important}.kg-v4-actions{display:grid;grid-template-columns:1fr}.kg-v4-btn{width:100%}.kg-v4-visual{height:185px}.kg-v4-card{width:255px;height:180px}.kg-v4-stat{left:1%;min-width:155px}.kg-v4-arrow{width:36px;height:36px;margin-top:-18px}}
  @media(max-width:900px){.kg-approved-topbar .kg-topbar-actions{display:grid!important;grid-template-columns:128px 42px!important;grid-template-rows:42px 42px!important;grid-template-areas:"sell sell" "menu theme"!important;gap:8px!important;width:178px!important;min-width:0!important;align-items:center!important;justify-items:stretch!important;flex-shrink:0!important}.kg-approved-topbar .kg-v4-action.listings{display:none!important}.kg-approved-topbar .kg-v4-action.sell{grid-area:sell!important;display:inline-flex!important;width:auto!important;height:42px!important;padding:0 10px!important;font-size:11px!important;box-sizing:border-box!important}.kg-approved-topbar .kg-mobile-nav-toggle{grid-area:menu!important;display:flex!important;align-items:center!important;justify-content:center!important;width:42px!important;height:42px!important;padding:0!important;margin:0!important}.kg-approved-topbar .kg-theme-btn{grid-area:theme!important;display:flex!important;align-items:center!important;justify-content:center!important;width:42px!important;height:42px!important;padding:0!important;margin:0!important;font-size:21px!important;line-height:1!important;overflow:visible!important}.kg-v4-shell{height:620px!important}.kg-v4-visual{height:225px!important}.kg-v4-card{height:220px!important}}
  @media(max-width:600px){.kg-approved-topbar .kg-v4-action.sell{width:100%!important}.kg-v4-shell{height:640px!important}.kg-v4-slide{padding:30px 24px 52px!important}.kg-v4-visual{height:235px!important}.kg-v4-card{width:280px!important;height:225px!important}.kg-account-direct-card{max-height:calc(100dvh - 20px);overflow-y:auto}.kg-account-direct-field input,.kg-account-direct-submit,.kg-account-direct-google{min-height:48px}}
  `;
  document.head.appendChild(s);
}

function ensureAuthBackend(){
  if(window.KGMarketplaceSupabase) return Promise.resolve(window.KGMarketplaceSupabase);
  return new Promise(function(resolve,reject){
    var script=document.querySelector('script[data-kg-marketplace-backend]');
    if(!script){
      script=document.createElement("script");
      script.src="/assets/supabase-marketplace.js";
      script.async=true;
      script.dataset.kgMarketplaceBackend="1";
      document.head.appendChild(script);
    }
    var tries=0;
    var timer=setInterval(function(){
      tries++;
      if(window.KGMarketplaceSupabase){clearInterval(timer);resolve(window.KGMarketplaceSupabase);}
      else if(tries>=160){clearInterval(timer);reject(new Error("Giriş sistemi yüklenemedi."));}
    },50);
    script.addEventListener("error",function(){clearInterval(timer);reject(new Error("Giriş sistemi yüklenemedi."));},{once:true});
  });
}

function showAccountNote(message,isError){
  var note=document.getElementById("kgAccountDirectNote");
  if(!note) return;
  note.textContent=message||"";
  note.className="kg-account-direct-note show"+(isError?" error":"");
}
function closeAccountLogin(){
  var overlay=document.getElementById("kgAccountDirectOverlay");
  if(overlay) overlay.remove();
}
function openAccountLogin(api,mode){
  installStyle();
  var register=mode==="register";
  var old=document.getElementById("kgAccountDirectOverlay");
  if(old) old.remove();
  var overlay=document.createElement("div");
  overlay.id="kgAccountDirectOverlay";
  overlay.className="kg-account-direct-overlay";
  overlay.innerHTML='<section class="kg-account-direct-card" role="dialog" aria-modal="true" aria-labelledby="kgAccountDirectTitle"><button type="button" class="kg-account-direct-close" aria-label="Kapat">×</button><h2 id="kgAccountDirectTitle">'+(register?'Üye Ol':'Giriş Yap')+'</h2><p>'+(register?'KaçaGider hesabını ücretsiz oluştur.':'KaçaGider hesabına Google veya e-posta ile giriş yap.')+'</p><div class="kg-account-direct-tabs"><button type="button" class="kg-account-direct-tab '+(!register?'active':'')+'" data-account-mode="login">Giriş Yap</button><button type="button" class="kg-account-direct-tab '+(register?'active':'')+'" data-account-mode="register">Üye Ol</button></div><div id="kgAccountDirectNote" class="kg-account-direct-note"></div><button type="button" class="kg-account-direct-google" id="kgAccountDirectGoogle"><b>G</b><span>Google ile devam et</span></button><div class="kg-account-direct-divider">veya e-posta ile</div><form id="kgAccountDirectForm">'+(register?'<div class="kg-account-direct-field"><label>Ad Soyad</label><input id="kgAccountDirectName" type="text" autocomplete="name" required></div>':'')+'<div class="kg-account-direct-field"><label>E-posta</label><input id="kgAccountDirectEmail" type="email" autocomplete="email" required></div><div class="kg-account-direct-field"><label>Şifre</label><input id="kgAccountDirectPassword" type="password" minlength="8" autocomplete="'+(register?'new-password':'current-password')+'" required><small>En az 8 karakter.</small></div>'+(register?'<div class="kg-account-direct-field"><label>Şifre Tekrarı</label><input id="kgAccountDirectPasswordConfirm" type="password" minlength="8" autocomplete="new-password" required></div>':'')+'<button type="submit" class="kg-account-direct-submit" id="kgAccountDirectSubmit">'+(register?'Ücretsiz Üye Ol':'Giriş Yap')+'</button></form>'+(register?'':'<button type="button" class="kg-account-direct-forgot" id="kgAccountDirectForgot">Şifremi unuttum</button>')+'</section>';
  document.body.appendChild(overlay);
  overlay.querySelector(".kg-account-direct-close").onclick=closeAccountLogin;
  overlay.addEventListener("click",function(e){if(e.target===overlay)closeAccountLogin();});
  overlay.querySelectorAll("[data-account-mode]").forEach(function(b){b.onclick=function(){openAccountLogin(api,b.dataset.accountMode);};});
  document.getElementById("kgAccountDirectGoogle").onclick=async function(){
    var button=this;button.disabled=true;
    try{var result=await api.signInWithGoogle();if(result&&result.error)throw result.error;}
    catch(error){showAccountNote(error.message||"Google ile giriş başlatılamadı.",true);button.disabled=false;}
  };
  document.getElementById("kgAccountDirectForm").onsubmit=async function(e){
    e.preventDefault();
    var submit=document.getElementById("kgAccountDirectSubmit");submit.disabled=true;
    try{
      var email=document.getElementById("kgAccountDirectEmail").value;
      var password=document.getElementById("kgAccountDirectPassword").value;
      var result;
      if(register){
        var confirm=document.getElementById("kgAccountDirectPasswordConfirm").value;
        if(password!==confirm){showAccountNote("Şifreler aynı olmalı.",true);submit.disabled=false;return;}
        result=await api.signUp({fullName:document.getElementById("kgAccountDirectName").value,email:email,password:password});
        if(result&&result.error)throw result.error;
        if(!(result.data&&result.data.session)){
          showAccountNote("Üyeliğin oluşturuldu. E-posta adresine gönderdiğimiz doğrulama bağlantısını aç, ardından Giriş Yap sekmesinden devam et.",false);
          submit.disabled=false;
          return;
        }
      }else{
        result=await api.signIn({email:email,password:password});
        if(result&&result.error)throw result.error;
      }
      closeAccountLogin();
      syncAccountAction();
    }catch(error){showAccountNote(error.message||(register?"Üyelik oluşturulamadı.":"Giriş yapılamadı."),true);submit.disabled=false;}
  };
  var forgot=document.getElementById("kgAccountDirectForgot");
  if(forgot) forgot.onclick=async function(){
    var email=document.getElementById("kgAccountDirectEmail").value.trim();
    if(!email){showAccountNote("Önce e-posta adresini gir.",true);return;}
    try{var result=await api.resetPassword(email);if(result&&result.error)throw result.error;showAccountNote("Şifre yenileme bağlantısını e-posta adresine gönderdik.",false);}
    catch(error){showAccountNote(error.message||"Şifre yenileme e-postası gönderilemedi.",true);}
  };
}

async function syncAccountAction(){
  var button=document.getElementById("kgHeaderAccountAction");
  if(!button) return;
  try{
    var api=await ensureAuthBackend();
    await api.ready;
    var user=api.getSessionUser?await api.getSessionUser():await api.getUser();
    button.dataset.authMode=user?"logout":"login";
    button.textContent=user?"Çıkış Yap":"Giriş Yap";
    button.disabled=false;
    if(!accountAuthWatchInstalled){
      var client=await api.init();
      if(client&&client.auth&&typeof client.auth.onAuthStateChange==="function"){
        accountAuthWatchInstalled=true;
        client.auth.onAuthStateChange(function(_event,session){
          var b=document.getElementById("kgHeaderAccountAction");if(!b)return;
          var logged=Boolean(session&&session.user);b.dataset.authMode=logged?"logout":"login";b.textContent=logged?"Çıkış Yap":"Giriş Yap";b.disabled=false;
        });
      }
    }
  }catch(error){
    console.warn("KaçaGider hesap durumu:",error);
    button.dataset.authMode="login";
    button.textContent="Giriş Yap";
    button.disabled=false;
  }
}
async function handleAccountAction(){
  var button=document.getElementById("kgHeaderAccountAction");
  if(!button) return;
  button.disabled=true;
  try{
    var api=await ensureAuthBackend();
    await api.ready;
    var user=api.getSessionUser?await api.getSessionUser():await api.getUser();
    if(user){
      button.textContent="Çıkılıyor…";
      var result=await api.signOut();
      if(result&&result.error)throw result.error;
      try{sessionStorage.removeItem("kg-pending-listing-auth-v1");}catch(_e){}
      button.dataset.authMode="login";
      button.textContent="Giriş Yap";
      button.disabled=false;
      return;
    }
    button.disabled=false;
    openAccountLogin(api,"login");
  }catch(error){
    console.error("KaçaGider hesap işlemi:",error);
    button.disabled=false;
    button.textContent="Giriş Yap";
    alert("Giriş sistemi açılamadı. Lütfen tekrar dene.");
  }
}

function openValue(){
  if(typeof window.kgGoCategory==="function"){window.kgGoCategory("phone");return;}
  var card=document.querySelector('[data-category="phone"]');
  if(card) card.click();
}
function openSell(){
  if(window.KGMarketplaceUI&&typeof window.KGMarketplaceUI.choose==="function"){window.KGMarketplaceUI.choose();return;}
  var b=document.querySelector(".kg-mp-home-action");
  if(b){b.click();return;}
  openValue();
}
function buildHeader(){
  var header=document.querySelector(".kg-approved-topbar");
  if(!header) return false;
  if(header.dataset.kgV4==="1"){
    if(!document.getElementById("kgHeaderAccountAction")) header.dataset.kgV4="0";
    else return true;
  }
  var inner=header.querySelector(".kg-topbar-inner");
  var nav=header.querySelector(".kg-main-nav");
  var actions=header.querySelector(".kg-topbar-actions");
  if(!inner||!nav||!actions) return false;
  installStyle();

  header.querySelectorAll(".kg-market-search,.kg-v3-search,.kg-v4-search").forEach(function(x){x.remove();});
  var search=document.createElement("form");
  search.className="kg-v4-search";
  search.innerHTML='<span aria-hidden="true">⌕</span><input type="search" placeholder="Marka, model veya ilan ara..." aria-label="İlanlarda ara"><button type="submit">Ara</button>';
  search.addEventListener("submit",function(e){
    e.preventDefault();
    var term=search.querySelector("input").value.trim();
    location.href=term?"/ilanlar/?q="+encodeURIComponent(term):"/ilanlar/";
  });
  inner.insertBefore(search,actions);

  actions.querySelectorAll(".kg-v3-action,.kg-v4-action,#kgAccountSessionAction,#kgAccountLogout,#kgHeaderAccountAction").forEach(function(x){x.remove();});
  var listings=document.createElement("a");
  listings.href="/ilanlar/";
  listings.className="kg-v4-action listings";
  listings.textContent="İlanlar";
  var account=document.createElement("button");
  account.type="button";
  account.id="kgHeaderAccountAction";
  account.className="kg-v4-action account";
  account.dataset.authMode="login";
  account.textContent="Giriş Yap";
  account.setAttribute("aria-label","KaçaGider hesabına giriş yap veya çıkış yap");
  account.addEventListener("click",handleAccountAction);
  var sell=document.createElement("button");
  sell.type="button";
  sell.className="kg-v4-action sell";
  sell.textContent="Ücretsiz İlan Ver";
  sell.addEventListener("click",openSell);
  actions.insertBefore(listings,actions.firstChild);
  actions.insertBefore(account,listings.nextSibling);
  actions.insertBefore(sell,account.nextSibling);

  var oldSub=header.querySelector(".kg-market-subbar,.kg-v3-subbar,.kg-v4-subbar");
  if(oldSub){
    var oldNav=oldSub.querySelector(".kg-main-nav");
    if(oldNav) nav=oldNav;
    oldSub.remove();
  }
  var sub=document.createElement("div");
  sub.className="kg-v4-subbar";
  var subInner=document.createElement("div");
  subInner.className="kg-v4-subbar-inner";
  sub.appendChild(subInner);
  subInner.appendChild(nav);
  header.appendChild(sub);
  header.dataset.kgV4="1";
  syncAccountAction();
  return true;
}

var slides=[
  {
    eyebrow:"GÜNCEL PİYASA DEĞERİ",
    title:'Cihazın ne kadar eder? <span>Güncel ikinci el piyasa değerini öğren.</span>',
    text:"Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolu için ortalama satış değerini öğren.",
    primary:"Piyasa Değerini Hesapla",primaryAction:"value",
    secondary:"Ücretsiz İlan Ver",secondaryAction:"sell",
    image:"/assets/categories/telefon.jpg",badge:"Üyeliksiz sorgulama",stat:"Ortalama satış değeri"
  },
  {
    eyebrow:"KAÇAGİDER PAZARYERİ",
    title:'Değerini öğren. <span>Doğru fiyata sat.</span>',
    text:"Cihazının piyasa değerini öğren, ücretsiz ilanını oluştur ve doğru alıcıyla buluş.",
    primary:"Ücretsiz İlan Ver",primaryAction:"sell",
    secondary:"İlanları Gör",secondaryAction:"listings",
    image:"/assets/categories/bilgisayar.jpg",badge:"Ücretsiz ilan",stat:"Bağımsız piyasa verisi"
  },
  {
    eyebrow:"ŞEFFAF KARŞILAŞTIRMA",
    title:'İlan fiyatını piyasa değeriyle karşılaştır. <span>Daha bilinçli karar ver.</span>',
    text:"Satıcının fiyatını KaçaGider piyasa değeriyle yan yana gör ve değerine yakın ilanları kolayca fark et.",
    primary:"İlanları İncele",primaryAction:"listings",
    secondary:"Piyasa Değerini Hesapla",secondaryAction:"value",
    image:"/assets/categories/tablet.jpg",badge:"Piyasa değeriyle karşılaştır",stat:"Piyasa değeri + ilan fiyatı"
  }
];

function action(name){
  if(name==="sell"){openSell();return;}
  if(name==="listings"){location.href="/ilanlar/";return;}
  openValue();
}
function stopSlider(){if(sliderTimer){clearInterval(sliderTimer);sliderTimer=0;}}
function showSlide(index){
  var root=document.getElementById("kgV4Slider");
  if(!root) return;
  var items=root.querySelectorAll(".kg-v4-slide");
  var dots=root.querySelectorAll(".kg-v4-dot");
  if(!items.length) return;
  sliderIndex=(index+items.length)%items.length;
  items.forEach(function(el,i){el.classList.toggle("active",i===sliderIndex);});
  dots.forEach(function(el,i){el.classList.toggle("active",i===sliderIndex);});
}
function startSlider(){
  stopSlider();
  sliderTimer=setInterval(function(){
    if(document.hidden) return;
    showSlide(sliderIndex+1);
  },6500);
}
function buildSlider(){
  if(location.pathname!=="/") return true;
  var home=document.getElementById("viewHome");
  if(!home) return false;
  if(document.getElementById("kgV4Slider")) return true;
  installStyle();
  var root=document.createElement("section");
  root.id="kgV4Slider";
  root.setAttribute("aria-label","KaçaGider tanıtım");
  root.innerHTML='<div class="kg-v4-shell">'+slides.map(function(s,i){
    return '<article class="kg-v4-slide '+(i===0?"active":"")+'" data-index="'+i+'"><div class="kg-v4-copy"><span class="kg-v4-eyebrow">'+s.eyebrow+'</span><'+(i===0?"h1":"h2")+'>'+s.title+'</'+(i===0?"h1":"h2")+'><p>'+s.text+'</p><div class="kg-v4-actions"><button class="kg-v4-btn primary" type="button" data-action="'+s.primaryAction+'">'+s.primary+'</button><button class="kg-v4-btn" type="button" data-action="'+s.secondaryAction+'">'+s.secondary+'</button></div></div><div class="kg-v4-visual"><div class="kg-v4-card"><img src="'+s.image+'" alt="" decoding="async"></div><span class="kg-v4-badge">'+s.badge+'</span><div class="kg-v4-stat"><small>KaçaGider</small><strong>'+s.stat+'</strong></div></div></article>';
  }).join("")+'<button class="kg-v4-arrow prev" type="button" aria-label="Önceki">‹</button><button class="kg-v4-arrow next" type="button" aria-label="Sonraki">›</button><div class="kg-v4-dots">'+slides.map(function(_s,i){return '<button type="button" class="kg-v4-dot '+(i===0?"active":"")+'" data-i="'+i+'" aria-label="'+(i+1)+'. slayt"></button>';}).join("")+'</div></div>';

  var target=home.querySelector(".kg-approved-category-grid,.category-grid,.home-intro");
  if(target) target.insertAdjacentElement("beforebegin",root);
  else home.insertBefore(root,home.firstChild);

  root.addEventListener("click",function(e){
    var a=e.target.closest("[data-action]");
    if(a){action(a.dataset.action);return;}
    if(e.target.closest(".kg-v4-arrow.prev")){showSlide(sliderIndex-1);startSlider();return;}
    if(e.target.closest(".kg-v4-arrow.next")){showSlide(sliderIndex+1);startSlider();return;}
    var dot=e.target.closest(".kg-v4-dot");
    if(dot){showSlide(Number(dot.dataset.i));startSlider();}
  });
  root.addEventListener("mouseenter",stopSlider);
  root.addEventListener("mouseleave",startSlider);
  document.addEventListener("visibilitychange",function(){if(document.hidden)stopSlider();else startSlider();});
  startSlider();
  return true;
}
function boot(){
  installStyle();
  buildHeader();
  buildSlider();
  setTimeout(syncAccountAction,400);
  setTimeout(syncAccountAction,1200);
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
else boot();
})();
