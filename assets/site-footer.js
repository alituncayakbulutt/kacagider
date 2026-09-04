(function(){
  'use strict';
  var FAVORITES_KEY='kg_marketplace_favorites_v1';

  // Legacy footer rendering is intentionally disabled.
  // This file remains responsible only for marketplace favorite sync.
  function removeLegacyFooter(){
    var footer=document.getElementById('kgGlobalFooter');
    if(footer) footer.remove();
    var style=document.getElementById('kgGlobalFooterStyle');
    if(style) style.remove();
  }

  function localFavorites(){
    try{
      var v=JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]');
      return Array.isArray(v)?v:[];
    }catch(_e){
      return [];
    }
  }

  function writeFavorites(v){
    try{
      localStorage.setItem(FAVORITES_KEY,JSON.stringify(Array.from(new Set(v.filter(Boolean)))));
    }catch(_e){}
  }

  function paintFavorites(){
    var favs=new Set(localFavorites());
    document.querySelectorAll('[data-fav]').forEach(function(b){
      var active=favs.has(b.dataset.fav);
      b.classList.toggle('active',active);
      b.textContent=active?'♥':'♡';
    });
  }

  async function favoriteContext(){
    var api=window.KGMarketplaceSupabase;
    if(!api) return null;
    try{
      await api.ready;
      var user=await api.getUser();
      if(!user) return null;
      var client=await api.init();
      return {api:api,user:user,client:client};
    }catch(_e){
      return null;
    }
  }

  async function syncAllFavorites(){
    var ctx=await favoriteContext();
    if(!ctx) return;
    var cloud=await ctx.client.from('user_favorites').select('listing_id').eq('user_id',ctx.user.id);
    if(cloud.error) return;
    var cloudIds=(cloud.data||[]).map(function(x){return x.listing_id;}).filter(Boolean);
    var local=localFavorites();
    var cloudSet=new Set(cloudIds);
    var missing=local.filter(function(id){return !cloudSet.has(id);});
    if(missing.length){
      await ctx.client.from('user_favorites').upsert(
        missing.map(function(id){return {user_id:ctx.user.id,listing_id:id};}),
        {onConflict:'user_id,listing_id'}
      );
    }
    writeFavorites(cloudIds.concat(local));
    paintFavorites();
    setTimeout(paintFavorites,700);
    setTimeout(paintFavorites,1600);
  }

  async function syncOneFavorite(id){
    var ctx=await favoriteContext();
    if(!ctx||!id) return;
    var active=localFavorites().includes(id);
    if(active){
      await ctx.client.from('user_favorites').upsert(
        {user_id:ctx.user.id,listing_id:id},
        {onConflict:'user_id,listing_id'}
      );
    }else{
      await ctx.client.from('user_favorites').delete().eq('user_id',ctx.user.id).eq('listing_id',id);
    }
  }

  function bindFavoriteCloudSync(){
    if(document.documentElement.dataset.kgFavoriteCloud==='1') return;
    document.documentElement.dataset.kgFavoriteCloud='1';
    document.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('[data-fav]');
      if(!b) return;
      var id=b.dataset.fav;
      setTimeout(function(){syncOneFavorite(id);},0);
    });
    setTimeout(syncAllFavorites,250);
    setTimeout(syncAllFavorites,1100);
  }

  function boot(){
    removeLegacyFooter();
    bindFavoriteCloudSync();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();