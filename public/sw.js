const CACHE_NAME = 'hearquran-v2';
const API_CACHE_NAME = 'hearquran-api-v1';

const urlsToCache = [
    '/',
    '/index.html',
    '/index.css',
    '/manifest.json',
    '/icon.svg'
];

// Pre-cache static assets on install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // Do NOT intercept audio URLs
    if (url.includes('/audio/') || url.endsWith('.mp3')) {
        return;
    }

    // Network-first strategy for API text requests
    if (url.includes('api.alquran.cloud/v1/surah') || url.includes('api.alquran.cloud/v1/edition')) {
        event.respondWith(
            caches.open(API_CACHE_NAME).then((cache) => {
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Network succeeded – cache the fresh response and return it
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed – fall back to cached response
                        return cache.match(event.request);
                    });
            })
        );
        return;
    }

    // Cache-first strategy for all other (static) requests
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Clean up old caches on activate
self.addEventListener('activate', (event) => {
    const currentCaches = [CACHE_NAME, API_CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!currentCaches.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
