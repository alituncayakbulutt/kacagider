(function(){
"use strict";
if(window.__KG_ACCOUNT_SESSION_NAV__)return;
window.__KG_ACCOUNT_SESSION_NAV__=true;

var cachedApi=null;
var cachedUser=null;
var hostObserver=null;

function installStyle(){
  if(document.getElementById("kgAccountSessionNavStyle"))return;
  var s=document.createElement("style");
  s.id="kgAccountSessionNavStyle";
  s.textContent=`
    .kg-account-session,.kg-v4-action.account{
      display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:9px!important;
      min-height:46px!important;padding:0 15px!important;border:1px solid #536278!important;border-radius:12px!important;
      background:rgba(255,255,255,.04)!important;color:#fff!important;font:inherit!important;font-size:13px!important;
      font-weight:900!important;white-space:nowrap!important;cursor:pointer!important;visibility:visible!important;opacity:1!important;
      box-shadow:none!important;transition:background .18s ease,border-color .18s ease!important;
    }
    .kg-account-session:hover,.kg-v4-action.account:hover{background:rgba(255,255,255,.11)!important;border-color:#718198!important}
    .kg-account-session:disabled,.kg-v4-action.account:disabled{opacity:.62!important;cursor:wait!important}
    .kg-account-session::before,.kg-v4-action.account::before{
      content:"";display:block;width:18px;height:18px;flex:0 0 18px;background:currentColor;
      -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'/%3E%3C/svg%3E") center/contain no-repeat;
      mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'/%3E%3C/svg%3E") center/contain no-repeat;
    }
    .kg-account-login-overlay{position:fixed;inset:0;z-index:1000002;background:rgba(7,20,38,.72);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
    .kg-account-login-card{width:min(430px,100%);background:#fff;color:#101828;border-radius:18px;padding:22px;box-sizing:border-box;box-shadow:0 28px 80px rgba(2,6,23,.35);position:relative}
    .kg-account-login-card h2{margin:0 0 6px;font-size:24px}.kg-account-login-card p{margin:0 0 16px;color:#667085;font-size:13px;line-height:1.5}
    .kg-account-login-close{position:absolute;right:14px;top:14px;width:34px;height:34px;border:0;border-radius:9px;background:#f2f4f7;font-size:20px;cursor:pointer;touch-action:manipulation}
    .kg-account-google{width:100%;min-height:46px;border:1px solid #d0d5dd;border-radius:10px;background:#fff;color:#1d2939;font-weight:850;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-sizing:border-box;touch-action:manipulation}
    .kg-account-google b{width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;border:1px solid #e5e7eb;color:#4285f4;background:#fff;font-family:Arial,sans-serif}
    .kg-account-divider{display:flex;align-items:center;gap:10px;color:#98a2b3;font-size:11px;font-weight:750;margin:14px 0}.kg-account-divider:before,.kg-account-divider:after{content:"";height:1px;background:#e5e7eb;flex:1}
    .kg-account-field{display:grid;gap:6px;margin-bottom:12px}.kg-account-field label{font-size:12px;font-weight:850;color:#475467}.kg-account-field input{width:100%;min-height:44px;border:1px solid #d0d5dd;border-radius:10px;padding:10px 12px;font:inherit;box-sizing:border-box}
    .kg-account-submit{width:100%;min-height:46px;border:0;border-radius:10px;background:#16a34a;color:#fff;font-weight:900;cursor:pointer;box-sizing:border-box;touch-action:manipulation}.kg-account-submit:disabled,.kg-account-google:disabled{opacity:.6;cursor:wait}
    .kg-account-note{margin:0 0 12px;padding:10px 12px;border-radius:10px;background:#f0fdf4;color:#166534;font-size:12px;display:none}.kg-account-note.show{display:block}.kg-account-note.error{background:#fff1f2;color:#b42318}
    .kg-account-forgot{margin-top:10px;border:0;background:transparent;padding:0;color:#087a37;font-size:11px;font-weight:850;cursor:pointer;touch-action:manipulation}
    @media(max-width:900px){.kg-account-session,.kg-v4-action.account{min-height:42px!important;padding:0 10px!important;font-size:11px!important;gap:7px!important}.kg-account-session::before,.kg-v4-action.account::before{width:16px;height:16px;flex-basis:16px}}
    @media(max-width:640px){
      .kg-account-login-overlay{
        align-items:flex-start;justify-content:center;
        padding:max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom));
      }
      .kg-account-login-card{
        width:100%;max-width:none;margin:auto 0;border-radius:18px;padding:20px 16px 18px;
        max-height:calc(100dvh - 20px);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;
      }
      .kg-account-login-card h2{font-size:23px;line-height:1.15;padding-right:44px;margin-bottom:7px}
      .kg-account-login-card p{font-size:13px;line-height:1.45;margin-bottom:14px;padding-right:28px}
      .kg-account-login-close{right:12px;top:12px;width:38px;height:38px;border-radius:11px;font-size:22px;line-height:1}
      .kg-account-google,.kg-account-submit{min-height:50px;border-radius:12px;font-size:15px}
      .kg-account-google b{width:25px;height:25px;flex:0 0 25px}
      .kg-account-divider{margin:12px 0;font-size:11px;gap:9px}
      .kg-account-field{gap:7px;margin-bottom:11px}
      .kg-account-field label{font-size:13px}
      .kg-account-field input{min-height:50px;border-radius:12px;padding:12px 13px;font-size:16px;line-height:1.2}
      .kg-account-note{font-size:12px;line-height:1.4;padding:10px 11px;margin-bottom:11px}
      .kg-account-forgot{display:inline-flex;align-items:center;min-height:38px;margin-top:4px;padding:5px 0;font-size:12px}
    }
    @media(max-width:380px){
      .kg-account-login-overlay{padding-left:8px;padding-right:8px}
      .kg-account-login-card{padding:18px 14px 16px;border-radius:16px}
      .kg-account-login-card h2{font-size:21px}
      .kg-account-login-card p{font-size:12px}
      .kg-account-google,.kg-account-submit,.kg-account-field input{min-height:48px}
    }
    @media(max-width:640px) and (max-height:650px){
      .kg-account-login-card{margin:4px 0;padding-top:16px;padding-bottom:14px}
      .kg-account-login-card p{margin-bottom:10px}
      .kg-account-divider{margin:9px 0}
      .kg-account-field{margin-bottom:8px}
      .kg-account-google,.kg-account-submit,.kg-account-field input{min-height:46px}
      .kg-account-forgot{min-height:32px}
    }
  `;
  document.head.appendChild(s);
}

function actionsHost(){
  return document.querySelector(".kg-approved-topbar .kg-topbar-actions") || document.querySelector(".top nav");
}

function placeAfterSell(button){
  var host=actionsHost();
  if(!host||!button)return;
  var sell=host.querySelector(".kg-v4-action.sell,.cta");
  var theme=host.querySelector(".kg-theme-btn,#themeToggle");
  if(sell){
    if(sell.nextSibling!==button)host.insertBefore(button,sell.nextSibling);
  }else if(theme){
    if(theme.previousSibling!==button)host.insertBefore(button,theme);
  }else if(button.parentNode!==host){
    host.appendChild(button);
  }
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
  overlay.innerHTML='<section class="kg-account-login-card" role="dialog" aria-modal="true" aria-labelledby="kgAccountLoginTitle"><button type="button" class="kg-account-login-close" aria-label="Kapat">×</button><h2 id="kgAccountLoginTitle">Giriş Yap</h2><p>KaçaGider hesabına Google veya e-posta ile giriş yap.</p><div id="kgAccountLoginNote" class="kg-account-note"></div><button type="button" class="kg-account-google" id="kgAccountGoogle"><b>G</b><span>Google ile devam et</span></button><div class="kg-account-divider">veya e-posta ile</div><form id="kgAccountLoginForm"><div class="kg-account-field"><label>E-posta</label><input id="kgAccountEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" enterkeyhint="next" required></div><div class="kg-account-field"><label>Şifre</label><input id="kgAccountPassword" type="password" minlength="8" autocomplete="current-password" enterkeyhint="go" required></div><button type="submit" class="kg-account-submit" id="kgAccountSubmit">Giriş Yap</button></form><button type="button" class="kg-account-forgot" id="kgAccountForgot">Şifremi unuttum</button></section>';
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
      cachedUser=result&&result.data?result.data.user:null;
      closeLogin();renderFallback(cachedUser,api);
    }catch(error){showNote(error.message||"Giriş yapılamadı.",true);submit.disabled=false;}
  };
  document.getElementById("kgAccountForgot").onclick=async function(){
    var email=document.getElementById("kgAccountEmail").value.trim();
    if(!email){showNote("Önce e-posta adresini gir.",true);return;}
    try{var result=await api.resetPassword(email);if(result&&result.error)throw result.error;showNote("Şifre yenileme bağlantısını e-posta adresine gönderdik.",false);}catch(error){showNote(error.message||"Şifre yenileme e-postası gönderilemedi.",true);}
  };
}

function useHeaderOwnedButton(){
  var headerButton=document.getElementById("kgHeaderAccountAction");
  if(!headerButton)return false;
  var fallback=document.getElementById("kgAccountSessionAction");
  if(fallback)fallback.remove();
  headerButton.classList.add("account");
  installStyle();
  placeAfterSell(headerButton);
  return true;
}

function renderFallback(user,api){
  if(useHeaderOwnedButton())return;
  var host=actionsHost();
  if(!host)return;
  installStyle();
  var button=document.getElementById("kgAccountSessionAction");
  if(!button){
    button=document.createElement("button");
    button.type="button";
    button.id="kgAccountSessionAction";
    button.className="kg-account-session";
  }
  if(user){
    button.textContent="Çıkış Yap";
    button.setAttribute("aria-label","KaçaGider hesabından çıkış yap");
    button.onclick=async function(){
      button.disabled=true;button.textContent="Çıkılıyor…";
      try{
        var result=await api.signOut();if(result&&result.error)throw result.error;
        try{sessionStorage.removeItem("kg-pending-listing-auth-v1");}catch(_e){}
        cachedUser=null;renderFallback(null,api);
      }catch(error){console.error("KaçaGider çıkış:",error);button.disabled=false;button.textContent="Çıkış Yap";alert("Çıkış işlemi tamamlanamadı. Lütfen tekrar dene.");}
    };
  }else{
    button.textContent="Giriş Yap";
    button.setAttribute("aria-label","KaçaGider hesabına giriş yap");
    button.onclick=function(){openLogin(api);};
  }
  button.disabled=false;
  if(button.parentNode!==host)host.appendChild(button);
  placeAfterSell(button);
}

async function sync(){
  try{
    var api=await waitForBackend(0);await api.ready;
    cachedApi=api;
    cachedUser=api.getSessionUser?await api.getSessionUser():await api.getUser();
    renderFallback(cachedUser,api);
    return api;
  }catch(error){console.warn("KaçaGider hesap menüsü:",error);return null;}
}

function observeHeader(){
  var host=actionsHost();
  if(!host||typeof MutationObserver==="undefined"||hostObserver)return;
  hostObserver=new MutationObserver(function(){
    if(useHeaderOwnedButton())return;
    if(cachedApi)renderFallback(cachedUser,cachedApi);
  });
  hostObserver.observe(host,{childList:true,subtree:false});
}

async function boot(){
  installStyle();
  var api=await sync();
  observeHeader();
  if(!api)return;
  var client=await api.init();
  if(client&&client.auth&&typeof client.auth.onAuthStateChange==="function")client.auth.onAuthStateChange(function(_event,session){cachedUser=session&&session.user?session.user:null;renderFallback(cachedUser,api);});
  setTimeout(sync,350);setTimeout(sync,900);setTimeout(function(){useHeaderOwnedButton();},1400);
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
else boot();
})();
