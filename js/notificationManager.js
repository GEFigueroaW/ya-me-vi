// notificationManager.js - Sistema de Gestión de Notificaciones YA ME VI
// Maneja Push, In-App y Email notifications

import { auth, db, messaging, getToken, onMessage, VAPID_KEY } from './firebase-init.js';
import { doc, setDoc, getDoc, collection, getDocs, addDoc, query, where, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

class NotificationManager {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.fcmToken = null;
    this.userId = null;
    
    console.log('🔔 YA ME VI - Notification Manager inicializado');
    console.log(`📱 Soporte de notificaciones: ${this.isSupported ? '✅' : '❌'}`);
    console.log(`🔐 Permiso actual: ${this.permission}`);
  }

  // 🔐 SOLICITAR PERMISOS PARA NOTIFICACIONES PUSH
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('❌ Notificaciones no soportadas en este navegador');
      return false;
    }

    try {
      // Solicitar permiso al usuario
      this.permission = await Notification.requestPermission();
      
      if (this.permission === 'granted') {
        console.log('✅ Permiso para notificaciones concedido');
        await this.registerServiceWorker();
        await this.getFCMToken();
        return true;
      } else {
        console.warn('❌ Permiso para notificaciones denegado');
        return false;
      }
    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      return false;
    }
  }

  // 🔧 REGISTRAR SERVICE WORKER
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('❌ Service Worker no soportado');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registrado:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
      return false;
    }
  }

  // 🔑 OBTENER TOKEN FCM
  async getFCMToken() {
    if (!messaging || !this.isSupported) {
      console.warn('❌ Firebase Messaging no disponible');
      return null;
    }

    try {
      this.fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });

      if (this.fcmToken) {
        console.log('🔑 Token FCM obtenido:', this.fcmToken.substring(0, 20) + '...');
        await this.saveTokenToFirestore();
        return this.fcmToken;
      } else {
        console.warn('❌ No se pudo obtener el token FCM');
        return null;
      }
    } catch (error) {
      console.error('❌ Error obteniendo token FCM:', error);
      return null;
    }
  }

  // 💾 GUARDAR TOKEN EN FIRESTORE
  async saveTokenToFirestore() {
    if (!this.fcmToken || !auth.currentUser) {
      console.warn('❌ No hay token o usuario para guardar');
      return;
    }

    try {
      this.userId = auth.currentUser.uid;
      const userTokenDoc = doc(db, 'userTokens', this.userId);
      
      await setDoc(userTokenDoc, {
        fcmToken: this.fcmToken,
        userId: this.userId,
        email: auth.currentUser.email,
        lastUpdated: serverTimestamp(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        },
        isActive: true
      }, { merge: true });

      console.log('✅ Token guardado en Firestore para usuario:', this.userId);
    } catch (error) {
      console.error('❌ Error guardando token:', error);
    }
  }

  // 📱 CONFIGURAR ESCUCHA DE MENSAJES EN PRIMER PLANO
  setupForegroundMessageListener() {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('🔔 Mensaje recibido en primer plano:', payload);
      
      // Mostrar notificación in-app
      this.showInAppNotification({
        title: payload.notification?.title || 'YA ME VI',
        body: payload.notification?.body || 'Nueva notificación',
        type: 'push',
        data: payload.data
      });
    });
  }

  // 📢 MOSTRAR NOTIFICACIÓN IN-APP
  showInAppNotification({ title, body, type = 'info', duration = 5000, data = {} }) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 right-4 z-50 max-w-sm bg-gradient-to-r from-green-500 to-blue-600 
      text-white p-4 rounded-lg shadow-lg transform transition-all duration-300 
      translate-x-full animate__animated animate__slideInRight
    `;
    
    const typeIcon = {
      'info': '💡',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'push': '🔔',
      'prediction': '🎯',
      'analysis': '📊'
    };

    notification.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="text-2xl">${typeIcon[type] || '🔔'}</div>
        <div class="flex-1">
          <h4 class="font-bold text-sm">${title}</h4>
          <p class="text-xs mt-1 opacity-90">${body}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;

    // Agregar al DOM
    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Auto-remover después del tiempo especificado
    if (duration > 0) {
      setTimeout(() => {
        notification.classList.add('animate__slideOutRight');
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, duration);
    }

    // Click handler si hay datos adicionales
    if (data.url) {
      notification.style.cursor = 'pointer';
      notification.addEventListener('click', () => {
        window.location.href = data.url;
      });
    }

    console.log('📢 Notificación in-app mostrada:', title);
  }

  // 📬 OBTENER NOTIFICACIONES IN-APP DESDE FIRESTORE
  async getInAppNotifications() {
    if (!auth.currentUser) return [];

    try {
      const notificationsQuery = query(
        collection(db, 'inAppNotifications'),
        where('targetUsers', 'array-contains', auth.currentUser.uid),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(notificationsQuery);
      const notifications = [];

      snapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`📬 ${notifications.length} notificaciones in-app obtenidas`);
      return notifications;
    } catch (error) {
      console.error('❌ Error obteniendo notificaciones:', error);
      return [];
    }
  }

  // 🎯 MOSTRAR NOTIFICACIONES ESPECÍFICAS DE ANÁLISIS
  showAnalysisNotification(analysisType, data) {
    const messages = {
      'new-predictions': {
        title: '🎯 Nuevas Predicciones Disponibles',
        body: `Se han generado nuevas predicciones para ${data.game || 'tu juego favorito'}`,
        type: 'prediction'
      },
      'analysis-complete': {
        title: '📊 Análisis Completado',
        body: `Tu análisis de la combinación ${data.combination || ''} está listo`,
        type: 'analysis'
      },
      'lucky-numbers': {
        title: '🍀 Números de la Suerte',
        body: `Tus números personalizados han sido actualizados`,
        type: 'success'
      },
      'frequency-alert': {
        title: '📈 Alerta de Frecuencia',
        body: `Los números ${data.numbers || ''} han mostrado alta frecuencia`,
        type: 'warning'
      }
    };

    const notification = messages[analysisType] || {
      title: '🔔 YA ME VI',
      body: 'Nueva notificación de análisis',
      type: 'info'
    };

    this.showInAppNotification({
      ...notification,
      data: { url: data.url || '/analisis.html' }
    });
  }

  // 🚀 INICIALIZAR SISTEMA COMPLETO
  async initialize() {
    console.log('🚀 Inicializando sistema de notificaciones...');
    
    // Configurar listener de mensajes en primer plano
    this.setupForegroundMessageListener();
    
    // Si el usuario ya está autenticado, obtener token
    if (auth.currentUser) {
      if (this.permission === 'granted') {
        await this.getFCMToken();
      }
    }

    // Cargar notificaciones in-app pendientes
    if (auth.currentUser) {
      const inAppNotifications = await this.getInAppNotifications();
      inAppNotifications.forEach(notification => {
        if (!notification.shown) {
          this.showInAppNotification({
            title: notification.title,
            body: notification.body,
            type: notification.type || 'info',
            data: notification.data || {}
          });
        }
      });
    }

    console.log('✅ Sistema de notificaciones inicializado');
  }
}

// Crear instancia global
export const notificationManager = new NotificationManager();

// Auto-inicializar cuando el usuario se autentica
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('👤 Usuario autenticado, inicializando notificaciones...');
    notificationManager.userId = user.uid;
    notificationManager.initialize();
  }
});

// Exportar para uso en otros módulos
export default NotificationManager;
