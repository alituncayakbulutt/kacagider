(function(){
'use strict';
if(window.__KG_SELL_OPTIONS_PHASE1__)return;
window.__KG_SELL_OPTIONS_PHASE1__=true;
function load(src,id){return new Promise(function(resolve,reject){var e=document.getElementById(id);if(e){if(e.dataset.loaded==='1')return resolve();e.addEventListener('load',resolve,{once:true});e.addEventListener('error',reject,{once:true});return;}var s=document.createElement('script');s.id=id;s.src=src;s.async=false;s.addEventListener('load',function(){s.dataset.loaded='1';resolve();},{once:true});s.addEventListener('error',reject,{once:true});document.head.appendChild(s);});}
load('/assets/marketplace-sell-options-modal.js?v=20260905-phase1','kgDealerSellPhase1')
  .then(function(){return load('/assets/marketplace-damage-guard.js?v=20260906-damage-guard','kgDealerDamageGuard');})
  .then(function(){return load('/assets/marketplace-sell-options-ui.js?v=20260905-phase1','kgSellOptionsUiPhase1');})
  .catch(function(error){console.warn('KaçaGider satış seçenekleri yüklenemedi:',error);});
})();