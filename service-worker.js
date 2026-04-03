const CACHE = 'vgc-assets-v3';
const BASE = '/vgc-asset-tracker';
const FILES = [
  BASE + '/', BASE + '/index.html', BASE + '/admin.html',
  BASE + '/field.html', BASE + '/manifest.json',
  BASE + '/icon-192.png', BASE + '/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
];

// These URLs are NEVER cached — always fetched fresh
const NEVER_CACHE = [
  'raw.githubusercontent.com',
  'assets.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(FILES.map(f => c.add(f).catch(()=>{})))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Never cache assets.json or GitHub raw content — always fetch fresh
  if (NEVER_CACHE.some(pattern => url.includes(pattern))) {
    e.respondWith(
      fetch(e.request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } }))
    );
    return;
  }

  // For everything else: cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(r => {
        if (r?.status === 200) {
          const cl = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, cl));
        }
        return r;
      }).catch(() => cached);
    })
  );
});
