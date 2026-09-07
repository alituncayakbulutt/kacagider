(function(){
'use strict';
if(window.__KG_SELL_OPTIONS_UI_PHASE1__)return;
window.__KG_SELL_OPTIONS_UI_PHASE1__=true;
function q(s,r){return(r||document).querySelector(s);}
function currentPrice(){var e=q('#mainPrice');return Number(String(e&&e.textContent||'').replace(/[^0-9]/g,''))||0;}
function isPhone(){var n=q('#selectedCategoryName');if(n&&String(n.textContent||'').trim()==='Telefon')return true;var a=q('.category-card.active[data-category],.kg-approved-card.active[data-category]');return !!(a&&a.dataset&&(a.dataset.category==='phone'||a.dataset.category==='telefon'));}
function addCss(){if(q('#kgSellOptionsCss'))return;var l=document.createElement('link');l.id='kgSellOptionsCss';l.rel='stylesheet';l.href='/assets/marketplace-sell-options.css?v=20260905-phase1';document.head.appendChild(l);}
function selfSell(){if(window.KGMarketplaceUI&&typeof window.KGMarketplaceUI.beginListing==='function')window.KGMarketplaceUI.beginListing();}
function dealerSell(){if(window.KGDealerSellPhase1&&typeof window.KGDealerSellPhase1.open==='function')window.KGDealerSellPhase1.open();}
function ensure(){var card=q('.price-card');if(!card)return null;var box=q('#kgSellPaths');if(box)return box;box=document.createElement('section');box.id='kgSellPaths';box.className='kg-sell-paths';box.innerHTML='<h3>Cihazını nasıl satmak istersin?</h3><p>Değerini öğrendin. Şimdi sana uygun satış yolunu seç.</p><div class="kg-sell-grid"><button type="button" class="kg-sell-choice" id="kgSelfSell"><strong>👤 Kendin Sat</strong><span>Daha yüksek fiyatı hedefle. İlanını ücretsiz oluştur ve alıcını kendin bul.</span><small>Ücretsiz ilan oluştur →</small></button><button type="button" class="kg-sell-choice dealer" id="kgDealerSell"><strong>🏪 Telefoncuya Sat</strong><span>Doğrulanmış telefonculardan cihazın için alış teklifi al.</span><small>Telefonculardan teklif al →</small></button></div><p class="kg-sell-note">KaçaGider telefoncu alış fiyatını belirlemez; teklifleri telefoncular verir.</p>';card.appendChild(box);q('#kgSelfSell',box).onclick=selfSell;q('#kgDealerSell',box).onclick=dealerSell;return box;}
function refresh(){var box=ensure();if(!box)return;var show=currentPrice()>0&&isPhone();box.classList.toggle('ready',show);var old=q('#kgMpResultAction');if(old)old.style.display=show?'none':'';}
function boot(){addCss();ensure();refresh();var p=q('#mainPrice');if(p)new MutationObserver(refresh).observe(p,{childList:true,characterData:true,subtree:true});var c=q('#selectedCategoryName');if(c)new MutationObserver(refresh).observe(c,{childList:true,characterData:true,subtree:true});setTimeout(refresh,500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();