const CACHE_NAME = 'vinyl-shell-v2';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {}),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.destination === 'audio' || request.destination === 'media') {
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/manifest.json' || url.pathname === '/favicon.svg') {
      event.respondWith(
        caches.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        }),
      );
      return;
    }

    if (url.pathname.startsWith('/assets/')) {
      event.respondWith(
        caches.match(request).then((cached) => {
          return cached || fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
            }
            return response;
          });
        }),
      );
    }
  }
});
