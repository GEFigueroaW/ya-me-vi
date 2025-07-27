# YA ME VI Cloud Functions

Este directorio contiene las Cloud Functions para el sistema de notificaciones de YA ME VI.

## 🚀 Funciones Implementadas

### 1. **sendLotteryNotifications**
- **Trigger**: Nuevo documento en `lottery_results`
- **Función**: Envía notificaciones push automáticas cuando hay nuevos sorteos
- **Usuarios objetivo**: Usuarios activos en los últimos 7 días con notificaciones habilitadas

### 2. **sendWelcomeEmail**
- **Trigger**: Nuevo usuario registrado en `users`
- **Función**: Envía email de bienvenida usando SendGrid
- **Template**: Usa plantillas dinámicas de SendGrid

### 3. **checkUserCombinations**
- **Trigger**: Nuevo documento en `lottery_results`
- **Función**: Verifica si las combinaciones de usuarios coinciden con sorteos
- **Notificación**: Push para 3+ aciertos, Email para 4+ aciertos

### 4. **notificationApi**
- **Trigger**: HTTP Request
- **Función**: API para enviar notificaciones manuales desde admin panel
- **Endpoint**: `POST /send-notification`

### 5. **cleanupData**
- **Trigger**: Programado (diario 2 AM México)
- **Función**: Limpia logs antiguos y tokens FCM inválidos
- **Retención**: 90 días para logs, 365 días para usuarios inactivos

## 📋 Configuración Requerida

### Variables de Entorno
```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
```

### Reglas de Firestore
Las siguientes colecciones deben estar configuradas:
- `users` - Información de usuarios y tokens FCM
- `lottery_results` - Resultados de sorteos
- `user_combinations` - Combinaciones guardadas por usuarios
- `notification_logs` - Log de notificaciones enviadas
- `email_logs` - Log de emails enviados

## 🛠️ Instalación

1. **Instalar dependencias**:
```bash
cd functions
npm install
```

2. **Configurar SendGrid**:
```bash
firebase functions:config:set sendgrid.key="YOUR_API_KEY"
```

3. **Desplegar funciones**:
```bash
firebase deploy --only functions
```

## 📧 Configuración de SendGrid

1. Crear cuenta en SendGrid
2. Generar API Key con permisos de envío
3. Crear template dinámico para emails de bienvenida
4. Configurar dominio de envío verificado

## 🔔 Configuración de FCM

1. Habilitar Firebase Cloud Messaging en la consola
2. Generar claves VAPID para web push
3. Configurar service worker (`firebase-messaging-sw.js`)

## 🚀 Despliegue

```bash
# Desarrollo local
npm run serve

# Desplegar a producción
npm run deploy

# Ver logs
npm run logs
```

## 📊 Monitoreo

- **Firebase Console**: Ver métricas de ejecución
- **Logs**: Usar `firebase functions:log`
- **Errores**: Monitorear en Cloud Functions console

## 🔧 Personalización

### Modificar Plantillas de Notificación
Editar en `index.js` las secciones de `notification` y `data`.

### Ajustar Timing
- Cambiar frecuencia de limpieza en `cleanupData`
- Modificar período de usuarios activos en `sendLotteryNotifications`

### Agregar Nuevos Triggers
Crear nuevas funciones siguiendo el patrón establecido.
