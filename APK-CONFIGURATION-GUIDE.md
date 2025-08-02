# Guía de Configuración APK para YA ME VI

## Problemas Identificados y Soluciones

### 1. Error "Unable to process request due to missing initial state"

**Causa:** WebView no tiene estado inicial configurado para Firebase Auth
**Solución:** Implementado en `index-apk-compatible.html` y `js/firebase-init-apk.js`

#### Configuraciones aplicadas:
- Inicialización de localStorage con estado inicial
- Persistencia local para Firebase Auth
- Detección automática de entorno APK/WebView
- Configuración específica para WebIntoApp

### 2. Problemas de Dominio en Firebase

**Dominios que deben estar configurados en Firebase Console:**

#### En Authentication > Settings > Authorized domains:
```
localhost
127.0.0.1
yamevi.com.mx
ya-me-vi.firebaseapp.com
ya-me-vi.web.app
gefigueiroaw.github.io
webintoapp.com
file://
```

#### Configuración específica para WebIntoApp:
```
*.webintoapp.com
app://localhost
app://yamevi.com.mx
```

### 3. Configuración OAuth para Google Sign-In

#### Dominios autorizados para OAuth:
```
https://yamevi.com.mx
https://ya-me-vi.firebaseapp.com
https://ya-me-vi.web.app
https://gefigueiroaw.github.io
```

#### URI de redirección autorizadas:
```
https://yamevi.com.mx/__/auth/handler
https://ya-me-vi.firebaseapp.com/__/auth/handler
https://ya-me-vi.web.app/__/auth/handler
https://gefigueiroaw.github.io/ya-me-vi/__/auth/handler
```

### 4. Configuración en WebIntoApp

#### URL Principal:
```
https://yamevi.com.mx
```

#### Configuraciones recomendadas:
- ✅ Habilitar JavaScript
- ✅ Habilitar Local Storage
- ✅ Habilitar Session Storage
- ✅ Habilitar cookies
- ✅ Habilitar geolocalización (opcional)
- ✅ Modo pantalla completa
- ❌ Desactivar zoom (configurado en CSS)

#### Configuraciones de seguridad:
- Permitir HTTP y HTTPS
- Permitir dominios externos para Firebase
- Configurar User-Agent personalizado (opcional)

### 5. Archivos APK-Compatible Creados

#### Archivos principales:
- `index-apk-compatible.html` - Página principal optimizada
- `login-apk-compatible.html` - Login con detección de WebView
- `js/firebase-init-apk.js` - Firebase optimizado para APK

#### Mejoras implementadas:
- Detección automática de entorno WebView/APK
- Inicialización robusta de estado
- Manejo de errores específicos para APK
- Persistencia mejorada para autenticación
- Navegación segura entre páginas

### 6. Pasos para Resolución Completa

#### En Firebase Console:
1. Ir a Authentication > Settings
2. Agregar todos los dominios listados arriba
3. Verificar que OAuth esté configurado correctamente
4. Asegurar que las reglas de Firestore permitan acceso

#### En WebIntoApp:
1. Usar `https://yamevi.com.mx` como URL principal
2. Habilitar todas las configuraciones recomendadas
3. Generar nueva APK después de los cambios

#### Archivos a usar:
- Reemplazar `index.html` con `index-apk-compatible.html`
- Usar `login-apk-compatible.html` para login
- Importar `js/firebase-init-apk.js` en lugar del archivo normal

### 7. Testing y Verificación

#### Para verificar en navegador:
```javascript
// Abrir consola del navegador y ejecutar:
console.log('Entorno:', {
  isWebView: !window.chrome,
  isApp: navigator.userAgent.includes('webintoapp'),
  localStorage: typeof Storage !== 'undefined',
  sessionStorage: typeof sessionStorage !== 'undefined'
});
```

#### Para verificar Firebase:
```javascript
// En consola del navegador:
import { auth } from './js/firebase-init-apk.js';
console.log('Firebase Auth:', auth);
console.log('Current user:', auth.currentUser);
```

### 8. Notas Importantes

- El error "missing initial state" se debe a que WebView no preserva el estado entre recargas
- La autenticación con Google puede requerir redirect en lugar de popup en APK
- Los dominios file:// y app:// son necesarios para APKs
- La persistencia local es crucial para mantener sesiones en WebView

### 9. Monitoreo y Debug

#### Logs importantes a verificar:
- `🚀 Firebase APK-compatible inicializado`
- `✅ Estado inicial configurado`
- `📱 Configurando para entorno APK/WebView`
- `🔍 Entorno detectado: {isApp: true}`

#### Errores comunes a resolver:
- `auth/unauthorized-domain` → Agregar dominio a Firebase
- `auth/popup-blocked` → Usar redirect en lugar de popup
- `missing initial state` → Verificar localStorage inicialización

## Implementación Final

Para implementar la solución completa:

1. **Actualizar Firebase Console** con los dominios listados
2. **Reemplazar archivos** con las versiones APK-compatible
3. **Regenerar APK** en WebIntoApp con la nueva configuración
4. **Probar en dispositivo real** para verificar funcionamiento

La configuración actual debería resolver todos los problemas identificados en las imágenes compartidas.
