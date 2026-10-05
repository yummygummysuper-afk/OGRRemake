// Versioned, self-contained offline bundle. Bump CACHE for each release.
const CACHE='og-rooms-standalone-github-44436ee280686d97';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const assetPaths=new Set(ASSETS.map(path=>new URL(path,self.location.href).pathname));
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('og-rooms-standalone-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode!=='navigate'&&!assetPaths.has(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  // A complete cached game must not be replaced by a Cloudflare 530/502 page.
  const cached=request.mode==='navigate'?await cache.match('./index.html'):await cache.match(request,{ignoreSearch:true});
  if(cached)return cached;
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),6000);
  try{
   const response=await fetch(request,{signal:controller.signal});
   if(response.ok){await cache.put(request,response.clone());return response;}
   const fallback=await cache.match(request,{ignoreSearch:true});if(fallback)return fallback;
   return response;
  }catch(error){
   const fallback=await cache.match(request,{ignoreSearch:true});if(fallback)return fallback;
   if(request.mode==='navigate')return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="background:#101410;color:#d5e4b6;font:18px system-ui;padding:35px"><h1>OG ROOMS</h1><p>Игра ещё не сохранена на этом устройстве. Для первой загрузки нужен доступный сервер. / The game has not been saved on this device yet. Connect to a working server for the first load.</p><button onclick="location.reload()">Повторить / Retry</button>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
   return Response.error();
  }finally{clearTimeout(timeout);}
 })());
});
