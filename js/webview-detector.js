// Detector de WebView y configuraciones específicas para WebIntoApp
// Archivo: js/webview-detector.js

class WebViewDetector {
  static isWebView() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detectar WebIntoApp específicamente
    if (this.isWebIntoApp()) {
      console.log('🔍 WebIntoApp detectado');
      return true;
    }
    
    // Detectar otros tipos de WebView
    const webViewPatterns = [
      'webview',
      'wv',
      'android.*version.*chrome',
      'crios',
      'fxios',
      'mobile.*safari.*version',
      'facebook',
      'instagram',
      'twitter',
      'linkedin'
    ];
    
    const isWebViewUA = webViewPatterns.some(pattern => {
      const regex = new RegExp(pattern);
      return regex.test(userAgent);
    });
    
    // Detectar por características específicas del entorno
    const hasWebViewFeatures = 
      (window.navigator.standalone === false && /iPhone|iPad/.test(userAgent)) ||
      (typeof window.orientation !== 'undefined' && !window.DeviceMotionEvent) ||
      (window.ReactNativeWebView !== undefined) ||
      (window.webkit && window.webkit.messageHandlers) ||
      (window.Android !== undefined);
    
    const result = isWebViewUA || hasWebViewFeatures;
    console.log('🔍 WebView detectado:', result, {
      userAgent: userAgent.slice(0, 100),
      isWebViewUA,
      hasWebViewFeatures
    });
    
    return result;
  }
  
  static isWebIntoApp() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Múltiples formas de detectar WebIntoApp
    const webIntoAppIndicators = [
      userAgent.includes('webintoapp'),
      window.location.href.includes('webintoapp'),
      // Detectar por propiedades específicas que WebIntoApp podría establecer
      window.WEBINTOAPP !== undefined,
      // Detectar por características del viewport en apps móviles
      (this.isMobile() && window.innerWidth === window.screen.width && window.innerHeight === window.screen.height)
    ];
    
    return webIntoAppIndicators.some(indicator => indicator);
  }
  
  static isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  static shouldUseExternalBrowser() {
    return this.isWebView();
  }
  
  static generateExternalLoginUrl(type = 'google') {
    const baseUrl = window.location.origin;
    const returnUrl = encodeURIComponent(window.location.href);
    return `${baseUrl}/external-login.html?type=${type}&return=${returnUrl}&webview=true`;
  }
  
  static openExternalLogin(type = 'google') {
    console.log('🌐 Intentando abrir autenticación externa...');
    
    const externalUrl = this.generateExternalLoginUrl(type);
    console.log('🔗 URL externa generada:', externalUrl);
    
    try {
      // Método 1: Intentar window.open con configuraciones específicas para WebView
      if (typeof window.open === 'function') {
        console.log('📱 Intentando window.open...');
        
        // Configuración específica para WebViews
        const windowFeatures = 'toolbar=yes,location=yes,directories=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes,width=400,height=600';
        const popup = window.open(externalUrl, '_blank', windowFeatures);
        
        if (popup && !popup.closed) {
          console.log('✅ Popup abierto exitosamente');
          return true;
        } else {
          console.log('⚠️ Popup bloqueado o falló, intentando redirección...');
        }
      }
      
      // Método 2: Redirección directa
      console.log('🔄 Redirigiendo directamente...');
      window.location.href = externalUrl;
      return true;
      
    } catch (error) {
      console.error('❌ Error abriendo navegador externo:', error);
      
      // Método de respaldo: intentar location.replace
      try {
        window.location.replace(externalUrl);
        return true;
      } catch (replaceError) {
        console.error('❌ Error en location.replace:', replaceError);
        return false;
      }
    }
  }
  
  static getEnvironmentInfo() {
    return {
      userAgent: navigator.userAgent,
      isWebView: this.isWebView(),
      isWebIntoApp: this.isWebIntoApp(),
      isMobile: this.isMobile(),
      shouldUseExternal: this.shouldUseExternalBrowser(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
      },
      features: {
        webkitMessageHandlers: !!(window.webkit && window.webkit.messageHandlers),
        reactNativeWebView: !!window.ReactNativeWebView,
        android: !!window.Android,
        standalone: window.navigator.standalone
      }
    };
  }
}

export default WebViewDetector;
