// === webview-auth-fix.js ===
// Sistema de autenticación robusto específico para WebView/WebIntoApp
// Soluciona el problema "Unable to process request due to missing initial state"

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// === DETECTOR DE ENTORNO WEBVIEW ===
class WebViewDetector {
  static isWebView() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidWebView = /wv|webview/.test(userAgent);
    const isWebIntoApp = /webintoapp/i.test(userAgent) || window.webintoapp !== undefined;
    const hasLimitedFeatures = !window.chrome || typeof window.chrome.runtime === 'undefined';
    
    console.log('🔍 Detectando entorno...');
    console.log('📱 User Agent:', userAgent);
    console.log('🤖 Android WebView:', isAndroidWebView);
    console.log('📦 WebIntoApp:', isWebIntoApp);
    console.log('⚡ Limited Features:', hasLimitedFeatures);
    
    return isAndroidWebView || isWebIntoApp || hasLimitedFeatures;
  }
  
  static getEnvironment() {
    if (this.isWebView()) {
      return 'webview';
    }
    return 'browser';
  }
}

// === CONFIGURACIÓN FIREBASE OPTIMIZADA ===
const firebaseConfig = {
  apiKey: "AIzaSyAJYWSNUMj5aej7O9u5BwJQts7L2F6Poqw",
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.firebasestorage.app",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:web:07bd1eb476d38594d002fe"
};

console.log('🚀 Iniciando Firebase Auth Fix para WebView...');
console.log(`🌍 Entorno detectado: ${WebViewDetector.getEnvironment()}`);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// === STORAGE SEGURO PARA WEBVIEW ===
class SecureStorage {
  static set(key, value) {
    try {
      // Intentar localStorage primero
      localStorage.setItem(key, JSON.stringify(value));
      console.log(`💾 Guardado en localStorage: ${key}`);
    } catch (error) {
      try {
        // Fallback a sessionStorage
        sessionStorage.setItem(key, JSON.stringify(value));
        console.log(`💾 Guardado en sessionStorage: ${key}`);
      } catch (sessionError) {
        // Fallback a cookie
        document.cookie = `${key}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=3600`;
        console.log(`🍪 Guardado en cookie: ${key}`);
      }
    }
  }
  
  static get(key) {
    try {
      // Intentar localStorage
      const value = localStorage.getItem(key);
      if (value) return JSON.parse(value);
    } catch (error) {
      console.log('⚠️ Error leyendo localStorage');
    }
    
    try {
      // Intentar sessionStorage
      const value = sessionStorage.getItem(key);
      if (value) return JSON.parse(value);
    } catch (error) {
      console.log('⚠️ Error leyendo sessionStorage');
    }
    
    try {
      // Intentar cookie
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === key) {
          return JSON.parse(decodeURIComponent(value));
        }
      }
    } catch (error) {
      console.log('⚠️ Error leyendo cookies');
    }
    
    return null;
  }
  
  static remove(key) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } catch (error) {
      console.log('⚠️ Error limpiando storage');
    }
  }
}

// === SISTEMA DE AUTENTICACIÓN WEBVIEW ===
class WebViewAuth {
  constructor() {
    this.isWebView = WebViewDetector.isWebView();
    this.authInProgress = false;
    this.setupAuthListener();
    
    // Limpiar estado previo al iniciar
    this.clearAuthState();
    
    console.log(`🔧 WebViewAuth inicializado - Entorno: ${this.isWebView ? 'WebView' : 'Browser'}`);
  }
  
  clearAuthState() {
    try {
      SecureStorage.remove('firebase:authUser');
      SecureStorage.remove('firebase:host');
      SecureStorage.remove('auth_state');
      SecureStorage.remove('auth_error');
      console.log('🧹 Estado de autenticación limpiado');
    } catch (error) {
      console.log('⚠️ Error limpiando estado:', error);
    }
  }
  
  setupAuthListener() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ Usuario autenticado:', user.email);
        SecureStorage.set('auth_state', 'authenticated');
        SecureStorage.set('user_data', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
        
        // Registrar usuario en Firestore
        this.registerUser(user);
        
        // Redirigir a home
        this.redirectToHome();
      } else {
        console.log('👤 No hay usuario autenticado');
        SecureStorage.set('auth_state', 'unauthenticated');
        SecureStorage.remove('user_data');
      }
    });
  }
  
  async signInWithGoogle() {
    if (this.authInProgress) {
      console.log('⏳ Autenticación ya en progreso...');
      return;
    }
    
    try {
      this.authInProgress = true;
      console.log('🚀 Iniciando autenticación Google para WebView...');
      
      // Limpiar estado previo
      this.clearAuthState();
      
      // Configurar provider
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Configuración específica para WebView
      provider.setCustomParameters({
        'prompt': 'select_account',
        'access_type': 'online'
      });
      
      // Marcar estado de autenticación
      SecureStorage.set('auth_state', 'authenticating');
      
      console.log('🔄 Iniciando redirect para autenticación...');
      
      // Usar siempre redirect en WebView (más confiable que popup)
      await signInWithRedirect(auth, provider);
      
    } catch (error) {
      this.authInProgress = false;
      console.error('❌ Error en autenticación:', error);
      SecureStorage.set('auth_error', error.message);
      this.showError(error);
      throw error;
    }
  }
  
  async handleRedirectResult() {
    try {
      console.log('🔄 Procesando resultado de redirect...');
      
      const result = await getRedirectResult(auth);
      
      if (result) {
        console.log('✅ Redirect exitoso:', result.user.email);
        return result.user;
      } else {
        console.log('ℹ️ No hay resultado de redirect');
        return null;
      }
    } catch (error) {
      console.error('❌ Error procesando redirect:', error);
      SecureStorage.set('auth_error', error.message);
      this.showError(error);
      throw error;
    } finally {
      this.authInProgress = false;
    }
  }
  
  async registerUser(user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      
      const userData = {
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        lastAccess: serverTimestamp(),
        device: 'WebIntoApp APK',
        platform: 'Android WebView',
        packageName: 'com.webintoapp.myapp',
        isOnline: true,
        uid: user.uid,
        
        // Admin check
        isAdmin: user.email ? [
          'gfigueroa.w@gmail.com', 
          'admin@yamevi.com.mx', 
          'eugenfw@gmail.com',
          'guillermo.figueroaw@totalplay.com.mx'
        ].includes(user.email.toLowerCase()) : false,
        
        createdAt: serverTimestamp()
      };
      
      await setDoc(userRef, userData, { merge: true });
      console.log('✅ Usuario registrado en Firestore');
      
    } catch (error) {
      console.error('❌ Error registrando usuario:', error);
    }
  }
  
  redirectToHome() {
    try {
      console.log('🏠 Redirigiendo a home...');
      
      // Pequeño delay para asegurar que el estado se guarde
      setTimeout(() => {
        if (this.isWebView) {
          // En WebView, usar location.href
          window.location.href = './home.html';
        } else {
          // En browser, usar location.replace
          window.location.replace('./home.html');
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error en redirección:', error);
    }
  }
  
  showError(error) {
    const errorMessage = this.getErrorMessage(error);
    
    // Mostrar error en UI
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.classList.remove('hidden');
      
      // Ocultar después de 5 segundos
      setTimeout(() => {
        errorElement.classList.add('hidden');
      }, 5000);
    }
    
    console.error('🚨 Error mostrado al usuario:', errorMessage);
  }
  
  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Autenticación cancelada por el usuario';
      case 'auth/popup-blocked':
        return 'Popup bloqueado. Intentando método alternativo...';
      case 'auth/configuration-not-found':
        return 'Error de configuración. Contacte al administrador.';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifique su internet.';
      default:
        return 'Error de autenticación. Intente nuevamente.';
    }
  }
  
  async signOutUser() {
    try {
      await signOut(auth);
      this.clearAuthState();
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
    }
  }
}

// === INICIALIZACIÓN AUTOMÁTICA ===
const webViewAuth = new WebViewAuth();

// Manejar resultado de redirect al cargar la página
window.addEventListener('load', async () => {
  try {
    await webViewAuth.handleRedirectResult();
  } catch (error) {
    console.error('❌ Error manejando redirect en load:', error);
  }
});

// === EXPORTACIONES ===
export { 
  webViewAuth, 
  WebViewDetector, 
  SecureStorage,
  auth, 
  db,
  onAuthStateChanged,
  signOut 
};

// Hacer disponible globalmente para el HTML
window.webViewAuth = webViewAuth;
window.WebViewDetector = WebViewDetector;

console.log('🚀 WebView Auth Fix completamente inicializado');