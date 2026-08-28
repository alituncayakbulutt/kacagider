// KaçaGider ekran değişim piyasa ortalamaları — 2026-08-22
// Amaç: "Piksel Atması" kusurunda modelin yaklaşık ekran değişim maliyetinin %50'sini düşmek.
// Bu değerler kesin servis teklifi değildir; Türkiye'deki güncel özel/yetkili servis ve yedek parça
// fiyatlarının genel taramasıyla oluşturulmuş piyasa ortalaması tahminleridir.
// Başlıca referanslar: Samsung Türkiye / Technopat, Telefon Profesörü, Servismatik,
// Teknofix, GSM İletişim, ALPA, Webtekno, TamirFiyatlari.com ve güncel servis ilanları.

(function(global){
  const DEFAULTS={Apple:7000,Samsung:5500,Xiaomi:3200,Oppo:4000,Vivo:4200,Huawei:5000,Honor:4000,Realme:3200,OnePlus:4200,Google:12000};

  const exact={
    Apple:{
      "iPhone 11":4000,"iPhone 11 Pro":6500,"iPhone 11 Pro Max":7000,"iPhone SE (2. nesil)":2500,
      "iPhone 12 mini":4500,"iPhone 12":5000,"iPhone 12 Pro":6500,"iPhone 12 Pro Max":7500,
      "iPhone 13 mini":5500,"iPhone 13":6000,"iPhone 13 Pro":8500,"iPhone 13 Pro Max":9500,"iPhone SE (3. nesil)":3000,
      "iPhone 14":8000,"iPhone 14 Plus":8500,"iPhone 14 Pro":11000,"iPhone 14 Pro Max":12500,
      "iPhone 15":12000,"iPhone 15 Plus":12500,"iPhone 15 Pro":15000,"iPhone 15 Pro Max":18000,
      "iPhone 16":15000,"iPhone 16 Plus":16000,"iPhone 16 Pro":17000,"iPhone 16 Pro Max":19000,"iPhone 16e":13000,
      "iPhone 17":17500,"iPhone 17 Pro":21000,"iPhone 17 Pro Max":24000,"iPhone Air":20500,"iPhone 17e":17000
    },
    Samsung:{
      "Galaxy S21":9500,"Galaxy S21+":9700,"Galaxy S21 Ultra":14400,"Galaxy S21 FE":7000,
      "Galaxy S22":9200,"Galaxy S22+":9200,"Galaxy S22 Ultra":12900,
      "Galaxy S23":8500,"Galaxy S23+":10000,"Galaxy S23 Ultra":13200,"Galaxy S23 FE":6000,
      "Galaxy S24":8200,"Galaxy S24+":10200,"Galaxy S24 Ultra":14100,"Galaxy S24 FE":6000,
      "Galaxy S25":8300,"Galaxy S25+":10400,"Galaxy S25 Edge":14400,"Galaxy S25 Ultra":14500,"Galaxy S25 FE":6500,
      "Galaxy S26":9200,"Galaxy S26+":11300,"Galaxy S26 Ultra":15100,
      "Galaxy A15":2500,"Galaxy A16":2800,"Galaxy A17":3000,"Galaxy A22":3400,"Galaxy A23":3300,"Galaxy A24":4050,"Galaxy A25":4200,"Galaxy A26":4300,
      "Galaxy A32":3200,"Galaxy A33 5G":3500,"Galaxy A34 5G":3800,"Galaxy A35 5G":3900,"Galaxy A36 5G":4300,
      "Galaxy A52":3800,"Galaxy A52s 5G":4000,"Galaxy A53 5G":4200,"Galaxy A54 5G":4500,"Galaxy A55 5G":4700,"Galaxy A56 5G":5200,"Galaxy A57 5G":5600,
      "Galaxy A72":4300,"Galaxy A73 5G":4700,
      "Galaxy Z Fold3":18000,"Galaxy Z Fold4":22000,"Galaxy Z Fold5":24000,"Galaxy Z Fold6":30000,"Galaxy Z Fold7":35000,"Galaxy Z Fold8":40000,"Galaxy Z Fold8 Ultra":45000,
      "Galaxy Z Flip3":9000,"Galaxy Z Flip4":10500,"Galaxy Z Flip5":12000,"Galaxy Z Flip6":14000,"Galaxy Z Flip7":15500,"Galaxy Z Flip8":17000
    }
  };

  function samsungFamily(model){
    if(/^Galaxy A1/.test(model)) return 2800;
    if(/^Galaxy A2/.test(model)) return 4000;
    if(/^Galaxy A3/.test(model)) return 4000;
    if(/^Galaxy A5/.test(model)) return 4700;
    if(/^Galaxy A7/.test(model)) return 4600;
    if(/^Galaxy M1/.test(model)) return 2800;
    if(/^Galaxy M2/.test(model)) return 3400;
    if(/^Galaxy M3/.test(model)) return 3800;
    if(/^Galaxy M5/.test(model)) return 4300;
    if(/^Galaxy Z Fold/.test(model)) return 26000;
    if(/^Galaxy Z Flip/.test(model)) return 13000;
    if(/^Galaxy S/.test(model)) return 9000;
    return DEFAULTS.Samsung;
  }

  function xiaomiFamily(model){
    const note=String(model).match(/Redmi Note\s*(\d+)/i);
    if(note){const n=+note[1]; if(n<=9)return 1100;if(n<=11)return 1500;if(n===12)return 1900;if(n===13)return /Pro/i.test(model)?3000:2300;if(n>=14)return /Pro/i.test(model)?4000:2800;}
    const mi=String(model).match(/(?:Xiaomi|Mi)\s*(\d+)/i);
    if(mi){const n=+mi[1];if(n<=11)return 2500;if(n===12)return 3500;if(n===13)return 4500;if(n===14)return 5500;if(n>=15)return 7000;}
    if(/POCO.*(?:X|F)6|POCO.*(?:X|F)7|POCO X8/i.test(model)) return 5000;
    if(/POCO/i.test(model)) return 3500;
    if(/Redmi/i.test(model)) return 2200;
    return DEFAULTS.Xiaomi;
  }

  function oppoFamily(model){
    if(/^Find X[89]/i.test(model)) return 9000;
    if(/^Find X[67]/i.test(model)) return 7500;
    if(/^Find X/i.test(model)) return 5500;
    const reno=String(model).match(/^Reno\s*(\d+)/i);
    if(reno){const n=+reno[1];if(n<=8)return 3000;if(n<=11)return 4300;if(n<=13)return 5500;return 6500;}
    if(/^A/i.test(model)) return 2300;
    return DEFAULTS.Oppo;
  }

  function vivoFamily(model){
    if(/^X2/i.test(model)) return 11000;
    if(/^X1/i.test(model)) return 9500;
    if(/^X/i.test(model)) return 7000;
    const v=String(model).match(/^V(\d+)/i);if(v){const n=+v[1];if(n<30)return 3800;if(n<50)return 5200;return 6200;}
    if(/^Y/i.test(model)) return 2300;
    return DEFAULTS.Vivo;
  }

  function huaweiFamily(model){
    if(/^Pura 80/i.test(model)) return 10000;if(/^Pura 70/i.test(model)) return 8500;
    if(/^P60/i.test(model)) return 7000;if(/^P50/i.test(model)) return 5500;if(/^P40/i.test(model)) return 4200;if(/^P30/i.test(model)) return 3200;
    if(/^Mate 60|^Mate 70/i.test(model)) return 9000;if(/^Mate 40|^Mate 50/i.test(model)) return 6500;if(/^Mate/i.test(model)) return 4500;
    if(/^nova/i.test(model)) return 3500;
    return DEFAULTS.Huawei;
  }

  function honorFamily(model){
    if(/^Magic/i.test(model)) return 8500;
    if(/^400/i.test(model)) return 6500;if(/^200/i.test(model)) return 5500;if(/^90/i.test(model)) return 4800;if(/^70/i.test(model)) return 4200;if(/^50/i.test(model)) return 3500;
    if(/^X/i.test(model)) return 2800;
    return DEFAULTS.Honor;
  }

  function realmeFamily(model){
    if(/^GT 7/i.test(model)) return 6000;if(/^GT 6/i.test(model)) return 5200;if(/^GT 5/i.test(model)) return 4500;if(/^GT/i.test(model)) return 3500;
    if(/^C/i.test(model)) return 2000;
    const n=String(model).match(/^(\d+)/);if(n){const v=+n[1];if(v<=10)return 2400;if(v<=12)return 3200;return 4000;}
    return DEFAULTS.Realme;
  }

  function oneplusFamily(model){
    if(/^Nord/i.test(model)) return 2800;
    const n=String(model).match(/(?:OnePlus\s*)?(\d+)/i);if(n){const v=+n[1];if(v<=9)return 3500;if(v<=11)return 5000;if(v<=12)return 6000;return 7500;}
    return DEFAULTS.OnePlus;
  }

  function googleFamily(model){
    const n=String(model).match(/Pixel\s*(\d+)/i);if(n){const v=+n[1];if(v<=6)return 7000;if(v===7)return 9000;if(v===8)return 15000;if(v===9)return 18000;return 20000;}
    return DEFAULTS.Google;
  }

  function getAverageScreenRepairPrice(brand,model){
    brand=String(brand||"");model=String(model||"");
    if(exact[brand] && exact[brand][model]) return exact[brand][model];
    if(brand==="Samsung") return samsungFamily(model);
    if(brand==="Xiaomi") return xiaomiFamily(model);
    if(brand==="Oppo") return oppoFamily(model);
    if(brand==="Vivo") return vivoFamily(model);
    if(brand==="Huawei") return huaweiFamily(model);
    if(brand==="Honor") return honorFamily(model);
    if(brand==="Realme") return realmeFamily(model);
    if(brand==="OnePlus") return oneplusFamily(model);
    if(brand==="Google") return googleFamily(model);
    return DEFAULTS[brand]||4000;
  }

  global.KG_SCREEN_REPAIR_PRICE_DATA=exact;
  global.getAverageScreenRepairPrice=getAverageScreenRepairPrice;
})(window);

// marketplace-test branch only: marketplace prototype assets are loaded directly with a version
// query so Codespaces/browser cache cannot keep an older header/slider implementation alive.
(function(){
  if(window.location.pathname!=="/") return;
  var V="20260825-0025";

  function add(src,onload){
    var s=document.createElement("script");
    s.src=src+(src.indexOf("?")===-1?"?":"&")+"v="+V;
    s.defer=true;
    if(onload) s.onload=onload;
    document.head.appendChild(s);
  }

  add("/data/model-images.js",function(){
    add("/assets/marketplace-details.js");
    add("/assets/marketplace-home-header.js");
    add("/assets/marketplace-home-slider.js");
    add("/assets/marketplace-store.js");
    add("/assets/marketplace-test.js");
    add("/assets/marketplace-production.js");
    add("/assets/marketplace-nav-test.js");
  });
})();
