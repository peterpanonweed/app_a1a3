const CACHE_NAME = 'drohnenschein-v1';
const ASSETS = [
  '/app_a1a3/',
  '/app_a1a3/index.html',
  '/app_a1a3/modul-1.html',
  '/app_a1a3/modul-2.html',
  '/app_a1a3/modul-3.html',
  '/app_a1a3/modul-4.html',
  '/app_a1a3/exam.html',
  '/app_a1a3/manifest.json',
  '/app_a1a3/icon-192.png',
  '/app_a1a3/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap'
];

// Install — cache alle wichtigen Dateien
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — alten Cache löschen
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — Cache first, dann Netzwerk
self.addEventListener('fetch', (e) => {
  // Nur GET-Requests cachen
  if(e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if(cached) return cached;
      return fetch(e.request).then((response) => {
        // Nur valide Responses cachen
        if(!response || response.status !== 200 || response.type === 'opaque'){
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => {
        // Offline-Fallback
        if(e.request.destination === 'document'){
          return caches.match('/app_a1a3/index.html');
        }
      });
    })
  );
});
