(function(){
  "use strict";

  var CATEGORY_LABELS={
    phone:"Telefon",
    tablet:"Tablet",
    computer:"Bilgisayar",
    watch:"Akıllı Saat",
    console:"Oyun Konsolu"
  };
  var PATH_CATEGORY_LABELS={
    telefon:"Telefon",
    tablet:"Tablet",
    bilgisayar:"Bilgisayar",
    "akilli-saat":"Akıllı Saat",
    "oyun-konsolu":"Oyun Konsolu"
  };

  function cleanParams(params){
    var out={};
    Object.keys(params||{}).forEach(function(key){
      var value=params[key];
      if(value===undefined || value===null || value==="" || (typeof value==="number" && !Number.isFinite(value))) return;
      out[key]=value;
    });
    return out;
  }

  function kgGaEvent(name,params){
    if(typeof window.gtag!=="function") return;
    var payload=cleanParams(Object.assign({page_path:window.location.pathname},params||{}));
    window.gtag("event",name,payload);
  }

  function visible(el){
    if(!el) return false;
    var style=window.getComputedStyle ? window.getComputedStyle(el) : null;
    return !style || (style.display!=="none" && style.visibility!=="hidden");
  }

  function activeCategoryKey(){
    var active=document.querySelector(".category-card.active[data-category]");
    if(active && CATEGORY_LABELS[active.dataset.category]) return active.dataset.category;

    var selectedName=document.getElementById("selectedCategoryName");
    var selectedText=selectedName ? String(selectedName.textContent||"").trim() : "";
    var found=Object.keys(CATEGORY_LABELS).find(function(key){return CATEGORY_LABELS[key]===selectedText;});
    if(found) return found;

    var first=window.location.pathname.split("/").filter(Boolean)[0]||"";
    return Object.keys(PATH_CATEGORY_LABELS).find(function(slug){return slug===first;}) || "";
  }

  function categoryLabel(){
    var key=activeCategoryKey();
    if(CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
    if(PATH_CATEGORY_LABELS[key]) return PATH_CATEGORY_LABELS[key];
    return "";
  }

  function isGenericContext(){
    var generic=document.getElementById("genericPanel");
    var phone=document.getElementById("phonePanel");
    if(visible(generic) && !visible(phone)) return true;
    var key=activeCategoryKey();
    return key && key!=="phone" && key!=="telefon";
  }

  function valuationContext(){
    var generic=isGenericContext();
    var brandEl=document.getElementById(generic ? "genericBrand" : "phoneBrand");
    var modelEl=document.getElementById(generic ? "genericModel" : "model");
    var storageEl=document.getElementById(generic ? "genericStorage" : "storage");
    return cleanParams({
      category:categoryLabel(),
      brand:brandEl ? brandEl.value : "",
      model:modelEl ? modelEl.value : "",
      storage:storageEl ? String(storageEl.value||"") : ""
    });
  }

  function parseNumber(value){
    var digits=String(value||"").replace(/[^0-9]/g,"");
    return digits ? Number(digits) : 0;
  }

  function storageUnit(){
    var key=activeCategoryKey();
    return key==="watch" || key==="akilli-saat" ? "mm" : "GB";
  }

  function withStorageUnit(ctx){
    if(!ctx.storage) return ctx;
    return Object.assign({},ctx,{storage_unit:storageUnit()});
  }

  function onChange(target){
    if(!target || !target.id) return;
    var ctx=withStorageUnit(valuationContext());
    if(target.id==="phoneBrand" || target.id==="genericBrand"){
      kgGaEvent("brand_selected",ctx);
      return;
    }
    if(target.id==="model" || target.id==="genericModel"){
      kgGaEvent("model_selected",ctx);
      return;
    }
    if(target.id==="storage" || target.id==="genericStorage"){
      kgGaEvent("storage_selected",ctx);
    }
  }

  var completionArmed=false;
  var lastCompletionSignature="";
  var saleSubmissionArmed=false;
  var lastSaleSignature="";

  function onClick(event){
    var target=event.target;
    if(!target || !target.closest) return;

    var categoryCard=target.closest("[data-category]");
    if(categoryCard && CATEGORY_LABELS[categoryCard.dataset.category]){
      kgGaEvent("category_selected",{category:CATEGORY_LABELS[categoryCard.dataset.category]});
    }

    var calc=target.closest(".calc-btn");
    if(calc && calc.id!=="standaloneSaleBtn"){
      completionArmed=true;
      lastCompletionSignature="";
      kgGaEvent("valuation_started",withStorageUnit(valuationContext()));
    }

    var sellIntent=target.closest(".sell-btn,.price-sale-cta");
    if(sellIntent){
      kgGaEvent("sell_intent_clicked",withStorageUnit(valuationContext()));
    }

    var saleSubmit=target.closest("#saleForm button,#standaloneSaleBtn");
    if(saleSubmit){
      saleSubmissionArmed=true;
      lastSaleSignature="";
    }

    var seoCta=target.closest(".kg-seo-cta");
    if(seoCta){
      var destination="";
      try{destination=new URL(seoCta.href,window.location.origin).pathname;}catch(e){}
      kgGaEvent("seo_cta_clicked",{
        source_path:window.location.pathname,
        destination_path:destination,
        link_text:String(seoCta.textContent||"").trim().slice(0,100)
      });
    }

    var guideLink=target.closest(".kg-dyk-guide-link,.kg-seo-guide-back,.kg-imei-official-link");
    if(guideLink){
      var guideDestination="";
      try{guideDestination=new URL(guideLink.href,window.location.origin).pathname;}catch(e){}
      kgGaEvent("guide_link_clicked",{
        destination_path:guideDestination,
        link_text:String(guideLink.textContent||"").trim().slice(0,100)
      });
    }
  }

  function watchValuationCompletion(){
    var price=document.getElementById("mainPrice");
    if(!price || typeof MutationObserver==="undefined") return;
    var observer=new MutationObserver(function(){
      if(!completionArmed) return;
      var estimatedPrice=parseNumber(price.textContent);
      if(!estimatedPrice) return;
      var ctx=withStorageUnit(valuationContext());
      var signature=[ctx.category,ctx.brand,ctx.model,ctx.storage,estimatedPrice].join("|");
      if(signature===lastCompletionSignature) return;
      lastCompletionSignature=signature;
      completionArmed=false;
      var trustScore=parseNumber(document.getElementById("trustScore") && document.getElementById("trustScore").textContent);
      kgGaEvent("valuation_completed",Object.assign({},ctx,{
        estimated_price:estimatedPrice,
        currency:"TRY",
        trust_score:trustScore||undefined
      }));
    });
    observer.observe(price,{childList:true,subtree:true,characterData:true});
  }

  function watchSaleSubmission(){
    var result=document.getElementById("saleCompareResult");
    if(!result || typeof MutationObserver==="undefined") return;
    var observer=new MutationObserver(function(){
      if(!saleSubmissionArmed || result.style.display!=="block") return;
      var salePrice=parseNumber(document.getElementById("salePriceInput") && document.getElementById("salePriceInput").value);
      if(!salePrice) salePrice=parseNumber(document.getElementById("standaloneSalePrice") && document.getElementById("standaloneSalePrice").value);
      if(!salePrice) return;
      var ctx=withStorageUnit(valuationContext());
      var signature=[ctx.category,ctx.brand,ctx.model,ctx.storage,salePrice].join("|");
      if(signature===lastSaleSignature) return;
      lastSaleSignature=signature;
      saleSubmissionArmed=false;
      kgGaEvent("sale_feedback_submitted",Object.assign({},ctx,{sale_price:salePrice,currency:"TRY"}));
    });
    observer.observe(result,{attributes:true,attributeFilter:["style","class"],childList:true,subtree:true});
  }

  function ready(){
    document.addEventListener("change",function(event){onChange(event.target);},true);
    document.addEventListener("click",onClick,true);
    watchValuationCompletion();
    watchSaleSubmission();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",ready,{once:true});
  else ready();
})();
