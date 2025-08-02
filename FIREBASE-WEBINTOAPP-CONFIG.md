# 🔧 GUÍA: Configurar Firebase para WebIntoApp

## ❗ PROBLEMA CRÍTICO IDENTIFICADO

El **Android package name** en Firebase debe ser `com.webintoapp.myapp` para que funcione correctamente con WebIntoApp, pero actualmente está configurado como `com.gefiguw.yamevi`.

## 📋 PASOS PARA SOLUCIONARLO

### 1. **Ir a Firebase Console**
- Abre: https://console.firebase.google.com/
- Selecciona el proyecto: **ya-me-vi**
- Ve a **⚙️ Project Settings**

### 2. **Agregar Nueva App Android**
- En la sección "Your apps", haz clic en **+ Add app**
- Selecciona **Android**
- Usa estos datos:
  ```
  Android package name: com.webintoapp.myapp
  App nickname: YA-ME-VI WebIntoApp
  Debug signing certificate SHA-1: (opcional por ahora)
  ```

### 3. **Descargar google-services.json**
- Firebase generará un nuevo `google-services.json`
- **¡IMPORTANTE!** Este archivo debe tener:
  ```json
  "android_client_info": {
    "package_name": "com.webintoapp.myapp"
  }
  ```

### 4. **Configurar OAuth**
- Ve a **Authentication** → **Sign-in method**
- En **Google**, asegúrate de que esté habilitado
- Verifica que el **Web client ID** esté configurado
- Agrega los dominios autorizados:
  ```
  ya-me-vi.firebaseapp.com
  localhost (para pruebas)
  ```

### 5. **Actualizar Archivo en Proyecto**
- Reemplaza el archivo `google-services.json` actual
- O créalo como `google-services-webintoapp.json`

## 🔍 VERIFICACIÓN

Para verificar que está bien configurado, el archivo debe contener:

```json
{
  "client": [
    {
      "client_info": {
        "android_client_info": {
          "package_name": "com.webintoapp.myapp"  ← ESTO ES CRÍTICO
        }
      }
    }
  ]
}
```

## 🚀 DESPUÉS DE LA CONFIGURACIÓN

1. Actualiza el archivo en el proyecto
2. Prueba la autenticación en: `http://localhost:8080/test-apk-auth.html`
3. Si funciona, prueba en WebIntoApp

## 📱 CONFIGURACIÓN WEBINTOAPP

En la configuración de WebIntoApp, asegúrate de usar:
- **Package Name**: `com.webintoapp.myapp`
- **App Name**: `YA-ME-VI`
- **Min SDK**: 21 o superior

## ❓ SI SIGUE FALLANDO

1. Verifica que el package name sea exactamente `com.webintoapp.myapp`
2. Confirma que el OAuth client esté habilitado para Android
3. Revisa que el authDomain sea `ya-me-vi.firebaseapp.com`
4. Prueba primero en navegador web para descartar problemas de configuración

---

⚠️ **NOTA**: El package name `com.webintoapp.myapp` es estándar para todas las apps creadas con WebIntoApp. No puede ser personalizado.
