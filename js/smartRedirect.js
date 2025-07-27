// Smart Redirect System - Direct flow from landing page to login or register
import { deviceDetector } from './deviceDetector.js';

export class SmartRedirector {
  constructor() {
    this.initialized = false;
  }

  // Inicializar el detector
  async init() {
    await deviceDetector.waitForInit();
    this.initialized = true;
  }

  // Esperar a que esté listo
  async waitForInit() {
    if (this.initialized) return;
    
    // Esperar con timeout máximo de 300ms para ser más rápido
    const timeout = new Promise(resolve => setTimeout(resolve, 300));
    const initPromise = new Promise(resolve => {
      const checkInit = () => {
        if (this.initialized) {
          resolve();
        } else {
          setTimeout(checkInit, 50);
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
    const destination = await this.determineDestination(showLoadingFn, hideLoadingFn);
    window.location.href = destination.destination;
    return destination;
  }
}

// Exportar instancia única
export const smartRedirector = new SmartRedirector();
