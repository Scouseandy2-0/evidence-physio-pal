const CACHE_NAME = 'physio-evidence-v1';
const urlsToCache = [
  '/',
  '/conditions',
  '/protocols',
  '/assessments',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];
// Import { Capacitor } from '@capacitor/core'

const isNative = Capacitor?.isNativePlatform?.() ?? false

if (!isNative && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(r => console.log('SW registered:', r))
      .catch(err => console.log('SW registration failed:', err))
  })
}


// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});