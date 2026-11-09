// Investignito Service Worker
const CACHE_NAME = 'investignito-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-first fetch handler required by Chrome on Android for PWA installability
self.addEventListener('fetch', (event) => {
  // Pass non-GET requests directly
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
