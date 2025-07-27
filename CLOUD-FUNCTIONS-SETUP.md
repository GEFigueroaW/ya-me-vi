# YA ME VI - Configuración de Firebase Cloud Functions para Notificaciones

## 📂 Estructura Necesaria

Crea esta estructura de carpetas en tu proyecto:

```
ya-me-vi/
├── functions/
│   ├── package.json
│   ├── index.js
│   └── sendgrid-config.js (opcional)
├── firebase.json
└── .firebaserc
```

## 🔧 1. Configurar Firebase CLI

```bash
# Instalar Firebase CLI globalmente (si no lo tienes)
npm install -g firebase-tools

# Inicializar funciones en tu proyecto
firebase init functions

# Seleccionar:
# - Use an existing project (ya-me-vi)
# - JavaScript
# - Yes para ESLint
# - Yes para instalar dependencias
```

## 📦 2. package.json para Cloud Functions

```json
{
  "name": "functions",
  "description": "Cloud Functions for YA ME VI",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1",
    "@sendgrid/mail": "^7.7.0"
  },
  "devDependencies": {
    "eslint": "^8.15.0",
    "eslint-config-google": "^0.14.0",
    "firebase-functions-test": "^3.1.0"
  },
  "private": true
}
```

## 🚀 3. index.js - Cloud Functions Principal

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// =====================================================
// 📱 FUNCIÓN: ENVIAR NOTIFICACIONES PUSH
// =====================================================

exports.sendPushNotifications = functions.firestore
  .document('pushNotifications/{notificationId}')
  .onCreate(async (snap, context) => {
    try {
      const notificationData = snap.data();
      console.log('🚀 Procesando notificación push:', context.params.notificationId);

      // Validar que la notificación esté pendiente
      if (notificationData.status !== 'pending') {
        console.log('❌ Notificación no está pendiente');
        return null;
      }

      // Preparar mensaje FCM
      const message = {
        notification: {
          title: notificationData.notification.title,
          body: notificationData.notification.body,
          image: notificationData.notification.image
        },
        data: notificationData.data,
        tokens: notificationData.tokens
      };

      // Enviar notificación
      const response = await admin.messaging().sendMulticast(message);
      
      console.log('✅ Notificaciones enviadas:', response.successCount);
      console.log('❌ Notificaciones fallidas:', response.failureCount);

      // Actualizar estado en Firestore
      await snap.ref.update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        successCount: response.successCount,
        failureCount: response.failureCount,
        results: response.responses.map(r => ({
          success: r.success,
          error: r.error ? r.error.code : null
        }))
      });

      // Limpiar tokens inválidos
      if (response.failureCount > 0) {
        const invalidTokens = [];
        response.responses.forEach((result, index) => {
          if (!result.success && result.error) {
            const errorCode = result.error.code;
            if (errorCode === 'messaging/invalid-registration-token' ||
                errorCode === 'messaging/registration-token-not-registered') {
              invalidTokens.push(notificationData.tokens[index]);
            }
          }
        });

        // Eliminar tokens inválidos de la base de datos
        if (invalidTokens.length > 0) {
          console.log('🗑️ Eliminando tokens inválidos:', invalidTokens.length);
          await cleanupInvalidTokens(invalidTokens);
        }
      }

      return {
        success: true,
        sent: response.successCount,
        failed: response.failureCount
      };

    } catch (error) {
      console.error('❌ Error enviando notificaciones push:', error);
      
      // Marcar como fallida
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        failedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      throw error;
    }
  });

// =====================================================
// 📧 FUNCIÓN: ENVIAR EMAILS
// =====================================================

exports.sendEmailNotifications = functions.firestore
  .document('emailNotifications/{emailId}')
  .onCreate(async (snap, context) => {
    try {
      const emailData = snap.data();
      console.log('📧 Procesando email:', context.params.emailId);

      // Validar que el email esté pendiente
      if (emailData.status !== 'pending') {
        console.log('❌ Email no está pendiente');
        return null;
      }

      // IMPORTANTE: Configura SendGrid API Key en Firebase Functions config
      // firebase functions:config:set sendgrid.api_key="TU_SENDGRID_API_KEY"
      const sendgridApiKey = functions.config().sendgrid?.api_key;
      
      if (!sendgridApiKey) {
        throw new Error('SendGrid API Key no configurada');
      }

      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(sendgridApiKey);

      // Preparar emails individuales
      const messages = emailData.recipients.map(email => ({
        to: email,
        from: {
          email: 'noreply@yamevi.com.mx', // Cambiar por tu dominio verificado
          name: 'YA ME VI'
        },
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent,
        // Personalización
        substitutions: {
          ...emailData.templateData,
          recipientEmail: email
        }
      }));

      // Enviar emails en lotes de 100 (límite de SendGrid)
      const batchSize = 100;
      let totalSent = 0;
      let totalFailed = 0;
      const results = [];

      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        
        try {
          const response = await sgMail.send(batch);
          totalSent += batch.length;
          results.push({ batch: i / batchSize + 1, success: true, count: batch.length });
          console.log(`✅ Lote ${i / batchSize + 1} enviado: ${batch.length} emails`);
        } catch (error) {
          totalFailed += batch.length;
          results.push({ batch: i / batchSize + 1, success: false, error: error.message });
          console.error(`❌ Error en lote ${i / batchSize + 1}:`, error);
        }
      }

      // Actualizar estado en Firestore
      await snap.ref.update({
        status: totalFailed === 0 ? 'sent' : 'partial',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        totalSent: totalSent,
        totalFailed: totalFailed,
        results: results
      });

      console.log(`📧 Emails procesados - Enviados: ${totalSent}, Fallidos: ${totalFailed}`);

      return {
        success: true,
        sent: totalSent,
        failed: totalFailed
      };

    } catch (error) {
      console.error('❌ Error enviando emails:', error);
      
      // Marcar como fallido
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        failedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      throw error;
    }
  });

// =====================================================
// 🔧 FUNCIÓN: LIMPIAR TOKENS INVÁLIDOS
// =====================================================

async function cleanupInvalidTokens(invalidTokens) {
  const batch = db.batch();
  
  for (const token of invalidTokens) {
    // Buscar el documento del usuario con este token
    const userTokensQuery = await db.collection('userTokens')
      .where('fcmToken', '==', token)
      .get();
    
    userTokensQuery.forEach(doc => {
      batch.update(doc.ref, {
        isActive: false,
        invalidatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
  }
  
  await batch.commit();
  console.log(`🗑️ ${invalidTokens.length} tokens marcados como inválidos`);
}

// =====================================================
// ⏰ FUNCIÓN: NOTIFICACIONES PROGRAMADAS
// =====================================================

exports.scheduledNotifications = functions.pubsub
  .schedule('0 9 * * 1,3,5') // Lunes, Miércoles, Viernes a las 9 AM (UTC)
  .timeZone('America/Mexico_City')
  .onRun(async (context) => {
    console.log('⏰ Ejecutando notificaciones programadas...');
    
    try {
      // Obtener todos los tokens activos
      const tokensSnapshot = await db.collection('userTokens')
        .where('isActive', '==', true)
        .get();
      
      if (tokensSnapshot.empty) {
        console.log('❌ No hay usuarios activos para notificar');
        return null;
      }
      
      const tokens = [];
      tokensSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.fcmToken) {
          tokens.push(data.fcmToken);
        }
      });
      
      // Crear notificación programada
      const scheduledNotification = {
        notification: {
          title: '🎯 YA ME VI - Nuevas Predicciones',
          body: 'Las predicciones más recientes están disponibles. ¡Revisa tus números de la suerte!',
          image: '/assets/logo-512.png'
        },
        data: {
          url: '/sugeridas.html',
          type: 'scheduled',
          timestamp: Date.now().toString()
        },
        tokens: tokens,
        createdBy: 'system',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        targetCount: tokens.length
      };
      
      // Guardar en Firestore para que la función de push la procese
      await db.collection('pushNotifications').add(scheduledNotification);
      
      console.log(`⏰ Notificación programada creada para ${tokens.length} usuarios`);
      return { success: true, targetCount: tokens.length };
      
    } catch (error) {
      console.error('❌ Error en notificaciones programadas:', error);
      throw error;
    }
  });

// =====================================================
// 📊 FUNCIÓN: ESTADÍSTICAS DE NOTIFICACIONES
// =====================================================

exports.getNotificationStats = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario esté autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }
  
  // Verificar que sea admin
  const adminEmails = ['gfigueroa.w@gmail.com', 'admin@yamevi.com.mx'];
  if (!adminEmails.includes(context.auth.token.email)) {
    throw new functions.https.HttpsError('permission-denied', 'No tienes permisos de administrador');
  }
  
  try {
    const [pushSnapshot, inAppSnapshot, emailSnapshot] = await Promise.all([
      db.collection('pushNotifications').get(),
      db.collection('inAppNotifications').get(),
      db.collection('emailNotifications').get()
    ]);
    
    const stats = {
      push: { total: pushSnapshot.size, pending: 0, sent: 0, failed: 0 },
      inApp: { total: inAppSnapshot.size, active: 0, shown: 0 },
      email: { total: emailSnapshot.size, pending: 0, sent: 0, failed: 0 }
    };
    
    // Contar estados
    pushSnapshot.forEach(doc => {
      const status = doc.data().status;
      if (status === 'pending') stats.push.pending++;
      else if (status === 'sent') stats.push.sent++;
      else if (status === 'failed') stats.push.failed++;
    });
    
    inAppSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.isActive) stats.inApp.active++;
      if (data.shown) stats.inApp.shown++;
    });
    
    emailSnapshot.forEach(doc => {
      const status = doc.data().status;
      if (status === 'pending') stats.email.pending++;
      else if (status === 'sent') stats.email.sent++;
      else if (status === 'failed') stats.email.failed++;
    });
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    throw new functions.https.HttpsError('internal', 'Error interno del servidor');
  }
});

console.log('🚀 YA ME VI - Cloud Functions cargadas correctamente');
```

## 🔥 4. firebase.json

```json
{
  "functions": {
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run lint"
    ],
    "source": "functions"
  },
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "functions/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## 🎯 5. .firebaserc

```json
{
  "projects": {
    "default": "ya-me-vi"
  }
}
```

## 🚀 Comandos para Desplegar

```bash
# Instalar dependencias
cd functions
npm install

# Configurar SendGrid (opcional, para emails)
firebase functions:config:set sendgrid.api_key="TU_SENDGRID_API_KEY_AQUI"

# Desplegar funciones
firebase deploy --only functions

# Ver logs
firebase functions:log

# Probar localmente
firebase emulators:start --only functions
```

## 🔑 Configuraciones Adicionales Necesarias

### Firebase Console:
1. Habilitar Cloud Messaging
2. Generar VAPID Key
3. Configurar dominio autorizado
4. Habilitar Cloud Functions

### SendGrid (para emails):
1. Crear cuenta en SendGrid
2. Verificar tu dominio
3. Obtener API Key
4. Configurar en Firebase Functions

## ⚠️ Importante

- Las Cloud Functions se ejecutan en el servidor de Google
- Los emails requieren dominio verificado
- Las notificaciones push necesitan HTTPS
- Revisar límites de Firebase (plan gratuito vs. pagado)

¡Con estas configuraciones tendrás un sistema completo de notificaciones para YA ME VI! 🎉
