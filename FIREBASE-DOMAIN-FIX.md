## 🚨 Firebase Authentication Error - Solución

### **Error actual:**
```
Firebase: Error (auth/unauthorized-domain)
Domain: yamevi.com.mx
```

### **Causa:**
El dominio `yamevi.com.mx` no está autorizado en Firebase Authentication para realizar operaciones de login con Google.

### **Solución paso a paso:**

#### 1. **Acceder a Firebase Console:**
- URL: https://console.firebase.google.com/
- Proyecto: **ya-me-vi**

#### 2. **Navegar a configuración de Authentication:**
- Menú lateral: **Authentication**
- Pestaña: **Settings**
- Sección: **Authorized domains**

#### 3. **Agregar dominio autorizado:**
- Clic en **"Add domain"**
- Ingresar: `yamevi.com.mx`
- Clic en **"Add"**

#### 4. **Dominios que deben estar autorizados:**
```
✅ localhost (desarrollo)
✅ 127.0.0.1 (desarrollo local)
✅ ya-me-vi.firebaseapp.com (dominio por defecto)
✅ yamevi.com.mx (dominio personalizado)
```

#### 5. **Verificación adicional - Google OAuth:**
Si usas Google OAuth, también verificar en:
- Google Cloud Console
- APIs & Services > Credentials
- OAuth 2.0 Client ID
- Authorized JavaScript origins: agregar `https://yamevi.com.mx`

### **Notas importantes:**
- Los cambios pueden tardar hasta 5 minutos en propagarse
- Asegúrate de usar HTTPS en producción
- El dominio debe coincidir exactamente (sin www, etc.)

### **Testing después del cambio:**
1. Refrescar la página
2. Intentar login con Google nuevamente
3. Verificar en DevTools que no aparezcan errores de dominio

---
**Status**: ⏳ Pendiente de configuración en Firebase Console
