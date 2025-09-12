# 🔐 CONFIGURACIÓN GOOGLE CLOUD CONSOLE - OAUTH REAL

## 🎯 OBJETIVO
Configurar Google OAuth para que funcione con YA ME VI APK

## 📋 PASOS DETALLADOS

### 1. 🌐 ACCEDER A GOOGLE CLOUD CONSOLE
```
URL: https://console.cloud.google.com/
Proyecto: yamevi-53e6a (o tu proyecto de Firebase)
```

### 2. 🔑 IR A CREDENCIALES
1. En el menú lateral → **APIs & Services**
2. Clic en **Credentials** 
3. Buscar **OAuth 2.0 Client IDs**
4. Clic en el **lápiz de editar** (ícono editar)

### 3. ➕ AÑADIR REDIRECT URI
En la sección **Authorized redirect URIs**, AÑADIR:

```
https://yamevi.com.mx/oauth-return.html
```

**URIs actuales + nueva:**
```
✅ https://ya-me-vi.firebaseapp.com/__/auth/handler
✅ https://yamevi.com.mx/__/auth/handler  
✅ https://yamevi.com.mx/auth-external.html
✅ https://yamevi.com.mx/login.html
🆕 https://yamevi.com.mx/oauth-return.html
```

### 4. 💾 GUARDAR CAMBIOS
- Clic **SAVE** o **Guardar**
- Esperar confirmación "Credentials saved"

### 5. 📋 COPIAR CREDENCIALES
Necesitarás copiar:
- **CLIENT ID**: Empieza con números y termina en `.apps.googleusercontent.com`
- **CLIENT SECRET**: Empieza con `GOCSPX-` seguido de caracteres

### 6. 🔧 ACTUALIZAR ARCHIVOS
Usa el script `update-credentials.ps1` con tus credenciales reales.

## ⚠️ IMPORTANTE
- NO compartas el CLIENT_SECRET públicamente
- Guarda ambos valores en lugar seguro
- Los necesitarás para el siguiente paso

## 🔍 VERIFICACIÓN
Después de guardar, verifica que aparezca:
- ✅ oauth-return.html en la lista de Redirect URIs
- ✅ Estado "Active" en el OAuth Client

## 📱 CONFIGURACIÓN APK (WebIntoApp)
**Package Name:**
```
com.gefiguw.yamevi
```

**Deep Link Scheme:**
```
com.gefiguw.yamevi://oauth/callback
```

## 🎯 SIGUIENTE PASO
Actualizar archivos con tus credenciales reales usando el script proporcionado.