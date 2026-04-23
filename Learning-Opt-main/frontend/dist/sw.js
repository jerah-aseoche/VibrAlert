const CACHE_NAME = 'vibralert-v2';
const STATIC_CACHE = 'vibralert-static-v2';
const API_CACHE = 'vibralert-api-v2';

// Files to cache on install
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/banner.png',
  '/login-bg.jpg'
];

// Install - cache static files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== STATIC_CACHE && key !== API_CACHE)
        .map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Fetch - offline-first strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // API requests - cache then network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then(cache => 
        fetch(event.request).then(response => {
          cache.put(event.request, response.clone());
          return response;
        }).catch(() => cache.match(event.request))
      )
    );
    return;
  }
  
  // Static assets - cache first
  event.respondWith(
    caches.match(event.request).then(response => 
      response || fetch(event.request).then(res => {
        caches.open(STATIC_CACHE).then(cache => cache.put(event.request, res.clone()));
        return res;
      })
    )
  );
});

// Push notification handler
self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'VibrAlert', body: 'Alarm triggered!' };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});