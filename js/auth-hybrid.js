// === auth-hybrid.js ===
// Sistema híbrido que maneja tanto Firebase Auth como autenticación directa

console.log('🔧 Iniciando Auth Hybrid System...');

// Detectar entorno
function detectEnvironment() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isWebView = /wv|webview/.test(userAgent) || 
                   /webintoapp/i.test(userAgent) || 
                   !window.chrome || 
                   typeof window.chrome.runtime === 'undefined';
  
  console.log('🔍 Entorno detectado:', isWebView ? 'WebView/APK' : 'Browser');
  return isWebView;
}

// Sistema de storage híbrido
class HybridStorage {
  static get(key) {
    // Intentar localStorage primero
    try {
      const value = localStorage.getItem(key);
      if (value) return JSON.parse(value);
    } catch (e) {}
    
    // Intentar sessionStorage
    try {
      const value = sessionStorage.getItem(key);
      if (value) return JSON.parse(value);
    } catch (e) {}
    
    // Intentar cookies
    try {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === key) {
          return JSON.parse(decodeURIComponent(value));
        }
      }
    } catch (e) {}
    
    return null;
  }
  
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (e2) {
        document.cookie = `${key}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=3600`;
      }
    }
  }
}

// Sistema de autenticación híbrido
class HybridAuth {
  constructor() {
    this.isWebView = detectEnvironment();
    this.currentUser = null;
    this.authStateListeners = [];
    
    console.log(`🔧 HybridAuth inicializado - Entorno: ${this.isWebView ? 'WebView' : 'Browser'}`);
  }
  
  // Verificar autenticación actual
  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    // Verificar storage directo (para APK)
    const authState = HybridStorage.get('auth_state');
    const userData = HybridStorage.get('user_data');
    
    if (authState === 'authenticated' && userData) {
      this.currentUser = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        isHybridUser: true,
        provider: userData.provider || 'direct',
        isAdmin: userData.isAdmin || false
      };
      
      console.log('✅ Usuario encontrado en storage directo:', this.currentUser.email);
      return this.currentUser;
    }
    
    console.log('👤 No hay usuario autenticado en storage directo');
    return null;
  }
  
  // Escuchar cambios de estado de autenticación
  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    
    // Verificar estado actual inmediatamente
    const user = this.getCurrentUser();
    callback(user);
    
    // Verificar cambios periódicamente
    setInterval(() => {
      const currentUser = this.getCurrentUser();
      const hasChanged = (currentUser?.uid !== this.currentUser?.uid);
      
      if (hasChanged) {
        this.currentUser = currentUser;
        this.authStateListeners.forEach(listener => listener(currentUser));
      }
    }, 1000);
  }
  
  // Cerrar sesión
  async signOut() {
    try {
      // Limpiar storage directo
      HybridStorage.set('auth_state', 'unauthenticated');
      localStorage.removeItem('user_data');
      sessionStorage.removeItem('user_data');
      
      this.currentUser = null;
      
      // Notificar a listeners
      this.authStateListeners.forEach(listener => listener(null));
      
      console.log('✅ Sesión cerrada en HybridAuth');
      
      // Redireccionar según entorno
      if (this.isWebView) {
        window.location.href = './login-directo-apk.html';
      } else {
        window.location.href = './login.html';
      }
      
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
    }
  }
  
  // Verificar si usuario es admin
  isUserAdmin(user) {
    if (!user) return false;
    
    const adminEmails = [
      'gfigueroa.w@gmail.com',
      'admin@yamevi.com.mx', 
      'eugenfw@gmail.com',
      'guillermo.figueroaw@totalplay.com.mx'
    ];
    
    return user.isAdmin || adminEmails.includes(user.email?.toLowerCase());
  }
}

// Instancia global
const hybridAuth = new HybridAuth();

// Función de guard para verificar autenticación
function authGuard() {
  const user = hybridAuth.getCurrentUser();
  
  if (!user) {
    console.log('🚫 Usuario no autenticado, redirigiendo...');
    
    if (hybridAuth.isWebView) {
      window.location.href = './login-directo-apk.html';
    } else {
      window.location.href = './login.html';
    }
    
    return false;
  }
  
  console.log('✅ Usuario autenticado:', user.email);
  return true;
}

// Función para mostrar elementos de admin
function toggleAdminElements(user) {
  const isAdmin = hybridAuth.isUserAdmin(user);
  const adminElements = document.querySelectorAll('.admin-only');
  
  adminElements.forEach(element => {
    if (isAdmin) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  });
  
  console.log(`🔐 Elementos admin ${isAdmin ? 'mostrados' : 'ocultos'}`);
}

// Exportar para compatibilidad
window.hybridAuth = hybridAuth;
window.authGuard = authGuard;
window.toggleAdminElements = toggleAdminElements;

// Hacer disponibles las funciones como el sistema Firebase original
export {
  hybridAuth as auth,
  authGuard,
  toggleAdminElements
};

// Función de compatibilidad para onAuthStateChanged
export function onAuthStateChanged(auth, callback) {
  return hybridAuth.onAuthStateChanged(callback);
}

// Función de compatibilidad para signOut
export async function signOut() {
  return await hybridAuth.signOut();
}

// Función para obtener usuario actual
export function getCurrentUser() {
  return hybridAuth.getCurrentUser();
}

console.log('✅ Auth Hybrid System inicializado completamente');