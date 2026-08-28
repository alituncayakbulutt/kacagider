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


  const SAMSUNG={
    "Galaxy S20":{
      "Kozmik Gri":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20_specs_design_colors_cosmic-gray.jpg?$684_547_PNG$",
      "Bulut Mavisi":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20_specs_design_colors_cloud-blue.jpg?$684_547_PNG$",
      "Bulut Pembesi":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20_specs_design_colors_cloud-pink.jpg?$684_547_PNG$"
    },
    "Galaxy S20+":{
      "Kozmik Siyah":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20-plus_specs_design_colors_cosmic-black.jpg?$684_547_PNG$",
      "Kozmik Gri":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20-plus_specs_design_colors_cosmic-gray.jpg?$684_547_PNG$",
      "Bulut Mavisi":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20-plus_specs_design_colors_cloud-blue.jpg?$684_547_PNG$",
      "Bulut Beyazı":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20-plus_specs_design_colors_cloud-white.jpg?$684_547_PNG$"
    },
    "Galaxy S20 Ultra":{
      "Kozmik Siyah":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20-ultra_specs_design_colors_cosmic-black.jpg?$684_547_PNG$",
      "Kozmik Gri":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20-ultra_specs_design_colors_cosmic-gray.jpg?$684_547_PNG$"
    },
    "Galaxy S20 FE":{
      "Bulut Laciverti":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20-fe_specs_design_colors_cloud-navy.jpg?$684_547_PNG$",
      "Bulut Lavantası":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20-fe_specs_design_colors_cloud-lavender.jpg?$684_547_PNG$",
      "Bulut Nanesi":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20-fe_specs_design_colors_cloud-mint.jpg?$684_547_PNG$",
      "Bulut Beyazı":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20-fe_specs_design_colors_cloud-white.jpg?$684_547_PNG$",
      "Bulut Turuncusu":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20-fe_specs_design_colors_cloud-orange.jpg?$684_547_PNG$",
      "Bulut Kırmızısı":"https://images.samsung.com/is/image/samsung/assets/es/smartphones/galaxy-s20/specs/galaxy-s20-fe_specs_design_colors_cloud-red.jpg?$684_547_PNG$"
    }
  };

  const DATA={Apple:APPLE,Samsung:SAMSUNG};

  /*
   * Marketplace varsayilan gorselleri modelden bagimsizdir:
   * satici fotografi yoksa her urun kendi kategorisinin ortak ikonunu kullanir.
   * Satici fotografi yuklendiginde mevcut oncelik nedeniyle ikon devreden cikar.
   */
  const CATEGORY_FALLBACKS={
    "Telefon":"/assets/marketplace/icons/telefon.svg",
    "Tablet":"/assets/marketplace/icons/tablet.svg",
    "Bilgisayar":"/assets/marketplace/icons/bilgisayar.svg",
    "Akıllı Saat":"/assets/marketplace/icons/akilli-saat.svg",
    "Oyun Konsolu":"/assets/marketplace/icons/oyun-konsolu.svg"
  };

  const VERIFIED_MODEL_COLORS={
    Xiaomi:{
      "Xiaomi 12 Lite":["Siyah","Lite Yeşil","Lite Pembe"]
    }
  };

  /*
   * Exact model kaydi bulunmayan markalarda renk alani bos kalmasin.
   * Exact DATA / VERIFIED_MODEL_COLORS kayitlari her zaman bu paletlerden once gelir.
   */
  const BRAND_COLOR_OPTIONS={
    Apple:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Pembe","Kırmızı","Sarı","Altın","Diğer"],
    Samsung:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Pembe","Kırmızı","Altın","Diğer"],
    Xiaomi:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Pembe","Altın","Diğer"],
    Oppo:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Altın","Diğer"],
    Vivo:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Altın","Diğer"],
    Huawei:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Altın","Diğer"],
    Honor:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Altın","Diğer"],
    Realme:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Mor","Sarı","Altın","Diğer"],
    OnePlus:["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Diğer"],
    Google:["Siyah","Beyaz","Gri","Mavi","Yeşil","Pembe","Mor","Diğer"]
  };
  const GENERIC_COLOR_OPTIONS=["Siyah","Beyaz","Gri","Gümüş","Mavi","Yeşil","Kırmızı","Mor","Pembe","Altın","Diğer"];

  const MODEL_COLOR_ALIASES={
    Samsung:{
      "Galaxy S20":{"Gri":"Kozmik Gri","Mavi":"Bulut Mavisi","Pembe":"Bulut Pembesi"},
      "Galaxy S20+":{"Siyah":"Kozmik Siyah","Gri":"Kozmik Gri","Mavi":"Bulut Mavisi","Beyaz":"Bulut Beyazı"},
      "Galaxy S20 Ultra":{"Siyah":"Kozmik Siyah","Gri":"Kozmik Gri"},
      "Galaxy S20 FE":{"Lacivert":"Bulut Laciverti","Mor":"Bulut Lavantası","Yeşil":"Bulut Nanesi","Beyaz":"Bulut Beyazı","Turuncu":"Bulut Turuncusu","Kırmızı":"Bulut Kırmızısı"}
    }
  };

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

  function normalizeCategory(category){
    const raw=String(category||"").trim();
    const aliases={
      "telefon":"Telefon",
      "phone":"Telefon",
      "tablet":"Tablet",
      "bilgisayar":"Bilgisayar",
      "computer":"Bilgisayar",
      "akıllı saat":"Akıllı Saat",
      "akilli saat":"Akıllı Saat",
      "akilli-saat":"Akıllı Saat",
      "watch":"Akıllı Saat",
      "oyun konsolu":"Oyun Konsolu",
      "oyun-konsolu":"Oyun Konsolu",
      "console":"Oyun Konsolu"
    };
    return aliases[raw.toLocaleLowerCase("tr-TR")]||raw;
  }

  function getCategoryImage(category){
    return CATEGORY_FALLBACKS[normalizeCategory(category)]||"";
  }

  function getModelImage(brand,model,color,category){
    return getCategoryImage(category);
  }

  function getModelColors(brand,model){
    brand=String(brand||"").trim();
    model=String(model||"").trim();
    const modelData=DATA[brand]&&DATA[brand][model];
    if(modelData) return Object.keys(modelData);
    const verified=VERIFIED_MODEL_COLORS[brand]&&VERIFIED_MODEL_COLORS[brand][model];
    if(verified) return verified.slice();
    const brandColors=BRAND_COLOR_OPTIONS[brand];
    return (brandColors||GENERIC_COLOR_OPTIONS).slice();
  }

  function hasExactModelColors(brand,model){
    return !!((DATA[brand]&&DATA[brand][model])||(VERIFIED_MODEL_COLORS[brand]&&VERIFIED_MODEL_COLORS[brand][model]));
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
      Array.from(select.attributes).forEach(function(attribute){
        replacement.setAttribute(attribute.name,attribute.value);
      });
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
      note.textContent=hasExactModelColors(info.brand,info.model)
        ? "Bu model için yalnızca doğrulanmış üretim renkleri gösterilir."
        : "Bu marka için yaygın renk seçenekleri gösterilir; farklı bir renk için Diğer seçeneğini kullanın.";
      field.appendChild(note);
    }
  }


  if(document){
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",syncListingColorSelect,{once:true});
    else syncListingColorSelect();
    new MutationObserver(syncListingColorSelect).observe(document.documentElement,{subtree:true,childList:true});
  }

  global.KG_MODEL_IMAGE_DATA=DATA;
  global.KG_CATEGORY_IMAGE_DATA=CATEGORY_FALLBACKS;
  global.getKgModelImage=getModelImage;
  global.getKgCategoryImage=getCategoryImage;
  global.getKgModelColors=getModelColors;

})(window);
