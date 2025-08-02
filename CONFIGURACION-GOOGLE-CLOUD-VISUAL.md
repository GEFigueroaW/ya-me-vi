# 🔧 CONFIGURACIÓN GOOGLE CLOUD CONSOLE - PASO A PASO

## 📋 BASADO EN TUS CAPTURAS DE PANTALLA

He revisado tus imágenes y veo que tienes la configuración casi completa, pero faltan algunos dominios críticos.

## ⚠️ CONFIGURACIÓN FALTANTE

### **En Google Cloud Console → APIs & Services → Credentials**

#### **OAuth 2.0 Client ID Configuration**

**AGREGAR en "Orígenes autorizados de JavaScript":**
```
https://yamevi.com.mx
https://www.yamevi.com.mx
https://ya-me-vi.web.app
```

**AGREGAR en "URIs de redireccionamiento autorizados":**
```
https://yamevi.com.mx/__/auth/handler
https://yamevi.com.mx/auth-external.html  
https://ya-me-vi.web.app/__/auth/handler
https://ya-me-vi.firebaseapp.com/__/auth/handler
```

## 🔧 PASOS ESPECÍFICOS

### **1. Editar OAuth Client**
- Ve a: https://console.cloud.google.com/apis/credentials
- Proyecto: ya-me-vi
- Click en "Web client (auto created by Google Service)"
- Click "✏️ Editar"

### **2. Actualizar Orígenes JavaScript**
En la sección "Orígenes autorizados de JavaScript", asegúrate de tener:
```
http://localhost
http://localhost:5000
https://ya-me-vi.firebaseapp.com
https://yamevi.com.mx          ← AGREGAR ESTE
https://www.yamevi.com.mx      ← AGREGAR ESTE  
https://ya-me-vi.web.app       ← AGREGAR ESTE
```

### **3. Actualizar Redirect URIs**
En "URIs de redireccionamiento autorizados", asegúrate de tener:
```
https://ya-me-vi.firebaseapp.com/__/auth/handler
https://ya-me-vi.web.app/__/auth/handler
https://yamevi.com.mx/auth-external.html        ← AGREGAR ESTE
https://yamevi.com.mx/__/auth/handler           ← AGREGAR ESTE
```

### **4. Guardar Cambios**
- Click "💾 Guardar"
- Espera 5-10 minutos para que los cambios se propaguen

## 🧪 PROBAR LA CONFIGURACIÓN

### **Test 1: En Navegador Local**
1. Ve a: `http://localhost:8080/diagnostico-oauth-webintoapp.html`
2. Click "Test OAuth Flow"
3. Debe funcionar sin errores

### **Test 2: En Dominio Público**
1. Sube la app a `yamevi.com.mx`
2. Prueba OAuth desde el dominio público
3. Debe funcionar sin "unauthorized domain"

### **Test 3: En APK WebIntoApp**
1. Genera nuevo APK con la configuración actualizada
2. Instala en dispositivo Android
3. Prueba Google Sign-In
4. Debe funcionar sin "missing initial state"

## 🚨 ERRORES COMUNES Y SOLUCIONES

### **Error: "unauthorized-domain"**
- **Causa**: Falta el dominio en "Orígenes autorizados"
- **Solución**: Agregar todos los dominios donde va a funcionar la app

### **Error: "redirect_uri_mismatch"**
- **Causa**: Falta el redirect URI específico
- **Solución**: Agregar todos los redirect URIs necesarios

### **Error: "missing initial state"**
- **Causa**: Package name incorrecto en WebIntoApp
- **Solución**: Verificar exactamente `com.webintoapp.myapp`

## ✅ CHECKLIST FINAL

- [ ] Dominios agregados en Google Cloud Console
- [ ] Redirect URIs actualizados
- [ ] Cambios guardados (esperar 5-10 min)
- [ ] Probar en navegador local
- [ ] Probar en dominio público
- [ ] Generar nuevo APK en WebIntoApp
- [ ] Probar OAuth en APK

---

**🎯 RESULTADO ESPERADO**: OAuth debería funcionar perfectamente en todos los entornos (navegador, dominio público, APK WebIntoApp) sin errores de dominio o estado.
