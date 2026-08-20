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

  function setupContactForm(){
    var form=document.getElementById("contactForm");
    if(!form || form.dataset.kgContactActive==="1") return;
    form.dataset.kgContactActive="1";

    var honey=document.createElement("input");
    honey.type="text";
    honey.name="_honey";
    honey.tabIndex=-1;
    honey.autocomplete="off";
    honey.setAttribute("aria-hidden","true");
    honey.style.position="absolute";
    honey.style.left="-9999px";
    honey.style.width="1px";
    honey.style.height="1px";
    honey.style.opacity="0";
    form.appendChild(honey);

    document.addEventListener("submit",async function(event){
      if(!event.target || event.target.id!=="contactForm") return;
      event.preventDefault();
      event.stopImmediatePropagation();

      var name=document.getElementById("contactName");
      var email=document.getElementById("contactEmail");
      var subject=document.getElementById("contactSubject");
      var messageInput=document.getElementById("contactMessage");
      var status=document.getElementById("contactFormMessage");
      var submitButton=form.querySelector(".kg-contact-submit");
      var fields=[
        [name,"contactNameError","Ad Soyad alanını doldurun."],
        [email,"contactEmailError","Geçerli bir e-posta adresi girin."],
        [subject,"contactSubjectError","Konu alanını doldurun."],
        [messageInput,"contactMessageError","Mesaj alanını doldurun."]
      ];
      var valid=true;

      fields.forEach(function(field){
        var input=field[0];
        var error=document.getElementById(field[1]);
        var value=input ? String(input.value||"").trim() : "";
        var invalid=!value || (input===email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
        if(error) error.textContent=invalid ? field[2] : "";
        if(invalid) valid=false;
      });

      if(!valid){
        if(status){
          status.textContent="Lütfen işaretlenen alanları kontrol edin.";
          status.style.color="#dc2626";
        }
        return;
      }

      if(honey.value){
        form.reset();
        if(status){status.textContent="Mesajınız gönderildi. Teşekkürler.";status.style.color="";}
        return;
      }

      var oldText=submitButton ? submitButton.textContent : "";
      if(submitButton){submitButton.disabled=true;submitButton.textContent="Gönderiliyor...";}
      if(status){status.textContent="";status.style.color="";}

      try{
        var response=await fetch("https://formsubmit.co/ajax/info@kacagider.com.tr",{
          method:"POST",
          headers:{"Content-Type":"application/json","Accept":"application/json"},
          body:JSON.stringify({
            name:String(name.value||"").trim(),
            email:String(email.value||"").trim(),
            subject:String(subject.value||"").trim(),
            message:String(messageInput.value||"").trim(),
            _subject:"KaçaGider İletişim: "+String(subject.value||"").trim(),
            _template:"table",
            _honey:""
          })
        });
        var data={};
        try{data=await response.json();}catch(e){}
        if(!response.ok || data.success===false) throw new Error(data.message||"İletişim formu gönderilemedi.");

        form.reset();
        if(status){
          status.textContent="Mesajınız gönderildi. En kısa sürede dönüş yapacağız.";
          status.style.color="#176b38";
        }
        kgGaEvent("contact_form_submitted",{source_path:window.location.pathname});
      }catch(error){
        console.error("İletişim formu gönderilemedi:",error);
        if(status){
          status.innerHTML='Mesaj gönderilemedi. Lütfen tekrar deneyin veya <a href="mailto:info@kacagider.com.tr">info@kacagider.com.tr</a> adresinden bize ulaşın.';
          status.style.color="#dc2626";
        }
        kgGaEvent("contact_form_error",{source_path:window.location.pathname});
      }finally{
        if(submitButton){submitButton.disabled=false;submitButton.textContent=oldText||"Gönder";}
      }
    },true);
  }

  function ready(){
    document.addEventListener("change",function(event){onChange(event.target);},true);
    document.addEventListener("click",onClick,true);
    watchValuationCompletion();
    watchSaleSubmission();
    setupContactForm();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",ready,{once:true});
  else ready();
})();
