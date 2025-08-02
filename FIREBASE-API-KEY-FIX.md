# 🔧 CORRECCIÓN URGENTE - Error Firebase API Key

## ❌ PROBLEMA IDENTIFICADO
Error: `auth/api-key-not-valid.-please-pass-a-valid-api-key`

Basándome en las imágenes de Firebase Console compartidas, he identificado discrepancias en la configuración.

## 📋 CONFIGURACIÓN CORRECTA IDENTIFICADA

### En Firebase Console se muestra:
- **API Key Web**: `AIzaSyB4bCqyyPuQo-3-ONMPrXtqPEJDF1BCb54`
- **App ID Web**: `1:748876890843:web:07bd1eb476d38594d002fe`
- **App ID Android**: `1:748876890843:android:315d26696c8142e4d002fe`
- **Storage Bucket**: `ya-me-vi.firebasestorage.app`

## ✅ CAMBIOS REALIZADOS

### 1. Actualizado `js/firebase-init.js`
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB4bCqyyPuQo-3-ONMPrXtqPEJDF1BCb54", // ✅ Corregido
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.firebasestorage.app", // ✅ Corregido
  messagingSenderId: "748876890843",
  appId: "1:748876890843:web:07bd1eb476d38594d002fe", // ✅ Corregido
  measurementId: "G-D7R797S5BC"
};
```

### 2. Actualizado `google-services.json`
- API Key corregida para Android
- App ID Android corregido

## 🔍 PASOS PARA VERIFICAR EN FIREBASE CONSOLE

### 1. Verificar Dominios Autorizados
En Firebase Console → Authentication → Settings → Authorized domains:
```
✅ ya-me-vi.firebaseapp.com
✅ yamevi.com.mx
✅ localhost (para desarrollo)
```

### 2. Verificar Configuración OAuth
En Google Cloud Console → APIs & Services → Credentials:

**Para Web Client:**
- Authorized JavaScript origins:
  - `https://yamevi.com.mx`
  - `https://www.yamevi.com.mx`
  - `https://ya-me-vi.firebaseapp.com`

- Authorized redirect URIs:
  - `https://yamevi.com.mx/__/auth/handler`
  - `https://www.yamevi.com.mx/__/auth/handler`
  - `https://ya-me-vi.firebaseapp.com/__/auth/handler`

### 3. Verificar API Key Restrictions
En Google Cloud Console → APIs & Services → Credentials:
- La API Key debe tener las siguientes APIs habilitadas:
  - Identity and Access Management (IAM) API
  - Cloud Resource Manager API
  - Firebase Authentication API

## 🧪 PÁGINA DE PRUEBA CREADA
He creado `test-firebase-config.html` para verificar la configuración:

1. Abrir en navegador: `http://localhost:8080/test-firebase-config.html`
2. Hacer clic en "🔥 Probar Inicialización Firebase"
3. Hacer clic en "🔐 Probar Autenticación Google"

## 📱 VERIFICACIÓN ADICIONAL NECESARIA

### En Firebase Console - Authentication:
1. Ir a Authentication → Sign-in method
2. Verificar que Google está habilitado
3. Verificar que el Web SDK configuration está correcto
4. Verificar los dominios autorizados

### En Google Cloud Console:
1. Ir a APIs & Services → Credentials
2. Buscar el Web Client ID: `748876890843-ju4cf2i0ggjomna6fa8r4pqogl3q7l.apps.googleusercontent.com`
3. Verificar que las URLs autorizadas están correctas

## 🚨 ACCIONES INMEDIATAS

1. **Verificar en Firebase Console** que la configuración mostrada coincide con los valores actualizados
2. **Regenerar API Key** si el problema persiste
3. **Verificar dominios autorizados** en Authentication settings
4. **Probar con la página de prueba** creada

## 📞 SIGUIENTE PASO
Usar la página de pruebas y revisar la consola del navegador para obtener más detalles específicos del error.
