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

  const CATEGORY_IMAGES={
    "Telefon":"/assets/marketplace/icons/telefon.svg",
    "Tablet":"/assets/marketplace/icons/tablet.svg",
    "Bilgisayar":"/assets/marketplace/icons/bilgisayar.svg",
    "Akıllı Saat":"/assets/marketplace/icons/akilli-saat.svg",
    "Oyun Konsolu":"/assets/marketplace/icons/oyun-konsolu.svg"
  };

  const VERIFIED_MODEL_COLORS={
    Samsung:{
      "Galaxy S20":["Kozmik Gri","Bulut Mavisi","Bulut Pembesi"],
      "Galaxy S20+":["Kozmik Siyah","Kozmik Gri","Bulut Mavisi"],
      "Galaxy S20 Ultra":["Kozmik Siyah","Kozmik Gri"]
    },
    Xiaomi:{
      "Xiaomi 12 Lite":["Siyah","Lite Yeşil","Lite Pembe"]
    }
  };

  const BRAND_COLORS={
    Apple:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Pembe","Kırmızı","Sarı","Altın","Diğer"],
    Samsung:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Pembe","Kırmızı","Altın","Diğer"],
    Xiaomi:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Pembe","Altın","Diğer"],
    Oppo:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Pembe","Altın","Diğer"],
    Vivo:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Pembe","Altın","Diğer"],
    Huawei:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Pembe","Altın","Diğer"],
    Honor:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Pembe","Altın","Diğer"],
    Realme:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Sarı","Altın","Diğer"],
    OnePlus:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Kırmızı","Altın","Diğer"],
    Google:["Siyah","Beyaz","Gri","Mavi","Yeşil","Pembe","Diğer"]
  };
  const GENERIC_COLORS=["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Pembe","Kırmızı","Sarı","Altın","Kahverengi","Diğer"];

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

  function getCategoryImage(category){
    return CATEGORY_IMAGES[String(category||"").trim()]||"";
  }

  function getModelColors(brand,model){
    brand=String(brand||"").trim();
    model=String(model||"").trim();
    const modelData=DATA[brand]&&DATA[brand][model];
    if(modelData) return Object.keys(modelData);
    const verified=VERIFIED_MODEL_COLORS[brand]&&VERIFIED_MODEL_COLORS[brand][model];
    if(verified) return verified.slice();
    return (BRAND_COLORS[brand]||GENERIC_COLORS).slice();
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
    let select=document.getElementById("kgColor")||document.getElementById("kgMpColor");
    if(!select||select.dataset.kgRealColors==="1") return;
    const info=currentBrandModel();
    const colors=getModelColors(info.brand,info.model);
    if(!colors.length) return;
    const current=String(select.value||"").trim();
    if(select.tagName!=="SELECT"){
      const replacement=document.createElement("select");
      replacement.id=select.id;
      replacement.name=select.name||"color";
      replacement.required=select.required;
      replacement.className=select.className;
      select.replaceWith(replacement);
      select=replacement;
    }
    select.innerHTML='<option value="">Renk seçiniz</option>'+colors.map(function(color){return '<option value="'+color+'">'+color+'</option>';}).join('');
    if(colors.indexOf(current)!==-1) select.value=current;
    select.dataset.kgRealColors="1";
    const field=select.closest(".kg-mp-field");
    if(field&&!field.querySelector(".kg-real-color-note")){
      const note=document.createElement("small");
      note.className="kg-real-color-note";
      note.style.color="#667085";
      const exact=Boolean((DATA[info.brand]&&DATA[info.brand][info.model])||(VERIFIED_MODEL_COLORS[info.brand]&&VERIFIED_MODEL_COLORS[info.brand][info.model]));
      note.textContent=exact?"Bu model için doğrulanmış üretim renkleri gösterilir.":"Bu marka için yaygın ürün renkleri gösterilir.";
      field.appendChild(note);
    }
  }

  if(document){
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",syncListingColorSelect,{once:true});
    else syncListingColorSelect();
    new MutationObserver(syncListingColorSelect).observe(document.documentElement,{subtree:true,childList:true});
  }

  global.KG_MODEL_IMAGE_DATA=DATA;
  global.getKgModelImage=getModelImage;
  global.getKgModelColors=getModelColors;
  global.getKgCategoryImage=getCategoryImage;
})(window);
