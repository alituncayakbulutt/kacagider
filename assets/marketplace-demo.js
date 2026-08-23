/* KaçaGider Marketplace FAZ 1 — visual/demo flow only. */
(function(){
  'use strict';

  function qs(name){
    try{return new URLSearchParams(window.location.search).get(name)||'';}catch(e){return '';}
  }

  function text(id,value){
    var el=document.getElementById(id);
    if(el && value) el.value=value;
  }

  function priceText(value){
    var number=Number(String(value||'').replace(/[^0-9.,]/g,'').replace(/\./g,'').replace(',','.'));
    if(!Number.isFinite(number)||number<=0) return '';
    return Math.round(number).toLocaleString('tr-TR')+' TL';
  }

  document.addEventListener('DOMContentLoaded',function(){
    var brand=qs('brand')||'Apple';
    var model=qs('model')||'iPhone 13';
    var storage=qs('storage')||'128 GB';
    var estimated=qs('estimated')||'20250';

    text('kgmBrand',brand);
    text('kgmModel',model);
    text('kgmStorage',storage);

    var estimateEl=document.getElementById('kgmEstimate');
    var formatted=priceText(estimated);
    if(estimateEl && formatted) estimateEl.textContent=formatted;

    var sale=document.getElementById('kgmSalePrice');
    if(sale && estimated && !sale.value){
      var numeric=Number(String(estimated).replace(/[^0-9]/g,''));
      if(Number.isFinite(numeric)&&numeric>0) sale.value=Math.round(numeric/50)*50;
    }

    var authForm=document.getElementById('kgmAuthForm');
    var publish=document.getElementById('kgmPublish');
    var success=document.getElementById('kgmSuccess');
    var authStatus=document.getElementById('kgmAuthStatus');
    var isDemoAuthenticated=false;

    if(authForm){
      authForm.addEventListener('submit',function(event){
        event.preventDefault();
        var email=document.getElementById('kgmEmail');
        var password=document.getElementById('kgmPassword');
        if(!email || !email.value || !password || password.value.length<6){
          if(authStatus) authStatus.textContent='Demo için geçerli bir e-posta ve en az 6 karakterli şifre gir.';
          return;
        }
        isDemoAuthenticated=true;
        if(authStatus) authStatus.textContent='Demo girişi tamamlandı. Gerçek hesap oluşturulmadı.';
        if(publish) publish.disabled=false;
      });
    }

    if(publish){
      publish.addEventListener('click',function(){
        if(!isDemoAuthenticated) return;
        if(success){
          success.classList.add('is-visible');
          success.scrollIntoView({behavior:'smooth',block:'center'});
        }
      });
    }
  });
})();
