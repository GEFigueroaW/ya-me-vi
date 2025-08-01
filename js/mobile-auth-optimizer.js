// Optimizador de autenticación para dispositivos móviles
// Archivo: js/mobile-auth-optimizer.js

export class MobileAuthOptimizer {
  
  constructor() {
    this.initializeDetection();
  }
  
  initializeDetection() {
    this.userAgent = navigator.userAgent.toLowerCase();
    this.isMobileDevice = this.detectMobileDevice();
    this.isWebView = this.detectWebView();
    this.isIOSWebView = this.detectIOSWebView();
    this.isAndroidWebView = this.detectAndroidWebView();
    this.isWebIntoApp = this.detectWebIntoApp();
    
    console.log('📱 Mobile Auth Optimizer iniciado:', {
      isMobileDevice: this.isMobileDevice,
      isWebView: this.isWebView,
      isIOSWebView: this.isIOSWebView,
      isAndroidWebView: this.isAndroidWebView,
      isWebIntoApp: this.isWebIntoApp,
      userAgent: this.userAgent.substring(0, 100)
    });
  }
  
  detectMobileDevice() {
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(this.userAgent);
  }
  
  detectWebView() {
    // Detección mejorada de WebView
    const webViewIndicators = [
      // Android WebView
      (/android.*version.*chrome/i.test(this.userAgent) && !this.userAgent.includes('chrome/')),
      // iOS WebView (mejorado)
      (window.navigator.standalone === false && /iphone|ipad/i.test(this.userAgent) && !this.userAgent.includes('safari/')),
      // Apps específicas
      /facebook|instagram|twitter|linkedin|webview|wv/i.test(this.userAgent),
      // WebIntoApp específico
      this.detectWebIntoApp(),
      // Otras características
      !!(window.ReactNativeWebView || window.Android || (window.webkit && window.webkit.messageHandlers))
    ];
    
    return webViewIndicators.some(indicator => indicator);
  }
  
  detectIOSWebView() {
    return /iphone|ipad/i.test(this.userAgent) && 
           window.navigator.standalone === false && 
           !this.userAgent.includes('safari/');
  }
  
  detectAndroidWebView() {
    return /android/i.test(this.userAgent) && 
           /version.*chrome/i.test(this.userAgent) && 
           !this.userAgent.includes('chrome/');
  }
  
  detectWebIntoApp() {
    return this.userAgent.includes('webintoapp') || 
           window.location.href.includes('webintoapp') ||
           !!(window.WEBINTOAPP);
  }
  
  shouldUseRedirectAuth() {
    // Usar redirect en lugar de popup en estos casos:
    return this.isMobileDevice || 
           this.isWebView || 
           this.isIOSWebView || 
           this.isAndroidWebView ||
           this.isWebIntoApp ||
           // Viewport muy pequeño (probable móvil)
           window.innerWidth < 500;
  }
  
  shouldUseExternalBrowser() {
    // Usar navegador externo en casos específicos
    return this.isWebIntoApp || 
           this.isIOSWebView ||
           (this.isAndroidWebView && this.userAgent.includes('webview'));
  }
  
  async optimizedGoogleAuth(auth, GoogleAuthProvider) {
    console.log('🚀 Iniciando autenticación optimizada para móvil...');
    
    const provider = new GoogleAuthProvider();
    
    // Configuración optimizada del provider
    provider.setCustomParameters({
      prompt: 'select_account',
      access_type: 'online',
      include_granted_scopes: 'true',
      // Importante para móviles
      display: this.isMobileDevice ? 'touch' : 'page'
    });
    
    provider.addScope('email');
    provider.addScope('profile');
    
    // Estrategia 1: Navegador externo para WebViews problemáticos
    if (this.shouldUseExternalBrowser()) {
      console.log('🌐 Usando navegador externo (WebView detectado)');
      return await this.handleExternalBrowserAuth();
    }
    
    // Estrategia 2: Redirect para móviles
    if (this.shouldUseRedirectAuth()) {
      console.log('📱 Usando signInWithRedirect (móvil/WebView)');
      return await this.handleRedirectAuth(auth, provider);
    }
    
    // Estrategia 3: Popup para desktop
    console.log('🖥️ Usando signInWithPopup (desktop)');
    return await this.handlePopupAuth(auth, provider);
  }
  
  async handleExternalBrowserAuth() {
    const externalUrl = this.generateExternalLoginUrl();
    console.log('🔗 URL externa:', externalUrl);
    
    // Mostrar estado de carga
    this.updateButtonState('Abriendo navegador...', true);
    
    // Múltiples métodos para abrir navegador externo
    let opened = false;
    
    try {
      // Método 1: window.open optimizado para móviles
      if (typeof window.open === 'function') {
        const windowOptions = this.isMobileDevice 
          ? 'toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes'
          : 'width=400,height=600,scrollbars=yes,resizable=yes';
          
        const popup = window.open(externalUrl, '_blank', windowOptions);
        
        if (popup && !popup.closed) {
          console.log('✅ Navegador externo abierto');
          opened = true;
        }
      }
      
      if (!opened) {
        // Método 2: Redirección directa
        console.log('🔄 Redirigiendo directamente...');
        window.location.href = externalUrl;
        opened = true;
      }
      
    } catch (error) {
      console.error('❌ Error abriendo navegador externo:', error);
      this.updateButtonState('Continuar con Google', false);
      throw new Error('No se pudo abrir el navegador externo');
    }
    
    // Esperar resultado del login externo
    return await this.waitForExternalLogin();
  }
  
  async handleRedirectAuth(auth, provider) {
    const { signInWithRedirect, getRedirectResult } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"
    );
    
    try {
      // Limpiar estado previo
      await this.clearAuthState(auth);
      
      // Usar redirect
      await signInWithRedirect(auth, provider);
      
      // La redirección ocurre automáticamente
      return null;
      
    } catch (error) {
      console.error('❌ Error con signInWithRedirect:', error);
      
      // Fallback a navegador externo
      if (error.code === 'auth/operation-not-supported-in-this-environment') {
        console.log('🔄 Fallback a navegador externo...');
        return await this.handleExternalBrowserAuth();
      }
      
      throw error;
    }
  }
  
  async handlePopupAuth(auth, provider) {
    const { signInWithPopup } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"
    );
    
    try {
      // Limpiar estado previo
      await this.clearAuthState(auth);
      
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Popup auth exitoso:', result.user.email);
      return result;
      
    } catch (error) {
      console.error('❌ Error con signInWithPopup:', error);
      
      // Fallback strategies
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/web-storage-unsupported') {
        
        console.log('🔄 Popup bloqueado, intentando redirect...');
        return await this.handleRedirectAuth(auth, provider);
      }
      
      throw error;
    }
  }
  
  async clearAuthState(auth) {
    try {
      await auth.signOut();
      console.log('🧹 Estado de auth limpiado');
    } catch (error) {
      console.log('ℹ️ No había estado previo que limpiar');
    }
    
    // Esperar un momento para que se complete la limpieza
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  generateExternalLoginUrl() {
    const baseUrl = window.location.origin;
    const returnUrl = encodeURIComponent(window.location.href);
    
    // EVITAR BUCLES INFINITOS - No agregar parámetros problemáticos
    const params = new URLSearchParams({
      type: 'google',
      return: returnUrl,
      webview: 'true',
      mobile: this.isMobileDevice ? 'true' : 'false',
      timestamp: Date.now(), // Evitar cache
      // NO agregar immediate=true que causa bucles
      source: 'mobile_optimizer'
    });
    
    return `${baseUrl}/external-login.html?${params.toString()}`;
  }
  
  async waitForExternalLogin() {
    return new Promise((resolve, reject) => {
      let checkCount = 0;
      const maxChecks = 120; // 2 minutos
      
      // Limpiar estados previos que puedan causar bucles
      const cleanupKeys = ['external_login_attempts', 'google_auth_errors'];
      
      const checkInterval = setInterval(() => {
        checkCount++;
        
        // Verificar si el login externo fue exitoso
        const loginData = localStorage.getItem('external_login_success');
        if (loginData) {
          clearInterval(checkInterval);
          localStorage.removeItem('external_login_success');
          
          // Limpiar contadores de error
          cleanupKeys.forEach(key => sessionStorage.removeItem(key));
          
          try {
            const userData = JSON.parse(loginData);
            console.log('✅ Login externo exitoso:', userData.email);
            resolve(userData);
          } catch (error) {
            console.error('❌ Error parseando datos de login:', error);
            reject(new Error('Error procesando el resultado del login'));
          }
          return;
        }
        
        // Verificar si hay un error
        const loginError = localStorage.getItem('external_login_error');
        if (loginError) {
          clearInterval(checkInterval);
          localStorage.removeItem('external_login_error');
          
          console.error('❌ Error en login externo:', loginError);
          reject(new Error(loginError));
          return;
        }
        
        // Timeout
        if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
          this.updateButtonState('Continuar con Google', false);
          
          // Limpiar contadores para evitar bloqueos permanentes
          cleanupKeys.forEach(key => sessionStorage.removeItem(key));
          
          reject(new Error('Timeout esperando el resultado del login'));
        }
      }, 1000);
    });
  }
  
  updateButtonState(text, disabled) {
    const button = document.getElementById('loginWithGoogle') || 
                   document.querySelector('[data-auth="google"]');
    
    if (button) {
      button.innerHTML = text;
      button.disabled = disabled;
    }
  }
  
  async checkRedirectResult(auth) {
    const { getRedirectResult } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"
    );
    
    try {
      console.log('🔍 Verificando resultado de redirección...');
      
      const result = await Promise.race([
        getRedirectResult(auth),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]);
      
      if (result && result.user) {
        console.log('✅ Redirect auth exitoso:', result.user.email);
        return result;
      }
      
      return null;
      
    } catch (error) {
      if (error.message === 'Timeout') {
        console.log('⏰ Timeout verificando redirect result');
      } else {
        console.error('❌ Error verificando redirect result:', error);
      }
      return null;
    }
  }
  
  getEnvironmentInfo() {
    return {
      userAgent: this.userAgent,
      isMobileDevice: this.isMobileDevice,
      isWebView: this.isWebView,
      isIOSWebView: this.isIOSWebView,
      isAndroidWebView: this.isAndroidWebView,
      isWebIntoApp: this.isWebIntoApp,
      shouldUseRedirect: this.shouldUseRedirectAuth(),
      shouldUseExternal: this.shouldUseExternalBrowser(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        ratio: window.devicePixelRatio
      },
      features: {
        standalone: window.navigator.standalone,
        webkitMessageHandlers: !!(window.webkit && window.webkit.messageHandlers),
        reactNativeWebView: !!window.ReactNativeWebView,
        android: !!window.Android
      }
    };
  }
}

export default MobileAuthOptimizer;
