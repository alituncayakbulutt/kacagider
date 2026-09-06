(function(){
'use strict';
if(window.KGDealerSellBackend)return;

var BUCKET='dealer-sell-images';
var TABLE='dealer_sell_requests';
var PHOTO_TABLE='dealer_sell_request_photos';
var loading=null;

function waitForMarketplaceApi(){
  if(window.KGMarketplaceSupabase)return Promise.resolve(window.KGMarketplaceSupabase);
  if(loading)return loading;
  loading=new Promise(function(resolve,reject){
    var existing=document.querySelector('script[data-kg-marketplace-backend]');
    if(!existing){
      existing=document.createElement('script');
      existing.src='/assets/supabase-marketplace.js';
      existing.async=true;
      existing.dataset.kgMarketplaceBackend='1';
      document.head.appendChild(existing);
    }
    var tries=0,t=setInterval(function(){
      tries++;
      if(window.KGMarketplaceSupabase){clearInterval(t);resolve(window.KGMarketplaceSupabase);}
      else if(tries>=160){clearInterval(t);reject(new Error('Supabase bağlantısı yüklenemedi.'));}
    },50);
    existing.addEventListener('error',function(){clearInterval(t);reject(new Error('Supabase bağlantısı yüklenemedi.'));},{once:true});
  });
  return loading;
}

async function api(){
  var mp=await waitForMarketplaceApi();
  await mp.ready;
  return mp;
}

async function client(){
  var mp=await api();
  return mp.init();
}

async function getUser(){
  var mp=await api();
  return mp.getUser();
}

function extOf(file){
  var name=String(file&&file.name||'').toLowerCase();
  var m=name.match(/\.([a-z0-9]+)$/);
  if(m&&/^(jpg|jpeg|png|webp|heic|heif)$/.test(m[1]))return m[1]==='jpeg'?'jpg':m[1];
  var type=String(file&&file.type||'').toLowerCase();
  if(type==='image/png')return'png';
  if(type==='image/webp')return'webp';
  if(type==='image/heic')return'heic';
  if(type==='image/heif')return'heif';
  return'jpg';
}

function validImage(file){
  if(!file)return false;
  var type=String(file.type||'').toLowerCase();
  var name=String(file.name||'').toLowerCase();
  return /^image\/(jpeg|png|webp|heic|heif)$/.test(type)||/\.(jpe?g|png|webp|heic|heif)$/.test(name);
}

function requiredTypes(hasDamage){
  return hasDamage?['front','back','side','corners','damage']:['front','back','side','corners'];
}

function cleanText(v,max){
  var s=String(v==null?'':v).trim();
  return max?s.slice(0,max):s;
}

async function submitRequest(input){
  input=input||{};
  var user=await getUser();
  if(!user){var authError=new Error('Telefonculardan teklif almak için giriş yapmalısın.');authError.code='AUTH_REQUIRED';throw authError;}

  var draft=input.draft||{};
  var hasDamage=input.hasDamage===true;
  var attested=input.attested===true;
  if(!attested)throw new Error('Bilgi ve fotoğraf doğruluğu onayını işaretlemelisin.');
  if(!cleanText(draft.brand)||!cleanText(draft.model))throw new Error('Cihaz bilgileri eksik.');
  if(!cleanText(draft.city)||!cleanText(draft.district))throw new Error('İl ve ilçe bilgileri eksik.');

  var photos=input.photos||{};
  var required=requiredTypes(hasDamage);
  for(var r=0;r<required.length;r++){
    var requiredFile=photos[required[r]];
    if(!requiredFile)throw new Error('Zorunlu cihaz fotoğraflarını tamamlamalısın.');
  }

  var ordered=['front','back','side','corners','damage'];
  for(var i=0;i<ordered.length;i++){
    var f=photos[ordered[i]];
    if(!f)continue;
    if(!validImage(f))throw new Error('Yalnızca JPG, PNG, WEBP veya HEIC fotoğraf yükleyebilirsin.');
    if(f.size>10*1024*1024)throw new Error('Her fotoğraf en fazla 10 MB olabilir.');
  }

  var c=await client();
  var battery=parseInt(draft.battery,10);
  if(!Number.isFinite(battery)||battery<1||battery>100)battery=null;
  var marketValue=Number(draft.marketPrice||0)||null;
  var snapshot={
    market_value:marketValue,
    details:Array.isArray(input.details)?input.details:[],
    captured_at:new Date().toISOString(),
    source:'kacagider_valuation'
  };
  var payload={
    user_id:user.id,
    category:'phone',
    brand:cleanText(draft.brand,120),
    model:cleanText(draft.model,160),
    storage:cleanText(draft.storage,80)||null,
    market_value:marketValue,
    city:cleanText(draft.city,100),
    district:cleanText(draft.district,100),
    battery:battery,
    warranty:cleanText(draft.warranty,40)||null,
    box_invoice:cleanText(draft.boxInvoice,40)||null,
    notes:cleanText(draft.notes,1000)||null,
    has_damage:hasDamage,
    seller_declaration:true,
    valuation_snapshot:snapshot,
    status:'draft'
  };

  var inserted=await c.from(TABLE).insert(payload).select('id,request_code,status,created_at').single();
  if(inserted.error)throw inserted.error;
  var request=inserted.data;
  var uploaded=[];
  var rows=[];

  try{
    var stamp=Date.now();
    for(var p=0;p<ordered.length;p++){
      var type=ordered[p],file=photos[type];
      if(!file)continue;
      var ext=extOf(file);
      var path=user.id+'/'+request.id+'/'+type+'-'+stamp+'-'+p+'.'+ext;
      var upload=await c.storage.from(BUCKET).upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||('image/'+ext)});
      if(upload.error)throw upload.error;
      uploaded.push(path);
      rows.push({request_id:request.id,user_id:user.id,photo_type:type,object_path:path,sort_order:p});
    }
    if(rows.length){
      var photoInsert=await c.from(PHOTO_TABLE).insert(rows);
      if(photoInsert.error)throw photoInsert.error;
    }
    var opened=await c.from(TABLE).update({status:'open',updated_at:new Date().toISOString()}).eq('id',request.id).eq('user_id',user.id).select('id,request_code,status,created_at').single();
    if(opened.error)throw opened.error;
    return {request:opened.data,photoCount:rows.length};
  }catch(error){
    if(uploaded.length){try{await c.storage.from(BUCKET).remove(uploaded);}catch(_e){}}
    try{await c.from(TABLE).delete().eq('id',request.id).eq('user_id',user.id);}catch(_e){}
    throw error;
  }
}

async function listMyRequests(){
  var user=await getUser();
  if(!user)return[];
  var c=await client();
  var res=await c.from(TABLE).select('id,request_code,brand,model,storage,market_value,city,district,has_damage,status,created_at').eq('user_id',user.id).order('created_at',{ascending:false});
  if(res.error)throw res.error;
  return res.data||[];
}

window.KGDealerSellBackend={api:api,client:client,getUser:getUser,submitRequest:submitRequest,listMyRequests:listMyRequests,config:{bucket:BUCKET,table:TABLE,photoTable:PHOTO_TABLE}};
})();
