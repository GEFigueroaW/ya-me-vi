# 🔧 Guía de Verificación y Configuración Firebase

## 📋 **Checklist de configuración para Google Auth en móviles**

### **1. Verificar dominios autorizados en Firebase** ✅

Ve a [Firebase Console](https://console.firebase.google.com/) → Proyecto: `ya-me-vi`

#### **Authentication → Settings → Authorized domains**
Asegúrate de que estén configurados:
```
✅ localhost
✅ 127.0.0.1  
✅ ya-me-vi.firebaseapp.com
✅ yamevi.com.mx
✅ www.yamevi.com.mx (si usas www)
```

### **2. Verificar Google OAuth Configuration** ✅

#### **Google Cloud Console:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona proyecto: `ya-me-vi`
3. APIs & Services → Credentials
4. Busca tu OAuth 2.0 Client ID

#### **Authorized JavaScript origins:**
```
✅ https://yamevi.com.mx
✅ https://www.yamevi.com.mx
✅ https://ya-me-vi.firebaseapp.com
✅ http://localhost (para desarrollo)
✅ http://127.0.0.1 (para desarrollo)
```

#### **Authorized redirect URIs:**
```
✅ https://yamevi.com.mx/__/auth/handler
✅ https://www.yamevi.com.mx/__/auth/handler
✅ https://ya-me-vi.firebaseapp.com/__/auth/handler
✅ http://localhost/__/auth/handler
```

### **3. Configuración específica para móviles** 📱

#### **En Firebase Console → Authentication → Sign-in method → Google:**
- ✅ Habilitado
- ✅ Web SDK configuration correcta
- ✅ Support email configurado

#### **Configuraciones avanzadas recomendadas:**
```javascript
// En tu código, asegúrate de tener:
provider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'online',
  include_granted_scopes: 'true',
  display: 'touch' // Importante para móviles
});
```

### **4. Verificar manifest.json para PWA** 📱

Tu `manifest.json` debe tener:
```json
{
  "start_url": "index.html",
  "display": "standalone",
  "scope": "."
}
```

### **5. Verificar meta tags para móviles** 📱

En tu HTML, asegúrate de tener:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
```

### **6. Probar diferentes escenarios** 🧪

#### **Usa el archivo de prueba:**
```bash
# Abre en tu servidor local
https://yamevi.com.mx/test-mobile-auth.html
```

#### **Escenarios a probar:**
- ✅ Chrome Android normal
- ✅ Safari iOS normal  
- ✅ Chrome Android WebView
- ✅ Safari iOS WebView
- ✅ WebIntoApp
- ✅ PWA instalada

### **7. Logs de diagnóstico** 📋

#### **Verificar en console del móvil:**
```javascript
// Deberías ver logs como:
"📱 Mobile Auth Optimizer iniciado"
"📊 Diagnóstico del dispositivo: ..."
"🚀 Iniciando autenticación optimizada..."
```

#### **Errores comunes y soluciones:**

**Error: `auth/unauthorized-domain`**
- ✅ Verificar dominios autorizados
- ✅ Esperar 5 minutos para propagación

**Error: `auth/popup-blocked`**
- ✅ El sistema debería hacer fallback automático
- ✅ Verificar que se abre navegador externo

**Error: `auth/operation-not-supported-in-this-environment`**
- ✅ Verificar detección de WebView
- ✅ Confirmar que usa navegador externo

### **8. Comandos de terminal para testing** 💻

#### **Verificar configuración actual:**
```powershell
# Ver archivos de configuración
Get-Content manifest.json | Select-String "start_url|display"
Get-Content firebase.json | Select-String "hosting"
```

#### **Probar en diferentes puertos:**
```powershell
# Si usas servidor local diferente
python -m http.server 8080
# o
npx serve -l 8080
```

### **9. Configuración de headers para móviles** 🌐

Si usas servidor propio, asegúrate de tener:
```
X-Frame-Options: ALLOWALL
Content-Security-Policy: frame-ancestors *
```

### **10. Verificación final** ✅

#### **Checklist antes de deployment:**
- [ ] Dominios Firebase configurados
- [ ] Google OAuth configurado  
- [ ] Mobile auth optimizer implementado
- [ ] Test en diferentes dispositivos
- [ ] Logs de error monitoreados
- [ ] Fallbacks funcionando

---

## 🚨 **Si sigues teniendo problemas:**

1. **Revisa los logs específicos** del dispositivo problemático
2. **Prueba el archivo test-mobile-auth.html** en el dispositivo
3. **Verifica la configuración paso a paso** con esta guía
4. **Contacta con los logs específicos** del error

## 📞 **Información de soporte:**
- Firebase Project ID: `ya-me-vi`
- Auth Domain: `ya-me-vi.firebaseapp.com`  
- Custom Domain: `yamevi.com.mx`
