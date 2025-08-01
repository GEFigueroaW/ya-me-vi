// Sistema de Autenticación Móvil Nativo
// Diseñado específicamente para entornos móviles problemáticos

class MobileAuthSystem {
  constructor() {
    this.isInitialized = false;
    this.authMethods = {
      email: true,
      google: false, // Deshabilitado por defecto hasta resolver configuración
      popup: false,
      redirect: false // Problemático en móviles
    };
    
    this.deviceInfo = this.analyzeDevice();
    this.init();
  }
  
  analyzeDevice() {
    const userAgent = navigator.userAgent;
    
    return {
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isWebView: this.detectWebView(userAgent),
      isStandalone: window.navigator.standalone === true,
      platform: this.detectPlatform(userAgent),
      browser: this.detectBrowser(userAgent),
      supportPopups: this.testPopupSupport(),
      cookiesEnabled: navigator.cookieEnabled,
      supportsLocalStorage: this.testLocalStorage()
    };
  }
  
  detectWebView(userAgent) {
    const webViewPatterns = [
      /webview/i,
      /webintoapp/i,
      // Android WebView sin Chrome completo
      /android.*version.*chrome/i && !userAgent.includes('Chrome/'),
      // iOS WebView
      /iPhone|iPad/.test(userAgent) && window.navigator.standalone === false && !userAgent.includes('Safari/')
    ];
    
    return webViewPatterns.some(pattern => 
      typeof pattern === 'boolean' ? pattern : pattern.test(userAgent)
    );
  }
  
  detectPlatform(userAgent) {
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/Windows Phone/i.test(userAgent)) return 'Windows Phone';
    return 'Desktop';
  }
  
  detectBrowser(userAgent) {
    if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) return 'Chrome';
    if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) return 'Safari';
    if (userAgent.includes('Firefox/')) return 'Firefox';
    if (userAgent.includes('Edg/')) return 'Edge';
    return 'Unknown';
  }
  
  testPopupSupport() {
    try {
      const popup = window.open('', 'test', 'width=1,height=1');
      if (popup) {
        popup.close();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  
  testLocalStorage() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  init() {
    console.log('🔧 Inicializando Sistema de Auth Móvil Nativo');
    console.log('📱 Dispositivo:', this.deviceInfo);
    
    // Determinar métodos de auth disponibles
    this.determineAvailableMethods();
    
    this.isInitialized = true;
    console.log('✅ Métodos disponibles:', this.authMethods);
  }
  
  determineAvailableMethods() {
    // Email/Password siempre disponible
    this.authMethods.email = true;
    
    // Google Auth solo si no es WebView problemático
    if (!this.deviceInfo.isWebView || this.deviceInfo.supportPopups) {
      this.authMethods.google = true;
      this.authMethods.popup = this.deviceInfo.supportPopups;
    }
    
    // Redirect problemático en móviles, especialmente WebViews
    this.authMethods.redirect = !this.deviceInfo.isMobile || 
                               (!this.deviceInfo.isWebView && this.deviceInfo.platform === 'iOS');
  }
  
  // Método principal de autenticación
  async authenticate(method, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Sistema no inicializado');
    }
    
    console.log(`🔐 Intentando autenticación: ${method}`);
    
    switch (method) {
      case 'email':
        return this.emailAuth(options);
      case 'google':
        return this.googleAuth(options);
      case 'google-popup':
        return this.googlePopupAuth(options);
      case 'google-newTab':
        return this.googleNewTabAuth(options);
      default:
        throw new Error(`Método no soportado: ${method}`);
    }
  }
  
  async emailAuth({ email, password, action = 'login' }) {
    if (!email || !password) {
      throw new Error('Email y contraseña requeridos');
    }
    
    console.log(`📧 Autenticación email: ${action}`);
    
    // Aquí se integraría con Firebase Auth
    // Por ahora retornamos una promesa simulada
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email.includes('@') && password.length >= 6) {
          resolve({
            success: true,
            method: 'email',
            user: { email, displayName: email.split('@')[0] }
          });
        } else {
          reject(new Error('Credenciales inválidas'));
        }
      }, 1000);
    });
  }
  
  async googleAuth(options = {}) {
    if (!this.authMethods.google) {
      throw new Error('Google Auth no disponible en este dispositivo');
    }
    
    // Decidir estrategia basada en dispositivo
    if (this.deviceInfo.isWebView || !this.deviceInfo.supportPopups) {
      return this.googleNewTabAuth(options);
    } else {
      return this.googlePopupAuth(options);
    }
  }
  
  async googlePopupAuth(options = {}) {
    console.log('🪟 Intentando Google Auth con popup');
    
    if (!this.authMethods.popup) {
      throw new Error('Popups no soportados');
    }
    
    // Implementación del popup
    return new Promise((resolve, reject) => {
      const popup = window.open(
        'about:blank',
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        reject(new Error('No se pudo abrir popup'));
        return;
      }
      
      // Simular proceso de auth
      setTimeout(() => {
        popup.close();
        resolve({
          success: true,
          method: 'google-popup',
          user: { email: 'user@gmail.com', displayName: 'Usuario Google' }
        });
      }, 3000);
    });
  }
  
  async googleNewTabAuth(options = {}) {
    console.log('🌐 Intentando Google Auth con nueva pestaña');
    
    return new Promise((resolve, reject) => {
      // Configurar listener para mensajes del callback
      const messageHandler = (event) => {
        if (event.origin !== window.location.origin) return;
        
        window.removeEventListener('message', messageHandler);
        
        if (event.data.type === 'auth-success') {
          resolve({
            success: true,
            method: 'google-newTab',
            user: { email: 'user@gmail.com', displayName: 'Usuario Google' },
            code: event.data.code
          });
        } else if (event.data.type === 'auth-error') {
          reject(new Error(event.data.error));
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Abrir nueva pestaña
      const authUrl = this.buildGoogleAuthUrl();
      const newTab = window.open(authUrl, '_blank');
      
      if (!newTab) {
        window.removeEventListener('message', messageHandler);
        reject(new Error('No se pudo abrir nueva pestaña'));
        return;
      }
      
      // Timeout de 60 segundos
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        if (!newTab.closed) {
          newTab.close();
        }
        reject(new Error('Timeout de autenticación'));
      }, 60000);
    });
  }
  
  buildGoogleAuthUrl() {
    // Esta URL necesita el Client ID real de Google
    const params = new URLSearchParams({
      client_id: '748876890843-YOUR_REAL_CLIENT_ID.apps.googleusercontent.com',
      redirect_uri: `${window.location.origin}/google-callback.html`,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'online',
      prompt: 'select_account'
    });
    
    return `https://accounts.google.com/oauth/v2/auth?${params}`;
  }
  
  // Métodos de diagnóstico
  generateDiagnosticReport() {
    return {
      timestamp: new Date().toISOString(),
      device: this.deviceInfo,
      authMethods: this.authMethods,
      browserCapabilities: {
        localStorage: this.deviceInfo.supportsLocalStorage,
        cookies: this.deviceInfo.cookiesEnabled,
        popups: this.deviceInfo.supportPopups,
        webGL: !!window.WebGLRenderingContext,
        serviceWorker: 'serviceWorker' in navigator
      },
      networkInfo: {
        online: navigator.onLine,
        connection: navigator.connection?.effectiveType || 'unknown'
      }
    };
  }
  
  logDiagnostic() {
    const report = this.generateDiagnosticReport();
    console.log('🔍 Reporte de diagnóstico completo:', report);
    return report;
  }
}

// Instancia global
window.MobileAuthSystem = MobileAuthSystem;

// Auto-inicialización si estamos en móvil
if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  window.mobileAuth = new MobileAuthSystem();
  console.log('📱 Sistema de Auth Móvil activado automáticamente');
}

export default MobileAuthSystem;
