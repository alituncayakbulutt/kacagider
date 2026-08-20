(function(){
  "use strict";

  function visible(el){
    if(!el) return false;
    var style=window.getComputedStyle ? window.getComputedStyle(el) : null;
    return !style || (style.display!=="none" && style.visibility!=="hidden");
  }

  function context(){
    var generic=document.getElementById("genericPanel");
    var phone=document.getElementById("phonePanel");
    var useGeneric=visible(generic) && !visible(phone);
    var brandEl=document.getElementById(useGeneric ? "genericBrand" : "phoneBrand");
    var modelEl=document.getElementById(useGeneric ? "genericModel" : "model");
    return {
      brand:brandEl ? String(brandEl.value||"").trim() : "",
      model:modelEl ? String(modelEl.value||"").trim() : ""
    };
  }

  function ensure(){
    var price=document.getElementById("mainPrice");
    if(!price) return null;
    var el=document.getElementById("resultProductName");
    if(!el){
      el=document.createElement("div");
      el.id="resultProductName";
      el.setAttribute("aria-live","polite");
      price.parentNode.insertBefore(el,price);
    }
    el.style.display="none";
    el.style.margin="3px 0 4px";
    el.style.fontSize="20px";
    el.style.lineHeight="1.25";
    el.style.fontWeight="900";
    el.style.color="#f8fafc";
    el.style.letterSpacing="-.2px";
    return el;
  }

  function priceExists(){
    var price=document.getElementById("mainPrice");
    if(!price) return false;
    return /[1-9]/.test(String(price.textContent||""));
  }

  function render(){
    if(!priceExists()) return;
    var ctx=context();
    if(!ctx.model) return;
    var el=ensure();
    if(!el) return;
    var modelLower=ctx.model.toLocaleLowerCase("tr-TR");
    var brandLower=ctx.brand.toLocaleLowerCase("tr-TR");
    var label=ctx.brand && modelLower.indexOf(brandLower)!==0 ? ctx.brand+" "+ctx.model : ctx.model;
    el.textContent=label;
    el.style.display="block";
  }

  function clear(){
    var el=document.getElementById("resultProductName");
    if(el){el.textContent="";el.style.display="none";}
  }

  function scheduleRender(){
    [0,50,150,350,700].forEach(function(delay){
      window.setTimeout(render,delay);
    });
  }

  function init(){
    ensure();

    document.addEventListener("change",function(event){
      var id=event.target && event.target.id;
      if(id==="phoneBrand" || id==="model" || id==="storage" || id==="genericBrand" || id==="genericModel" || id==="genericStorage") clear();
    },true);

    document.addEventListener("click",function(event){
      var target=event.target;
      if(!target || !target.closest) return;
      var calc=target.closest(".calc-btn");
      if(calc && calc.id!=="standaloneSaleBtn") scheduleRender();
    },true);

    var price=document.getElementById("mainPrice");
    if(price && typeof MutationObserver!=="undefined"){
      new MutationObserver(scheduleRender).observe(price,{childList:true,subtree:true,characterData:true});
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
