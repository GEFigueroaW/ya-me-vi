// firebase-messaging-sw.js - Service Worker para Firebase Cloud Messaging
// YA ME VI - Sistema de Notificaciones Push

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Configuración de Firebase (corregida para coincidir con firebase-config.js)
const firebaseConfig = {
  apiKey: "AIzaSyBak3-l2c4nqltw-BPE04GYAaxS2gJo2Xo",
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.appspot.com",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:web:ju4cf2i0ggjomna6fa8r4pqogl3q7l.apps.googleusercontent.com",
  measurementId: "G-D7R797S5BC"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar Firebase Messaging
const messaging = firebase.messaging();

// Manejo de mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 YA ME VI - Mensaje recibido en segundo plano:', payload);

  const notificationTitle = payload.notification?.title || 'YA ME VI - Nueva Notificación';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes nuevas actualizaciones disponibles',
    icon: '/assets/logo-192.png',
    badge: '/assets/logo-192.png',
    image: payload.notification?.image || '/assets/logo-512.png',
    tag: 'ya-me-vi-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'open-app',
        title: '✅ Ver Ahora',
        icon: '/assets/logo-192.png'
      },
      {
        action: 'dismiss',
        title: '❌ Cerrar',
        icon: '/assets/logo-192.png'
      }
    ],
    data: {
      url: payload.data?.url || '/home.html',
      timestamp: Date.now(),
      source: 'ya-me-vi'
    }
  };

  // Mostrar la notificación
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejo de clics en las notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('👆 YA ME VI - Clic en notificación:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Obtener la URL desde los datos de la notificación
  const urlToOpen = event.notification.data?.url || '/home.html';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  // Abrir o enfocar la ventana de la app
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then((clientList) => {
      // Buscar si ya hay una ventana abierta con YA ME VI
      for (const client of clientList) {
        if (client.url.includes('yamevi.com.mx') && 'focus' in client) {
          client.focus();
          client.navigate(fullUrl);
          return;
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// Manejo de cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('❌ YA ME VI - Notificación cerrada:', event.notification.tag);
  
  // Opcional: enviar analítica de que la notificación fue cerrada
  // Aquí podrías registrar en Firebase Analytics si lo deseas
});

console.log('🚀 YA ME VI - Firebase Messaging Service Worker cargado correctamente');
