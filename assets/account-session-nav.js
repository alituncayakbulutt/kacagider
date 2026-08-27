(function(){
"use strict";
if(window.__KG_ACCOUNT_SESSION_NAV__)return;
window.__KG_ACCOUNT_SESSION_NAV__=true;

function installStyle(){
  if(document.getElementById("kgAccountSessionNavStyle"))return;
  var s=document.createElement("style");
  s.id="kgAccountSessionNavStyle";
  s.textContent=`
    .kg-account-session{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 13px;border:1px solid rgba(255,255,255,.34);border-radius:10px;background:rgba(255,255,255,.06);color:#fff;font:inherit;font-size:12px;font-weight:900;white-space:nowrap;cursor:pointer}
    .kg-account-session:hover{background:rgba(255,255,255,.13)}
    .kg-account-session:disabled{opacity:.6;cursor:wait}
    .kg-account-login-overlay{position:fixed;inset:0;z-index:1000002;background:rgba(7,20,38,.72);display:flex;align-items:center;justify-content:center;padding:18px}
    .kg-account-login-card{width:min(430px,100%);background:#fff;color:#101828;border-radius:18px;padding:22px;box-shadow:0 28px 80px rgba(2,6,23,.35);position:relative}
    .kg-account-login-card h2{margin:0 0 6px;font-size:24px}.kg-account-login-card p{margin:0 0 16px;color:#667085;font-size:13px;line-height:1.5}
    .kg-account-login-close{position:absolute;right:14px;top:14px;width:34px;height:34px;border:0;border-radius:9px;background:#f2f4f7;font-size:20px;cursor:pointer}
    .kg-account-google{width:100%;min-height:46px;border:1px solid #d0d5dd;border-radius:10px;background:#fff;color:#1d2939;font-weight:850;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}
    .kg-account-google b{width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;border:1px solid #e5e7eb;color:#4285f4;background:#fff;font-family:Arial,sans-serif}
    .kg-account-divider{display:flex;align-items:center;gap:10px;color:#98a2b3;font-size:11px;font-weight:750;margin:14px 0}.kg-account-divider:before,.kg-account-divider:after{content:"";height:1px;background:#e5e7eb;flex:1}
    .kg-account-field{display:grid;gap:6px;margin-bottom:12px}.kg-account-field label{font-size:12px;font-weight:850;color:#475467}.kg-account-field input{width:100%;min-height:44px;border:1px solid #d0d5dd;border-radius:10px;padding:10px 12px;font:inherit}
    .kg-account-submit{width:100%;min-height:46px;border:0;border-radius:10px;background:#16a34a;color:#fff;font-weight:900;cursor:pointer}.kg-account-submit:disabled,.kg-account-google:disabled{opacity:.6;cursor:wait}
    .kg-account-note{margin:0 0 12px;padding:10px 12px;border-radius:10px;background:#f0fdf4;color:#166534;font-size:12px;display:none}.kg-account-note.show{display:block}.kg-account-note.error{background:#fff1f2;color:#b42318}
    .kg-account-forgot{margin-top:10px;border:0;background:transparent;padding:0;color:#087a37;font-size:11px;font-weight:850;cursor:pointer}
    @media(max-width:540px){.kg-account-session{min-height:38px;padding:0 9px;font-size:10px}}
  `;
  document.head.appendChild(s);
}

function actionsHost(){
  return document.querySelector(".kg-approved-topbar .kg-topbar-actions") || document.querySelector(".top nav");
}

function waitForBackend(tries){
  tries=tries||0;
  if(window.KGMarketplaceSupabase)return Promise.resolve(window.KGMarketplaceSupabase);
  if(tries>=120)return Promise.reject(new Error("Oturum sistemi yüklenemedi."));
  return new Promise(function(resolve,reject){setTimeout(function(){waitForBackend(tries+1).then(resolve,reject);},50);});
}

function showNote(message,isError){
  var note=document.getElementById("kgAccountLoginNote");
  if(!note)return;
  note.textContent=message||"";
  note.className="kg-account-note show"+(isError?" error":"");
}

function closeLogin(){
  var overlay=document.getElementById("kgAccountLoginOverlay");
  if(overlay)overlay.remove();
}

function openLogin(api){
  installStyle();
  if(document.getElementById("kgAccountLoginOverlay"))return;
  var overlay=document.createElement("div");
  overlay.id="kgAccountLoginOverlay";
  overlay.className="kg-account-login-overlay";
  overlay.innerHTML='<section class="kg-account-login-card" role="dialog" aria-modal="true" aria-labelledby="kgAccountLoginTitle"><button type="button" class="kg-account-login-close" aria-label="Kapat">×</button><h2 id="kgAccountLoginTitle">Giriş Yap</h2><p>KaçaGider hesabına Google veya e-posta ile giriş yap.</p><div id="kgAccountLoginNote" class="kg-account-note"></div><button type="button" class="kg-account-google" id="kgAccountGoogle"><b>G</b><span>Google ile devam et</span></button><div class="kg-account-divider">veya e-posta ile</div><form id="kgAccountLoginForm"><div class="kg-account-field"><label>E-posta</label><input id="kgAccountEmail" type="email" autocomplete="email" required></div><div class="kg-account-field"><label>Şifre</label><input id="kgAccountPassword" type="password" minlength="8" autocomplete="current-password" required></div><button type="submit" class="kg-account-submit" id="kgAccountSubmit">Giriş Yap</button></form><button type="button" class="kg-account-forgot" id="kgAccountForgot">Şifremi unuttum</button></section>';
  document.body.appendChild(overlay);
  overlay.querySelector(".kg-account-login-close").onclick=closeLogin;
  overlay.addEventListener("click",function(e){if(e.target===overlay)closeLogin();});
  var google=document.getElementById("kgAccountGoogle");
  google.onclick=async function(){
    google.disabled=true;
    try{var result=await api.signInWithGoogle();if(result&&result.error)throw result.error;}
    catch(error){showNote(error.message||"Google ile giriş başlatılamadı.",true);google.disabled=false;}
  };
  document.getElementById("kgAccountLoginForm").onsubmit=async function(e){
    e.preventDefault();
    var submit=document.getElementById("kgAccountSubmit");submit.disabled=true;
    try{
      var result=await api.signIn({email:document.getElementById("kgAccountEmail").value,password:document.getElementById("kgAccountPassword").value});
      if(result&&result.error)throw result.error;
      var user=result&&result.data?result.data.user:null;
      closeLogin();setButton(user,api);
    }catch(error){showNote(error.message||"Giriş yapılamadı.",true);submit.disabled=false;}
  };
  document.getElementById("kgAccountForgot").onclick=async function(){
    var email=document.getElementById("kgAccountEmail").value.trim();
    if(!email){showNote("Önce e-posta adresini gir.",true);return;}
    try{var result=await api.resetPassword(email);if(result&&result.error)throw result.error;showNote("Şifre yenileme bağlantısını e-posta adresine gönderdik.",false);}catch(error){showNote(error.message||"Şifre yenileme e-postası gönderilemedi.",true);}
  };
}

function setButton(user,api){
  var host=actionsHost();
  if(!host)return;
  installStyle();
  var legacy=document.getElementById("kgAccountLogout");if(legacy)legacy.remove();
  var old=document.getElementById("kgAccountSessionAction");if(old)old.remove();
  var button=document.createElement("button");
  button.type="button";
  button.id="kgAccountSessionAction";
  button.className="kg-account-session";
  if(user){
    button.textContent="Çıkış Yap";
    button.setAttribute("aria-label","KaçaGider hesabından çıkış yap");
    button.onclick=async function(){
      button.disabled=true;button.textContent="Çıkılıyor…";
      try{var result=await api.signOut();if(result&&result.error)throw result.error;try{sessionStorage.removeItem("kg-pending-listing-auth-v1");}catch(_e){}setButton(null,api);}
      catch(error){console.error("KaçaGider çıkış:",error);button.disabled=false;button.textContent="Çıkış Yap";alert("Çıkış işlemi tamamlanamadı. Lütfen tekrar dene.");}
    };
  }else{
    button.textContent="Giriş Yap";
    button.setAttribute("aria-label","KaçaGider hesabına giriş yap");
    button.onclick=function(){openLogin(api);};
  }
  var cta=host.querySelector(".cta,.kg-v4-action.sell");
  if(cta)host.insertBefore(button,cta);else host.appendChild(button);
}

async function sync(){
  try{
    var api=await waitForBackend(0);await api.ready;
    var user=api.getSessionUser?await api.getSessionUser():await api.getUser();
    setButton(user,api);
    return api;
  }catch(error){console.warn("KaçaGider hesap menüsü:",error);return null;}
}

async function boot(){
  var api=await sync();
  if(!api)return;
  var client=await api.init();
  if(client&&client.auth&&typeof client.auth.onAuthStateChange==="function")client.auth.onAuthStateChange(function(_event,session){setButton(session&&session.user?session.user:null,api);});
  setTimeout(sync,350);setTimeout(sync,900);
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
else boot();
})();
