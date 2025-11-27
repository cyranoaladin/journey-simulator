// Service Worker désactivé pour les tests
// Ce SW se désinstalle automatiquement

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      return self.registration.unregister();
    })
  );
});

// Ne rien intercepter
self.addEventListener('fetch', (event) => {
  // Laisser passer toutes les requêtes sans intervention
  return;
});