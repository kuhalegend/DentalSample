const CACHE='dental-os-v9';
const ASSETS=['/','/index.html','/styles.css','/app.js','/extra.js','/riley.css','/riley.js','/vapi-bootstrap.js','/vendor/vapi-web.local.mjs','/assets/mark.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  if(event.request.url.includes('/.netlify/functions/'))return;
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});
