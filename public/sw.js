const CACHE_NAME = 'physio-evidence-v3';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Ensure new SW activates immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Network-first for navigations and core assets to avoid stale app shell
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isNavigation = req.mode === 'navigate';
  const isCoreAsset = ['script', 'style', 'worker'].includes(req.destination);
  const url = new URL(req.url);

  // Always bypass cache for auth callback to avoid stale app shell during login
  if (isNavigation && url.pathname.startsWith('/auth/callback')) {
    event.respondWith(fetch(req));
    return;
  }

  if (isNavigation || isCoreAsset) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return response;
        })
        .catch(() => caches.match(req).then((res) => res || caches.match('/')))
    );
    return;
  }

  // Cache-first for other GET requests
  if (req.method === 'GET') {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            try {
              const copy = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            } catch (_) {}
            return networkRes;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});