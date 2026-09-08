(function(){
  "use strict";
  if(window.__KG_MODEL_DEMAND__)return;
  window.__KG_MODEL_DEMAND__=true;

  var LABELS={high:"Yüksek talep",medium:"Orta talep",low:"Yeni / düşük talep",collecting:"Veri toplanıyor"};
  var lastSignature="";

  function esc(v){return String(v==null?"":v).replace(/[&<>\"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c];});}
  function visible(el){if(!el)return false;var s=window.getComputedStyle?window.getComputedStyle(el):null;return !s||(s.display!=="none"&&s.visibility!=="hidden");}
  function value(id){var el=document.getElementById(id);return el?String(el.value||"").trim():"";}
  function activeCategory(){
    var active=document.querySelector('.category-card.active[data-category],.kg-approved-card.active[data-category],[data-category].active');
    var raw=active&&active.dataset?String(active.dataset.category||""):"";
    var map={phone:"phone",telefon:"phone",tablet:"tablet",computer:"computer",bilgisayar:"computer",watch:"watch","akilli-saat":"watch",console:"console","oyun-konsolu":"console"};
    if(map[raw])return map[raw];
    var n=document.getElementById("selectedCategoryName");
    var t=n?String(n.textContent||"").trim():"";
    return {Telefon:"phone",Tablet:"tablet",Bilgisayar:"computer","Akıllı Saat":"watch","Oyun Konsolu":"console"}[t]||"";
  }
  function context(){
    var generic=document.getElementById("genericPanel");
    var phone=document.getElementById("phonePanel");
    var isGeneric=visible(generic)&&!visible(phone);
    var category=activeCategory();
    if(!category)return null;
    var brand=value(isGeneric?"genericBrand":"phoneBrand");
    var model=value(isGeneric?"genericModel":"model");
    var storage=value(isGeneric?"genericStorage":"storage");
    if(!brand||!model)return null;
    return{category:category,brand:brand,model:model,storage:storage};
  }
  function hasResult(){var p=document.getElementById("mainPrice");return p&&/[0-9]/.test(String(p.textContent||""));}
  function clientKey(){
    var key="";
    try{key=localStorage.getItem("kg-model-demand-client-v1")||"";}catch(e){}
    if(key)return key;
    try{key=crypto.randomUUID();}catch(e){key="kg-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);}
    try{localStorage.setItem("kg-model-demand-client-v1",key);}catch(e){}
    return key;
  }
  function ensureBackend(){
    if(window.KGMarketplaceSupabase)return Promise.resolve(window.KGMarketplaceSupabase);
    return new Promise(function(resolve,reject){
      var existing=document.querySelector('script[data-kg-marketplace-backend]');
      function done(){window.KGMarketplaceSupabase?resolve(window.KGMarketplaceSupabase):reject(new Error("Talep veri katmanı yüklenemedi."));}
      if(existing){existing.addEventListener("load",done,{once:true});existing.addEventListener("error",function(){reject(new Error("Talep veri katmanı yüklenemedi."));},{once:true});return;}
      var s=document.createElement("script");s.src="/assets/supabase-marketplace.js";s.async=true;s.dataset.kgMarketplaceBackend="1";s.onload=done;s.onerror=function(){reject(new Error("Talep veri katmanı yüklenemedi."));};document.head.appendChild(s);
    });
  }
  function ensureStyle(){
    if(document.getElementById("kg-model-demand-style"))return;
    var s=document.createElement("style");s.id="kg-model-demand-style";
    s.textContent='\
.kg-demand-card{padding:17px 18px;border:1px solid #d7e3f2;border-radius:16px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.05)}.kg-demand-card h3{margin:0;color:#172033;font-size:15px}.kg-demand-sub{margin:4px 0 12px;color:#667085;font-size:11px;line-height:1.45}.kg-demand-badge{display:inline-flex;padding:5px 8px;border-radius:999px;background:#edf7ff;color:#175d8f;font-size:10px;font-weight:900}.kg-demand-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.kg-demand-stat{padding:10px;border:1px solid #e6ebf1;border-radius:10px;background:#f8fafc}.kg-demand-stat span{display:block;color:#667085;font-size:10px}.kg-demand-stat strong{display:block;margin-top:3px;color:#172033;font-size:15px}.kg-demand-budget{margin:10px 0 0;color:#475467;font-size:11px}.kg-demand-proof{margin:9px 0 0;color:#7b8798;font-size:10px;line-height:1.45}.kg-demand-form{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:11px}.kg-demand-form input{width:100%;min-height:36px;padding:0 9px;border:1px solid #d0d5dd;border-radius:8px;background:#fff;color:#101828;font-size:11px}.kg-demand-action{grid-column:1/-1;border:0;border-radius:9px;min-height:38px;background:#0da64a;color:#fff;font-weight:900;cursor:pointer}.kg-demand-action:disabled{opacity:.65;cursor:default}.kg-demand-note{grid-column:1/-1;min-height:15px;margin:0;color:#667085;font-size:10px}.kg-demand-waiting{padding:11px;border-radius:10px;background:#f8fafc;color:#667085;font-size:11px}.kg-demand-pill{display:inline-flex;margin-top:7px;padding:5px 8px;border-radius:999px;background:#edf7ff;color:#175d8f;font-size:10px;font-weight:900}\
html[data-theme="dark"] .kg-demand-card{background:#172235!important;border-color:#2d3c52!important}html[data-theme="dark"] .kg-demand-card h3,html[data-theme="dark"] .kg-demand-stat strong{color:#edf3fb!important}html[data-theme="dark"] .kg-demand-sub,html[data-theme="dark"] .kg-demand-budget,html[data-theme="dark"] .kg-demand-proof,html[data-theme="dark"] .kg-demand-note{color:#b7c3d5!important}html[data-theme="dark"] .kg-demand-stat,html[data-theme="dark"] .kg-demand-waiting,html[data-theme="dark"] .kg-demand-form input{background:#111c2d!important;border-color:#2d3c52!important;color:#edf3fb!important}';
    document.head.appendChild(s);
  }
  function ensureCard(){
    var card=document.getElementById("kgModelDemandCard");if(card)return card;
    var side=document.querySelector(".side");if(!side)return null;
    card=document.createElement("section");card.id="kgModelDemandCard";card.className="kg-demand-card";card.style.display="none";
    var expertise=document.getElementById("kgExpertiseCard");
    if(expertise&&expertise.parentNode===side)expertise.insertAdjacentElement("afterend",card);else{var trust=document.querySelector(".trust");if(trust&&trust.parentNode===side)side.insertBefore(card,trust);else side.appendChild(card);}
    return card;
  }
  function money(v){return Number(v||0).toLocaleString("tr-TR")+" TL";}
  function normalizeRow(data){var row=Array.isArray(data)?data[0]:data;return row||null;}
  function saveSnapshot(ctx,row){
    var snap={context:ctx,buyerCount:Number(row.buyer_count||0),budgetCount:Number(row.budget_count||0),avgBudgetMin:row.avg_budget_min==null?null:Number(row.avg_budget_min),avgBudgetMax:row.avg_budget_max==null?null:Number(row.avg_budget_max),activeListingCount:Number(row.active_listing_count||0),demandLevel:String(row.demand_level||"collecting"),updatedAt:new Date().toISOString()};
    window.KG_MODEL_DEMAND_SNAPSHOT=snap;
    try{sessionStorage.setItem("kg-model-demand-snapshot",JSON.stringify(snap));}catch(e){}
    try{window.dispatchEvent(new CustomEvent("kg:model-demand",{detail:snap}));}catch(e){}
    injectIntoOpenFlows();return snap;
  }
  window.KGGetModelDemandSnapshot=function(){return window.KG_MODEL_DEMAND_SNAPSHOT||null;};
  function renderUnavailable(message){var card=ensureCard();if(!card)return;card.innerHTML='<h3>Model Talebi</h3><p class="kg-demand-sub">Gerçek alıcı ilgisini gösterir.</p><div class="kg-demand-waiting">'+esc(message||"Talep verisi hazırlanıyor.")+'</div>';card.style.display="block";}
  function render(ctx,row){
    var card=ensureCard();if(!card)return;
    var snap=saveSnapshot(ctx,row);var budget="Bütçe verisi yeni oluşuyor.";
    if(snap.budgetCount>=2&&(snap.avgBudgetMin||snap.avgBudgetMax)){budget="Ortalama bütçe: "+(snap.avgBudgetMin?money(snap.avgBudgetMin):"—")+" – "+(snap.avgBudgetMax?money(snap.avgBudgetMax):"—");}
    card.innerHTML='<h3>Model Talebi</h3><p class="kg-demand-sub">Bu model için gerçek kullanıcı alım ilgisi.</p><span class="kg-demand-badge">'+esc(LABELS[snap.demandLevel]||LABELS.collecting)+'</span><div class="kg-demand-grid"><div class="kg-demand-stat"><span>Bu modeli arayan</span><strong>'+snap.buyerCount+' kişi</strong></div><div class="kg-demand-stat"><span>Aktif ilan</span><strong>'+snap.activeListingCount+'</strong></div></div><p class="kg-demand-budget">'+esc(budget)+'</p><p class="kg-demand-proof">Sayı yalnızca “Bu modeli arıyorum” diyen gerçek kullanıcı sinyallerinden hesaplanır; değerleme sorguları alıcı sayılmaz.</p><form class="kg-demand-form" id="kgDemandForm"><input id="kgDemandMin" type="number" min="1" placeholder="Min. bütçe (opsiyonel)"><input id="kgDemandMax" type="number" min="1" placeholder="Maks. bütçe (opsiyonel)"><button class="kg-demand-action" type="submit">Bu modeli arıyorum</button><p class="kg-demand-note" id="kgDemandNote"></p></form>';
    card.style.display="block";
    var form=document.getElementById("kgDemandForm");if(form)form.onsubmit=function(e){e.preventDefault();register(ctx);};
  }
  async function fetchDemand(force){
    if(!hasResult())return;
    var ctx=context();if(!ctx)return;
    var signature=[ctx.category,ctx.brand,ctx.model,ctx.storage].join("|");if(!force&&signature===lastSignature)return;lastSignature=signature;
    try{
      var api=await ensureBackend();var client=await api.init();
      var res=await client.rpc("get_model_demand_signal",{p_category:ctx.category,p_brand:ctx.brand,p_model:ctx.model,p_storage_label:ctx.storage||""});
      if(res.error)throw res.error;var row=normalizeRow(res.data);if(!row)throw new Error("Talep verisi alınamadı.");render(ctx,row);
    }catch(error){console.warn("KaçaGider Model Talebi:",error);renderUnavailable("Talep verisi hazırlanıyor.");}
  }
  async function register(ctx){
    var btn=document.querySelector("#kgDemandForm .kg-demand-action"),note=document.getElementById("kgDemandNote");var min=Number(value("kgDemandMin"))||null,max=Number(value("kgDemandMax"))||null;
    if(min&&max&&max<min){if(note)note.textContent="Maksimum bütçe minimum bütçeden düşük olamaz.";return;}
    if(btn){btn.disabled=true;btn.textContent="Kaydediliyor…";}if(note)note.textContent="";
    try{
      var api=await ensureBackend();var client=await api.init();
      var res=await client.rpc("register_model_demand",{p_category:ctx.category,p_brand:ctx.brand,p_model:ctx.model,p_storage_label:ctx.storage||"",p_client_key:clientKey(),p_budget_min:min,p_budget_max:max});
      if(res.error)throw res.error;var row=normalizeRow(res.data);render(ctx,row);var newBtn=document.querySelector("#kgDemandForm .kg-demand-action");if(newBtn){newBtn.disabled=true;newBtn.textContent="Talebin kaydedildi ✓";}
    }catch(error){console.warn("KaçaGider Model Talebi kayıt:",error);if(note)note.textContent="Talep kaydı henüz aktif değil.";if(btn){btn.disabled=false;btn.textContent="Bu modeli arıyorum";}}
  }
  function injectIntoOpenFlows(){
    var s=window.KG_MODEL_DEMAND_SNAPSHOT;if(!s||!s.buyerCount)return;
    document.querySelectorAll('.kg-mp-device').forEach(function(host){if(host.querySelector('[data-kg-demand-pill]'))return;host.insertAdjacentHTML('beforeend','<span class="kg-demand-pill" data-kg-demand-pill="1">Model talebi: '+s.buyerCount+' alıcı · '+s.activeListingCount+' aktif ilan</span>');});
  }
  function ready(){
    ensureStyle();ensureCard();var price=document.getElementById("mainPrice");if(price&&typeof MutationObserver!=="undefined")new MutationObserver(function(){lastSignature="";setTimeout(fetchDemand,40);}).observe(price,{childList:true,subtree:true,characterData:true});
    document.addEventListener("change",function(e){if(!e.target)return;if(["phoneBrand","model","storage","genericBrand","genericModel","genericStorage"].indexOf(e.target.id)>=0){lastSignature="";setTimeout(fetchDemand,80);}},true);
    var observer=new MutationObserver(injectIntoOpenFlows);observer.observe(document.documentElement,{childList:true,subtree:true});setTimeout(fetchDemand,200);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});else ready();
})();
