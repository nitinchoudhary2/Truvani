// sw.js - Advanced Service Worker with AI Caching 🚀
const CACHE_NAME = 'truvani-ai-v3.0';
const DYNAMIC_CACHE = 'truvani-dynamic-v3.0';

// Critical files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activated');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Network First, then Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Firebase API calls
  if (url.origin.includes('firebase') || url.origin.includes('googleapis')) {
    return;
  }
  
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response for caching
        const responseClone = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Return offline fallback
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background Sync - For offline posts
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background Sync');
  
  if (event.tag === 'sync-articles') {
    event.waitUntil(syncArticles());
  }
});

async function syncArticles() {
  console.log('📡 Syncing pending articles...');
  // Add your sync logic here
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Truvani News';
  const options = {
    body: data.body || 'New article published!',
    icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/3208/3208799.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3208/3208799.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'news-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Article',
        icon: 'https://cdn-icons-png.flaticon.com/512/3208/3208799.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'https://cdn-icons-png.flaticon.com/512/3208/3208799.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message from client
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Message received', event.data);
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => caches.delete(cache))
        );
      })
    );
  }
});

console.log('✅ Service Worker: Loaded successfully');
