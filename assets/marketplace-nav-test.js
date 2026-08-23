(function(){
  "use strict";
  function installListingsNav(){
    if(document.getElementById("kgMpListingsNav")) return;
    var nav=document.querySelector(".kg-main-nav") || document.querySelector("nav");
    if(!nav) return;
    var link=document.createElement("a");
    link.id="kgMpListingsNav";
    link.href="/ilanlar/";
    link.textContent="İlanlar";
    link.setAttribute("aria-label","Yayındaki ilanları görüntüle");
    var info=Array.from(nav.querySelectorAll("a,button")).find(function(el){
      return String(el.textContent||"").trim().toLocaleUpperCase("tr-TR").indexOf("BİLGİ MERKEZİ")!==-1;
    });
    if(info && info.parentNode===nav) nav.insertBefore(link,info);
    else nav.appendChild(link);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",installListingsNav,{once:true});
  else installListingsNav();
  new MutationObserver(installListingsNav).observe(document.documentElement,{subtree:true,childList:true});
})();
