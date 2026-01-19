/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// src/service-worker.js - Service Worker for offline caching

const CACHE_NAME = 'mfai-journey-simulator-v1';
const DEBUG = false;
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/images/logo_mfai.png',
  // Add more URLs as needed
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        if (DEBUG) console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  // For API requests, use network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Check if response is valid
          if (!response || response.status !== 200 || response.type !== 'basic') {
            // If invalid, try cache fallback
            return caches.match(event.request).then(cachedResponse => cachedResponse || response);
          }

          // Clone response to cache it
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        })
        .catch(() => {
          // Try to retrieve from cache
          return caches.match(event.request);
        })
    );
  } else {
    // For other requests, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached response if found
          if (response) {
            return response;
          }

          // Otherwise, make network request
          return fetch(event.request);
        })
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            if (DEBUG) console.log('Deleting cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
