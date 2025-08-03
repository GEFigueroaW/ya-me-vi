// SOLUCIÓN DEFINITIVA APK - Deshabilitación completa de OAuth Google
// Este script debe cargarse ANTES que cualquier código de Firebase Auth

(function() {
  'use strict';
  
  console.log('🔧 [APK-OAUTH-KILLER] Iniciando solución definitiva...');
  
  // Detectar entorno APK de forma robusta
  function isAPKEnvironment() {
    const ua = navigator.userAgent.toLowerCase();
    const isWebView = /wv|webview|webintoapp/i.test(ua);
    const isAndroid = /android/i.test(ua);
    const hasLimitedStorage = !window.sessionStorage || !window.localStorage;
    
    // Detectores específicos de WebIntoApp
    const isWebIntoApp = /webintoapp/i.test(ua) || 
                        window.navigator.userAgent.includes('WebIntoApp') ||
                        document.querySelector('meta[name="generator"][content*="WebIntoApp"]');
    
    return {
      isAPK: isWebView && isAndroid,
      isWebIntoApp,
      hasLimitedStorage,
      shouldDisableOAuth: isWebView || isAndroid || hasLimitedStorage || isWebIntoApp
    };
  }

  const env = isAPKEnvironment();
  console.log('🔍 [APK-OAUTH-KILLER] Entorno detectado:', env);

  if (env.shouldDisableOAuth) {
    console.log('🚫 [APK-OAUTH-KILLER] Entorno APK/WebView detectado - DESHABILITANDO OAuth completamente');
    
    // 1. INTERCEPTAR y BLOQUEAR todas las funciones de Firebase OAuth
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && (
        url.includes('accounts.google.com') ||
        url.includes('oauth') ||
        url.includes('auth/handler') ||
        url.includes('signInWith')
      )) {
        console.log('🚫 [APK-OAUTH-KILLER] Bloqueando petición OAuth:', url);
        return Promise.reject(new Error('OAuth deshabilitado en APK'));
      }
      return originalFetch.apply(this, args);
    };

    // 2. SOBRESCRIBIR métodos problemáticos de Firebase Auth
    let firebaseAuthOverrideApplied = false;
    
    function overrideFirebaseAuth() {
      if (firebaseAuthOverrideApplied) return;
      
      // Esperar a que Firebase se cargue
      const checkFirebase = setInterval(() => {
        if (window.firebase || window.getAuth) {
          console.log('🔥 [APK-OAUTH-KILLER] Firebase detectado - aplicando overrides...');
          
          // Override signInWithRedirect
          if (window.signInWithRedirect) {
            const originalSignInWithRedirect = window.signInWithRedirect;
            window.signInWithRedirect = function() {
              console.log('🚫 [APK-OAUTH-KILLER] signInWithRedirect bloqueado');
              throw new Error('signInWithRedirect no disponible en APK. Usa email/contraseña.');
            };
          }
          
          // Override signInWithPopup para que falle inmediatamente
          if (window.signInWithPopup) {
            const originalSignInWithPopup = window.signInWithPopup;
            window.signInWithPopup = function() {
              console.log('🚫 [APK-OAUTH-KILLER] signInWithPopup bloqueado en APK');
              throw new Error('OAuth no disponible en APK. Usa email/contraseña para iniciar sesión.');
            };
          }
          
          firebaseAuthOverrideApplied = true;
          clearInterval(checkFirebase);
        }
      }, 100);
      
      // Timeout después de 5 segundos
      setTimeout(() => {
        clearInterval(checkFirebase);
        if (!firebaseAuthOverrideApplied) {
          console.log('⚠️ [APK-OAUTH-KILLER] Firebase no detectado después de 5s');
        }
      }, 5000);
    }

    // 3. REMOVER/OCULTAR botones de Google OAuth
    function removeOAuthButtons() {
      const selectors = [
        '[id*="google"]',
        '[id*="Google"]',
        '[class*="google"]',
        'button[onclick*="google"]',
        'button[onclick*="Google"]',
        'a[href*="google"]',
        '*[data-provider="google"]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element.textContent.toLowerCase().includes('google') ||
              element.textContent.toLowerCase().includes('continuar con google')) {
            
            console.log('🗑️ [APK-OAUTH-KILLER] Removiendo botón OAuth:', element.textContent);
            
            // Remover completamente el elemento
            element.remove();
          }
        });
      });
    }

    // 4. MOSTRAR mensaje explicativo
    function showAPKMessage() {
      // Buscar contenedor principal
      const containers = [
        document.querySelector('.glass-effect'),
        document.querySelector('.max-w-md'),
        document.querySelector('main'),
        document.querySelector('.container'),
        document.body
      ].filter(Boolean);
      
      if (containers.length > 0) {
        const container = containers[0];
        
        // Crear mensaje
        const apkMessage = document.createElement('div');
        apkMessage.id = 'apk-oauth-message';
        apkMessage.innerHTML = `
          <div style="
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            text-align: center;
            font-weight: bold;
            border: 2px solid #ff8c42;
            box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
          ">
            <div style="font-size: 24px; margin-bottom: 8px;">📱</div>
            <div style="font-size: 16px; margin-bottom: 8px;">
              <strong>Aplicación APK Detectada</strong>
            </div>
            <div style="font-size: 14px; line-height: 1.4;">
              El botón "Continuar con Google" no funciona en aplicaciones APK.<br>
              <strong>Por favor, usa tu email y contraseña para iniciar sesión.</strong>
            </div>
            <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">
              Si no tienes cuenta, haz clic en "Crear cuenta"
            </div>
          </div>
        `;
        
        // Insertar al principio del contenedor
        container.insertBefore(apkMessage, container.firstChild);
      }
    }

    // 5. EJECUTAR todas las funciones
    function executeAPKFixes() {
      console.log('⚡ [APK-OAUTH-KILLER] Ejecutando todas las correcciones...');
      
      overrideFirebaseAuth();
      removeOAuthButtons();
      showAPKMessage();
      
      // Volver a ejecutar después de que se cargue el contenido
      setTimeout(() => {
        removeOAuthButtons();
        if (!document.getElementById('apk-oauth-message')) {
          showAPKMessage();
        }
      }, 1000);
      
      // Y una vez más después de 3 segundos por si acaso
      setTimeout(() => {
        removeOAuthButtons();
      }, 3000);
    }

    // EJECUTAR cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', executeAPKFixes);
    } else {
      executeAPKFixes();
    }
    
    // También ejecutar inmediatamente
    setTimeout(executeAPKFixes, 100);
    
    console.log('✅ [APK-OAUTH-KILLER] Solución definitiva aplicada');
  } else {
    console.log('✅ [APK-OAUTH-KILLER] Entorno web normal - OAuth disponible');
  }
  
})();
