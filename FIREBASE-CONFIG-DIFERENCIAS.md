# Configuración Firebase YA ME VI - Diferencias Web vs APK

## 📱 **Configuración WEB** (para navegadores)
**Archivos:** `js/firebase-init.js`, páginas HTML
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB4bCGyyPuQo-3-ONMPFKtqPEJDFl8Cb54",
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.firebasestorage.app",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:web:07bd1eb476d38594d002fe", // WEB App ID
  measurementId: "G-D7R797S5BC"
};
```

## 🤖 **Configuración ANDROID/APK** (para WebIntoApp)
**Archivos:** `js/firebase-init-apk*.js`
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAJYWSNUMj5aej7O9u5BwJQts7L2F6Poqw", // Android API Key
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.firebasestorage.app",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:android:315d26696c8142e4d002fe", // Android App ID
  measurementId: "G-D7R797S5BC"
};
```

## 🔑 **Diferencias clave:**

### API Keys
- **Web**: `AIzaSyB4bCGyyPuQo-3-ONMPFKtqPEJDFl8Cb54`
- **Android**: `AIzaSyAJYWSNUMj5aej7O9u5BwJQts7L2F6Poqw`

### App IDs
- **Web**: `1:748876890843:web:07bd1eb476d38594d002fe`
- **Android**: `1:748876890843:android:315d26696c8142e4d002fe`

### OAuth Client ID (para ambos)
- `748876890843-jiu4cfl2ioqgjomna6fa8r4pqogl3q7l.apps.googleusercontent.com`

## 📁 **Archivos por plataforma:**

### Web (Navegadores)
- `js/firebase-init.js` - Configuración principal web
- `register.html`, `login-email.html` - Páginas web principales
- `firebase-messaging-sw.js` - Service Worker (usa config web)

### Android APK (WebIntoApp)
- `js/firebase-init-apk.js` - Configuración principal APK
- `js/firebase-init-apk-v2.js` - Configuración APK versión 2
- `js/firebase-init-apk-fixed.js` - Configuración APK corregida
- `login-apk-*.html` - Páginas específicas para APK

### Configuración Central
- `js/firebase-config.js` - Contiene ambas configuraciones
- `google-services.json` - Archivo de configuración Android original

## ⚠️ **Importante:**
1. **Web** y **Android** tienen API Keys diferentes
2. **No mezclar** configuraciones entre plataformas
3. **Google Auth** requiere OAuth Client ID específico
4. **StorageBucket** es el mismo para ambas: `ya-me-vi.firebasestorage.app`

## 🎯 **Uso según entorno:**
- **Navegador web**: Usar configuración WEB
- **APK con WebIntoApp**: Usar configuración ANDROID
- **Testing**: Verificar qué configuración está activa

## 📊 **Del google-services.json extraído:**
```json
{
  "project_number": "748876890843",
  "project_id": "ya-me-vi",
  "storage_bucket": "ya-me-vi.firebasestorage.app",
  "mobilesdk_app_id": "1:748876890843:android:315d26696c8142e4d002fe",
  "package_name": "com.gefiguw.yamevi",
  "client_id": "748876890843-jiu4cfl2ioqgjomna6fa8r4pqogl3q7l.apps.googleusercontent.com",
  "android_api_key": "AIzaSyAJYWSNUMj5aej7O9u5BwJQts7L2F6Poqw"
}
```

---
**Última actualización**: 2 de Agosto, 2025
**Estado**: ✅ Configuraciones sincronizadas con google-services.json
