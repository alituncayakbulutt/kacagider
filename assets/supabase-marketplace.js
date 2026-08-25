(function(){
  "use strict";

  const SUPABASE_URL="https://cfkrmzoghpoddkvzplyq.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY="sb_publishable_6GWze78qYhMyZQaM05MElQ_HrAJDAxE";
  const SDK_URL="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const BUCKET="listing-images";

  const CATEGORY_LABELS={
    phone:"Telefon",
    tablet:"Tablet",
    computer:"Bilgisayar",
    watch:"Akıllı Saat",
    console:"Oyun Konsolu"
  };
  const CATEGORY_KEYS=Object.fromEntries(Object.entries(CATEGORY_LABELS).map(([key,label])=>[label,key]));

  function loadSdk(){
    if(window.supabase && typeof window.supabase.createClient==="function") return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-kg-supabase-sdk]');
      if(existing){
        existing.addEventListener("load",()=>resolve(),{once:true});
        existing.addEventListener("error",()=>reject(new Error("Supabase SDK yüklenemedi.")),{once:true});
        return;
      }
      const script=document.createElement("script");
      script.src=SDK_URL;
      script.async=true;
      script.dataset.kgSupabaseSdk="1";
      script.onload=()=>resolve();
      script.onerror=()=>reject(new Error("Supabase SDK yüklenemedi."));
      document.head.appendChild(script);
    });
  }

  async function init(){
    await loadSdk();
    if(!window.__KG_SUPABASE_CLIENT__){
      window.__KG_SUPABASE_CLIENT__=window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
          auth:{
            persistSession:true,
            autoRefreshToken:true,
            detectSessionInUrl:true,
            storageKey:"kg-auth-v1"
          }
        }
      );
    }
    return window.__KG_SUPABASE_CLIENT__;
  }

  function categoryKey(value){
    if(CATEGORY_LABELS[value]) return value;
    return CATEGORY_KEYS[value]||String(value||"").trim().toLowerCase();
  }
  function categoryLabel(value){
    return CATEGORY_LABELS[categoryKey(value)]||value||"";
  }

  function dataUrlToFile(dataUrl,index){
    const parts=String(dataUrl||"").split(",");
    if(parts.length<2) throw new Error("Fotoğraf verisi okunamadı.");
    const match=parts[0].match(/data:([^;]+);base64/);
    const mime=(match&&match[1])||"image/jpeg";
    const binary=atob(parts[1]);
    const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
    const ext=mime==="image/png"?"png":mime==="image/webp"?"webp":"jpg";
    return new File([bytes],`photo-${index+1}.${ext}`,{type:mime});
  }

  async function getUser(){
    const client=await init();
    const {data,error}=await client.auth.getUser();
    if(error && error.name!=="AuthSessionMissingError") throw error;
    return data&&data.user?data.user:null;
  }

  async function signUp({fullName,email,password}){
    const client=await init();
    return client.auth.signUp({
      email,
      password,
      options:{
        data:{full_name:fullName||""},
        emailRedirectTo:"https://www.kacagider.com.tr/"
      }
    });
  }

  async function signIn({email,password}){
    const client=await init();
    return client.auth.signInWithPassword({email,password});
  }

  async function signOut(){
    const client=await init();
    return client.auth.signOut();
  }

  async function publishListing(input){
    const client=await init();
    const user=await getUser();
    if(!user) throw new Error("İlan yayınlamak için giriş yapmalısın.");

    const payload={
      user_id:user.id,
      category:categoryKey(input.category),
      brand:String(input.brand||"").trim(),
      model:String(input.model||"").trim(),
      storage:String(input.storage||"").trim()||null,
      color:String(input.color||"").trim()||null,
      city:String(input.city||"").trim()||null,
      district:String(input.district||"").trim()||null,
      description:String(input.description||"").trim()||null,
      seller_price:Number(input.salePrice||0)||null,
      market_value:Number(input.marketValue||0)||null,
      details:Array.isArray(input.details)?input.details:[],
      seller_name:String(user.user_metadata&&user.user_metadata.full_name||"").trim()||null,
      contact_phone:String(input.contactPhone||"").trim()||null,
      status:"draft",
      published_at:null
    };

    if(!payload.brand||!payload.model) throw new Error("Marka ve model bilgisi eksik.");
    if(!payload.seller_price) throw new Error("Satış fiyatını gir.");

    const {data:listing,error:listingError}=await client
      .from("listings")
      .insert(payload)
      .select("*")
      .single();
    if(listingError) throw listingError;

    const uploadedPaths=[];
    const photoRows=[];
    const photos=Array.isArray(input.photos)?input.photos.slice(0,5):[];
    try{
      for(let i=0;i<photos.length;i++){
        const file=dataUrlToFile(photos[i],i);
        const safeExt=file.name.split(".").pop()||"jpg";
        const objectPath=`${user.id}/${listing.id}/${Date.now()}-${i}.${safeExt}`;
        const {error:uploadError}=await client.storage
          .from(BUCKET)
          .upload(objectPath,file,{cacheControl:"3600",upsert:false,contentType:file.type});
        if(uploadError) throw uploadError;
        uploadedPaths.push(objectPath);
        photoRows.push({
          listing_id:listing.id,
          user_id:user.id,
          object_path:objectPath,
          sort_order:i,
          alt_text:[payload.brand,payload.model,payload.color].filter(Boolean).join(" ")
        });
      }

      if(photoRows.length){
        const {error:photoError}=await client.from("listing_photos").insert(photoRows);
        if(photoError) throw photoError;
      }

      const publishedAt=new Date().toISOString();
      const {data:published,error:publishError}=await client
        .from("listings")
        .update({status:"published",published_at:publishedAt})
        .eq("id",listing.id)
        .eq("user_id",user.id)
        .select("*")
        .single();
      if(publishError) throw publishError;
      return published;
    }catch(error){
      if(uploadedPaths.length){
        try{await client.storage.from(BUCKET).remove(uploadedPaths);}catch(_e){}
      }
      try{await client.from("listings").delete().eq("id",listing.id).eq("user_id",user.id);}catch(_e){}
      throw error;
    }
  }

  function publicPhotoUrl(client,path){
    if(!path) return "";
    const {data}=client.storage.from(BUCKET).getPublicUrl(path);
    return data&&data.publicUrl?data.publicUrl:"";
  }

  function normalizeListing(client,row){
    const photoRows=Array.isArray(row.listing_photos)?row.listing_photos.slice().sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0)):[];
    return {
      id:row.id,
      category:categoryLabel(row.category),
      categoryKey:categoryKey(row.category),
      brand:row.brand,
      model:row.model,
      storage:row.storage,
      color:row.color,
      city:row.city,
      district:row.district,
      description:row.description,
      salePrice:Number(row.seller_price||0),
      marketValue:Number(row.market_value||0),
      estimatedPrice:Number(row.market_value||0),
      details:Array.isArray(row.details)?row.details:[],
      sellerName:row.seller_name||"Bireysel satıcı",
      contactPhone:row.contact_phone||"",
      status:row.status,
      createdAt:row.created_at,
      publishedAt:row.published_at,
      photos:photoRows.map(p=>publicPhotoUrl(client,p.object_path)).filter(Boolean)
    };
  }

  async function listPublished(){
    const client=await init();
    const {data,error}=await client
      .from("listings")
      .select("*, listing_photos(object_path,sort_order)")
      .eq("status","published")
      .order("published_at",{ascending:false});
    if(error) throw error;
    return (data||[]).map(row=>normalizeListing(client,row));
  }

  async function getListing(id){
    const client=await init();
    const {data,error}=await client
      .from("listings")
      .select("*, listing_photos(object_path,sort_order)")
      .eq("id",id)
      .eq("status","published")
      .maybeSingle();
    if(error) throw error;
    return data?normalizeListing(client,data):null;
  }

  window.KGMarketplaceSupabase={
    ready:init(),
    init,
    getUser,
    signUp,
    signIn,
    signOut,
    publishListing,
    listPublished,
    getListing,
    categoryKey,
    categoryLabel,
    config:{url:SUPABASE_URL}
  };
})();