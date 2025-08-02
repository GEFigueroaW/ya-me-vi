# 🔐 SOLUCIÓN OAUTH: Configurar Google Cloud Console

## ⚠️ PROBLEMA IDENTIFICADO

Si OAuth sigue fallando después de configurar Firebase correctamente, el problema probablemente está en **Google Cloud Console** donde necesitas configurar la **OAuth Consent Screen**.

## 📋 PASOS PARA SOLUCIONARLO

### **1. Ir a Google Cloud Console**
- Ve a: https://console.cloud.google.com/
- Selecciona el proyecto: **ya-me-vi**

### **2. Configurar OAuth Consent Screen**
- Ve a **APIs & Services** → **OAuth consent screen**
- Tipo de usuario: **External** (para permitir cualquier cuenta Google)
- Completa la información requerida:

```
App name: YA-ME-VI
User support email: tu@email.com
Developer contact information: tu@email.com
```

### **3. Agregar Scopes**
- Ve a **Scopes**
- Agrega estos scopes esenciales:
  - `../auth/userinfo.email`
  - `../auth/userinfo.profile`
  - `openid`

### **4. Configurar Test Users (IMPORTANTE)**
Si la app está en modo "Testing":
- Ve a **Test users**
- Agrega tu email y cualquier otro email que vaya a probar
- **ESTO ES CRÍTICO**: Solo usuarios en esta lista pueden autenticarse

### **5. Verificar Authorized Domains**
- Ve a **APIs & Services** → **Credentials**
- Edita el OAuth 2.0 client ID
- En **Authorized JavaScript origins**, agrega:
  ```
  https://ya-me-vi.firebaseapp.com
  https://ya-me-vi.web.app
  ```
- En **Authorized redirect URIs**, agrega:
  ```
  https://ya-me-vi.firebaseapp.com/__/auth/handler
  ```

### **6. Verificar API Keys**
- Ve a **APIs & Services** → **Credentials**
- Encuentra la API key: `AIzaSyAJYWSNUMj5aej7O9u5BwJQts7L2F6Poqw`
- Edita las restricciones:
  - **Application restrictions**: Android apps
  - **Package name**: `com.webintoapp.myapp`
  - **SHA-1**: (opcional, pero recomendado)

## 🔧 CONFIGURACIÓN WEBINTOAPP ADICIONAL

### **Obtener SHA-1 Certificate**
Si WebIntoApp te permite configurar SHA-1:

1. **Pídele a WebIntoApp el SHA-1 certificate**
2. **O usa uno de desarrollo**:
   ```
   SHA-1: DA:39:A3:EE:5E:6B:4B:0D:32:55:BF:EF:95:60:18:90:AF:D8:07:09
   ```

3. **Agrega el SHA-1 en Firebase**:
   - Firebase Console → Project Settings
   - Tu app Android → Add fingerprint
   - Pega el SHA-1

## 🚨 ERRORES COMUNES Y SOLUCIONES

### **Error: "This app isn't verified"**
- La app necesita verificación de Google
- **Solución temporal**: Agregar usuarios de prueba
- **Solución definitiva**: Someter app para verificación

### **Error: "Access blocked"**
- OAuth consent screen no configurado
- **Solución**: Completar configuración en Google Cloud Console

### **Error: "Missing initial state"**
- Package name incorrecto
- **Solución**: Verificar exactamente `com.webintoapp.myapp`

### **Error: "Popup closed by user"**
- Comportamiento normal si usuario cancela
- **Solución**: Usar redirect como fallback

## ✅ CHECKLIST FINAL

- [ ] OAuth Consent Screen configurado
- [ ] Test users agregados (si está en modo Testing)
- [ ] Authorized domains configurados
- [ ] API key restringida al package correcto
- [ ] SHA-1 certificate agregado (si está disponible)
- [ ] google-services.json subido a WebIntoApp
- [ ] Package name exacto: `com.webintoapp.myapp`

## 🧪 PROBAR LA SOLUCIÓN

1. **Después de configurar Google Cloud Console**
2. **Regenerar APK en WebIntoApp**
3. **Probar OAuth en dispositivo real**
4. **Verificar que no aparezca "missing initial state"**

---

**⚠️ IMPORTANTE**: El problema más común es que la app esté en modo "Testing" en Google Cloud Console y tu email no esté en la lista de test users.
