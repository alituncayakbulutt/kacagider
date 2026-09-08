(function(){
  "use strict";
  if(window.__KG_MOBILE_PWA__)return;window.__KG_MOBILE_PWA__=true;
  var deferred=null;
  function setupManifest(){if(!document.querySelector('link[rel="manifest"]')){var l=document.createElement('link');l.rel='manifest';l.href='/manifest.webmanifest';document.head.appendChild(l);}if(!document.querySelector('meta[name="theme-color"]')){var m=document.createElement('meta');m.name='theme-color';m.content='#0b1628';document.head.appendChild(m);}}
  function register(){if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(e){console.warn('KaçaGider PWA:',e);});}
  function ensureButton(){if(document.getElementById('kgInstallApp'))return;var b=document.createElement('button');b.id='kgInstallApp';b.type='button';b.textContent='KaçaGider’i Telefona Ekle';b.style.cssText='position:fixed;right:14px;bottom:14px;z-index:9998;border:0;border-radius:999px;padding:10px 14px;background:#0b1628;color:#fff;font-size:11px;font-weight:900;box-shadow:0 8px 24px rgba(2,6,23,.24);display:none';b.onclick=async function(){if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;b.style.display='none';}else{alert('iPhone/iPad: Safari paylaş menüsünden “Ana Ekrana Ekle” seçeneğini kullanabilirsin.');}};document.body.appendChild(b);}
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;ensureButton();document.getElementById('kgInstallApp').style.display='block';});
  window.addEventListener('appinstalled',function(){var b=document.getElementById('kgInstallApp');if(b)b.style.display='none';});
  function ready(){setupManifest();register();ensureButton();if(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.matchMedia('(display-mode: standalone)').matches){var b=document.getElementById('kgInstallApp');if(b)b.style.display='block';}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
