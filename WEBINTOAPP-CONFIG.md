# WebIntoApp Configuration for YA-ME-VI
# Configuración específica para el APK generado con WebIntoApp

## 📱 INFORMACIÓN DE LA APP

**Package Name:** `com.webintoapp.myapp`  
**App Name:** YA-ME-VI  
**Version:** 1.0  
**Target SDK:** 34  
**Min SDK:** 21  

## 🔧 CONFIGURACIÓN FIREBASE

### google-services.json ✅
```json
{
  "android_client_info": {
    "package_name": "com.webintoapp.myapp"
  },
  "mobilesdk_app_id": "1:748876890843:android:f3bf99d0c2d9a3f2d002fe"
}
```

### OAuth Client ID
```
748876890843-jiu4cfl2ioqgjomna6fa8r4pqogl3q7l.apps.googleusercontent.com
```

## 🚀 ARCHIVOS GRADLE INCLUIDOS

1. **build.gradle.kts** (proyecto)
   - Plugin Google Services v4.4.3
   - Configuración de repositorios

2. **app/build.gradle.kts** (módulo app)
   - Plugin Google Services aplicado
   - Firebase BoM v34.0.0
   - Dependencies: Auth, Firestore, Analytics

## 📋 PASOS PARA WEBINTOAPP

### 1. Subir Archivos
- `google-services.json` → Raíz del proyecto
- `build.gradle.kts` → Raíz del proyecto  
- `app/build.gradle.kts` → Directorio app/

### 2. Configuración WebIntoApp
- **URL de la web:** https://ya-me-vi.web.app
- **Package Name:** com.webintoapp.myapp
- **App Name:** YA-ME-VI
- **Icon:** Subir logo de la app

### 3. Permisos Necesarios
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
```

### 4. Verificar OAuth
- Dominio autorizado: `ya-me-vi.firebaseapp.com`
- Package name coincide: `com.webintoapp.myapp`
- SHA-1 certificate (opcional para testing)

## ⚡ TESTING

### En Navegador (Desarrollo)
```
http://localhost:8080/test-apk-auth.html
```

### En APK (Producción)
1. Generar APK con WebIntoApp
2. Instalar en dispositivo Android
3. Probar autenticación Google
4. Verificar que no aparece "missing initial state"

## 🔍 TROUBLESHOOTING

### Error: "missing initial state"
- ✅ **SOLUCIONADO:** Package name correcto configurado

### Error: "configuration-not-found"
- Verificar que google-services.json esté en la raíz
- Confirmar que el package name coincida exactamente

### Error: "auth/invalid-api-key"
- Verificar API key en google-services.json
- Confirmar que la app Android esté habilitada en Firebase

## 📱 RESULTADO ESPERADO

Con esta configuración, la autenticación Google OAuth debería funcionar perfectamente en el APK generado por WebIntoApp, sin errores de "missing initial state" o problemas de configuración.

---

**Estado:** ✅ CONFIGURACIÓN COMPLETA  
**Fecha:** Agosto 2, 2025  
**Firebase Package:** com.webintoapp.myapp
