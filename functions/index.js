// Cloud Functions para YA ME VI - Sistema de Notificaciones
// Versión: 1.0.0

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const express = require('express');

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Configurar SendGrid
sgMail.setApiKey(functions.config().sendgrid.key);

// Configurar Express con CORS
const app = express();
app.use(cors({ origin: true }));

// =============================================================================
// 🔔 FUNCIÓN 1: NOTIFICACIONES PUSH AUTOMÁTICAS
// =============================================================================

/**
 * Envía notificaciones push a usuarios activos cuando hay nuevos sorteos
 */
exports.sendLotteryNotifications = functions.firestore
  .document('lottery_results/{docId}')
  .onCreate(async (snap, context) => {
    try {
      const lotteryData = snap.data();
      console.log('🎲 Nuevo sorteo detectado:', lotteryData);
      
      // Obtener tokens de usuarios activos (últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activeUsersQuery = await db
        .collection('users')
        .where('lastAccess', '>=', sevenDaysAgo)
        .where('notificationsEnabled', '==', true)
        .get();
      
      if (activeUsersQuery.empty) {
        console.log('📭 No hay usuarios activos para notificar');
        return null;
      }
      
      const tokens = [];
      activeUsersQuery.forEach(doc => {
        const userData = doc.data();
        if (userData.fcmToken) {
          tokens.push(userData.fcmToken);
        }
      });
      
      if (tokens.length === 0) {
        console.log('📭 No hay tokens FCM disponibles');
        return null;
      }
      
      // Preparar mensaje de notificación
      const message = {
        notification: {
          title: `🎯 Nuevo sorteo de ${lotteryData.gameType}`,
          body: `Números ganadores: ${lotteryData.numbers.join(', ')}`,
          icon: '/assets/logo-192.png',
          image: '/assets/logo-512.png'
        },
        data: {
          gameType: lotteryData.gameType,
          numbers: JSON.stringify(lotteryData.numbers),
          date: lotteryData.date,
          url: '/analisis.html'
        },
        tokens: tokens
      };
      
      // Enviar notificaciones
      const response = await admin.messaging().sendMulticast(message);
      
      console.log(`✅ Notificaciones enviadas: ${response.successCount}/${tokens.length}`);
      console.log(`❌ Fallos: ${response.failureCount}`);
      
      // Limpiar tokens inválidos
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        
        console.log('🗑️ Limpiando tokens inválidos:', failedTokens.length);
        // Aquí podrías eliminar los tokens inválidos de la base de datos
      }
      
      return response;
      
    } catch (error) {
      console.error('❌ Error enviando notificaciones:', error);
      return null;
    }
  });

// =============================================================================
// 📧 FUNCIÓN 2: NOTIFICACIONES POR EMAIL
// =============================================================================

/**
 * Envía emails de bienvenida a nuevos usuarios
 */
exports.sendWelcomeEmail = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    try {
      const userData = snap.data();
      const userId = context.params.userId;
      
      console.log('👋 Enviando email de bienvenida a:', userData.email);
      
      const msg = {
        to: userData.email,
        from: {
          email: 'noreply@yamevi.com.mx',
          name: 'YA ME VI'
        },
        templateId: 'd-xxxxxx', // ID del template de SendGrid
        dynamicTemplateData: {
          userName: userData.displayName || 'Usuario',
          welcomeMessage: '¡Bienvenido a YA ME VI!',
          appUrl: 'https://yamevi.com.mx',
          loginUrl: 'https://yamevi.com.mx/login.html'
        }
      };
      
      await sgMail.send(msg);
      console.log('✅ Email de bienvenida enviado a:', userData.email);
      
      // Registrar el envío
      await db.collection('email_logs').add({
        userId: userId,
        email: userData.email,
        type: 'welcome',
        status: 'sent',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      
      // Registrar el error
      await db.collection('email_logs').add({
        userId: context.params.userId,
        type: 'welcome',
        status: 'error',
        error: error.message,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return { error: error.message };
    }
  });

// =============================================================================
// 📊 FUNCIÓN 3: NOTIFICACIONES DE ANÁLISIS PERSONALIZADOS
// =============================================================================

/**
 * Notifica cuando una combinación del usuario aparece en sorteos
 */
exports.checkUserCombinations = functions.firestore
  .document('lottery_results/{docId}')
  .onCreate(async (snap, context) => {
    try {
      const lotteryData = snap.data();
      const winningNumbers = lotteryData.numbers;
      
      console.log('🔍 Verificando combinaciones de usuarios para:', winningNumbers);
      
      // Buscar combinaciones de usuarios que coincidan
      const userCombinationsQuery = await db
        .collection('user_combinations')
        .where('gameType', '==', lotteryData.gameType)
        .where('isActive', '==', true)
        .get();
      
      if (userCombinationsQuery.empty) {
        console.log('📭 No hay combinaciones de usuarios activas');
        return null;
      }
      
      const notifications = [];
      
      userCombinationsQuery.forEach(doc => {
        const combData = doc.data();
        const userNumbers = combData.numbers;
        
        // Calcular coincidencias
        const matches = userNumbers.filter(num => winningNumbers.includes(num)).length;
        
        if (matches >= 3) { // Notificar si hay 3 o más coincidencias
          notifications.push({
            userId: combData.userId,
            userEmail: combData.userEmail,
            numbers: userNumbers,
            matches: matches,
            winningNumbers: winningNumbers,
            gameType: lotteryData.gameType
          });
        }
      });
      
      if (notifications.length === 0) {
        console.log('🎯 No hay coincidencias significativas');
        return null;
      }
      
      // Enviar notificaciones
      const promises = notifications.map(async (notif) => {
        try {
          // Obtener token FCM del usuario
          const userDoc = await db.collection('users').doc(notif.userId).get();
          const userData = userDoc.data();
          
          if (userData && userData.fcmToken) {
            const message = {
              notification: {
                title: `🎉 ¡${notif.matches} números coinciden!`,
                body: `Tu combinación [${notif.numbers.join(', ')}] tiene ${notif.matches} aciertos en ${notif.gameType}`,
                icon: '/assets/logo-192.png'
              },
              data: {
                type: 'combination_match',
                matches: notif.matches.toString(),
                gameType: notif.gameType,
                url: '/combinacion.html'
              },
              token: userData.fcmToken
            };
            
            await admin.messaging().send(message);
            console.log(`✅ Notificación enviada a ${notif.userEmail}: ${notif.matches} aciertos`);
          }
          
          // También enviar email si es 4+ aciertos
          if (notif.matches >= 4 && userData.email) {
            const emailMsg = {
              to: userData.email,
              from: {
                email: 'noreply@yamevi.com.mx',
                name: 'YA ME VI'
              },
              subject: `🎉 ¡${notif.matches} números de tu combinación coincidieron!`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #00B44F;">🎯 ¡Felicitaciones!</h2>
                  <p>Tu combinación registrada en YA ME VI ha tenido <strong>${notif.matches} aciertos</strong> en el sorteo de <strong>${notif.gameType}</strong>:</p>
                  
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Tu combinación:</strong> ${notif.numbers.join(', ')}</p>
                    <p><strong>Números ganadores:</strong> ${notif.winningNumbers.join(', ')}</p>
                    <p><strong>Aciertos:</strong> ${notif.matches} números</p>
                  </div>
                  
                  <p><a href="https://yamevi.com.mx/combinacion.html" style="background: #00B44F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Análisis Completo</a></p>
                  
                  <hr style="margin: 30px 0;">
                  <p style="color: #666; font-size: 12px;">Este email fue enviado porque tienes notificaciones activadas en YA ME VI.</p>
                </div>
              `
            };
            
            await sgMail.send(emailMsg);
            console.log(`📧 Email enviado a ${notif.userEmail} por ${notif.matches} aciertos`);
          }
          
        } catch (error) {
          console.error(`❌ Error notificando a ${notif.userEmail}:`, error);
        }
      });
      
      await Promise.all(promises);
      console.log(`✅ Procesadas ${notifications.length} notificaciones de coincidencias`);
      
      return { notificationsSent: notifications.length };
      
    } catch (error) {
      console.error('❌ Error verificando combinaciones:', error);
      return null;
    }
  });

// =============================================================================
// 🌐 FUNCIÓN 4: API PARA NOTIFICACIONES MANUALES
// =============================================================================

/**
 * API para enviar notificaciones manuales desde el admin panel
 */
app.post('/send-notification', async (req, res) => {
  try {
    const { title, body, targetUsers, url } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Título y mensaje son requeridos' });
    }
    
    let query = db.collection('users');
    
    // Filtrar usuarios si se especifica
    if (targetUsers && targetUsers.length > 0) {
      query = query.where(admin.firestore.FieldPath.documentId(), 'in', targetUsers);
    } else {
      // Por defecto, solo usuarios activos en los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.where('lastAccess', '>=', thirtyDaysAgo);
    }
    
    const usersSnapshot = await query.get();
    
    if (usersSnapshot.empty) {
      return res.status(404).json({ error: 'No se encontraron usuarios para notificar' });
    }
    
    const tokens = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.fcmToken && userData.notificationsEnabled !== false) {
        tokens.push(userData.fcmToken);
      }
    });
    
    if (tokens.length === 0) {
      return res.status(404).json({ error: 'No hay tokens FCM disponibles' });
    }
    
    const message = {
      notification: {
        title: title,
        body: body,
        icon: '/assets/logo-192.png'
      },
      data: {
        type: 'manual',
        url: url || '/home.html',
        timestamp: Date.now().toString()
      },
      tokens: tokens
    };
    
    const response = await admin.messaging().sendMulticast(message);
    
    // Registrar el envío
    await db.collection('notification_logs').add({
      type: 'manual',
      title: title,
      body: body,
      targetCount: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
      total: tokens.length
    });
    
  } catch (error) {
    console.error('❌ Error enviando notificación manual:', error);
    res.status(500).json({ error: error.message });
  }
});

// Exportar la API
exports.notificationApi = functions.https.onRequest(app);

// =============================================================================
// 🧹 FUNCIÓN 5: LIMPIEZA AUTOMÁTICA
// =============================================================================

/**
 * Limpia tokens FCM inválidos y datos antiguos
 */
exports.cleanupData = functions.pubsub
  .schedule('0 2 * * *') // Diario a las 2 AM
  .timeZone('America/Mexico_City')
  .onRun(async (context) => {
    try {
      console.log('🧹 Iniciando limpieza automática...');
      
      // Limpiar logs antiguos (más de 90 días)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const oldLogsQuery = await db
        .collection('notification_logs')
        .where('timestamp', '<', ninetyDaysAgo)
        .get();
      
      const deletePromises = [];
      oldLogsQuery.forEach(doc => {
        deletePromises.push(doc.ref.delete());
      });
      
      await Promise.all(deletePromises);
      console.log(`🗑️ Eliminados ${deletePromises.length} logs antiguos`);
      
      // Limpiar usuarios inactivos (más de 365 días sin acceso)
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      
      const inactiveUsersQuery = await db
        .collection('users')
        .where('lastAccess', '<', oneYearAgo)
        .get();
      
      const inactiveCleanup = [];
      inactiveUsersQuery.forEach(doc => {
        inactiveCleanup.push(doc.ref.update({
          fcmToken: admin.firestore.FieldValue.delete(),
          isOnline: false
        }));
      });
      
      await Promise.all(inactiveCleanup);
      console.log(`🧹 Limpiados ${inactiveCleanup.length} usuarios inactivos`);
      
      return { 
        logsDeleted: deletePromises.length,
        usersCleanedUp: inactiveCleanup.length
      };
      
    } catch (error) {
      console.error('❌ Error en limpieza automática:', error);
      return { error: error.message };
    }
  });

console.log('🚀 YA ME VI Cloud Functions cargadas correctamente');
