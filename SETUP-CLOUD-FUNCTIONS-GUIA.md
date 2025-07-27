# 🚀 GUÍA DE CONFIGURACIÓN - CLOUD FUNCTIONS YAMEVI

## ✅ ESTADO ACTUAL
- ✅ Archivos de Cloud Functions creados
- ✅ Configuración de Firebase lista
- ✅ Reglas de Firestore configuradas
- ⏳ Pendiente: Instalación de Node.js y Firebase CLI

## 📋 PASOS A SEGUIR

### 1. **Instalar Node.js** (REQUERIDO)
   ```
   📥 Descargar desde: https://nodejs.org
   📦 Versión recomendada: LTS (20.x)
   🔄 Reiniciar PowerShell después de instalar
   ✅ Verificar: node --version
   ```

### 2. **Instalar Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

### 3. **Instalar dependencias del proyecto**
   ```bash
   cd functions
   npm install
   cd ..
   ```

### 4. **Configurar Firebase**
   ```bash
   firebase login
   firebase use ya-me-vi
   ```

### 5. **Configurar SendGrid (IMPORTANTE)**
   ```bash
   firebase functions:config:set sendgrid.key="TU_API_KEY_AQUI"
   ```
   
   📧 **Para obtener SendGrid API Key:**
   - Ve a: https://sendgrid.com
   - Registrate (gratis)
   - Settings → API Keys → Create API Key
   - Selecciona "Mail Send" permissions

### 6. **Desplegar Cloud Functions**
   ```bash
   firebase deploy --only functions
   ```

### 7. **Desplegar reglas de Firestore**
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

## 🎯 FUNCIONES QUE SE DESPLEGARÁN

### 📱 **sendLotteryNotifications**
- Se activa cuando hay nuevos sorteos en `lottery_results`
- Envía notificaciones push a usuarios activos
- Target: Usuarios con notificaciones habilitadas

### 📧 **sendWelcomeEmail**
- Se activa cuando se registra un nuevo usuario
- Envía email de bienvenida usando SendGrid
- Template personalizable

### 🎲 **checkUserCombinations**
- Verifica coincidencias de números de usuarios
- Notifica automáticamente cuando hay aciertos
- Push para 3+ aciertos, Email para 4+ aciertos

### 🌐 **notificationApi**
- API HTTP para notificaciones manuales
- Endpoint: `/api/send-notification`
- Para uso desde admin panel

### 🧹 **cleanupData**
- Limpieza automática diaria (2 AM México)
- Elimina logs antiguos y tokens inválidos
- Optimiza rendimiento de la base de datos

## 🔧 COMANDOS ÚTILES

```bash
# Probar localmente
firebase emulators:start

# Ver logs en tiempo real
firebase functions:log --follow

# Ver configuración actual
firebase functions:config:get

# Desplegar solo una función
firebase deploy --only functions:sendLotteryNotifications

# Ver estado del proyecto
firebase projects:list
```

## 🚨 SOLUCIÓN DE PROBLEMAS

### Si Node.js no se reconoce:
1. Cierra y abre PowerShell
2. Verifica PATH: `$env:PATH`
3. Reinstala Node.js si es necesario

### Si Firebase CLI falla:
```bash
npm cache clean --force
npm install -g firebase-tools --force
```

### Si SendGrid no funciona:
1. Verifica la API Key en SendGrid dashboard
2. Checa que tenga permisos de "Mail Send"
3. Confirma configuración: `firebase functions:config:get`

## 📊 VERIFICACIÓN FINAL

Una vez desplegado, verifica en:
- **Firebase Console**: https://console.firebase.google.com/project/ya-me-vi/functions
- **Logs**: `firebase functions:log`
- **Configuración**: `firebase functions:config:get`

## 🎉 RESULTADO ESPERADO

Con las Cloud Functions activas tendrás:
- ✅ Notificaciones push automáticas para nuevos sorteos
- ✅ Emails de bienvenida para nuevos usuarios  
- ✅ Notificaciones de aciertos en combinaciones
- ✅ API para notificaciones manuales desde admin
- ✅ Limpieza automática de datos

---

**📞 ¿Problemas?** Ejecuta paso a paso y verifica cada comando antes de continuar.
