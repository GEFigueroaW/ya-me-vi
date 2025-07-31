// Detector de WebView y configuraciones específicas para WebIntoApp
// Archivo: js/webview-detector.js

export class WebViewDetector {
  static isWebView() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detectar diferentes tipos de WebView
    const webViewPatterns = [
      'webview',
      'wv',
      'webintoapp',
      'facebook',
      'instagram',
      'twitter',
      'linkedin'
    ];
    
    return webViewPatterns.some(pattern => userAgent.includes(pattern)) ||
           // También detectar por características específicas
           (window.navigator.standalone === false && /iPhone|iPad/.test(userAgent)) ||
           (typeof window.orientation !== 'undefined' && !window.DeviceMotionEvent);
  }
  
  static isWebIntoApp() {
    return navigator.userAgent.toLowerCase().includes('webintoapp') ||
           window.location.href.includes('webintoapp') ||
           // Detectar por configuración específica de WebIntoApp
           (this.isWebView() && window.innerWidth === window.screen.width);
  }
  
  static shouldUseExternalBrowser() {
    return this.isWebView() || this.isWebIntoApp();
  }
  
  static createExternalLoginURL(returnUrl = window.location.origin) {
    // Crear URL para login externo
    const baseUrl = window.location.origin;
    const loginUrl = `${baseUrl}/external-login.html`;
    const params = new URLSearchParams({
      returnUrl: returnUrl,
      timestamp: Date.now()
    });
    
    return `${loginUrl}?${params.toString()}`;
  }
  
  static openExternalLogin() {
    if (this.shouldUseExternalBrowser()) {
      const externalUrl = this.createExternalLoginURL();
      
      // Intentar abrir en navegador externo
      try {
        // Para WebIntoApp y otros WebViews
        if (typeof window.open === 'function') {
          const popup = window.open(externalUrl, '_blank', 'toolbar=yes,location=yes');
          
          // Si no se abre popup, usar location
          if (!popup || popup.closed) {
            window.location.href = externalUrl;
          }
          
          return true;
        } else {
          window.location.href = externalUrl;
          return true;
        }
      } catch (error) {
        console.error('Error abriendo navegador externo:', error);
        return false;
      }
    }
    
    return false;
  }
}

export default WebViewDetector;
