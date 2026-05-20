// Service Worker for VoiceLink
// يساعد في الحفاظ على الاتصال في الخلفية

const CACHE_NAME = 'voicelink-v1';

// Install
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Keep alive for background operation
self.addEventListener('message', (event) => {
  if (event.data === 'keepAlive') {
    // Acknowledge keepalive
    event.ports[0].postMessage('alive');
  }
});

// Handle push notifications (for future FCM integration)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'لديك مكالمة واردة',
      icon: '/icon.png',
      badge: '/badge.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'voicelink-call',
      requireInteraction: true,
      actions: [
        { action: 'answer', title: '📞 رد' },
        { action: 'reject', title: '❌ رفض' }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'VoiceLink', options)
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'answer' || event.action === 'reject') {
    // Handle call actions
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            client.postMessage({ type: event.action });
            return;
          }
        }
        // If no window is open, open one
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  } else {
    // Just open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow('/');
      })
    );
  }
});
