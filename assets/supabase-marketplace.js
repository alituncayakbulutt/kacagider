(function(){
"use strict";
const SUPABASE_URL="https://cfkrmzoghpoddkvzplyq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_6GWze78qYhMyZQaM05MElQ_HrAJDAxE";
const SDK_URL="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
const BUCKET="listing-images";
const PENDING_AUTH_KEY="kg-pending-listing-auth-v1";
const CATEGORY_LABELS={phone:"Telefon",tablet:"Tablet",computer:"Bilgisayar",watch:"Akıllı Saat",console:"Oyun Konsolu"};
const CATEGORY_KEYS=Object.fromEntries(Object.entries(CATEGORY_LABELS).map(([k,v])=>[v,k]));

function sdkReady(){return !!(window.supabase&&typeof window.supabase.createClient==="function");}
function loadSdk(){
  if(sdkReady())return Promise.resolve();
  return new Promise((resolve,reject)=>{
    let settled=false;
    const finish=(err)=>{if(settled)return;settled=true;clearInterval(poll);clearTimeout(timeout);if(err)reject(err);else resolve();};
    let script=document.querySelector('script[data-kg-supabase-sdk]');
    if(!script){script=document.createElement("script");script.src=SDK_URL;script.async=true;script.dataset.kgSupabaseSdk="1";document.head.appendChild(script);}
    script.addEventListener("load",()=>{if(sdkReady())finish();},{once:true});
    script.addEventListener("error",()=>finish(new Error("Supabase SDK yüklenemedi.")),{once:true});
    const poll=setInterval(()=>{if(sdkReady())finish();},50);
    const timeout=setTimeout(()=>finish(new Error("Supabase SDK zaman aşımına uğradı. Lütfen bağlantınızı kontrol edip sayfayı yenileyin.")),10000);
  });
}
function authRedirectUrl(){
  try{return new URL("/",window.location.origin).toString();}
  catch(_e){return "https://kacagider.com.tr/";}
}
async function init(){
  await loadSdk();
  if(!window.__KG_SUPABASE_CLIENT__){
    window.__KG_SUPABASE_CLIENT__=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:"kg-auth-v1"}});
  }
  return window.__KG_SUPABASE_CLIENT__;
}
function authErrorMessage(error,fallback){
  const raw=String(error&&error.message||error||"").trim();
  const code=String(error&&error.code||"").trim().toLowerCase();
  const text=raw.toLowerCase();
  if(!raw)return fallback||"İşlem tamamlanamadı. Lütfen tekrar dene.";
  if(code==="invalid_credentials"||text.includes("invalid login credentials"))return "E-posta adresi veya şifre hatalı.";
  if(code==="email_not_confirmed"||text.includes("email not confirmed"))return "E-posta adresin henüz doğrulanmamış. Gelen kutundaki doğrulama bağlantısını aç.";
  if(code==="user_already_exists"||text.includes("user already registered")||text.includes("already been registered"))return "Bu e-posta adresiyle daha önce üyelik oluşturulmuş. Giriş yapabilir veya şifreni yenileyebilirsin.";
  if(text.includes("password should be at least")||text.includes("password is too short")||text.includes("weak password"))return "Şifre en az 8 karakter olmalı.";
  if(text.includes("email rate limit exceeded")||text.includes("rate limit"))return "Çok kısa sürede fazla e-posta isteği gönderildi. Birkaç dakika sonra tekrar dene.";
  if(text.includes("signup is disabled"))return "Yeni üyelik oluşturma şu anda geçici olarak kullanılamıyor.";
  if(text.includes("email address")&&text.includes("invalid"))return "Geçerli bir e-posta adresi gir.";
  if(text.includes("unable to validate email address"))return "E-posta adresi doğrulanamadı. Adresi kontrol edip tekrar dene.";
  if(text.includes("token has expired")||text.includes("otp_expired")||text.includes("expired"))return "Bu bağlantının süresi dolmuş. Yeni bir doğrulama veya şifre yenileme e-postası iste.";
  if(text.includes("same password"))return "Yeni şifre eski şifrenle aynı olamaz.";
  if(text.includes("network")||text.includes("fetch"))return "Bağlantı hatası oluştu. İnternet bağlantını kontrol edip tekrar dene.";
  return fallback||"İşlem tamamlanamadı. Lütfen bilgilerini kontrol edip tekrar dene.";
}
function localizeAuthResult(result,fallback){
  if(result&&result.error){
    const localized=new Error(authErrorMessage(result.error,fallback));
    localized.code=result.error.code||"";
    return Object.assign({},result,{error:localized});
  }
  return result;
}
function categoryKey(value){if(CATEGORY_LABELS[value])return value;return CATEGORY_KEYS[value]||String(value||"").trim().toLowerCase();}
function categoryLabel(value){return CATEGORY_LABELS[categoryKey(value)]||value||"";}
function dataUrlToFile(dataUrl,index){
  const parts=String(dataUrl||"").split(",");if(parts.length<2)throw new Error("Fotoğraf verisi okunamadı.");
  const match=parts[0].match(/data:([^;]+);base64/),mime=(match&&match[1])||"image/jpeg",binary=atob(parts[1]),bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  const ext=mime==="image/png"?"png":mime==="image/webp"?"webp":"jpg";
  return new File([bytes],`photo-${index+1}.${ext}`,{type:mime});
}
function isVerifiedUser(user){
  if(!user)return false;
  return Boolean(user.email_confirmed_at||user.confirmed_at||(user.app_metadata&&user.app_metadata.provider==="google"));
}
async function getSessionUser(){
  const client=await init();
  const {data,error}=await client.auth.getUser();
  if(error&&error.name!=="AuthSessionMissingError"&&error.message!=="Auth session missing!")throw new Error(authErrorMessage(error,"Oturum bilgisi alınamadı. Lütfen tekrar giriş yap."));
  return data&&data.user?data.user:null;
}
async function getUser(){const user=await getSessionUser();return isVerifiedUser(user)?user:null;}
async function signUp({fullName,email,password}){
  const client=await init();
  const result=await client.auth.signUp({email,password,options:{data:{full_name:String(fullName||"").trim()},emailRedirectTo:authRedirectUrl()}});
  return localizeAuthResult(result,"Üyelik oluşturulamadı. Bilgilerini kontrol edip tekrar dene.");
}
async function signIn({email,password}){
  const client=await init();
  const result=localizeAuthResult(await client.auth.signInWithPassword({email,password}),"Giriş yapılamadı. E-posta adresini ve şifreni kontrol et.");
  if(result&&result.data&&result.data.user&&!isVerifiedUser(result.data.user)){
    await client.auth.signOut();
    return {data:{user:null,session:null},error:new Error("E-posta adresini doğrulamadan giriş yapamazsın. Gelen kutundaki doğrulama bağlantısını aç.")};
  }
  return result;
}
async function signInWithGoogle(){
  const client=await init();
  return localizeAuthResult(await client.auth.signInWithOAuth({provider:"google",options:{redirectTo:authRedirectUrl(),queryParams:{prompt:"select_account"}}}),"Google ile giriş başlatılamadı. Lütfen tekrar dene.");
}
async function resendVerification(email){
  const clean=String(email||"").trim();
  if(!clean)throw new Error("Önce e-posta adresini gir.");
  const client=await init();
  return localizeAuthResult(await client.auth.resend({type:"signup",email:clean,options:{emailRedirectTo:authRedirectUrl()}}),"Doğrulama e-postası gönderilemedi. Lütfen biraz sonra tekrar dene.");
}
async function resetPassword(email){
  const clean=String(email||"").trim();
  if(!clean)throw new Error("Önce e-posta adresini gir.");
  const client=await init();
  return localizeAuthResult(await client.auth.resetPasswordForEmail(clean,{redirectTo:authRedirectUrl()}),"Şifre yenileme e-postası gönderilemedi. Lütfen biraz sonra tekrar dene.");
}
async function updatePassword(password){
  const clean=String(password||"");
  if(clean.length<8)throw new Error("Yeni şifre en az 8 karakter olmalı.");
  const client=await init();
  return localizeAuthResult(await client.auth.updateUser({password:clean}),"Şifre güncellenemedi. Lütfen tekrar dene.");
}
async function signOut(){const client=await init();return localizeAuthResult(await client.auth.signOut(),"Çıkış işlemi tamamlanamadı. Lütfen tekrar dene.");}

function selectedValue(id){
  const el=document.getElementById(id);
  if(!el)return "";
  if(el.tagName==="SELECT"){const o=el.options[el.selectedIndex];return o?String(o.textContent||"").trim():"";}
  return String(el.value||"").trim();
}
function currentCategoryKey(){
  const active=document.querySelector('.category-card.active[data-category],.kg-approved-card.active[data-category],[data-category].active');
  const raw=active&&active.dataset?active.dataset.category:"";
  const map={phone:"phone",telefon:"phone",tablet:"tablet",computer:"computer",bilgisayar:"computer",watch:"watch","akilli-saat":"watch",console:"console","oyun-konsolu":"console"};
  if(map[raw])return map[raw];
  const selected=document.getElementById("selectedCategoryName");
  const label=selected?String(selected.textContent||"").trim():"";
  return CATEGORY_KEYS[label]||"phone";
}
function textPrice(){
  const el=document.getElementById("mainPrice");
  return Number(String(el?el.textContent:"").replace(/[^0-9]/g,""))||0;
}
function capturePendingListing(){
  try{
    const category=currentCategoryKey(),generic=category!=="phone";
    const details=typeof window.KGMarketplaceCollectDetails==="function"?window.KGMarketplaceCollectDetails():[];
    const ctx={category,categoryLabel:categoryLabel(category),brand:selectedValue(generic?"genericBrand":"phoneBrand"),model:selectedValue(generic?"genericModel":"model"),storage:selectedValue(generic?"genericStorage":"storage"),marketValue:textPrice(),details:Array.isArray(details)?details:[]};
    if(!ctx.marketValue||!ctx.brand||!ctx.model)return null;
    sessionStorage.setItem(PENDING_AUTH_KEY,JSON.stringify(ctx));
    return ctx;
  }catch(_e){return null;}
}
function loadPendingListing(){
  try{
    const raw=sessionStorage.getItem(PENDING_AUTH_KEY);if(!raw)return null;
    const value=JSON.parse(raw);if(!value||!value.marketValue||!value.brand||!value.model)return null;
    return value;
  }catch(_e){return null;}
}
function clearPendingListing(){try{sessionStorage.removeItem(PENDING_AUTH_KEY);}catch(_e){}}

function ensureAuthStyles(){
  if(document.getElementById("kgAuthUpgradeStyle"))return;
  const style=document.createElement("style");style.id="kgAuthUpgradeStyle";style.textContent=`
  .kg-auth-social{display:grid;gap:10px;margin:0 0 14px}.kg-auth-google{width:100%;min-height:46px;border:1px solid #d0d5dd;border-radius:10px;background:#fff;color:#1d2939;font-weight:850;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}.kg-auth-google:hover{background:#f9fafb}.kg-auth-google b{width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;border:1px solid #e5e7eb;font-family:Arial,sans-serif;color:#4285f4;background:#fff}.kg-auth-divider{display:flex;align-items:center;gap:10px;color:#98a2b3;font-size:11px;font-weight:750}.kg-auth-divider:before,.kg-auth-divider:after{content:"";height:1px;background:#e5e7eb;flex:1}.kg-auth-links{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:10px}.kg-auth-link{border:0;background:transparent;padding:3px 0;color:#087a37;font-size:11px;font-weight:850;cursor:pointer}.kg-auth-link:hover{text-decoration:underline}.kg-auth-confirm{margin-bottom:12px}.kg-auth-recovery-overlay{position:fixed;inset:0;z-index:1000001;background:rgba(7,20,38,.72);display:flex;align-items:center;justify-content:center;padding:18px}.kg-auth-recovery-card{width:min(460px,100%);background:#fff;color:#101828;border-radius:18px;padding:22px;box-shadow:0 28px 80px rgba(2,6,23,.35)}.kg-auth-recovery-card h2{margin:0 0 7px}.kg-auth-recovery-card p{margin:0 0 15px;color:#667085;font-size:13px;line-height:1.5}.kg-auth-recovery-card label{display:block;font-size:12px;font-weight:850;margin:10px 0 6px}.kg-auth-recovery-card input{width:100%;min-height:44px;border:1px solid #d0d5dd;border-radius:10px;padding:10px 12px}.kg-auth-recovery-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:16px}.kg-auth-recovery-actions button{border:0;border-radius:10px;padding:11px 14px;font-weight:900;cursor:pointer}.kg-auth-recovery-actions .primary{background:#16a34a;color:#fff}.kg-auth-recovery-note{margin-top:12px;padding:10px 12px;border-radius:10px;background:#f0fdf4;color:#166534;font-size:12px}.kg-auth-recovery-note.error{background:#fff1f2;color:#b42318}`;
  document.head.appendChild(style);
}
function authNote(message,isError){
  const note=document.getElementById("kgAuthNote");if(!note)return;
  note.className="kg-mp-note"+(isError?" error":"");note.textContent=message;
}
async function runGoogleSignIn(button){
  button.disabled=true;
  try{capturePendingListing();const result=await signInWithGoogle();if(result&&result.error)throw result.error;}
  catch(error){authNote(authErrorMessage(error,"Google ile giriş başlatılamadı. Lütfen tekrar dene."),true);button.disabled=false;}
}
function enhanceMarketplaceAuth(){
  const form=document.getElementById("kgMpAuth");if(!form||form.dataset.kgAuthUpgrade==="1")return;
  form.dataset.kgAuthUpgrade="1";ensureAuthStyles();
  const register=Boolean(document.getElementById("kgAuthName"));
  const social=document.createElement("div");social.className="kg-auth-social";social.innerHTML='<button type="button" class="kg-auth-google" id="kgAuthGoogle"><b>G</b><span>Google ile devam et</span></button><div class="kg-auth-divider">veya e-posta ile</div>';
  form.parentNode.insertBefore(social,form);
  const google=document.getElementById("kgAuthGoogle");if(google)google.addEventListener("click",function(){runGoogleSignIn(google);});
  if(register){
    const actions=form.querySelector(".kg-mp-actions"),wrap=document.createElement("div");wrap.className="kg-mp-field kg-auth-confirm";wrap.innerHTML='<label>Şifre Tekrarı</label><input id="kgAuthPasswordConfirm" type="password" minlength="8" autocomplete="new-password" required>';
    if(actions)form.insertBefore(wrap,actions);else form.appendChild(wrap);
    form.addEventListener("submit",function(e){
      const p=document.getElementById("kgAuthPassword"),c=document.getElementById("kgAuthPasswordConfirm");
      if(p&&c&&p.value!==c.value){e.preventDefault();e.stopImmediatePropagation();authNote("Şifreler aynı olmalı.",true);}
    },true);
  }
  const links=document.createElement("div");links.className="kg-auth-links";links.innerHTML=(register?"":'<button type="button" class="kg-auth-link" data-kg-auth="forgot">Şifremi unuttum</button>')+'<button type="button" class="kg-auth-link" data-kg-auth="resend">Doğrulama e-postasını tekrar gönder</button>';form.appendChild(links);
  const forgot=links.querySelector('[data-kg-auth="forgot"]');
  if(forgot)forgot.addEventListener("click",async function(){
    forgot.disabled=true;try{const result=await resetPassword(selectedValue("kgAuthEmail"));if(result&&result.error)throw result.error;authNote("Şifre yenileme bağlantısını e-posta adresine gönderdik.",false);}catch(error){authNote(authErrorMessage(error,"Şifre yenileme e-postası gönderilemedi. Lütfen biraz sonra tekrar dene."),true);}forgot.disabled=false;
  });
  const resend=links.querySelector('[data-kg-auth="resend"]');
  if(resend)resend.addEventListener("click",async function(){
    resend.disabled=true;try{const result=await resendVerification(selectedValue("kgAuthEmail"));if(result&&result.error)throw result.error;authNote("Doğrulama e-postasını tekrar gönderdik. Gelen kutusu ve spam klasörünü kontrol et.",false);}catch(error){authNote(authErrorMessage(error,"Doğrulama e-postası gönderilemedi. Lütfen biraz sonra tekrar dene."),true);}resend.disabled=false;
  });
}
function installAuthObserver(){
  ensureAuthStyles();enhanceMarketplaceAuth();
  const observer=new MutationObserver(()=>enhanceMarketplaceAuth());observer.observe(document.documentElement,{childList:true,subtree:true});
}
function cleanAuthUrl(){
  try{
    const url=new URL(location.href);["code","error","error_code","error_description"].forEach(k=>url.searchParams.delete(k));
    const clean=url.pathname+(url.searchParams.toString()?"?"+url.searchParams.toString():"");if(url.hash||clean!==location.pathname+location.search)history.replaceState(null,"",clean||"/");
  }catch(_e){}
}
function waitForMarketplaceUI(callback,tries){
  const count=Number(tries||0);if(window.KGMarketplaceUI&&typeof window.KGMarketplaceUI.beginListing==="function"){callback();return;}if(count<60)setTimeout(()=>waitForMarketplaceUI(callback,count+1),100);
}
async function resumePendingListing(user){
  const pending=loadPendingListing();if(!pending||!isVerifiedUser(user))return;
  clearPendingListing();cleanAuthUrl();waitForMarketplaceUI(()=>window.KGMarketplaceUI.beginListing(pending),0);
}
function showPasswordRecovery(client){
  if(document.getElementById("kgAuthRecovery"))return;ensureAuthStyles();
  const overlay=document.createElement("div");overlay.id="kgAuthRecovery";overlay.className="kg-auth-recovery-overlay";overlay.innerHTML='<section class="kg-auth-recovery-card"><h2>Yeni şifreni belirle</h2><p>Hesabın için en az 8 karakterlik yeni bir şifre oluştur.</p><form id="kgAuthRecoveryForm"><label>Yeni Şifre</label><input id="kgRecoveryPassword" type="password" minlength="8" autocomplete="new-password" required><label>Yeni Şifre Tekrarı</label><input id="kgRecoveryPasswordConfirm" type="password" minlength="8" autocomplete="new-password" required><div id="kgRecoveryNote"></div><div class="kg-auth-recovery-actions"><button type="submit" class="primary">Şifreyi Güncelle</button></div></form></section>';
  document.body.appendChild(overlay);document.body.style.overflow="hidden";
  const form=document.getElementById("kgAuthRecoveryForm");form.addEventListener("submit",async function(e){
    e.preventDefault();const p=document.getElementById("kgRecoveryPassword").value,c=document.getElementById("kgRecoveryPasswordConfirm").value,n=document.getElementById("kgRecoveryNote"),b=form.querySelector('button[type="submit"]');n.className="";n.textContent="";
    if(p!==c){n.className="kg-auth-recovery-note error";n.textContent="Şifreler aynı olmalı.";return;}b.disabled=true;
    try{const result=await client.auth.updateUser({password:p});if(result&&result.error)throw result.error;n.className="kg-auth-recovery-note";n.textContent="Şifren güncellendi. Devam Et butonuna basabilirsin.";b.type="button";b.textContent="Devam Et";b.disabled=false;b.onclick=function(){overlay.remove();document.body.style.overflow="";cleanAuthUrl();};}
    catch(error){n.className="kg-auth-recovery-note error";n.textContent=authErrorMessage(error,"Şifre güncellenemedi. Lütfen tekrar dene.");b.disabled=false;}
  });
}
async function installAuthLifecycle(client){
  installAuthObserver();
  client.auth.onAuthStateChange((event,session)=>{
    const user=session&&session.user?session.user:null;
    if(event==="PASSWORD_RECOVERY"){showPasswordRecovery(client);return;}
    if(user&&(event==="SIGNED_IN"||event==="INITIAL_SESSION"||event==="TOKEN_REFRESHED"))resumePendingListing(user);
  });
  const {data:{session}}=await client.auth.getSession();const initialUser=session&&session.user?session.user:null;if(initialUser)resumePendingListing(initialUser);
}

async function publishListing(input){
  const client=await init(),user=await getSessionUser();
  if(!user)throw new Error("İlan yayınlamak için giriş yapmalısın.");
  if(!isVerifiedUser(user))throw new Error("İlan yayınlamadan önce e-posta adresini doğrulamalısın.");
  const payload={user_id:user.id,category:categoryKey(input.category),brand:String(input.brand||"").trim(),model:String(input.model||"").trim(),storage:String(input.storage||"").trim()||null,color:String(input.color||"").trim()||null,city:String(input.city||"").trim()||null,district:String(input.district||"").trim()||null,description:String(input.description||"").trim()||null,seller_price:Number(input.salePrice||0)||null,market_value:Number(input.marketValue||0)||null,details:Array.isArray(input.details)?input.details:[],seller_name:String(user.user_metadata&&(user.user_metadata.full_name||user.user_metadata.name)||"").trim()||null,contact_phone:String(input.contactPhone||"").trim()||null,status:"draft",published_at:null};
  if(!CATEGORY_LABELS[payload.category])throw new Error("Geçersiz ilan kategorisi.");
  if(!payload.brand||!payload.model)throw new Error("Marka ve model bilgisi eksik.");
  if(!payload.seller_price||payload.seller_price<=0)throw new Error("Geçerli bir satış fiyatı gir.");
  if(!payload.market_value||payload.market_value<=0)throw new Error("Önce cihazının piyasa değerini hesapla.");
  if(!payload.city||!payload.district)throw new Error("Şehir ve ilçe bilgilerini gir.");
  if(!payload.contact_phone)throw new Error("İletişim telefonunu gir.");

  const {data:listing,error:listingError}=await client.from("listings").insert(payload).select("*").single();if(listingError)throw listingError;
  const uploaded=[],photoRows=[],photos=Array.isArray(input.photos)?input.photos.slice(0,5):[];
  try{
    for(let i=0;i<photos.length;i++){
      const file=dataUrlToFile(photos[i],i);if(file.size>6291456)throw new Error("Bir fotoğraf 6 MB sınırını aşıyor.");
      const ext=file.name.split(".").pop()||"jpg",path=`${user.id}/${listing.id}/${Date.now()}-${i}.${ext}`;
      const {error}=await client.storage.from(BUCKET).upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type});if(error)throw error;
      uploaded.push(path);photoRows.push({listing_id:listing.id,user_id:user.id,object_path:path,sort_order:i,alt_text:[payload.brand,payload.model,payload.color].filter(Boolean).join(" ")});
    }
    if(photoRows.length){const {error}=await client.from("listing_photos").insert(photoRows);if(error)throw error;}
    const {data:published,error}=await client.from("listings").update({status:"published",published_at:new Date().toISOString()}).eq("id",listing.id).eq("user_id",user.id).select("*").single();if(error)throw error;return published;
  }catch(error){
    if(uploaded.length){try{await client.storage.from(BUCKET).remove(uploaded);}catch(_e){}}
    try{await client.from("listings").delete().eq("id",listing.id).eq("user_id",user.id);}catch(_e){}
    throw error;
  }
}
function publicPhotoUrl(client,path){if(!path)return"";const {data}=client.storage.from(BUCKET).getPublicUrl(path);return data&&data.publicUrl?data.publicUrl:"";}
function normalizeListing(client,row){
  const photoRows=Array.isArray(row.listing_photos)?row.listing_photos.slice().sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0)):[];
  return {id:row.id,category:categoryLabel(row.category),categoryKey:categoryKey(row.category),brand:row.brand,model:row.model,storage:row.storage,color:row.color,city:row.city,district:row.district,description:row.description,salePrice:Number(row.seller_price||0),marketValue:Number(row.market_value||0),estimatedPrice:Number(row.market_value||0),details:Array.isArray(row.details)?row.details:[],sellerName:row.seller_name||"Bireysel satıcı",contactPhone:row.contact_phone||"",status:row.status,createdAt:row.created_at,publishedAt:row.published_at,photos:photoRows.map(p=>publicPhotoUrl(client,p.object_path)).filter(Boolean)};
}
async function listPublished(){const client=await init();const {data,error}=await client.from("listings").select("*, listing_photos(object_path,sort_order)").eq("status","published").order("published_at",{ascending:false});if(error)throw error;return(data||[]).map(row=>normalizeListing(client,row));}
async function getListing(id){if(!/^[0-9a-f-]{36}$/i.test(String(id||"")))return null;const client=await init();const {data,error}=await client.from("listings").select("*, listing_photos(object_path,sort_order)").eq("id",id).eq("status","published").maybeSingle();if(error)throw error;return data?normalizeListing(client,data):null;}

async function isAdmin(){const client=await init();const {data,error}=await client.rpc("is_admin");if(error)throw error;return data===true;}
async function adminListListings(){const client=await init();const {data,error}=await client.from("listings").select("*").order("created_at",{ascending:false});if(error)throw error;return data||[];}
async function adminListListingPhotos(listingIds){const client=await init();const ids=(Array.isArray(listingIds)?listingIds:[]).filter(Boolean);if(!ids.length)return[];const {data,error}=await client.from("listing_photos").select("listing_id,object_path,sort_order").in("listing_id",ids).order("sort_order");if(error)throw error;return data||[];}
async function adminListUsers(){const client=await init();const {data,error}=await client.rpc("admin_list_users");if(error)throw error;return data||[];}
async function adminListAuditLogs(){const client=await init();const {data,error}=await client.rpc("admin_list_audit_logs");if(error)throw error;return data||[];}
async function adminSetListingStatus(id,status){const client=await init();const {data,error}=await client.rpc("admin_set_listing_status",{p_listing_id:id,p_status:status});if(error)throw error;return data;}
async function adminDeleteListing(id){const client=await init();const {data,error}=await client.rpc("admin_delete_listing",{p_listing_id:id});if(error)throw error;return data;}
async function adminRemovePhotos(paths){const client=await init();const clean=(Array.isArray(paths)?paths:[]).filter(Boolean);if(!clean.length)return {data:[],error:null};return client.storage.from(BUCKET).remove(clean);}

const ready=init().then(client=>{installAuthLifecycle(client).catch(error=>console.warn("KaçaGider auth:",error));return client;});
window.KGMarketplaceSupabase={ready,init,getUser,getSessionUser,isVerifiedUser,signUp,signIn,signInWithGoogle,resendVerification,resetPassword,updatePassword,signOut,publishListing,listPublished,getListing,isAdmin,adminListListings,adminListListingPhotos,adminListUsers,adminListAuditLogs,adminSetListingStatus,adminDeleteListing,adminRemovePhotos,categoryKey,categoryLabel,authErrorMessage,config:{url:SUPABASE_URL,redirectUrl:authRedirectUrl()}};
})();