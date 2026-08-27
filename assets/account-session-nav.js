(function(){
"use strict";
if(window.__KG_ACCOUNT_SESSION_NAV__)return;
window.__KG_ACCOUNT_SESSION_NAV__=true;

function installStyle(){
  if(document.getElementById("kgAccountSessionNavStyle"))return;
  var s=document.createElement("style");
  s.id="kgAccountSessionNavStyle";
  s.textContent=`
    .kg-account-logout{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 13px;border:1px solid rgba(255,255,255,.34);border-radius:10px;background:rgba(255,255,255,.06);color:#fff;font:inherit;font-size:12px;font-weight:900;white-space:nowrap;cursor:pointer}
    .kg-account-logout:hover{background:rgba(255,255,255,.13)}
    .kg-account-logout:disabled{opacity:.6;cursor:wait}
    @media(max-width:540px){.kg-account-logout{min-height:38px;padding:0 9px;font-size:10px}}
  `;
  document.head.appendChild(s);
}

function actionsHost(){
  return document.querySelector(".kg-approved-topbar .kg-topbar-actions") || document.querySelector(".top nav");
}

function setButton(user,api){
  var host=actionsHost();
  if(!host)return;
  var button=document.getElementById("kgAccountLogout");
  if(!user){if(button)button.remove();return;}
  installStyle();
  if(button)return;
  button=document.createElement("button");
  button.type="button";
  button.id="kgAccountLogout";
  button.className="kg-account-logout";
  button.textContent="Çıkış Yap";
  button.setAttribute("aria-label","KaçaGider hesabından çıkış yap");
  button.addEventListener("click",async function(){
    button.disabled=true;
    button.textContent="Çıkılıyor…";
    try{
      var result=await api.signOut();
      if(result&&result.error)throw result.error;
      try{sessionStorage.removeItem("kg-pending-listing-auth-v1");}catch(_e){}
      location.reload();
    }catch(error){
      console.error("KaçaGider çıkış:",error);
      button.disabled=false;
      button.textContent="Çıkış Yap";
      alert("Çıkış işlemi tamamlanamadı. Lütfen tekrar dene.");
    }
  });
  var cta=host.querySelector(".cta,.kg-v4-action.sell");
  if(cta)host.insertBefore(button,cta);else host.appendChild(button);
}

function waitForBackend(tries){
  tries=tries||0;
  if(window.KGMarketplaceSupabase)return Promise.resolve(window.KGMarketplaceSupabase);
  if(tries>=120)return Promise.reject(new Error("Oturum sistemi yüklenemedi."));
  return new Promise(function(resolve,reject){setTimeout(function(){waitForBackend(tries+1).then(resolve,reject);},50);});
}

async function boot(){
  try{
    var api=await waitForBackend(0);
    await api.ready;
    var user=api.getSessionUser?await api.getSessionUser():await api.getUser();
    setButton(user,api);
    var client=await api.init();
    if(client&&client.auth&&typeof client.auth.onAuthStateChange==="function"){
      client.auth.onAuthStateChange(function(_event,session){setButton(session&&session.user?session.user:null,api);});
    }
  }catch(error){
    console.warn("KaçaGider hesap menüsü:",error);
  }
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
else boot();
})();
