// adminNotifications.js - Sistema de Administración de Notificaciones
// Permite al admin enviar Push, In-App y Email notifications

import { auth, db } from './firebase-init.js';
import { collection, getDocs, addDoc, doc, setDoc, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

class AdminNotificationSystem {
  constructor() {
    this.isAdmin = false;
    this.userTokens = [];
    this.emailList = [];
    
    console.log('👑 Admin Notification System inicializado');
  }

  // 🔐 VERIFICAR SI EL USUARIO ES ADMIN
  async checkAdminStatus() {
    if (!auth.currentUser) return false;

    try {
      const adminEmails = [
        'gfigueroa.w@gmail.com',
        'admin@yamevi.com.mx'
      ];

      this.isAdmin = adminEmails.includes(auth.currentUser.email);
      console.log(`👑 Estado de admin: ${this.isAdmin ? '✅' : '❌'}`);
      
      return this.isAdmin;
    } catch (error) {
      console.error('❌ Error verificando admin:', error);
      return false;
    }
  }

  // 📱 OBTENER TODOS LOS TOKENS FCM DE USUARIOS
  async getAllUserTokens() {
    if (!this.isAdmin) {
      console.warn('❌ Solo los admins pueden obtener tokens de usuarios');
      return [];
    }

    try {
      const tokensSnapshot = await getDocs(collection(db, 'userTokens'));
      this.userTokens = [];

      tokensSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.isActive && data.fcmToken) {
          this.userTokens.push({
            userId: doc.id,
            fcmToken: data.fcmToken,
            email: data.email,
            lastUpdated: data.lastUpdated
          });
        }
      });

      console.log(`📱 ${this.userTokens.length} tokens de usuarios obtenidos`);
      return this.userTokens;
    } catch (error) {
      console.error('❌ Error obteniendo tokens:', error);
      return [];
    }
  }

  // 📧 OBTENER LISTA DE CORREOS DE USUARIOS
  async getAllUserEmails() {
    if (!this.isAdmin) {
      console.warn('❌ Solo los admins pueden obtener emails de usuarios');
      return [];
    }

    try {
      const tokensSnapshot = await getDocs(collection(db, 'userTokens'));
      this.emailList = [];

      tokensSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.email) {
          this.emailList.push({
            userId: doc.id,
            email: data.email,
            lastUpdated: data.lastUpdated
          });
        }
      });

      console.log(`📧 ${this.emailList.length} emails de usuarios obtenidos`);
      return this.emailList;
    } catch (error) {
      console.error('❌ Error obteniendo emails:', error);
      return [];
    }
  }

  // 🚀 ENVIAR NOTIFICACIÓN PUSH A TODOS
  async sendPushNotificationToAll(notificationData) {
    if (!this.isAdmin) {
      throw new Error('❌ Solo los admins pueden enviar notificaciones push');
    }

    try {
      // Obtener todos los tokens activos
      const tokens = await this.getAllUserTokens();
      
      if (tokens.length === 0) {
        throw new Error('❌ No hay tokens disponibles para enviar notificaciones');
      }

      // Preparar datos de la notificación
      const pushData = {
        notification: {
          title: notificationData.title || 'YA ME VI - Nueva Notificación',
          body: notificationData.body || 'Tienes nuevas actualizaciones disponibles',
          image: notificationData.image || '/assets/logo-512.png'
        },
        data: {
          url: notificationData.url || '/home.html',
          type: notificationData.type || 'general',
          timestamp: Date.now().toString()
        },
        tokens: tokens.map(t => t.fcmToken)
      };

      // Guardar la notificación en Firestore para que Cloud Function la procese
      const notificationDoc = await addDoc(collection(db, 'pushNotifications'), {
        ...pushData,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'pending',
        targetCount: tokens.length
      });

      console.log('🚀 Notificación push programada:', notificationDoc.id);
      
      // Mostrar notificación de éxito al admin
      this.showAdminFeedback('success', `✅ Notificación push enviada a ${tokens.length} usuarios`);
      
      return {
        success: true,
        notificationId: notificationDoc.id,
        targetCount: tokens.length
      };

    } catch (error) {
      console.error('❌ Error enviando notificación push:', error);
      this.showAdminFeedback('error', `❌ Error: ${error.message}`);
      throw error;
    }
  }

  // 📢 CREAR NOTIFICACIÓN IN-APP PARA TODOS
  async createInAppNotificationForAll(notificationData) {
    if (!this.isAdmin) {
      throw new Error('❌ Solo los admins pueden crear notificaciones in-app');
    }

    try {
      // Obtener todos los usuarios
      const users = await this.getAllUserTokens();
      const userIds = users.map(u => u.userId);

      if (userIds.length === 0) {
        throw new Error('❌ No hay usuarios registrados');
      }

      // Crear notificación in-app
      const inAppNotificationDoc = await addDoc(collection(db, 'inAppNotifications'), {
        title: notificationData.title || 'YA ME VI - Nueva Notificación',
        body: notificationData.body || 'Tienes nuevas actualizaciones disponibles',
        type: notificationData.type || 'info',
        targetUsers: userIds,
        data: {
          url: notificationData.url || '/home.html',
          action: notificationData.action || 'view'
        },
        isActive: true,
        shown: false,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        expiresAt: notificationData.expiresAt || null
      });

      console.log('📢 Notificación in-app creada:', inAppNotificationDoc.id);
      
      this.showAdminFeedback('success', `✅ Notificación in-app creada para ${userIds.length} usuarios`);
      
      return {
        success: true,
        notificationId: inAppNotificationDoc.id,
        targetCount: userIds.length
      };

    } catch (error) {
      console.error('❌ Error creando notificación in-app:', error);
      this.showAdminFeedback('error', `❌ Error: ${error.message}`);
      throw error;
    }
  }

  // 📧 PROGRAMAR ENVÍO DE EMAIL A TODOS
  async scheduleEmailToAll(emailData) {
    if (!this.isAdmin) {
      throw new Error('❌ Solo los admins pueden programar emails');
    }

    try {
      // Obtener todos los emails
      const emails = await this.getAllUserEmails();
      
      if (emails.length === 0) {
        throw new Error('❌ No hay emails de usuarios disponibles');
      }

      // Crear documento para que Cloud Function procese el envío
      const emailDoc = await addDoc(collection(db, 'emailNotifications'), {
        subject: emailData.subject || 'YA ME VI - Nueva Notificación',
        htmlContent: emailData.htmlContent || emailData.body || 'Tienes nuevas actualizaciones disponibles',
        textContent: emailData.textContent || emailData.body || 'Tienes nuevas actualizaciones disponibles',
        recipients: emails.map(e => e.email),
        templateData: {
          appName: 'YA ME VI',
          appLogo: 'https://yamevi.com.mx/assets/logo-512.png',
          appUrl: 'https://yamevi.com.mx',
          unsubscribeUrl: 'https://yamevi.com.mx/unsubscribe'
        },
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'pending',
        targetCount: emails.length
      });

      console.log('📧 Email programado:', emailDoc.id);
      
      this.showAdminFeedback('success', `✅ Email programado para ${emails.length} usuarios`);
      
      return {
        success: true,
        emailId: emailDoc.id,
        targetCount: emails.length
      };

    } catch (error) {
      console.error('❌ Error programando email:', error);
      this.showAdminFeedback('error', `❌ Error: ${error.message}`);
      throw error;
    }
  }

  // 🎯 ENVIAR NOTIFICACIÓN ESPECÍFICA DE ANÁLISIS
  async sendAnalysisNotification(analysisType, gameType) {
    const analysisMessages = {
      'new-predictions': {
        title: '🎯 Nuevas Predicciones Disponibles',
        body: `Se han generado nuevas predicciones inteligentes para ${gameType}. ¡Revísalas ahora!`,
        url: '/sugeridas.html',
        type: 'prediction'
      },
      'frequency-update': {
        title: '📊 Análisis de Frecuencias Actualizado',
        body: `Los datos de frecuencia de ${gameType} han sido actualizados con los últimos sorteos`,
        url: '/analisis.html',
        type: 'analysis'
      },
      'lucky-numbers': {
        title: '🍀 Números de la Suerte Actualizados',
        body: `Tus números personalizados para ${gameType} han sido recalculados`,
        url: '/combinacion.html',
        type: 'success'
      },
      'system-maintenance': {
        title: '🔧 Mantenimiento Programado',
        body: `El sistema estará en mantenimiento. Los análisis estarán disponibles pronto`,
        url: '/home.html',
        type: 'warning'
      }
    };

    const messageData = analysisMessages[analysisType] || analysisMessages['new-predictions'];
    
    // Enviar tanto push como in-app
    const results = await Promise.allSettled([
      this.sendPushNotificationToAll(messageData),
      this.createInAppNotificationForAll(messageData)
    ]);

    console.log('🎯 Notificación de análisis enviada:', analysisType, results);
    return results;
  }

  // 📊 OBTENER ESTADÍSTICAS DE NOTIFICACIONES
  async getNotificationStats() {
    if (!this.isAdmin) return null;

    try {
      const [pushSnapshot, inAppSnapshot, emailSnapshot] = await Promise.all([
        getDocs(collection(db, 'pushNotifications')),
        getDocs(collection(db, 'inAppNotifications')),
        getDocs(collection(db, 'emailNotifications'))
      ]);

      const stats = {
        push: {
          total: pushSnapshot.size,
          pending: 0,
          sent: 0,
          failed: 0
        },
        inApp: {
          total: inAppSnapshot.size,
          active: 0,
          shown: 0
        },
        email: {
          total: emailSnapshot.size,
          pending: 0,
          sent: 0,
          failed: 0
        }
      };

      // Contar estados de push notifications
      pushSnapshot.forEach(doc => {
        const status = doc.data().status;
        if (status === 'pending') stats.push.pending++;
        else if (status === 'sent') stats.push.sent++;
        else if (status === 'failed') stats.push.failed++;
      });

      // Contar estados de in-app notifications
      inAppSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.isActive) stats.inApp.active++;
        if (data.shown) stats.inApp.shown++;
      });

      // Contar estados de email notifications
      emailSnapshot.forEach(doc => {
        const status = doc.data().status;
        if (status === 'pending') stats.email.pending++;
        else if (status === 'sent') stats.email.sent++;
        else if (status === 'failed') stats.email.failed++;
      });

      console.log('📊 Estadísticas de notificaciones:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  }

  // 💬 MOSTRAR FEEDBACK AL ADMIN
  showAdminFeedback(type, message) {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    const feedback = document.createElement('div');
    feedback.className = `
      fixed bottom-4 right-4 z-50 ${colors[type]} text-white p-4 rounded-lg 
      shadow-lg max-w-sm animate__animated animate__slideInUp
    `;
    feedback.innerHTML = `
      <div class="flex items-start space-x-2">
        <div class="flex-1 text-sm">${message}</div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white">×</button>
      </div>
    `;

    document.body.appendChild(feedback);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      feedback.classList.add('animate__slideOutDown');
      setTimeout(() => feedback.remove(), 300);
    }, 5000);
  }

  // 🚀 INICIALIZAR SISTEMA DE ADMIN
  async initialize() {
    console.log('👑 Inicializando sistema de administración de notificaciones...');
    
    const isAdmin = await this.checkAdminStatus();
    
    if (isAdmin) {
      await this.getAllUserTokens();
      await this.getAllUserEmails();
      console.log('✅ Sistema de admin inicializado correctamente');
    }
    
    return isAdmin;
  }
}

// Crear instancia global para el admin
export const adminNotificationSystem = new AdminNotificationSystem();

// Auto-inicializar cuando el usuario se autentica
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const isAdmin = await adminNotificationSystem.initialize();
    if (isAdmin) {
      console.log('👑 Sistema de administración de notificaciones listo');
    }
  }
});

export default AdminNotificationSystem;
