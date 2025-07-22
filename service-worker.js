// service-worker.js - Service Worker para YA ME VI PWA
const CACHE_NAME = 'ya-me-vi-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/home.html',
  '/analisis.html',
  '/combinacion.html',
  '/sugeridas.html',
  '/css/styles.css',
  '/js/shared.js',
  '/js/dataParser.js',
  '/js/mlPredictor.js',
  '/js/firebase-init.js',
  '/assets/logo-192.png',
  '/assets/logo-512.png',
  '/assets/Melate.csv',
  '/assets/Revancha.csv',
  '/assets/Revanchita.csv',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Cacheando archivos principales');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Eliminando caché obsoleto:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercepción de peticiones (Cache First Strategy)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devolver desde caché si existe
        if (response) {
          return response;
        }
        
        // Clonar la petición porque es un stream que solo se puede usar una vez
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Verificar si recibimos una respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar la respuesta porque es un stream que solo se puede usar una vez
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Mostrar página offline básica para navegación
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Manejo de mensajes desde la aplicación
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ Service Worker: Actualizando inmediatamente...');
    self.skipWaiting();
  }
});

// Notificaciones push (para futuras implementaciones)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/assets/logo-192.png',
      badge: '/assets/favicon-32.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
