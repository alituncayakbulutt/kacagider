(function(){
  'use strict';
  var ENDPOINT='https://cfkrmzoghpoddkvzplyq.supabase.co/functions/v1/kg-growth-lead';
  function note(form,text,error){var el=form.querySelector('[data-growth-note]');if(!el)return;el.className='kg-growth-note show '+(error?'error':'success');el.textContent=text;}
  function campaign(){try{var q=new URLSearchParams(location.search);return{utm_source:q.get('utm_source')||'',utm_medium:q.get('utm_medium')||'',utm_campaign:q.get('utm_campaign')||'',referrer:document.referrer||''};}catch(_e){return{utm_source:'',utm_medium:'',utm_campaign:'',referrer:''};}}
  function track(name,params){if(typeof window.gtag==='function')window.gtag('event',name,params||{});}
  document.querySelectorAll('[data-growth-form]').forEach(function(form){
    form.addEventListener('submit',async function(e){
      e.preventDefault();var button=form.querySelector('button[type="submit"]');if(button)button.disabled=true;note(form,'Başvurun gönderiliyor…',false);
      var fd=new FormData(form),payload={lead_type:form.getAttribute('data-growth-form')||'',company:fd.get('company'),contact_name:fd.get('contact_name'),email:fd.get('email'),phone:fd.get('phone'),city:fd.get('city'),website:fd.get('website'),business_type:fd.get('business_type'),monthly_volume:fd.get('monthly_volume'),message:fd.get('message'),company_url:fd.get('company_url'),consent:fd.get('consent')==='on'};Object.assign(payload,campaign());
      try{
        var r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),data=await r.json().catch(function(){return{};});
        if(!r.ok){var msg=r.status===429?'Çok kısa sürede fazla başvuru gönderildi. Bir süre sonra tekrar dene.':r.status===422?'Zorunlu alanları ve e-posta adresini kontrol et.':'Başvuru gönderilemedi. Lütfen tekrar dene.';throw new Error(msg);}
        note(form,data.message||'Başvurun alındı. Teşekkürler.',false);form.reset();track('growth_lead_submitted',{lead_type:payload.lead_type,utm_source:payload.utm_source||'(direct)',utm_medium:payload.utm_medium||'(none)'});
      }catch(err){note(form,err&&err.message?err.message:'Başvuru gönderilemedi. Lütfen tekrar dene.',true);track('growth_lead_failed',{lead_type:payload.lead_type});}
      finally{if(button)button.disabled=false;}
    });
  });
})();
