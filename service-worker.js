const CACHE = 'vgc-assets-v2';
const BASE = '/vgc-asset-tracker';
const FILES = [
  BASE + '/', BASE + '/index.html', BASE + '/admin.html',
  BASE + '/field.html', BASE + '/manifest.json',
  BASE + '/icon-192.png', BASE + '/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(FILES.map(f => c.add(f).catch(()=>{})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.url.includes('raw.githubusercontent.com')) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
    if (r?.status===200){const cl=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}
    return r;
  }).catch(()=>cached)));
});
