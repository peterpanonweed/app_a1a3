const CACHE_NAME = 'drohnenschein-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/modul-1.html',
  '/modul-2.html',
  '/modul-3.html',
  '/modul-4.html',
  '/exam.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
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
          return caches.match('/index.html');
        }
      });
    })
  );
});
