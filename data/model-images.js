(function(global){
  "use strict";

  /*
   * Marketplace test image policy:
   * - Kullanici kendi fotografini yuklediyse her zaman o kullanilir.
   * - Otomatik model gorseli yalnizca marka + model + secilen renk eslesiyorsa kullanilir.
   * - Bir modele ait tum renkleri ayni karede gosteren "colors" gorselleri kullanilmaz.
   * - Renk eslesmesi henuz yoksa yanlis fotograf gostermek yerine bos sonuc doner ve kategori fallback'i kullanilir.
   * - Ilan formunda gorsel eslemesi bulunan modeller icin sadece gercekte uretilen renkler listelenir.
   */

  const APPLE={
    "iPhone 11":{
      "Siyah":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-black-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Beyaz":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-white-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Sarı":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-yellow-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Kırmızı":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-red-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Yeşil":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-green-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Mor":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-purple-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80"
    },
    "iPhone 11 Pro":{
      "Gri":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-11-pro-space-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Gümüş":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-11-pro-silver-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Altın":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-11-pro-gold-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Yeşil":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-11-pro-midnight-green-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80"
    },
    "iPhone 11 Pro Max":{
      "Gri":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-11-pro-max-space-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Gümüş":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-11-pro-max-silver-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Altın":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-11-pro-max-gold-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Yeşil":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-11-pro-max-midnight-green-select-2019?wid=940&hei=1112&fmt=png-alpha&qlt=80"
    },
    "iPhone 12":{
      "Mavi":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-blue-select-2020?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Siyah":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-black-select-2020?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Beyaz":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-white-select-2020?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Yeşil":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-green-select-2020?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Kırmızı":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-red-select-2020?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Mor":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-purple-select-2021?wid=940&hei=1112&fmt=png-alpha&qlt=80"
    },
    "iPhone 13":{
      "Mavi":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-blue-select-2021?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Pembe":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-pink-select-2021?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Kırmızı":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-product-red-select-2021?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Siyah":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-midnight-select-2021?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Beyaz":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-starlight-select-2021?wid=940&hei=1112&fmt=png-alpha&qlt=80",
      "Yeşil":"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-green-select-2022?wid=940&hei=1112&fmt=png-alpha&qlt=80"
    }
  };

  const DATA={Apple:APPLE};

  const COLOR_ALIASES={
    "space gray":"Gri","space grey":"Gri","uzay grisi":"Gri","grafit":"Gri","graphite":"Gri",
    "silver":"Gümüş","gumus":"Gümüş","gümüş":"Gümüş",
    "gold":"Altın","altin":"Altın","altın":"Altın",
    "midnight green":"Yeşil","green":"Yeşil","yesil":"Yeşil","yeşil":"Yeşil",
    "black":"Siyah","midnight":"Siyah","siyah":"Siyah",
    "white":"Beyaz","starlight":"Beyaz","beyaz":"Beyaz",
    "blue":"Mavi","mavi":"Mavi",
    "red":"Kırmızı","product red":"Kırmızı","product(red)":"Kırmızı","kirmizi":"Kırmızı","kırmızı":"Kırmızı",
    "purple":"Mor","mor":"Mor",
    "pink":"Pembe","pembe":"Pembe",
    "yellow":"Sarı","sari":"Sarı","sarı":"Sarı"
  };

  function normalizeColor(color){
    const raw=String(color||"").trim();
    if(!raw) return "";
    const key=raw.toLocaleLowerCase("tr-TR").replace(/[()]/g,"").replace(/\s+/g," ");
    return COLOR_ALIASES[key]||raw;
  }

  function getModelImage(brand,model,color){
    brand=String(brand||"").trim();
    model=String(model||"").trim();
    color=normalizeColor(color);
    const modelData=DATA[brand]&&DATA[brand][model];
    if(!modelData||!color) return "";
    return modelData[color]||"";
  }

  function getModelColors(brand,model){
    brand=String(brand||"").trim();
    model=String(model||"").trim();
    const modelData=DATA[brand]&&DATA[brand][model];
    return modelData ? Object.keys(modelData) : [];
  }

  function selectedText(id){
    const el=document.getElementById(id);
    if(!el) return "";
    const opt=el.options&&el.options[el.selectedIndex];
    return String(opt?opt.textContent:el.value||"").trim();
  }

  function currentBrandModel(){
    const generic=document.getElementById("genericPanel");
    const isGeneric=generic&&getComputedStyle(generic).display!=="none";
    return {
      brand:selectedText(isGeneric?"genericBrand":"phoneBrand"),
      model:selectedText(isGeneric?"genericModel":"model")
    };
  }

  function syncListingColorSelect(){
    const select=document.getElementById("kgColor");
    if(!select||select.dataset.kgRealColors==="1") return;
    const info=currentBrandModel();
    const colors=getModelColors(info.brand,info.model);
    if(!colors.length) return;
    const current=String(select.value||"").trim();
    select.innerHTML='<option value="">Renk seçiniz</option>'+colors.map(function(color){return '<option value="'+color+'">'+color+'</option>';}).join('');
    if(colors.indexOf(current)!==-1) select.value=current;
    select.dataset.kgRealColors="1";
    const field=select.closest(".kg-mp-field");
    if(field&&!field.querySelector(".kg-real-color-note")){
      const note=document.createElement("small");
      note.className="kg-real-color-note";
      note.style.color="#667085";
      note.textContent="Bu model için yalnızca gerçek üretim renkleri gösterilir.";
      field.appendChild(note);
    }
  }

  if(document && document.head && !document.getElementById("kg-model-image-sizing")){
    const style=document.createElement("style");
    style.id="kg-model-image-sizing";
    style.textContent=".card{background:#070a0f!important;border-color:#202938!important;box-shadow:0 12px 30px rgba(7,10,15,.16)!important}.card:hover{border-color:#344054!important;box-shadow:0 16px 38px rgba(7,10,15,.24)!important}.card .body{background:#070a0f!important}.card .title,.card .asking{color:#f8fafc!important}.card .meta,.card .loc,.card .estimate span{color:#98a2b3!important}.card .estimate{border-top-color:#263244!important}.card .estimate strong{color:#22c55e!important}.card .chip{color:#d0d5dd!important;background:#111827!important;border-color:#2b3545!important}.card .detail{background:#111827!important;border:1px solid #2b3545!important}.card .detail:hover{background:#182235!important}.visual{height:300px!important;overflow:hidden!important;background:#090d13!important}.visual img.model-image{width:96%!important;height:96%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;object-position:center center!important;padding:0!important;margin:auto!important;transform:none!important;background:#090d13!important}.placeholder{background:#090d13!important;color:#e5e7eb!important}@media(max-width:540px){.visual{height:315px!important}.visual img.model-image{width:95%!important;height:95%!important}}";
    document.head.appendChild(style);
  }

  if(document){
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",syncListingColorSelect,{once:true});
    else syncListingColorSelect();
    new MutationObserver(syncListingColorSelect).observe(document.documentElement,{subtree:true,childList:true});
  }

  global.KG_MODEL_IMAGE_DATA=DATA;
  global.getKgModelImage=getModelImage;
  global.getKgModelColors=getModelColors;

  if(window.location.pathname==="/" && !document.getElementById("kgHeroSliderSyncScript")){
    const sync=document.createElement("script");
    sync.id="kgHeroSliderSyncScript";
    sync.src="/assets/marketplace-hero-slider-sync.js?v=1";
    sync.defer=true;
    document.head.appendChild(sync);
  }
})(window);
