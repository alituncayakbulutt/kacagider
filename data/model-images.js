(function(global){
  "use strict";

  /*
   * Marketplace test image policy:
   * - Kullanici kendi fotografini yuklediyse her zaman o kullanilir.
   * - Otomatik model gorseli yalnizca marka + model + secilen renk eslesiyorsa kullanilir.
   * - Bir modele ait tum renkleri ayni karede gosteren "colors" gorselleri kullanilmaz.
   * - Renk eslesmesi henuz yoksa yanlis fotograf gostermek yerine bos sonuc doner ve kategori fallback'i kullanilir.
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

  // Ilan kartinda otomatik cihaz gorseli kart alanini daha dolu kullansin.
  if(document && document.head && !document.getElementById("kg-model-image-sizing")){
    const style=document.createElement("style");
    style.id="kg-model-image-sizing";
    style.textContent=".visual img.model-image{width:100%!important;height:100%!important;object-fit:contain!important;padding:4px 10px 0!important;transform:scale(1.34);transform-origin:center center;background:#f8fafc!important}.visual{overflow:hidden!important}@media(max-width:540px){.visual img.model-image{transform:scale(1.28)}}";
    document.head.appendChild(style);
  }

  global.KG_MODEL_IMAGE_DATA=DATA;
  global.getKgModelImage=getModelImage;
})(window);
