from pathlib import Path

changed=[]
def save(path,text,old):
    if text!=old:
        path.write_text(text,encoding='utf-8');changed.append(str(path))

# 1) analytics-events.js must never configure GA4 again. The document head owns config/page_view.
p=Path('assets/analytics-events.js');s=p.read_text(encoding='utf-8');old=s
s=s.replace('  var KG_GA_MEASUREMENT_ID="G-078JHH25LH";\n  if(typeof window.gtag==="function")window.gtag("config",KG_GA_MEASUREMENT_ID);\n\n','')
if 'window.gtag("config",KG_GA_MEASUREMENT_ID)' in s:
    raise SystemExit('duplicate GA config remains in analytics-events.js')
save(p,s,old)

# 2) Marketplace list favorites: use one normalized event name.
p=Path('assets/marketplace-v2-list.js');s=p.read_text(encoding='utf-8');old=s
needle="async function toggleFavorite(id){const adding=!state.favs.has(id);if(adding)state.favs.add(id);else state.favs.delete(id);saveLocal();render();if(!state.user)return;try{if(adding)await state.client.from('user_favorites').upsert({user_id:state.user.id,listing_id:id},{onConflict:'user_id,listing_id',ignoreDuplicates:true});else await state.client.from('user_favorites').delete().eq('user_id',state.user.id).eq('listing_id',id)}catch(_e){}}"
repl="async function toggleFavorite(id){const adding=!state.favs.has(id);if(adding)state.favs.add(id);else state.favs.delete(id);saveLocal();render();if(typeof window.gtag==='function')window.gtag('event',adding?'favorite_added':'favorite_removed',{listing_id:id,source:'marketplace_list',authenticated:!!state.user});if(!state.user)return;try{if(adding)await state.client.from('user_favorites').upsert({user_id:state.user.id,listing_id:id},{onConflict:'user_id,listing_id',ignoreDuplicates:true});else await state.client.from('user_favorites').delete().eq('user_id',state.user.id).eq('listing_id',id)}catch(_e){}}"
if needle in s:s=s.replace(needle,repl,1)
elif "source:'marketplace_list'" not in s:raise SystemExit('marketplace list favorite patch marker missing')
save(p,s,old)

# 3) Marketplace detail favorites: same normalized event names.
p=Path('assets/marketplace-v2-detail.js');s=p.read_text(encoding='utf-8');old=s
needle="async function toggleFavorite(){const id=state.listing.id,adding=!state.favs.has(id);if(adding)state.favs.add(id);else state.favs.delete(id);saveLocal();const b=document.getElementById('detailFav');if(b){b.classList.toggle('active',adding);b.textContent=adding?'♥ Favoride':'♡ Favoriye Ekle'}if(state.user){if(adding)await state.client.from('user_favorites').upsert({user_id:state.user.id,listing_id:id},{onConflict:'user_id,listing_id',ignoreDuplicates:true});else await state.client.from('user_favorites').delete().eq('user_id',state.user.id).eq('listing_id',id)}}"
repl="async function toggleFavorite(){const id=state.listing.id,adding=!state.favs.has(id);if(adding)state.favs.add(id);else state.favs.delete(id);saveLocal();const b=document.getElementById('detailFav');if(b){b.classList.toggle('active',adding);b.textContent=adding?'♥ Favoride':'♡ Favoriye Ekle'}if(typeof window.gtag==='function')window.gtag('event',adding?'favorite_added':'favorite_removed',{listing_id:id,source:'marketplace_detail',authenticated:!!state.user});if(state.user){if(adding)await state.client.from('user_favorites').upsert({user_id:state.user.id,listing_id:id},{onConflict:'user_id,listing_id',ignoreDuplicates:true});else await state.client.from('user_favorites').delete().eq('user_id',state.user.id).eq('listing_id',id)}}"
if needle in s:s=s.replace(needle,repl,1)
elif "source:'marketplace_detail'" not in s:raise SystemExit('marketplace detail favorite patch marker missing')
save(p,s,old)

# 4) Listing conversion fires only after the backend confirms publish success.
p=Path('assets/marketplace-test.js');s=p.read_text(encoding='utf-8');old=s
needle='var published=await api.publishListing(d);location.href="/ilan/?id="+encodeURIComponent(published.id);'
repl='var published=await api.publishListing(d);if(typeof window.gtag==="function")window.gtag("event","listing_published",{listing_id:published.id,category:d.category,brand:d.brand,model:d.model,storage:d.storage,seller_price:d.salePrice,market_value:d.marketValue,currency:"TRY"});location.href="/ilan/?id="+encodeURIComponent(published.id);'
if needle in s:s=s.replace(needle,repl,1)
elif '"listing_published"' not in s:raise SystemExit('marketplace publish patch marker missing')
save(p,s,old)

# Cache bust the shared analytics event script on main and SEO layout.
for name in ['index.html','_layouts/seo.html']:
    p=Path(name);s=p.read_text(encoding='utf-8');old=s
    s=s.replace('/assets/analytics-events.js?v=20260901-live3','/assets/analytics-events.js?v=20260904-ga1')
    s=s.replace('/assets/analytics-events.js" defer','/assets/analytics-events.js?v=20260904-ga1" defer')
    save(p,s,old)

print('ANALYTICS CLEANUP:',len(changed),'file(s) updated')
for x in changed:print(' -',x)
