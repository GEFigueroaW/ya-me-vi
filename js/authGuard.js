// Auth Guard - Previene loops de redirección
export class AuthGuard {
  constructor() {
    this.lastRedirect = 0;
    this.redirectCooldown = 3000; // 3 segundos de cooldown
    this.maxRedirects = 3;
    this.redirectCount = parseInt(sessionStorage.getItem('authRedirectCount') || '0');
  }

  // Verificar si podemos hacer una redirección
  canRedirect() {
    const now = Date.now();
    const timeSinceLastRedirect = now - this.lastRedirect;
    
    // Si han pasado menos de 3 segundos, no permitir redirección
    if (timeSinceLastRedirect < this.redirectCooldown) {
      console.warn('🚫 Redirección bloqueada por cooldown');
      return false;
    }

    // Si ya hemos hecho demasiadas redirecciones, bloquear
    if (this.redirectCount >= this.maxRedirects) {
      console.warn('🚫 Demasiadas redirecciones, bloqueando para prevenir loop');
      this.showLoopError();
      return false;
    }

    return true;
  }

  // Registrar una redirección
  registerRedirect(destination) {
    this.lastRedirect = Date.now();
    this.redirectCount++;
    sessionStorage.setItem('authRedirectCount', this.redirectCount.toString());
    console.log(`📍 Redirección registrada #${this.redirectCount} a: ${destination}`);
  }

  // Limpiar contadores cuando la autenticación es exitosa
  clearRedirectCount() {
    this.redirectCount = 0;
    sessionStorage.removeItem('authRedirectCount');
    console.log('✅ Contador de redirecciones limpiado');
  }

  // Mostrar error de loop infinito
  showLoopError() {
    const errorMessage = `
      🔄 Loop de redirección detectado
      
      La aplicación está detectando un problema de autenticación.
      Por favor:
      
      1. Limpia el caché del navegador
      2. Cierra todas las pestañas de YA ME VI  
      3. Vuelve a abrir la aplicación
      
      Si el problema persiste, contacta al soporte técnico.
    `;
    
    alert(errorMessage);
    
    // Limpiar todos los datos de sesión
    sessionStorage.clear();
    localStorage.removeItem('biometric_user_info');
    
    // Redirigir a la página principal después de 5 segundos
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 5000);
  }

  // Redirección segura con protección contra loops
  safeRedirect(destination, reason = 'unknown') {
    if (!this.canRedirect()) {
      return false;
    }

    this.registerRedirect(destination);
    console.log(`🚀 Redirección segura a: ${destination} (razón: ${reason})`);
    
    setTimeout(() => {
      window.location.href = destination;
    }, 100);
    
    return true;
  }
}

// Instancia global
export const authGuard = new AuthGuard();
