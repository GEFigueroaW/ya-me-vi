// Fix OAuth APK - Prevenir errores de "missing initial state" en entornos APK
export function fixOAuthAPK() {
  
  // Detectar entorno APK/WebView
  function isAPKEnvironment() {
    const ua = navigator.userAgent.toLowerCase();
    const isWebView = /wv|webview|webintoapp/i.test(ua);
    const isAndroid = /android/i.test(ua);
    
    // Verificar sessionStorage
    let hasSessionStorage = false;
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      hasSessionStorage = true;
    } catch {
      hasSessionStorage = false;
    }
    
    return {
      isAPK: isWebView && isAndroid,
      isWebView,
      isAndroid,
      hasSessionStorage,
      userAgent: ua
    };
  }

  // Deshabilitar OAuth en entornos problemáticos
  function disableOAuthIfNeeded() {
    const env = isAPKEnvironment();
    
    console.log('🔍 Verificando compatibilidad OAuth:', env);
    
    if (env.isAPK || !env.hasSessionStorage) {
      console.log('⚠️ Entorno APK/WebView detectado - deshabilitando OAuth');
      
      // Encontrar y deshabilitar botones de Google OAuth
      const googleButtons = document.querySelectorAll('[id*="loginWithGoogle"], [id*="google"], button[class*="google"]');
      
      googleButtons.forEach(button => {
        if (button.textContent.toLowerCase().includes('google') || 
            button.textContent.toLowerCase().includes('continuar con google')) {
          
          console.log('🚫 Deshabilitando botón OAuth:', button.textContent);
          
          // Deshabilitar botón
          button.disabled = true;
          button.style.opacity = '0.5';
          button.style.cursor = 'not-allowed';
          
          // Cambiar texto
          const btnText = button.querySelector('.btn-text') || button;
          btnText.textContent = '❌ No disponible en APK';
          
          // Agregar evento para mostrar mensaje
          button.onclick = (e) => {
            e.preventDefault();
            alert('La autenticación con Google no está disponible en la aplicación APK. Por favor, usa tu email y contraseña para iniciar sesión.');
          };
        }
      });
      
      // Mostrar mensaje informativo
      showAPKWarning();
    }
  }

  // Mostrar advertencia para usuarios APK
  function showAPKWarning() {
    const warningHTML = `
      <div id="apkOAuthWarning" class="bg-orange-500/20 border border-orange-400 text-orange-100 px-4 py-3 rounded-lg mb-4">
        <div class="flex items-center">
          <span class="text-xl mr-2">⚠️</span>
          <div>
            <strong>Aplicación APK detectada</strong>
            <p class="text-sm mt-1">
              La autenticación con Google no está disponible en esta versión. 
              Por favor, usa tu email y contraseña para iniciar sesión.
            </p>
          </div>
        </div>
      </div>
    `;
    
    // Insertar warning después del logo
    const container = document.querySelector('.glass-effect, .max-w-md, form') || document.body;
    if (container && !document.getElementById('apkOAuthWarning')) {
      const logoDiv = container.querySelector('div:first-child') || container.firstElementChild;
      if (logoDiv) {
        logoDiv.insertAdjacentHTML('afterend', warningHTML);
      }
    }
  }

  // Interceptar errores de OAuth
  function interceptOAuthErrors() {
    // Interceptar errores globales
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message && 
          event.error.message.includes('missing initial state')) {
        
        console.error('🚫 Error OAuth interceptado:', event.error.message);
        
        // Mostrar mensaje amigable
        alert('Error de autenticación detectado. En aplicaciones APK, por favor usa tu email y contraseña en lugar de "Continuar con Google".');
        
        // Prevenir que el error se propague
        event.preventDefault();
      }
    });

    // Interceptar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && 
          event.reason.message.includes('missing initial state')) {
        
        console.error('🚫 Error OAuth Promise interceptado:', event.reason.message);
        
        // Mostrar mensaje amigable
        alert('Error de autenticación detectado. En aplicaciones APK, por favor usa tu email y contraseña en lugar de "Continuar con Google".');
        
        // Prevenir que el error se propague
        event.preventDefault();
      }
    });
  }

  // Función principal de inicialización
  function init() {
    console.log('🔧 Inicializando fix para OAuth APK...');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        disableOAuthIfNeeded();
        interceptOAuthErrors();
      });
    } else {
      disableOAuthIfNeeded();
      interceptOAuthErrors();
    }
    
    // También ejecutar después de un breve delay para asegurar que todos los elementos estén cargados
    setTimeout(() => {
      disableOAuthIfNeeded();
    }, 1000);
  }

  // Ejecutar inmediatamente
  init();

  // Retornar funciones útiles
  return {
    isAPKEnvironment,
    disableOAuthIfNeeded,
    showAPKWarning,
    interceptOAuthErrors
  };
}

// Auto-ejecutar si se incluye como módulo
if (typeof window !== 'undefined') {
  // Ejecutar automáticamente
  fixOAuthAPK();
}
