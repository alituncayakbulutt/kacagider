/* KaçaGider PWA: network-first for updated assets; offline cache is fallback only. */
const CACHE='kg-pwa-v3';
const STATIC=['/','/favicon.svg','/manifest.webmanifest'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('kg-pwa-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode!=='navigate'&&!/\.(?:js|css|svg|png|jpg|jpeg|webp|woff2?)$/i.test(url.pathname))return;
  event.respondWith(
    fetch(request).then(response=>{
      if(response.ok){
        const copy=response.clone();
        event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{}));
      }
      return response;
    }).catch(async()=>{
      const cache=await caches.open(CACHE);
      return (await cache.match(request))||(request.mode==='navigate'?await cache.match('/'):Response.error());
    })
  );
});
