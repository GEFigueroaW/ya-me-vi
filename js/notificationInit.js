// notificationInit.js - Inicialización de Notificaciones para YA ME VI
// Se carga en todas las páginas principales para configurar el sistema de notificaciones

import { notificationManager } from './notificationManager.js';
import { auth } from './firebase-init.js';

// Configuración de notificaciones por página
const PAGE_NOTIFICATIONS = {
  'home.html': {
    welcomeMessage: {
      title: '🎉 ¡Bienvenido a YA ME VI!',
      body: 'Descubre las mejores predicciones para lotería mexicana',
      type: 'success'
    }
  },
  'analisis.html': {
    analysisReady: {
      title: '📊 Análisis Estadístico Listo',
      body: 'Los datos históricos más recientes han sido procesados',
      type: 'analysis'
    }
  },
  'combinacion.html': {
    evaluationReady: {
      title: '🔍 Sistema de Evaluación Activo',
      body: 'Evalúa tus combinaciones con IA avanzada',
      type: 'info'
    }
  },
  'sugeridas.html': {
    predictionsReady: {
      title: '🎯 Predicciones Personalizadas',
      body: 'Nuevas combinaciones inteligentes disponibles',
      type: 'prediction'
    }
  }
};

class PageNotificationHandler {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.hasShownWelcome = false;
    
    console.log(`🔔 Notification Handler inicializado para: ${this.currentPage}`);
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
  }

  // 🎯 MOSTRAR NOTIFICACIÓN DE BIENVENIDA DE PÁGINA
  showPageWelcome() {
    const pageConfig = PAGE_NOTIFICATIONS[this.currentPage];
    if (pageConfig && !this.hasShownWelcome) {
      setTimeout(() => {
        const welcomeKey = Object.keys(pageConfig)[0];
        const welcomeNotification = pageConfig[welcomeKey];
        
        notificationManager.showInAppNotification({
          ...welcomeNotification,
          duration: 4000
        });
        
        this.hasShownWelcome = true;
      }, 1500); // Esperar 1.5 segundos para que la página cargue
    }
  }

  // 📱 CONFIGURAR BOTÓN DE PERMISOS DE NOTIFICACIÓN
  setupNotificationPermissionButton() {
    // Crear botón flotante para solicitar permisos
    if (notificationManager.permission !== 'granted' && notificationManager.isSupported) {
      const permissionButton = document.createElement('div');
      permissionButton.id = 'notification-permission-btn';
      permissionButton.className = `
        fixed bottom-4 left-4 z-40 bg-gradient-to-r from-blue-500 to-purple-600 
        text-white p-3 rounded-full shadow-lg cursor-pointer transform transition-all 
        duration-300 hover:scale-110 animate__animated animate__bounceIn
      `;
      permissionButton.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="text-xl">🔔</div>
          <div class="text-sm font-medium hidden md:block">Activar Notificaciones</div>
        </div>
      `;

      permissionButton.addEventListener('click', async () => {
        const granted = await notificationManager.requestPermission();
        if (granted) {
          notificationManager.showInAppNotification({
            title: '✅ Notificaciones Activadas',
            body: 'Ahora recibirás alertas sobre nuevas predicciones y análisis',
            type: 'success'
          });
          permissionButton.remove();
        } else {
          notificationManager.showInAppNotification({
            title: '❌ Permisos Denegados',
            body: 'Puedes activar las notificaciones desde la configuración de tu navegador',
            type: 'warning',
            duration: 6000
          });
        }
      });

      document.body.appendChild(permissionButton);

      // Auto-ocultar después de 10 segundos si no se interactúa
      setTimeout(() => {
        if (document.getElementById('notification-permission-btn')) {
          permissionButton.classList.add('animate__slideOutLeft');
          setTimeout(() => permissionButton.remove(), 300);
        }
      }, 10000);
    }
  }

  // 🎲 NOTIFICACIONES ESPECÍFICAS POR ACCIÓN
  showActionNotification(action, data = {}) {
    const actionNotifications = {
      'analysis-started': {
        title: '⏳ Analizando Datos...',
        body: 'Procesando información histórica para generar estadísticas',
        type: 'info',
        duration: 3000
      },
      'analysis-completed': {
        title: '✅ Análisis Completado',
        body: `Se han procesado ${data.totalRecords || 0} registros históricos`,
        type: 'success'
      },
      'combination-evaluated': {
        title: '🔍 Combinación Evaluada',
        body: `Tu combinación tiene ${data.percentage || 0}% de efectividad`,
        type: 'analysis'
      },
      'predictions-generated': {
        title: '🎯 Predicciones Generadas',
        body: `${data.count || 0} nuevas combinaciones inteligentes disponibles`,
        type: 'prediction'
      },
      'data-updated': {
        title: '🔄 Datos Actualizados',
        body: 'La información más reciente ha sido cargada',
        type: 'success'
      },
      'error-occurred': {
        title: '⚠️ Error Detectado',
        body: data.message || 'Ha ocurrido un problema. Intenta nuevamente.',
        type: 'error'
      }
    };

    const notification = actionNotifications[action];
    if (notification) {
      notificationManager.showInAppNotification({
        ...notification,
        data: { url: data.url }
      });
    }
  }

  // 🔔 CONFIGURAR ESCUCHA DE EVENTOS PERSONALIZADOS
  setupCustomEventListeners() {
    // Escuchar eventos personalizados de la aplicación
    document.addEventListener('yamievi:analysisStarted', (e) => {
      this.showActionNotification('analysis-started', e.detail);
    });

    document.addEventListener('yamievi:analysisCompleted', (e) => {
      this.showActionNotification('analysis-completed', e.detail);
    });

    document.addEventListener('yamievi:combinationEvaluated', (e) => {
      this.showActionNotification('combination-evaluated', e.detail);
    });

    document.addEventListener('yamievi:predictionsGenerated', (e) => {
      this.showActionNotification('predictions-generated', e.detail);
    });

    document.addEventListener('yamievi:dataUpdated', (e) => {
      this.showActionNotification('data-updated', e.detail);
    });

    document.addEventListener('yamievi:errorOccurred', (e) => {
      this.showActionNotification('error-occurred', e.detail);
    });

    console.log('👂 Event listeners configurados para notificaciones personalizadas');
  }

  // 🚀 INICIALIZAR TODO EL SISTEMA
  async initialize() {
    console.log('🚀 Inicializando sistema de notificaciones de página...');

    // Esperar a que el usuario esté autenticado
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          console.log('👤 Usuario autenticado, configurando notificaciones...');

          // Inicializar el notification manager
          await notificationManager.initialize();

          // Configurar elementos específicos de la página
          this.setupCustomEventListeners();
          this.setupNotificationPermissionButton();
          this.showPageWelcome();

          console.log('✅ Sistema de notificaciones de página listo');
          unsubscribe();
          resolve(true);
        }
      });
    });
  }
}

// Crear instancia global
export const pageNotificationHandler = new PageNotificationHandler();

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  pageNotificationHandler.initialize();
});

// Exportar funciones útiles para usar en otros módulos
export const showNotification = (type, data) => {
  pageNotificationHandler.showActionNotification(type, data);
};

export const requestNotificationPermission = async () => {
  return await notificationManager.requestPermission();
};

// Funciones para disparar eventos personalizados (útil para otros módulos)
export const notifyAnalysisStarted = (data = {}) => {
  document.dispatchEvent(new CustomEvent('yamievi:analysisStarted', { detail: data }));
};

export const notifyAnalysisCompleted = (data = {}) => {
  document.dispatchEvent(new CustomEvent('yamievi:analysisCompleted', { detail: data }));
};

export const notifyCombinationEvaluated = (data = {}) => {
  document.dispatchEvent(new CustomEvent('yamievi:combinationEvaluated', { detail: data }));
};

export const notifyPredictionsGenerated = (data = {}) => {
  document.dispatchEvent(new CustomEvent('yamievi:predictionsGenerated', { detail: data }));
};

export const notifyDataUpdated = (data = {}) => {
  document.dispatchEvent(new CustomEvent('yamievi:dataUpdated', { detail: data }));
};

export const notifyError = (data = {}) => {
  document.dispatchEvent(new CustomEvent('yamievi:errorOccurred', { detail: data }));
};

console.log('🔔 YA ME VI - Sistema de notificaciones de página cargado');
