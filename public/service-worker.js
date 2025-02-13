/* eslint-disable no-restricted-globals */

// Cache name for the app shell
const CACHE_NAME = 'debattle-cache-v1';

// URLs to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', (event) => {
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

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.message,
    icon: '/logo192.png',
    badge: '/favicon.ico',
    tag: data.id,
    data: data,
    actions: [
      {
        action: 'view',
        title: 'View',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
    vibrate: [200, 100, 200],
    requireInteraction: data.priority === 'urgent',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event - handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    const data = event.notification.data;
    let url = '/';

    // Determine URL based on notification type
    switch (data.type) {
      case 'debate_reply':
      case 'debate_featured':
      case 'debate_ended':
        url = `/debates/${data.debateId}`;
        break;
      case 'badge_earned':
        url = `/profile/badges`;
        break;
      case 'comment_reply':
        url = `/debates/${data.debateId}#comment-${data.commentId}`;
        break;
      case 'moderation_action':
        url = `/moderation`;
        break;
      default:
        url = '/notifications';
    }

    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // If a window is already open, focus it
          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

// Sync event - handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Sync logic here
      Promise.resolve()
    );
  }
}); 