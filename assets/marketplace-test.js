(function(){
  'use strict';
  if(window.__KG_MARKETPLACE_LOADER_V5__) return;
  window.__KG_MARKETPLACE_LOADER_V5__=true;

  function load(src,id){
    return new Promise(function(resolve,reject){
      var existing=document.getElementById(id);
      if(existing){
        if(existing.dataset.loaded==='1') return resolve();
        existing.addEventListener('load',resolve,{once:true});
        existing.addEventListener('error',reject,{once:true});
        return;
      }
      var script=document.createElement('script');
      script.id=id;
      script.src=src;
      script.async=false;
      script.addEventListener('load',function(){script.dataset.loaded='1';resolve();},{once:true});
      script.addEventListener('error',reject,{once:true});
      document.head.appendChild(script);
    });
  }

  load('/assets/marketplace-core.js?v=20260905-sell-phase1','kgMarketplaceCore')
    .then(function(){return load('/assets/marketplace-sell-options.js?v=20260905-sell-phase1','kgMarketplaceSellOptions');})
    .catch(function(error){console.warn('KaçaGider marketplace yüklenemedi:',error);});
})();