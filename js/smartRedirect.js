// Smart Redirect System - Direct flow from landing page to login or register
import { deviceDetector } from './deviceDetector.js';

export class SmartRedirector {
  constructor() {
    this.initialized = false;
  }

  // Inicializar el detector
  async init() {
    try {
      await deviceDetector.waitForInit();
      this.initialized = true;
      console.log('✅ SmartRedirector inicializado exitosamente');
    } catch (error) {
      console.error('❌ Error inicializando SmartRedirector:', error);
      // Establecer inicializado a true de todos modos para permitir operaciones básicas
      this.initialized = true;
      throw error;
    }
  }

  // Esperar a que esté listo
  async waitForInit() {
    if (this.initialized) return;
    
    console.log('⏳ Esperando inicialización de SmartRedirector...');
    
    // Esperar con timeout máximo de 1000ms (más tiempo para asegurar carga)
    const timeout = new Promise((resolve) => {
      setTimeout(() => {
        console.warn('⚠️ Timeout en espera de SmartRedirector, continuando de todos modos');
        this.initialized = true; // Forzar inicialización para continuar
        resolve();
      }, 1000);
    });
    
    const initPromise = new Promise(resolve => {
      const checkInit = () => {
        if (this.initialized) {
          console.log('✅ SmartRedirector ya está inicializado');
          resolve();
        } else {
          setTimeout(checkInit, 100);
        }
      };
      checkInit();
    });
    
    await Promise.race([initPromise, timeout]);
  }

  // Función principal de detección y redirección
  async determineDestination(showLoadingFn, hideLoadingFn) {
    try {
      await this.waitForInit();
      
      if (showLoadingFn) showLoadingFn('Detectando cuenta...');
      
      console.log('🔍 Iniciando detección de cuenta...');
      
      // NUEVO: Verificar si ya hay una sesión activa de Firebase
      try {
        const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
        const auth = getAuth();
        
        // Promesa para verificar estado de autenticación actual
        const checkAuthState = new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Desuscribirse inmediatamente
            resolve(user);
          });
          
          // Timeout después de 2 segundos
          setTimeout(() => {
            unsubscribe();
            resolve(null);
          }, 2000);
        });
        
        const currentUser = await checkAuthState;
        
        if (currentUser) {
          console.log('✅ Usuario ya autenticado encontrado:', currentUser.email);
          console.log('➡️ Redirigiendo directamente a home.html');
          
          return {
            destination: 'home.html',
            reason: 'already_authenticated',
            userInfo: { email: currentUser.email }
          };
        }
        
      } catch (authError) {
        console.warn('⚠️ Error verificando autenticación existente:', authError);
        // Continuar con el flujo normal si hay error
      }
      
      // Determinar el flujo según el tipo de dispositivo
      let userFlow;
      
      if (deviceDetector.isDesktop) {
        // Flujo para escritorio (directo a login con contraseña o registro)
        userFlow = await deviceDetector.determineDesktopFlow();
        console.log('🖥️ Dispositivo de escritorio detectado - usando flujo para desktop');
      } else {
        // Flujo para móviles/tablets (welcome o registro)
        userFlow = await deviceDetector.determineUserFlow();
        console.log('📱 Dispositivo móvil detectado - usando flujo estándar');
      }
      
      console.log('🔍 Flujo determinado:', userFlow);

      // Breve demora para UI
      await new Promise(resolve => setTimeout(resolve, 500));

      if (userFlow.action === 'register') {
        console.log('➡️ Usuario nuevo - redirigiendo a registro');
        return {
          destination: 'register.html',
          reason: 'new_user'
        };
      } else if (userFlow.action === 'welcome') {
        console.log('👋 Usuario existente - redirigiendo a welcome');
        return {
          destination: 'welcome.html',
          reason: 'returning_user',
          userInfo: userFlow.userInfo
        };
      } else if (userFlow.action === 'login') {
        console.log('🔑 Usuario desktop existente - redirigiendo directo a login');
        return {
          destination: 'login-email.html',
          reason: 'desktop_login',
          userInfo: userFlow.userInfo
        };
      }

    } catch (error) {
      console.error('❌ Error en detección inteligente:', error);
      
      // En caso de error, redirigir a registro por defecto
      return {
        destination: 'register.html',
        reason: 'error_fallback'
      };
    } finally {
      if (hideLoadingFn) hideLoadingFn();
    }
  }

  // Redirección directa
  async redirectToAppropriateDestination(showLoadingFn, hideLoadingFn) {
    try {
      console.log('🚀 Iniciando redirección inteligente...');
      
      // Si no está inicializado, intentar inicializar
      if (!this.initialized) {
        console.log('⚠️ SmartRedirector no inicializado, intentando inicializar ahora...');
        try {
          await this.init();
        } catch (error) {
          console.warn('No se pudo inicializar, pero continuaremos con la redirección básica');
        }
      }
      
      const destination = await this.determineDestination(showLoadingFn, hideLoadingFn);
      console.log(`✅ Destino determinado: ${destination.destination} (${destination.reason})`);
      
      // Redireccionar con pequeño retraso para que se vea el mensaje de carga
      await new Promise(resolve => setTimeout(resolve, 300));
      window.location.href = destination.destination;
      return destination;
    } catch (error) {
      console.error('❌ Error en redirección inteligente:', error);
      
      // Fallback seguro - redirigir a register.html que sabe manejar todos los casos
      if (hideLoadingFn) hideLoadingFn();
      alert('Hubo un problema al iniciar la aplicación. Redirigiendo a la página de registro...');
      window.location.href = 'register.html';
      
      return { destination: 'register.html', reason: 'error_fallback' };
    }
  }
}

// Exportar instancia única
export const smartRedirector = new SmartRedirector();
