const PHONE_PRICE_DATA = {
  Apple: {
    "iPhone 11": {
      64: { estimated_price: 12149, quick_sale_price: 11420, listing_price: 13060, confidence_score: 47, observation_count: 3 },
      128: { estimated_price: 14699, quick_sale_price: 13817, listing_price: 15801, confidence_score: 40, observation_count: 1 }
    },
    "iPhone 12": {
      64: { estimated_price: 18424, quick_sale_price: 17319, listing_price: 19806, confidence_score: 49, observation_count: 4 },
      128: { estimated_price: 22032, quick_sale_price: 20710, listing_price: 23684, confidence_score: 46, observation_count: 4 }
    },
    "iPhone 13": {
      128: { estimated_price: 29354, quick_sale_price: 27593, listing_price: 31556, confidence_score: 42, observation_count: 2 },
      256: { estimated_price: 31849, quick_sale_price: 29938, listing_price: 34238, confidence_score: 47, observation_count: 3 }
    },
    "iPhone 13 Pro": {
      128: { estimated_price: 45524, quick_sale_price: 42793, listing_price: 48938, confidence_score: 42, observation_count: 2 },
      256: { estimated_price: 47749, quick_sale_price: 44884, listing_price: 51330, confidence_score: 40, observation_count: 1 }
    },
    "iPhone 13 Pro Max": {
      128: { estimated_price: 45339, quick_sale_price: 42619, listing_price: 48740, confidence_score: 73, observation_count: 10 },
      256: { estimated_price: 49549, quick_sale_price: 46576, listing_price: 53265, confidence_score: 47, observation_count: 2 }
    },
    "iPhone 14": {
      128: { estimated_price: 35402, quick_sale_price: 33278, listing_price: 38057, confidence_score: 56, observation_count: 5 }
    },
    "iPhone 14 Pro": {
      128: { estimated_price: 53799, quick_sale_price: 50571, listing_price: 57834, confidence_score: 51, observation_count: 5 }
    },
    "iPhone 14 Pro Max": {
      256: { estimated_price: 60150, quick_sale_price: 56541, listing_price: 64661, confidence_score: 42, observation_count: 2 }
    },
    "iPhone 15": {
      128: { estimated_price: 48874, quick_sale_price: 45942, listing_price: 52540, confidence_score: 46, observation_count: 4 }
    },
    "iPhone 15 Pro": {
      128: { estimated_price: 68014, quick_sale_price: 63933, listing_price: 73115, confidence_score: 42, observation_count: 2 }
    },
    "iPhone 15 Pro Max": {
      256: { estimated_price: 81174, quick_sale_price: 76304, listing_price: 87262, confidence_score: 45, observation_count: 2 }
    }
  },
  Samsung: {
    "Galaxy S20": {
      128: { estimated_price: 7000, quick_sale_price: 6300, listing_price: 7700, confidence_score: 80, observation_count: 0, updated_at: "2026-08-17" }
    },
    "Galaxy S20+": {
      128: { estimated_price: 9500, quick_sale_price: 8500, listing_price: 10500, confidence_score: 80, observation_count: 0, updated_at: "2026-08-17" }
    },
    "Galaxy S20 Ultra": {
      128: { estimated_price: 12500, quick_sale_price: 11000, listing_price: 14000, confidence_score: 80, observation_count: 0, updated_at: "2026-08-17" }
    },
    "Galaxy S20 FE": {
      128: { estimated_price: 9000, quick_sale_price: 8100, listing_price: 9900, confidence_score: 78, observation_count: 0, updated_at: "2026-08-17" },
      256: { estimated_price: 10000, quick_sale_price: 9000, listing_price: 11000, confidence_score: 72, observation_count: 0, updated_at: "2026-08-17" }
    },
    "Galaxy S21": {
      128: { estimated_price: 10000, quick_sale_price: 9000, listing_price: 11000, confidence_score: 82, observation_count: 0, updated_at: "2026-08-17" },
      256: { estimated_price: 11000, quick_sale_price: 10000, listing_price: 12000, confidence_score: 72, observation_count: 0, updated_at: "2026-08-17" }
    },
    "Galaxy S21+": {
      128: { estimated_price: 13500, quick_sale_price: 12000, listing_price: 15000, confidence_score: 78, observation_count: 0, updated_at: "2026-08-17" },
      256: { estimated_price: 15000, quick_sale_price: 13500, listing_price: 16500, confidence_score: 76, observation_count: 0, updated_at: "2026-08-17" }
    },
    "Galaxy S21 Ultra": {
      128: { estimated_price: 17500, quick_sale_price: 16000, listing_price: 19000, confidence_score: 76, observation_count: 0, updated_at: "2026-08-17" },
      256: { estimated_price: 20000, quick_sale_price: 18000, listing_price: 22000, confidence_score: 82, observation_count: 0, updated_at: "2026-08-17" },
      512: { estimated_price: 22000, quick_sale_price: 20000, listing_price: 24000, confidence_score: 68, observation_count: 0, updated_at: "2026-08-17" }
    },
    "Galaxy S21 FE": {
      128: { estimated_price: 11500, quick_sale_price: 10500, listing_price: 12500, confidence_score: 80, observation_count: 0, updated_at: "2026-08-17" },
      256: { estimated_price: 13000, quick_sale_price: 11750, listing_price: 14250, confidence_score: 72, observation_count: 0, updated_at: "2026-08-17" }
    },
    "Galaxy S22": {
      128: { estimated_price: 15000, quick_sale_price: 13750, listing_price: 16250, confidence_score: 86, observation_count: 10, updated_at: "2026-08-17" },
      256: { estimated_price: 16500, quick_sale_price: 15000, listing_price: 18000, confidence_score: 72, observation_count: 5, updated_at: "2026-08-17" }
    },
    "Galaxy S23": {
      128: { estimated_price: 18000, quick_sale_price: 16500, listing_price: 19500, confidence_score: 84, observation_count: 8, updated_at: "2026-08-17" },
      256: { estimated_price: 21000, quick_sale_price: 19000, listing_price: 22500, confidence_score: 82, observation_count: 7, updated_at: "2026-08-17" }
    },
    "Galaxy S24": {
      128: { estimated_price: 27000, quick_sale_price: 24500, listing_price: 29000, confidence_score: 82, observation_count: 8, updated_at: "2026-08-17" },
      256: { estimated_price: 30000, quick_sale_price: 27500, listing_price: 32500, confidence_score: 82, observation_count: 8, updated_at: "2026-08-17" }
    },
    "Galaxy S25": {
      128: { estimated_price: 37000, quick_sale_price: 34000, listing_price: 39500, confidence_score: 70, observation_count: 4, updated_at: "2026-08-17" }
    }
  },
  Xiaomi: {},
  Oppo: {
    "Find X3 Pro": {
      256: { estimated_price: 14000, quick_sale_price: 12700, listing_price: 15300, confidence_score: 72, observation_count: 0, updated_at: "2026-08-18" }
    },
    "Find X5": {
      128: { estimated_price: 15000, quick_sale_price: 13600, listing_price: 16400, confidence_score: 65, observation_count: 0, updated_at: "2026-08-18" },
      256: { estimated_price: 17000, quick_sale_price: 15500, listing_price: 18500, confidence_score: 65, observation_count: 0, updated_at: "2026-08-18" }
    },
    "Find X5 Pro": {
      256: { estimated_price: 18500, quick_sale_price: 16800, listing_price: 20200, confidence_score: 75, observation_count: 0, updated_at: "2026-08-18" }
    },
    "Find X6 Pro": {
      256: { estimated_price: 16000, quick_sale_price: 14600, listing_price: 17400, confidence_score: 70, observation_count: 0, updated_at: "2026-08-18" },
      512: { estimated_price: 19000, quick_sale_price: 17300, listing_price: 20700, confidence_score: 65, observation_count: 0, updated_at: "2026-08-18" }
    }
  }
};

const APPLE_SUPPLEMENTAL_PRICE_DATA={
  "iPhone 11":{256:[17500,45]},
  "iPhone 11 Pro":{64:[12000,70],256:[15000,65],512:[18000,55]},
  "iPhone 11 Pro Max":{64:[15000,70],256:[18500,65],512:[21500,55]},
  "iPhone SE (2. nesil)":{64:[5000,70],128:[6000,65],256:[7000,55]},
  "iPhone 12 mini":{64:[10000,70],128:[11500,65],256:[13000,55]},
  "iPhone 12":{256:[25000,45]},
  "iPhone 12 Pro":{128:[16000,70],256:[18500,65],512:[21000,55]},
  "iPhone 12 Pro Max":{128:[19000,70],256:[21500,65],512:[24500,55]},
  "iPhone 13 mini":{128:[15000,70],256:[17000,65],512:[19000,55]},
  "iPhone 13":{512:[35000,42]},
  "iPhone 13 Pro":{512:[53000,45],1024:[60500,38]},
  "iPhone 13 Pro Max":{512:[55000,60],1024:[62500,48]},
  "iPhone SE (3. nesil)":{64:[6500,70],128:[7500,65],256:[8500,55]},
  "iPhone 14":{256:[38500,52],512:[42000,45]},
  "iPhone 14 Plus":{128:[22000,70],256:[24500,65],512:[27000,55]},
  "iPhone 14 Pro":{256:[57500,50],512:[63000,45],1024:[70000,38]},
  "iPhone 14 Pro Max":{128:[56000,50],512:[68000,45],1024:[75000,38]},
  "iPhone 15":{256:[53500,45],512:[59000,40]},
  "iPhone 15 Plus":{128:[28000,70],256:[31500,65],512:[35000,55]},
  "iPhone 15 Pro":{256:[73500,45],512:[80000,40],1024:[88000,35]},
  "iPhone 15 Pro Max":{512:[89500,40],1024:[99000,35]},
  "iPhone 16":{128:[30000,70],256:[34000,65],512:[38000,55]},
  "iPhone 16 Plus":{128:[35000,70],256:[39500,65],512:[44000,55]},
  "iPhone 16 Pro":{128:[43000,70],256:[49000,65],512:[55000,55],1024:[62000,45]},
  "iPhone 16 Pro Max":{256:[58000,70],512:[66000,65],1024:[75000,55]},
  "iPhone 16e":{128:[28000,70],256:[31500,65],512:[35500,55]},
  "iPhone 17":{256:[45000,65],512:[51000,55]},
  "iPhone 17 Pro":{256:[60000,65],512:[68000,55],1024:[78000,45]},
  "iPhone 17 Pro Max":{256:[75000,65],512:[85000,55],1024:[97000,45],2048:[112000,35]},
  "iPhone Air":{256:[55000,65],512:[62000,55],1024:[71000,45]},
  "iPhone 17e":{256:[50000,60],512:[57000,50]}
};
Object.entries(APPLE_SUPPLEMENTAL_PRICE_DATA).forEach(([model, prices])=>{
  const existing=PHONE_PRICE_DATA.Apple[model]||(PHONE_PRICE_DATA.Apple[model]={});
  Object.entries(prices).forEach(([storage,[estimated_price,confidence_score]])=>{
    if(existing[storage]) return;
    existing[storage]={estimated_price,quick_sale_price:Math.round(estimated_price*.91/100)*100,listing_price:Math.round(estimated_price*1.09/100)*100,confidence_score,observation_count:0,updated_at:"2026-08-18"};
  });
});

const APPLE_TR_PRICE_DATA={
  "iPhone 11":{64:[11500,80],128:[13500,80],256:[15500,80]},
  "iPhone 11 Pro":{64:[13500,80],256:[15500,80],512:[17500,75]},
  "iPhone 11 Pro Max":{64:[16000,80],256:[18000,80],512:[20000,75]},
  "iPhone SE (2. nesil)":{64:[6000,80],128:[7500,80],256:[9000,80]},
  "iPhone 12 mini":{64:[15000,80],128:[17000,80],256:[19000,80]},
  "iPhone 12":{64:[18000,80],128:[20500,80],256:[23000,80]},
  "iPhone 12 Pro":{128:[24000,80],256:[26000,80],512:[28500,75]},
  "iPhone 12 Pro Max":{128:[27000,80],256:[29000,80],512:[31500,75]},
  "iPhone 13 mini":{128:[23000,80],256:[25000,80],512:[28000,75]},
  "iPhone 13":{128:[28000,85],256:[31000,85],512:[34500,80]},
  "iPhone 13 Pro":{128:[35000,80],256:[38000,80],512:[42000,75],1024:[46000,70]},
  "iPhone 13 Pro Max":{128:[37000,80],256:[40000,80],512:[44500,75],1024:[49000,70]},
  "iPhone SE (3. nesil)":{64:[8500,80],128:[10000,80],256:[12000,80]},
  "iPhone 14":{128:[34000,85],256:[37000,85],512:[41000,80]},
  "iPhone 14 Plus":{128:[36000,80],256:[40000,80],512:[44000,75]},
  "iPhone 14 Pro":{128:[42000,80],256:[45500,80],512:[50000,75],1024:[55000,70]},
  "iPhone 14 Pro Max":{128:[48000,80],256:[52000,80],512:[57000,75],1024:[62500,70]},
  "iPhone 15":{128:[41000,85],256:[45500,85],512:[51000,80]},
  "iPhone 15 Plus":{128:[47000,80],256:[51000,80],512:[58000,75]},
  "iPhone 15 Pro":{128:[58000,85],256:[63000,85],512:[69000,80],1024:[76000,75]},
  "iPhone 15 Pro Max":{256:[68000,85],512:[75000,80],1024:[83000,75]},
  "iPhone 16":{128:[52000,85],256:[57000,85],512:[63000,80]},
  "iPhone 16 Plus":{128:[57000,80],256:[62000,80],512:[69000,75]},
  "iPhone 16 Pro":{128:[72000,85],256:[78000,85],512:[85000,80],1024:[93000,75]},
  "iPhone 16 Pro Max":{256:[82000,85],512:[92000,80],1024:[103000,75]},
  "iPhone 16e":{128:[37000,80],256:[42000,80],512:[48000,75]},
  "iPhone 17":{256:[70000,75],512:[80000,70]},
  "iPhone 17 Pro":{256:[96000,75],512:[106000,70],1024:[118000,65]},
  "iPhone 17 Pro Max":{256:[112000,75],512:[123000,70],1024:[136000,65],2048:[151000,65]},
  "iPhone Air":{256:[68000,75],512:[78000,70],1024:[90000,65]},
  "iPhone 17e":{256:[52000,75],512:[60000,70]}
};
Object.entries(APPLE_TR_PRICE_DATA).forEach(([model, prices])=>{
  PHONE_PRICE_DATA.Apple[model]={};
  Object.entries(prices).forEach(([storage,[estimated_price,confidence_score]])=>{
    PHONE_PRICE_DATA.Apple[model][storage]={estimated_price,quick_sale_price:Math.round(estimated_price*.91/100)*100,listing_price:Math.round(estimated_price*1.09/100)*100,confidence_score,observation_count:0,updated_at:"2026-08-18"};
  });
});

PHONE_PRICE_DATA.Vivo={
  "X200 FE":{256:{estimated_price:36000,quick_sale_price:32800,listing_price:39200,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "X300":{512:{estimated_price:52000,quick_sale_price:47300,listing_price:56700,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "X300 Pro":{512:{estimated_price:62000,quick_sale_price:56400,listing_price:67600,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "X300 Ultra":{512:{estimated_price:75000,quick_sale_price:68300,listing_price:81800,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "V21":{128:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "V21e":{128:{estimated_price:6500,quick_sale_price:5900,listing_price:7100,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "V23 5G":{128:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "V25":{128:{estimated_price:9500,quick_sale_price:8600,listing_price:10400,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "V29 Lite 5G":{256:{estimated_price:12000,quick_sale_price:10900,listing_price:13100,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "V29":{256:{estimated_price:15000,quick_sale_price:13600,listing_price:16400,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "V30":{256:{estimated_price:17500,quick_sale_price:15900,listing_price:19100,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "V30 Lite":{256:{estimated_price:12000,quick_sale_price:10900,listing_price:13100,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "V40 5G":{256:{estimated_price:21000,quick_sale_price:19100,listing_price:22900,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "V40 Lite":{256:{estimated_price:13000,quick_sale_price:11800,listing_price:14200,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "V50 5G":{256:{estimated_price:22000,quick_sale_price:20000,listing_price:24000,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "V50 Lite":{256:{estimated_price:13500,quick_sale_price:12300,listing_price:14700,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "V50 Lite 5G":{256:{estimated_price:16500,quick_sale_price:15000,listing_price:18000,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "V60 5G":{256:{estimated_price:25000,quick_sale_price:22800,listing_price:27300,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "V60 Lite":{256:{estimated_price:20000,quick_sale_price:18200,listing_price:21800,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "V60 Lite 5G":{256:{estimated_price:23500,quick_sale_price:21400,listing_price:25600,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "V70":{256:{estimated_price:28000,quick_sale_price:25500,listing_price:30500,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "V70 FE":{256:{estimated_price:23000,quick_sale_price:20900,listing_price:25100,confidence_score:70,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:27000,quick_sale_price:24600,listing_price:29400,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Y20":{64:{estimated_price:3500,quick_sale_price:3200,listing_price:3800,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Y20s":{128:{estimated_price:4000,quick_sale_price:3650,listing_price:4350,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Y11s":{32:{estimated_price:3000,quick_sale_price:2700,listing_price:3300,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Y51":{128:{estimated_price:4500,quick_sale_price:4100,listing_price:4900,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Y53s":{128:{estimated_price:5000,quick_sale_price:4550,listing_price:5450,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Y21s":{128:{estimated_price:5000,quick_sale_price:4550,listing_price:5450,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Y15s":{32:{estimated_price:3000,quick_sale_price:2700,listing_price:3300,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Y21":{64:{estimated_price:4000,quick_sale_price:3650,listing_price:4350,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Y33s":{128:{estimated_price:5500,quick_sale_price:5000,listing_price:6000,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Y22s":{128:{estimated_price:5500,quick_sale_price:5000,listing_price:6000,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Y35":{128:{estimated_price:5500,quick_sale_price:5000,listing_price:6000,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Y16":{64:{estimated_price:3500,quick_sale_price:3200,listing_price:3800,confidence_score:70,observation_count:0,updated_at:"2026-08-18"},128:{estimated_price:4250,quick_sale_price:3900,listing_price:4600,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Y36":{128:{estimated_price:6500,quick_sale_price:5900,listing_price:7100,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Y27":{128:{estimated_price:6500,quick_sale_price:5900,listing_price:7100,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Y17s":{128:{estimated_price:6000,quick_sale_price:5500,listing_price:6500,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Y18":{128:{estimated_price:6500,quick_sale_price:5900,listing_price:7100,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Y28":{256:{estimated_price:8000,quick_sale_price:7300,listing_price:8700,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Y19s":{128:{estimated_price:6750,quick_sale_price:6150,listing_price:7350,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Y04":{64:{estimated_price:6000,quick_sale_price:5500,listing_price:6500,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},128:{estimated_price:7000,quick_sale_price:6400,listing_price:7600,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Y29":{256:{estimated_price:10000,quick_sale_price:9100,listing_price:10900,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Y29s 5G":{128:{estimated_price:9000,quick_sale_price:8200,listing_price:9800,confidence_score:60,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:10500,quick_sale_price:9500,listing_price:11500,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Y31 5G":{256:{estimated_price:11000,quick_sale_price:10000,listing_price:12000,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Y11d":{128:{estimated_price:7000,quick_sale_price:6400,listing_price:7600,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Y21 5G":{128:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Y05":{64:{estimated_price:6500,quick_sale_price:5900,listing_price:7100,confidence_score:60,observation_count:0,updated_at:"2026-08-18"},128:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Y31d":{256:{estimated_price:12000,quick_sale_price:10900,listing_price:13100,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}}
};

PHONE_PRICE_DATA.Huawei={
  "P30":{128:{estimated_price:6500,quick_sale_price:5900,listing_price:7100,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "P30 Pro":{128:{estimated_price:9000,quick_sale_price:8200,listing_price:9800,confidence_score:70,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:11000,quick_sale_price:10000,listing_price:12000,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "P40":{128:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "P40 Pro":{256:{estimated_price:12500,quick_sale_price:11400,listing_price:13600,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "P50 Pro":{256:{estimated_price:17500,quick_sale_price:15900,listing_price:19100,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "P60 Pro":{256:{estimated_price:22000,quick_sale_price:20000,listing_price:24000,confidence_score:78,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:26000,quick_sale_price:23700,listing_price:28300,confidence_score:68,observation_count:0,updated_at:"2026-08-18"}},
  "Pura 70":{256:{estimated_price:33000,quick_sale_price:30000,listing_price:36000,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Pura 70 Pro":{512:{estimated_price:30000,quick_sale_price:27300,listing_price:32700,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Pura 70 Ultra":{512:{estimated_price:38000,quick_sale_price:34600,listing_price:41400,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Pura 80":{256:{estimated_price:42000,quick_sale_price:38200,listing_price:45800,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Pura 80 Pro":{512:{estimated_price:55000,quick_sale_price:50000,listing_price:60000,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Pura 80 Ultra":{512:{estimated_price:70000,quick_sale_price:63700,listing_price:76300,confidence_score:55,observation_count:0,updated_at:"2026-08-18"}},
  "Mate 40 Pro":{256:{estimated_price:13000,quick_sale_price:11800,listing_price:14200,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Mate 50 Pro":{256:{estimated_price:20000,quick_sale_price:18200,listing_price:21800,confidence_score:78,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:24000,quick_sale_price:21800,listing_price:26200,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Mate 60 Pro":{256:{estimated_price:27000,quick_sale_price:24600,listing_price:29400,confidence_score:55,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:31000,quick_sale_price:28200,listing_price:33800,confidence_score:55,observation_count:0,updated_at:"2026-08-18"},1024:{estimated_price:35000,quick_sale_price:31900,listing_price:38200,confidence_score:50,observation_count:0,updated_at:"2026-08-18"}},
  "Mate 70 Pro":{256:{estimated_price:38000,quick_sale_price:34600,listing_price:41400,confidence_score:50,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:43000,quick_sale_price:39100,listing_price:46900,confidence_score:50,observation_count:0,updated_at:"2026-08-18"},1024:{estimated_price:48000,quick_sale_price:43700,listing_price:52300,confidence_score:45,observation_count:0,updated_at:"2026-08-18"}},
  "Nova 9":{128:{estimated_price:7000,quick_sale_price:6400,listing_price:7600,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Nova 10":{256:{estimated_price:10000,quick_sale_price:9100,listing_price:10900,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Nova 10 Pro":{256:{estimated_price:12000,quick_sale_price:10900,listing_price:13100,confidence_score:68,observation_count:0,updated_at:"2026-08-18"}},
  "Nova 11":{256:{estimated_price:13500,quick_sale_price:12300,listing_price:14700,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Nova 11 Pro":{256:{estimated_price:16000,quick_sale_price:14600,listing_price:17400,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Nova 12":{256:{estimated_price:14000,quick_sale_price:12700,listing_price:15300,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Nova 12 SE":{256:{estimated_price:12000,quick_sale_price:10900,listing_price:13100,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Nova 13":{256:{estimated_price:14000,quick_sale_price:12700,listing_price:15300,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "Nova 13 Pro":{512:{estimated_price:19000,quick_sale_price:17300,listing_price:20700,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Nova Y70":{128:{estimated_price:5000,quick_sale_price:4550,listing_price:5450,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Nova Y90":{128:{estimated_price:5500,quick_sale_price:5000,listing_price:6000,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Nova Y91":{256:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}}
};

PHONE_PRICE_DATA.Honor={
  "Magic4 Pro":{256:{estimated_price:16000,quick_sale_price:14600,listing_price:17400,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Magic5 Pro":{512:{estimated_price:24000,quick_sale_price:21800,listing_price:26200,confidence_score:68,observation_count:0,updated_at:"2026-08-18"}},
  "Magic6 Pro":{512:{estimated_price:34000,quick_sale_price:30900,listing_price:37100,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Magic7 Pro":{512:{estimated_price:48000,quick_sale_price:43700,listing_price:52300,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Magic V2":{512:{estimated_price:38000,quick_sale_price:34600,listing_price:41400,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Magic V3":{512:{estimated_price:50000,quick_sale_price:45500,listing_price:54500,confidence_score:68,observation_count:0,updated_at:"2026-08-18"}},
  "X7":{128:{estimated_price:5000,quick_sale_price:4550,listing_price:5450,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "X7a":{128:{estimated_price:6000,quick_sale_price:5500,listing_price:6500,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "X7b":{256:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "X8":{128:{estimated_price:7000,quick_sale_price:6400,listing_price:7600,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "X8a":{128:{estimated_price:9000,quick_sale_price:8200,listing_price:9800,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "X8b":{256:{estimated_price:11500,quick_sale_price:10500,listing_price:12500,confidence_score:55,observation_count:0,updated_at:"2026-08-18"}},
  "X9":{128:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "X9a":{128:{estimated_price:9500,quick_sale_price:8600,listing_price:10400,confidence_score:75,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:11500,quick_sale_price:10500,listing_price:12500,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "X9b":{256:{estimated_price:14000,quick_sale_price:12700,listing_price:15300,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "X9c":{256:{estimated_price:16500,quick_sale_price:15000,listing_price:18000,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:19000,quick_sale_price:17300,listing_price:20700,confidence_score:55,observation_count:0,updated_at:"2026-08-18"}},
  "Honor 50":{128:{estimated_price:6500,quick_sale_price:5900,listing_price:7100,confidence_score:70,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Honor 70":{128:{estimated_price:8000,quick_sale_price:7300,listing_price:8700,confidence_score:68,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:9500,quick_sale_price:8600,listing_price:10400,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Honor 90":{256:{estimated_price:11500,quick_sale_price:10500,listing_price:12500,confidence_score:70,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:13500,quick_sale_price:12300,listing_price:14700,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Honor 90 Lite":{256:{estimated_price:9000,quick_sale_price:8200,listing_price:9800,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Honor 200":{256:{estimated_price:16500,quick_sale_price:15000,listing_price:18000,confidence_score:80,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:17500,quick_sale_price:15900,listing_price:19100,confidence_score:82,observation_count:0,updated_at:"2026-08-18"}},
  "Honor 200 Lite":{256:{estimated_price:11000,quick_sale_price:10000,listing_price:12000,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Honor 200 Pro":{512:{estimated_price:24000,quick_sale_price:21800,listing_price:26200,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Honor 400":{256:{estimated_price:20000,quick_sale_price:18200,listing_price:21800,confidence_score:72,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:22500,quick_sale_price:20500,listing_price:24500,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Honor 400 Lite":{256:{estimated_price:15000,quick_sale_price:13700,listing_price:16300,confidence_score:68,observation_count:0,updated_at:"2026-08-18"}},
  "Honor 400 Pro":{512:{estimated_price:30000,quick_sale_price:27300,listing_price:32700,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}}
};

PHONE_PRICE_DATA.Realme={
  "Realme GT 2":{128:{estimated_price:10000,quick_sale_price:9100,listing_price:10900,confidence_score:78,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:11000,quick_sale_price:10000,listing_price:12000,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "Realme GT 2 Pro":{128:{estimated_price:12000,quick_sale_price:10900,listing_price:13100,confidence_score:70,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:16000,quick_sale_price:14600,listing_price:17400,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "Realme GT 5":{256:{estimated_price:16000,quick_sale_price:14600,listing_price:17400,confidence_score:55,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:18500,quick_sale_price:16800,listing_price:20200,confidence_score:50,observation_count:0,updated_at:"2026-08-18"}},
  "Realme GT 6":{256:{estimated_price:21000,quick_sale_price:19100,listing_price:22900,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:24500,quick_sale_price:22300,listing_price:26700,confidence_score:80,observation_count:0,updated_at:"2026-08-18"}},
  "Realme GT 6T":{256:{estimated_price:20000,quick_sale_price:18200,listing_price:21800,confidence_score:82,observation_count:0,updated_at:"2026-08-18"}},
  "Realme GT 7":{256:{estimated_price:24000,quick_sale_price:21800,listing_price:26200,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:27500,quick_sale_price:25000,listing_price:30000,confidence_score:55,observation_count:0,updated_at:"2026-08-18"}},
  "Realme GT 7 Pro":{256:{estimated_price:30000,quick_sale_price:27300,listing_price:32700,confidence_score:60,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:35000,quick_sale_price:31900,listing_price:38200,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 8":{128:{estimated_price:6000,quick_sale_price:5500,listing_price:6500,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 8 Pro":{128:{estimated_price:7000,quick_sale_price:6400,listing_price:7600,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 9":{128:{estimated_price:7000,quick_sale_price:6400,listing_price:7600,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 9 Pro":{128:{estimated_price:8000,quick_sale_price:7300,listing_price:8700,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 10":{128:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:72,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 10 Pro":{128:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:68,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:10000,quick_sale_price:9100,listing_price:10900,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 11":{128:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:68,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:10000,quick_sale_price:9100,listing_price:10900,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 11 Pro":{128:{estimated_price:10500,quick_sale_price:9500,listing_price:11500,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:12500,quick_sale_price:11400,listing_price:13600,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 11 Pro+":{128:{estimated_price:12000,quick_sale_price:10900,listing_price:13100,confidence_score:60,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:14000,quick_sale_price:12700,listing_price:15300,confidence_score:70,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:16000,quick_sale_price:14600,listing_price:17400,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 12":{128:{estimated_price:9000,quick_sale_price:8200,listing_price:9800,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:10500,quick_sale_price:9500,listing_price:11500,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 12 Pro":{256:{estimated_price:14500,quick_sale_price:13200,listing_price:15800,confidence_score:82,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 12 Pro+":{256:{estimated_price:15500,quick_sale_price:14100,listing_price:16900,confidence_score:72,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:17500,quick_sale_price:15900,listing_price:19100,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 13":{128:{estimated_price:10500,quick_sale_price:9500,listing_price:11500,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:12000,quick_sale_price:10900,listing_price:13100,confidence_score:68,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 13 Pro":{256:{estimated_price:15000,quick_sale_price:13600,listing_price:16400,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:17500,quick_sale_price:15900,listing_price:19100,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Realme 14 Pro":{256:{estimated_price:17000,quick_sale_price:15500,listing_price:18500,confidence_score:68,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:19500,quick_sale_price:17700,listing_price:21300,confidence_score:58,observation_count:0,updated_at:"2026-08-18"}},
  "Realme C33":{128:{estimated_price:4500,quick_sale_price:4100,listing_price:4900,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Realme C53":{128:{estimated_price:5000,quick_sale_price:4550,listing_price:5450,confidence_score:78,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:6000,quick_sale_price:5500,listing_price:6500,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Realme C55":{128:{estimated_price:5000,quick_sale_price:4550,listing_price:5450,confidence_score:80,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:6000,quick_sale_price:5500,listing_price:6500,confidence_score:80,observation_count:0,updated_at:"2026-08-18"}},
  "Realme C61":{128:{estimated_price:6000,quick_sale_price:5500,listing_price:6500,confidence_score:75,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:8000,quick_sale_price:7300,listing_price:8700,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Realme C65":{128:{estimated_price:6000,quick_sale_price:5500,listing_price:6500,confidence_score:72,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:68,observation_count:0,updated_at:"2026-08-18"}},
  "Realme C67":{128:{estimated_price:7000,quick_sale_price:6400,listing_price:7600,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Realme C75":{128:{estimated_price:8000,quick_sale_price:7300,listing_price:8700,confidence_score:68,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:9500,quick_sale_price:8600,listing_price:10400,confidence_score:82,observation_count:0,updated_at:"2026-08-18"}}
};

PHONE_PRICE_DATA.OnePlus={
  "OnePlus Nord":{128:{estimated_price:6500,quick_sale_price:5900,listing_price:7100,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus Nord 2":{128:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:68,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus Nord 2T":{128:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:62,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:9500,quick_sale_price:8600,listing_price:10400,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus Nord 3":{128:{estimated_price:10500,quick_sale_price:9500,listing_price:11500,confidence_score:60,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:12000,quick_sale_price:10900,listing_price:13100,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus Nord 4":{256:{estimated_price:15000,quick_sale_price:13600,listing_price:16400,confidence_score:62,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:17500,quick_sale_price:15900,listing_price:19100,confidence_score:58,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus Nord 5":{256:{estimated_price:18000,quick_sale_price:16400,listing_price:19600,confidence_score:50,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:20500,quick_sale_price:18700,listing_price:22300,confidence_score:45,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus Nord CE 2":{128:{estimated_price:7000,quick_sale_price:6400,listing_price:7600,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus Nord CE 3 Lite":{128:{estimated_price:8000,quick_sale_price:7300,listing_price:8700,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:9000,quick_sale_price:8200,listing_price:9800,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus Nord CE 4":{128:{estimated_price:10000,quick_sale_price:9100,listing_price:10900,confidence_score:55,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:11500,quick_sale_price:10500,listing_price:12500,confidence_score:58,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus Nord CE 4 Lite":{256:{estimated_price:10000,quick_sale_price:9100,listing_price:10900,confidence_score:58,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 8":{128:{estimated_price:7000,quick_sale_price:6400,listing_price:7600,confidence_score:75,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 8 Pro":{128:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:68,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:10000,quick_sale_price:9100,listing_price:10900,confidence_score:68,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 9":{128:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:78,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:9000,quick_sale_price:8200,listing_price:9800,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 9 Pro":{128:{estimated_price:11000,quick_sale_price:10000,listing_price:12000,confidence_score:72,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:12500,quick_sale_price:11400,listing_price:13600,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 10 Pro":{128:{estimated_price:12500,quick_sale_price:11400,listing_price:13600,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:15000,quick_sale_price:13600,listing_price:16400,confidence_score:80,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 10T":{128:{estimated_price:13000,quick_sale_price:11800,listing_price:14200,confidence_score:62,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:15000,quick_sale_price:13600,listing_price:16400,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 11":{128:{estimated_price:15000,quick_sale_price:13600,listing_price:16400,confidence_score:55,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:18000,quick_sale_price:16400,listing_price:19600,confidence_score:68,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:21000,quick_sale_price:19100,listing_price:22900,confidence_score:55,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 11R":{128:{estimated_price:13500,quick_sale_price:12300,listing_price:14700,confidence_score:55,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:15500,quick_sale_price:14100,listing_price:16900,confidence_score:58,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 12":{256:{estimated_price:21000,quick_sale_price:19100,listing_price:22900,confidence_score:68,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:23500,quick_sale_price:21400,listing_price:25600,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 12R":{256:{estimated_price:23000,quick_sale_price:20900,listing_price:25100,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 13":{256:{estimated_price:28000,quick_sale_price:25500,listing_price:30500,confidence_score:60,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:33000,quick_sale_price:30000,listing_price:36000,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 13R":{256:{estimated_price:23000,quick_sale_price:20900,listing_price:25100,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "OnePlus 15":{256:{estimated_price:35000,quick_sale_price:31900,listing_price:38200,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:41000,quick_sale_price:37300,listing_price:44700,confidence_score:55,observation_count:0,updated_at:"2026-08-18"}}
};

PHONE_PRICE_DATA.Google={
  "Pixel 6":{128:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:72,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:10000,quick_sale_price:9100,listing_price:10900,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 6 Pro":{128:{estimated_price:10500,quick_sale_price:9500,listing_price:11500,confidence_score:68,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:12000,quick_sale_price:10900,listing_price:13100,confidence_score:65,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:14000,quick_sale_price:12700,listing_price:15300,confidence_score:50,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 6a":{128:{estimated_price:7500,quick_sale_price:6800,listing_price:8200,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 7":{128:{estimated_price:11000,quick_sale_price:10000,listing_price:12000,confidence_score:72,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:12500,quick_sale_price:11400,listing_price:13600,confidence_score:62,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 7 Pro":{128:{estimated_price:14000,quick_sale_price:12700,listing_price:15300,confidence_score:70,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:16000,quick_sale_price:14600,listing_price:17400,confidence_score:68,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:18500,quick_sale_price:16800,listing_price:20200,confidence_score:52,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 7a":{128:{estimated_price:10500,quick_sale_price:9500,listing_price:11500,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 8":{128:{estimated_price:15000,quick_sale_price:13600,listing_price:16400,confidence_score:72,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:17000,quick_sale_price:15500,listing_price:18500,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 8 Pro":{128:{estimated_price:19000,quick_sale_price:17300,listing_price:20700,confidence_score:70,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:21500,quick_sale_price:19600,listing_price:23400,confidence_score:70,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:24500,quick_sale_price:22300,listing_price:26700,confidence_score:58,observation_count:0,updated_at:"2026-08-18"},1024:{estimated_price:28000,quick_sale_price:25500,listing_price:30500,confidence_score:45,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 8a":{128:{estimated_price:14000,quick_sale_price:12700,listing_price:15300,confidence_score:68,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:16000,quick_sale_price:14600,listing_price:17400,confidence_score:58,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 9":{128:{estimated_price:21000,quick_sale_price:19100,listing_price:22900,confidence_score:62,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:24000,quick_sale_price:21800,listing_price:26200,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 9 Pro":{128:{estimated_price:26000,quick_sale_price:23700,listing_price:28300,confidence_score:55,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:29000,quick_sale_price:26400,listing_price:31600,confidence_score:60,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:33000,quick_sale_price:30000,listing_price:36000,confidence_score:50,observation_count:0,updated_at:"2026-08-18"},1024:{estimated_price:37000,quick_sale_price:33700,listing_price:40300,confidence_score:40,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 9 Pro XL":{128:{estimated_price:28000,quick_sale_price:25500,listing_price:30500,confidence_score:50,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:32000,quick_sale_price:29100,listing_price:34900,confidence_score:60,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:36000,quick_sale_price:32800,listing_price:39200,confidence_score:48,observation_count:0,updated_at:"2026-08-18"},1024:{estimated_price:40000,quick_sale_price:36400,listing_price:43600,confidence_score:38,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 9 Pro Fold":{256:{estimated_price:40000,quick_sale_price:36400,listing_price:43600,confidence_score:48,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:45000,quick_sale_price:41000,listing_price:49000,confidence_score:42,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 9a":{128:{estimated_price:18000,quick_sale_price:16400,listing_price:19600,confidence_score:55,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:20500,quick_sale_price:18700,listing_price:22300,confidence_score:50,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 10":{128:{estimated_price:26000,quick_sale_price:23700,listing_price:28300,confidence_score:45,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:29500,quick_sale_price:26800,listing_price:32200,confidence_score:48,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 10 Pro":{128:{estimated_price:32000,quick_sale_price:29100,listing_price:34900,confidence_score:40,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:36000,quick_sale_price:32800,listing_price:39200,confidence_score:45,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:41000,quick_sale_price:37300,listing_price:44700,confidence_score:38,observation_count:0,updated_at:"2026-08-18"},1024:{estimated_price:46000,quick_sale_price:41900,listing_price:50100,confidence_score:30,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 10 Pro XL":{256:{estimated_price:39000,quick_sale_price:35500,listing_price:42500,confidence_score:42,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:44000,quick_sale_price:40000,listing_price:48000,confidence_score:35,observation_count:0,updated_at:"2026-08-18"},1024:{estimated_price:49000,quick_sale_price:44600,listing_price:53400,confidence_score:28,observation_count:0,updated_at:"2026-08-18"}},
  "Pixel 10 Pro Fold":{256:{estimated_price:48000,quick_sale_price:43700,listing_price:52300,confidence_score:35,observation_count:0,updated_at:"2026-08-18"},512:{estimated_price:54000,quick_sale_price:49100,listing_price:58900,confidence_score:30,observation_count:0,updated_at:"2026-08-18"},1024:{estimated_price:60000,quick_sale_price:54600,listing_price:65400,confidence_score:25,observation_count:0,updated_at:"2026-08-18"}}
};

Object.assign(PHONE_PRICE_DATA.Oppo, {
  "Reno5": {128:{estimated_price:6000,quick_sale_price:5500,listing_price:6500,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Reno5 Lite": {128:{estimated_price:6000,quick_sale_price:5500,listing_price:6500,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "Reno6": {128:{estimated_price:8000,quick_sale_price:7300,listing_price:8700,confidence_score:65,observation_count:0,updated_at:"2026-08-18"}},
  "Reno7": {128:{estimated_price:10000,quick_sale_price:9100,listing_price:10900,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "Reno11 F 5G": {256:{estimated_price:15000,quick_sale_price:13600,listing_price:16400,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Reno11 FS": {256:{estimated_price:12000,quick_sale_price:10900,listing_price:13100,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "Reno13 F": {256:{estimated_price:13500,quick_sale_price:12300,listing_price:14700,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Reno13 F 5G": {256:{estimated_price:15500,quick_sale_price:14100,listing_price:16900,confidence_score:78,observation_count:0,updated_at:"2026-08-18"}},
  "Reno13 Pro 5G": {512:{estimated_price:26500,quick_sale_price:24100,listing_price:28900,confidence_score:72,observation_count:0,updated_at:"2026-08-18"}},
  "Reno14": {256:{estimated_price:26000,quick_sale_price:23700,listing_price:28300,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Reno14 F 5G": {256:{estimated_price:24000,quick_sale_price:21800,listing_price:26200,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "Reno14 Pro 5G": {512:{estimated_price:30000,quick_sale_price:27300,listing_price:32700,confidence_score:75,observation_count:0,updated_at:"2026-08-18"}},
  "A16": {64:{estimated_price:3500,quick_sale_price:3200,listing_price:3800,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "A17": {64:{estimated_price:4000,quick_sale_price:3650,listing_price:4350,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "A18": {128:{estimated_price:5500,quick_sale_price:5000,listing_price:6000,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "A38": {128:{estimated_price:6500,quick_sale_price:5900,listing_price:7100,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "A54": {128:{estimated_price:4500,quick_sale_price:4100,listing_price:4900,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "A55": {128:{estimated_price:5000,quick_sale_price:4550,listing_price:5450,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "A57": {128:{estimated_price:5500,quick_sale_price:5000,listing_price:6000,confidence_score:55,observation_count:0,updated_at:"2026-08-18"}},
  "A58": {128:{estimated_price:6500,quick_sale_price:5900,listing_price:7100,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "A60": {128:{estimated_price:8500,quick_sale_price:7700,listing_price:9300,confidence_score:70,observation_count:0,updated_at:"2026-08-18"},256:{estimated_price:10000,quick_sale_price:9100,listing_price:10900,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "A74": {128:{estimated_price:5000,quick_sale_price:4550,listing_price:5450,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "A76": {128:{estimated_price:5500,quick_sale_price:5000,listing_price:6000,confidence_score:55,observation_count:0,updated_at:"2026-08-18"}},
  "A77": {128:{estimated_price:5000,quick_sale_price:4550,listing_price:5450,confidence_score:55,observation_count:0,updated_at:"2026-08-18"}},
  "A78": {128:{estimated_price:6500,quick_sale_price:5900,listing_price:7100,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "A79": {256:{estimated_price:9000,quick_sale_price:8200,listing_price:9800,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}},
  "A96": {128:{estimated_price:7000,quick_sale_price:6400,listing_price:7600,confidence_score:70,observation_count:0,updated_at:"2026-08-18"}},
  "A98": {256:{estimated_price:11000,quick_sale_price:10000,listing_price:12000,confidence_score:60,observation_count:0,updated_at:"2026-08-18"}}
});

const SAMSUNG_PRICE_UPDATED_AT = "2026-08-17";
const roundSamsungPrice = value => Math.round(value / 500) * 500;
const addSamsungPriceRecords = (model, prices, confidence_score = 72) => {
  PHONE_PRICE_DATA.Samsung[model] = Object.fromEntries(
    Object.entries(prices).map(([storage, estimated_price]) => [storage, {
      estimated_price,
      quick_sale_price: roundSamsungPrice(estimated_price * .91),
      listing_price: roundSamsungPrice(estimated_price * 1.08),
      confidence_score,
      observation_count: 0,
      updated_at: SAMSUNG_PRICE_UPDATED_AT
    }])
  );
};
const addExactSamsungPriceRecords = (model, prices, confidence_score = 72) => {
  PHONE_PRICE_DATA.Samsung[model] = Object.fromEntries(
    Object.entries(prices).map(([storage, [estimated_price, quick_sale_price, listing_price]]) => [storage, {
      estimated_price,
      quick_sale_price,
      listing_price,
      confidence_score,
      observation_count: 0,
      updated_at: SAMSUNG_PRICE_UPDATED_AT
    }])
  );
};

// S22 ve sonrası Galaxy S serisi
addExactSamsungPriceRecords("Galaxy S22", {128:[15000,13750,16250],256:[16500,15000,18000]}, 80);
addExactSamsungPriceRecords("Galaxy S22+", {128:[17000,15500,18500],256:[18500,17000,20000]}, 72);
addExactSamsungPriceRecords("Galaxy S22 Ultra", {128:[24000,22000,26000],256:[27000,24500,29500],512:[30000,27500,33000],1024:[33000,30000,36000]}, 72);
addExactSamsungPriceRecords("Galaxy S23", {128:[23000,21000,25000],256:[25000,23000,27000]}, 80);
addExactSamsungPriceRecords("Galaxy S23+", {256:[28000,25500,30500],512:[31000,28000,34000]}, 72);
addExactSamsungPriceRecords("Galaxy S23 Ultra", {256:[36000,33000,39000],512:[39000,35500,42500],1024:[43000,39000,47000]}, 72);
addExactSamsungPriceRecords("Galaxy S23 FE", {128:[22000,20000,24000],256:[24000,22000,26000]}, 72);
addExactSamsungPriceRecords("Galaxy S24", {128:[28000,25500,30500],256:[31000,28500,33500]}, 80);
addExactSamsungPriceRecords("Galaxy S24+", {256:[34000,31000,37000],512:[38000,34500,41500]}, 72);
addExactSamsungPriceRecords("Galaxy S24 Ultra", {256:[50000,45500,54500],512:[54000,49000,59000],1024:[59000,53500,64500]}, 72);
addExactSamsungPriceRecords("Galaxy S24 FE", {128:[25000,23000,27000],256:[28000,25500,30500],512:[31000,28000,34000]}, 72);
addExactSamsungPriceRecords("Galaxy S25", {128:[37000,34000,40000],256:[41000,37500,44500],512:[45000,41000,49000]}, 80);
addExactSamsungPriceRecords("Galaxy S25+", {256:[43000,39000,47000],512:[48000,43500,52500]}, 72);
addExactSamsungPriceRecords("Galaxy S25 Ultra", {256:[62000,56500,67500],512:[66000,60000,72000],1024:[72000,65500,78500]}, 72);
addExactSamsungPriceRecords("Galaxy S25 Edge", {256:[40000,36500,43500],512:[44000,40000,48000]}, 60);
addExactSamsungPriceRecords("Galaxy S25 FE", {128:[30000,27500,32500],256:[33000,30000,36000],512:[36000,33000,39500]}, 60);
addExactSamsungPriceRecords("Galaxy S26", {256:[48000,44000,52000],512:[53000,48500,57500]}, 60);
addExactSamsungPriceRecords("Galaxy S26+", {256:[56000,51000,61000],512:[61000,55500,66500]}, 60);
addExactSamsungPriceRecords("Galaxy S26 Ultra", {256:[73000,66500,79500],512:[82000,74500,89500],1024:[90000,82000,98000]}, 60);

// Katlanabilir Galaxy modelleri: hızlı satış %91, ilan fiyatı %108 oranıyla yuvarlanır.
addSamsungPriceRecords("Galaxy Z Fold3", {256:15000,512:17000});
addSamsungPriceRecords("Galaxy Z Fold4", {256:21000,512:24000});
addSamsungPriceRecords("Galaxy Z Fold5", {256:30000,512:35000,1024:39000});
addSamsungPriceRecords("Galaxy Z Fold6", {256:46000,512:52000,1024:58000}, 60);
addSamsungPriceRecords("Galaxy Z Fold7", {256:58000,512:65000,1024:72000}, 60);
addSamsungPriceRecords("Galaxy Z Fold8", {256:70000,512:78000,1024:86000}, 60);
addSamsungPriceRecords("Galaxy Z Fold8 Ultra", {512:90000,1024:100000}, 60);
addSamsungPriceRecords("Galaxy Z Flip3", {128:8500,256:9500});
addSamsungPriceRecords("Galaxy Z Flip4", {128:12000,256:14000,512:15500});
addSamsungPriceRecords("Galaxy Z Flip5", {256:24000,512:27000});
addSamsungPriceRecords("Galaxy Z Flip6", {256:34000,512:38000}, 60);
addSamsungPriceRecords("Galaxy Z Flip7", {256:42000,512:47000}, 60);
addSamsungPriceRecords("Galaxy Z Flip8", {256:50000,512:56000}, 60);

// Galaxy A serisi: yalnızca modelde bulunan kapasite seçenekleri tanımlanır.
addSamsungPriceRecords("Galaxy A12", {64:3500,128:4000}, 80);
addSamsungPriceRecords("Galaxy A13", {64:4000,128:4500}, 80);
addSamsungPriceRecords("Galaxy A14", {64:5000,128:5500}, 80);
addSamsungPriceRecords("Galaxy A15", {128:7000,256:8000}, 80);
addSamsungPriceRecords("Galaxy A16", {128:8500,256:9500}, 80);
addSamsungPriceRecords("Galaxy A17", {128:10500,256:12000}, 60);
addSamsungPriceRecords("Galaxy A22", {64:4500,128:5000}, 80);
addSamsungPriceRecords("Galaxy A23", {64:5500,128:6000}, 80);
addSamsungPriceRecords("Galaxy A24", {128:8000}, 80);
addSamsungPriceRecords("Galaxy A25", {128:11000,256:12500}, 80);
addSamsungPriceRecords("Galaxy A26", {128:14000,256:16000}, 60);
addSamsungPriceRecords("Galaxy A32", {64:5500,128:6000}, 80);
addSamsungPriceRecords("Galaxy A33 5G", {128:7500,256:8500}, 80);
addSamsungPriceRecords("Galaxy A34 5G", {128:10000,256:11500}, 80);
addSamsungPriceRecords("Galaxy A35 5G", {128:13500,256:15500}, 80);
addSamsungPriceRecords("Galaxy A36 5G", {128:18000,256:20500}, 60);
addSamsungPriceRecords("Galaxy A52", {128:7000,256:8000}, 80);
addSamsungPriceRecords("Galaxy A52s 5G", {128:8500,256:9500}, 80);
addSamsungPriceRecords("Galaxy A53 5G", {128:9500,256:11000}, 80);
addSamsungPriceRecords("Galaxy A54 5G", {128:12000,256:13500}, 80);
addSamsungPriceRecords("Galaxy A55 5G", {128:16000,256:18000}, 80);
addSamsungPriceRecords("Galaxy A56 5G", {128:20000,256:22500}, 60);
addSamsungPriceRecords("Galaxy A57 5G", {128:25000,256:28000}, 60);
addSamsungPriceRecords("Galaxy A72", {128:8000,256:9000}, 72);
addSamsungPriceRecords("Galaxy A73 5G", {128:10500,256:12000}, 72);

// Galaxy M serisi
addSamsungPriceRecords("Galaxy M12", {64:3500,128:4000}, 80);
addSamsungPriceRecords("Galaxy M13", {64:4000,128:4500}, 80);
addSamsungPriceRecords("Galaxy M14 5G", {64:5000,128:5500}, 80);
addSamsungPriceRecords("Galaxy M15 5G", {128:7500,256:8500}, 80);
addSamsungPriceRecords("Galaxy M23 5G", {128:6000,256:7000}, 80);
addSamsungPriceRecords("Galaxy M33 5G", {128:7000,256:8000}, 80);
addSamsungPriceRecords("Galaxy M34 5G", {128:8500,256:9500}, 80);
addSamsungPriceRecords("Galaxy M35 5G", {128:10500,256:12000}, 80);
addSamsungPriceRecords("Galaxy M52 5G", {128:7500,256:8500}, 72);
addSamsungPriceRecords("Galaxy M53 5G", {128:8500,256:9500}, 72);
addSamsungPriceRecords("Galaxy M54 5G", {128:10500,256:12000}, 72);
addSamsungPriceRecords("Galaxy M55 5G", {128:14000,256:16000}, 72);

const XIAOMI_PRICE_UPDATED_AT = "2026-08-17";
const addExactXiaomiPriceRecords = (model, prices, confidence_score = 72, updated_at = XIAOMI_PRICE_UPDATED_AT) => {
  PHONE_PRICE_DATA.Xiaomi[model] = Object.fromEntries(
    Object.entries(prices).map(([storage, [estimated_price, quick_sale_price, listing_price, storage_confidence_score]]) => [storage, {
      estimated_price,
      quick_sale_price,
      listing_price,
      confidence_score: storage_confidence_score ?? confidence_score,
      observation_count: 0,
      updated_at
    }])
  );
};

// Redmi Note serisi
addExactXiaomiPriceRecords("Redmi Note 10", {64:[5500,5000,6000],128:[6500,5900,7100]}, 78);
addExactXiaomiPriceRecords("Redmi Note 10 Pro", {64:[6500,5900,7100],128:[7500,6800,8200]}, 78);
addExactXiaomiPriceRecords("Redmi Note 11", {64:[6500,5900,7100],128:[7500,6800,8200]}, 78);
addExactXiaomiPriceRecords("Redmi Note 11 Pro", {128:[8500,7700,9300]}, 78);
addExactXiaomiPriceRecords("Redmi Note 11 Pro+ 5G", {256:[10500,9500,11500]}, 72);
addExactXiaomiPriceRecords("Redmi Note 12", {128:[8000,7300,8700],256:[9000,8200,9800]}, 78);
addExactXiaomiPriceRecords("Redmi Note 12 5G", {128:[9000,8200,9800],256:[10000,9100,10900]}, 72);
addExactXiaomiPriceRecords("Redmi Note 12 Pro", {256:[11000,10000,12000]}, 72);
addExactXiaomiPriceRecords("Redmi Note 12 Pro 5G", {128:[11500,10500,12500],256:[13000,11800,14200]}, 72);
addExactXiaomiPriceRecords("Redmi Note 12S", {128:[8500,7700,9300],256:[9500,8600,10400]}, 72);
addExactXiaomiPriceRecords("Redmi Note 13", {128:[9000,8200,9800],256:[10500,9500,11500]}, 72);
addExactXiaomiPriceRecords("Redmi Note 13 5G", {128:[10000,9100,10900],256:[11500,10500,12500]}, 72);
addExactXiaomiPriceRecords("Redmi Note 13 Pro", {256:[13000,11800,14200],512:[14500,13200,15800]}, 72);
addExactXiaomiPriceRecords("Redmi Note 13 Pro 5G", {256:[14000,12700,15300],512:[16000,14500,17500]}, 72);
addExactXiaomiPriceRecords("Redmi Note 13 Pro+ 5G", {256:[16500,15000,18000],512:[18500,16800,20200]}, 72);
addExactXiaomiPriceRecords("Redmi Note 14", {128:[10000,9100,10900],256:[12000,10900,13100]}, 72);
addExactXiaomiPriceRecords("Redmi Note 14 5G", {128:[11500,10500,12500],256:[13500,12300,14700]}, 72);
addExactXiaomiPriceRecords("Redmi Note 14 Pro", {256:[15000,13600,16400],512:[17000,15500,18500]}, 72);
addExactXiaomiPriceRecords("Redmi Note 14 Pro 5G", {256:[16500,15000,18000],512:[18500,16800,20200]}, 72);
addExactXiaomiPriceRecords("Redmi Note 14 Pro+ 5G", {256:[19000,17300,20700],512:[21500,19600,23400]}, 72);
addExactXiaomiPriceRecords("Redmi Note 15", {256:[12500,11400,13600]}, 60);
addExactXiaomiPriceRecords("Redmi Note 15 Pro", {256:[16500,15000,18000]}, 60);
addExactXiaomiPriceRecords("Redmi Note 15 Pro 5G", {256:[21500,19600,23400],512:[24000,21800,26200]}, 60);
addExactXiaomiPriceRecords("Redmi Note 15 Pro+ 5G", {256:[26000,23700,28300],512:[29000,26400,31600]}, 60);

// Redmi ana serisi
addExactXiaomiPriceRecords("Redmi 10", {64:[4500,4100,4900],128:[5500,5000,6000]}, 78);
addExactXiaomiPriceRecords("Redmi 10C", {64:[4000,3600,4400],128:[4750,4300,5200]}, 78);
addExactXiaomiPriceRecords("Redmi 12", {128:[6000,5500,6500],256:[7000,6400,7600]}, 78);
addExactXiaomiPriceRecords("Redmi 12C", {64:[4500,4100,4900],128:[5250,4800,5700]}, 78);
addExactXiaomiPriceRecords("Redmi 13", {128:[6500,5900,7100],256:[7500,6800,8200]}, 72);
addExactXiaomiPriceRecords("Redmi 13C", {128:[6000,5500,6500],256:[7000,6400,7600]}, 72);
addExactXiaomiPriceRecords("Redmi 15", {128:[9000,8200,9800],256:[10500,9500,11500]}, 60);
addExactXiaomiPriceRecords("Redmi 15 5G", {128:[11000,10000,12000],256:[12500,11400,13600]}, 60);
addExactXiaomiPriceRecords("Redmi 15C", {128:[7500,6800,8200],256:[8500,7700,9300]}, 60);
addExactXiaomiPriceRecords("Redmi 15C 5G", {128:[9000,8200,9800],256:[10000,9100,10900]}, 60);

// POCO X serisi
addExactXiaomiPriceRecords("POCO X5", {128:[8500,7700,9300],256:[10000,9100,10900]}, 72);
addExactXiaomiPriceRecords("POCO X5 Pro", {128:[10500,9500,11500],256:[12000,10900,13100]}, 72);
addExactXiaomiPriceRecords("POCO X6", {256:[12500,11400,13600],512:[14500,13200,15800]}, 72);
addExactXiaomiPriceRecords("POCO X6 Pro", {256:[14000,12700,15300],512:[16000,14500,17500]}, 72);
addExactXiaomiPriceRecords("POCO X7", {256:[15000,13600,16400],512:[17000,15500,18500]}, 72);
addExactXiaomiPriceRecords("POCO X7 Pro", {256:[19000,17300,20700],512:[22000,20000,24000]}, 72);
addExactXiaomiPriceRecords("POCO X8 Pro", {256:[24000,21800,26200],512:[27000,24600,29400]}, 60);
addExactXiaomiPriceRecords("POCO X8 Pro Max", {256:[28000,25500,30500],512:[32000,29100,34900]}, 60);

// POCO F serisi
addExactXiaomiPriceRecords("POCO F5", {256:[13500,12300,14700]}, 72);
addExactXiaomiPriceRecords("POCO F5 Pro", {256:[16000,14500,17500],512:[18000,16400,19600]}, 72);
addExactXiaomiPriceRecords("POCO F6", {256:[17500,15900,19100],512:[20000,18200,21800]}, 72);
addExactXiaomiPriceRecords("POCO F6 Pro", {256:[21000,19100,22900],512:[24000,21800,26200]}, 72);
addExactXiaomiPriceRecords("POCO F7", {256:[22000,20000,24000],512:[25000,22700,27300]}, 72);
addExactXiaomiPriceRecords("POCO F7 Pro", {256:[27000,24600,29400],512:[30000,27300,32700]}, 72);
addExactXiaomiPriceRecords("POCO F7 Ultra", {256:[32000,29100,34900],512:[36000,32800,39200]}, 72);
addExactXiaomiPriceRecords("POCO F8 Pro", {256:[34000,30900,37100],512:[38000,34600,41400]}, 60);
addExactXiaomiPriceRecords("POCO F8 Ultra", {256:[40000,36400,43600],512:[45000,41000,49000]}, 60);

// POCO M serisi
addExactXiaomiPriceRecords("POCO M5", {64:[5000,4550,5450],128:[6000,5500,6500]}, 78);
addExactXiaomiPriceRecords("POCO M6 Pro", {256:[8500,7700,9300],512:[10000,9100,10900]}, 72);
addExactXiaomiPriceRecords("POCO M7 Pro", {256:[11000,10000,12000],512:[12500,11400,13600]}, 72);
addExactXiaomiPriceRecords("POCO M8 5G", {128:[12000,10900,13100],256:[13500,12300,14700]}, 60);
addExactXiaomiPriceRecords("POCO M8 Pro 5G", {256:[15500,14100,16900],512:[17500,15900,19100]}, 60);

// Xiaomi ana seri
const XIAOMI_MAIN_PRICE_UPDATED_AT = "2026-08-18";
addExactXiaomiPriceRecords("Xiaomi 11 Lite 5G NE", {128:[10000,9100,10900],256:[11000,10000,12000,70]}, 75, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 11T", {128:[8000,7300,8700],256:[10000,9100,10900,70]}, 75, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 11T Pro", {128:[10000,9100,10900,65],256:[11000,10000,12000]}, 70, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 12", {128:[14000,12700,15300,65],256:[15500,14100,16900]}, 75, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 12 Pro", {256:[17000,15500,18500]}, 70, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 12 Lite", {128:[10000,9100,10900],256:[11500,10500,12500]}, 70, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 12T", {128:[12000,10900,13100,65],256:[13500,12300,14700]}, 70, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 12T Pro", {256:[16000,14600,17400]}, 70, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 13", {256:[19000,17300,20700]}, 70, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 13 Pro", {256:[23000,20900,25100],512:[26000,23700,28300,65]}, 70, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 13 Lite", {128:[12000,10900,13100],256:[13500,12300,14700]}, 70, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 13T", {256:[17000,15500,18500]}, 75, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 13T Pro", {512:[22000,20000,24000,70],1024:[25000,22800,27300]}, 60, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 14", {256:[30000,27300,32700],512:[32000,29100,34900,65]}, 75, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 14 Ultra", {512:[45500,41400,49600]}, 75, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 14T", {256:[21000,19100,22900],512:[24000,21800,26200,65]}, 75, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 14T Pro", {512:[29000,26400,31600,70],1024:[33000,30000,36000]}, 60, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 15", {256:[31500,28700,34300],512:[35000,31900,38200,60]}, 70, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 15 Ultra", {512:[53000,48200,57800,65],1024:[59000,53700,64300]}, 60, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 15T", {256:[25000,22800,27300],512:[28000,25500,30500,60]}, 70, XIAOMI_MAIN_PRICE_UPDATED_AT);
addExactXiaomiPriceRecords("Xiaomi 15T Pro", {256:[29000,26400,31600],512:[32000,29100,34900,65],1024:[36000,32800,39200,55]}, 60, XIAOMI_MAIN_PRICE_UPDATED_AT);
