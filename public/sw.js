// Investignito Service Worker: Emergency Purge & Pass-Through
// Unregisters and cleans all stale caches to prevent white screen lockouts

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Pass through all fetch events directly to network without caching
// Do NOT call event.respondWith - let browser handle network requests directly
