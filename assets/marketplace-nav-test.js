(function(){
  "use strict";

  function clean(v){return String(v||"").replace(/\s+/g," ").trim();}

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
      return clean(el.textContent).toLocaleUpperCase("tr-TR").indexOf("BİLGİ MERKEZİ")!==-1;
    });
    if(info && info.parentNode===nav) nav.insertBefore(link,info);
    else nav.appendChild(link);
  }

  function goValue(){
    try{
      if(typeof window.kgGoCategory==="function"){ window.kgGoCategory("phone"); return; }
      var phone=document.querySelector('[data-category="phone"]');
      if(phone){ phone.click(); return; }
    }catch(e){}
    location.href="/";
  }

  function installHeroSliderFix(){
    var home=document.getElementById("viewHome");
    if(!home) return false;
    var slider=document.getElementById("kgMarketplaceSlider") || home.querySelector(".kg-market-slider");
    var hero=home.querySelector(":scope > .kg-approved-hero, :scope > .hero");
    if(!slider || !hero) return false;
    if(slider.dataset.kgHeroMoved==="1") return true;

    var first=slider.querySelector(".kg-market-slide");
    var copy=first && first.querySelector(".kg-market-copy");
    var oldTitle=copy && copy.querySelector("h2");
    var oldText=copy && copy.querySelector("p");
    var eyebrow=copy && copy.querySelector(".kg-market-eyebrow");
    var actions=copy && copy.querySelector(".kg-market-actions");
    var h1=hero.querySelector("h1");
    var p=hero.querySelector("p");
    if(!first || !copy || !h1 || !p) return false;

    if(oldTitle) oldTitle.remove();
    if(oldText) oldText.remove();
    h1.classList.add("kg-slider-main-h1");
    p.classList.add("kg-slider-main-p");
    if(eyebrow){
      eyebrow.textContent="ANINDA DEĞERLEME";
      eyebrow.insertAdjacentElement("afterend",h1);
    }else{
      copy.insertBefore(h1,copy.firstChild);
    }
    h1.insertAdjacentElement("afterend",p);

    if(actions){
      actions.innerHTML='<button type="button" class="kg-market-btn primary" id="kgSliderValueBtn">Fiyatını Hesapla →</button><button type="button" class="kg-market-btn secondary" id="kgSliderSellBtn">Ücretsiz İlan Ver →</button>';
      var valueBtn=actions.querySelector("#kgSliderValueBtn");
      var sellBtn=actions.querySelector("#kgSliderSellBtn");
      if(valueBtn) valueBtn.addEventListener("click",goValue);
      if(sellBtn) sellBtn.addEventListener("click",goValue);
    }

    hero.remove();
    slider.dataset.kgHeroMoved="1";

    var style=document.getElementById("kgHeroSliderFixStyle") || document.createElement("style");
    style.id="kgHeroSliderFixStyle";
    style.textContent='\n#viewHome:not(.category-selected) .kg-slider-main-h1{margin:0!important;max-width:760px!important;color:#0b1628!important;font-size:43px!important;line-height:1.04!important;letter-spacing:-1.45px!important;font-weight:950!important;text-align:left!important}\n#viewHome:not(.category-selected) .kg-slider-main-h1 span{color:#16a34a!important}\n#viewHome:not(.category-selected) .kg-slider-main-p{max-width:680px!important;margin:16px 0 0!important;color:#5f6c7d!important;font-size:16px!important;line-height:1.55!important;text-align:left!important}\nhtml[data-theme="dark"] #viewHome:not(.category-selected) .kg-slider-main-h1{color:#f1f5f9!important}\nhtml[data-theme="dark"] #viewHome:not(.category-selected) .kg-slider-main-p{color:#b5c1d0!important}\n@media(max-width:980px){#viewHome:not(.category-selected) .kg-slider-main-h1{font-size:37px!important;text-align:center!important}#viewHome:not(.category-selected) .kg-slider-main-p{text-align:center!important;margin-left:auto!important;margin-right:auto!important}}\n@media(max-width:640px){#viewHome:not(.category-selected) .kg-slider-main-h1{font-size:31px!important;letter-spacing:-.9px!important}#viewHome:not(.category-selected) .kg-slider-main-p{font-size:14px!important}}';
    if(!style.parentNode) document.head.appendChild(style);
    return true;
  }

  function boot(){
    installListingsNav();
    var tries=0;
    var timer=setInterval(function(){
      tries++;
      installListingsNav();
      if(installHeroSliderFix() || tries>100) clearInterval(timer);
    },100);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
  new MutationObserver(function(){installListingsNav();installHeroSliderFix();}).observe(document.documentElement,{subtree:true,childList:true});
})();
