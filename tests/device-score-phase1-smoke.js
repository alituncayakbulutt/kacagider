(function(){
  "use strict";
  function assert(name,condition,details){
    if(!condition)throw new Error("[Cihaz Skoru] "+name+" başarısız"+(details?": "+details:""));
    return {name:name,ok:true};
  }
  function run(api){
    if(!api||typeof api.calculateDeviceScore!=="function")throw new Error("KGDeviceScore yüklenmedi.");
    var base={battery:"100",screen:"original",faceId:"working",scratchCount:"none",scratchDepth:"none",pixelIssue:"no",dent:"none",surface:"clean",corners:"clean",backGlass:"clean",changedParts:[]};
    var pristine=api.calculateDeviceScore(base);
    var scratched=api.calculateDeviceScore(Object.assign({},base,{scratchCount:"6-15",scratchDepth:"medium"}));
    var aftermarket=api.calculateDeviceScore(Object.assign({},base,{screen:"aftermarket",changedParts:[{part:"screen",quality:"aftermarket"}]}));
    var faceIdBroken=api.calculateDeviceScore(Object.assign({},base,{faceId:"notworking"}));
    var repaired=api.calculateDeviceScore(Object.assign({},base,{changedParts:[{part:"battery",quality:"original"},{part:"backglass",quality:"aftermarket"}]}));
    var missing=api.calculateDeviceScore(Object.assign({},base,{battery:""}));
    return [
      assert("Temiz cihaz 100 puan",pristine.score===100,"puan="+pristine.score),
      assert("Çizik ekran temiz cihazdan düşük",scratched.score<pristine.score,"puan="+scratched.score),
      assert("Yan sanayi ekran belirgin düşürür",aftermarket.score<=80,"puan="+aftermarket.score),
      assert("Face ID arızası cihaz skorunu düşürür",faceIdBroken.score<pristine.score,"puan="+faceIdBroken.score),
      assert("Birden fazla işlem geçmişi puanı düşürür",repaired.score<pristine.score,"puan="+repaired.score),
      assert("Eksik zorunlu alan skor üretmez",missing.score===null,"puan="+missing.score)
    ];
  }
  window.KGDeviceScorePhase1Smoke={run:run};
})();
