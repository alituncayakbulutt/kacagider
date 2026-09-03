(function(){
  'use strict';

  var ENDPOINT='/functions/v1/kg-support-ai';
  var nativeFetch=window.fetch.bind(window);
  var authLoadPromise=null;

  function loadAuth(){
    if(window.KGMarketplaceSupabase&&typeof window.KGMarketplaceSupabase.init==='function') return Promise.resolve();
    if(authLoadPromise) return authLoadPromise;
    authLoadPromise=new Promise(function(resolve){
      var existing=document.querySelector('script[data-kg-info-auth-bridge]');
      if(existing){
        existing.addEventListener('load',function(){resolve();},{once:true});
        existing.addEventListener('error',function(){resolve();},{once:true});
        return;
      }
      var script=document.createElement('script');
      script.src='/assets/supabase-marketplace.js?v=20260903-auth1';
      script.async=false;
      script.dataset.kgInfoAuthBridge='1';
      script.onload=function(){resolve();};
      script.onerror=function(){resolve();};
      document.head.appendChild(script);
    });
    return authLoadPromise;
  }

  async function getAccessToken(){
    try{
      await loadAuth();
      if(window.KGMarketplaceSupabase&&typeof window.KGMarketplaceSupabase.init==='function'){
        await window.KGMarketplaceSupabase.init();
      }
      var client=window.__KG_SUPABASE_CLIENT__;
      if(!client||!client.auth||typeof client.auth.getSession!=='function') return '';
      var result=await client.auth.getSession();
      return String(result&&result.data&&result.data.session&&result.data.session.access_token||'');
    }catch(_e){return '';}
  }

  window.fetch=async function(input,init){
    var url='';
    try{url=typeof input==='string'?input:String(input&&input.url||'');}catch(_e){}
    if(url.indexOf(ENDPOINT)===-1) return nativeFetch(input,init);

    var options=Object.assign({},init||{});
    var headers=new Headers(options.headers||(input instanceof Request?input.headers:undefined));
    var token=await getAccessToken();
    if(token) headers.set('Authorization','Bearer '+token);
    options.headers=headers;

    var response=await nativeFetch(input,options);
    if(response.status!==429) return response;

    var data={};
    try{data=await response.clone().json();}catch(_e){}
    var message=String(data&&data.message||'Bugünkü 10 ücretsiz AI destek sorusu limitine ulaştın. Yarın tekrar deneyebilir veya hesabına giriş yaparak devam edebilirsin.');
    return new Response(JSON.stringify({reply:message,limited:true,remaining:0}),{
      status:200,
      headers:{'Content-Type':'application/json; charset=utf-8'}
    });
  };
})();