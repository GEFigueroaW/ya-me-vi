// Configuración maestra de Firebase para YA ME VI
// Este archivo centraliza todas las configuraciones para evitar inconsistencias

// Configuración Firebase principal WEB (basada en las credenciales de Google Console)
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB4bCGyyPuQo-3-ONMPFKtqPEJDFl8Cb54",
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.firebasestorage.app",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:web:07bd1eb476d38594d002fe",
  measurementId: "G-D7R797S5BC"
};

// Configuración específica para APK/Android (basada en google-services.json)
export const FIREBASE_CONFIG_APK = {
  apiKey: "AIzaSyAJYWSNUMj5aej7O9u5BwJQts7L2F6Poqw", // Android API Key del google-services.json
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.firebasestorage.app",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:android:315d26696c8142e4d002fe", // Android App ID del google-services.json
  measurementId: "G-D7R797S5BC"
};

// OAuth Client IDs para diferentes entornos (basados en google-services.json)
export const OAUTH_CLIENT_IDS = {
  web: "748876890843-jiu4cfl2ioqgjomna6fa8r4pqogl3q7l.apps.googleusercontent.com", // Del google-services.json
  android: "748876890843-jiu4cfl2ioqgjomna6fa8r4pqogl3q7l.apps.googleusercontent.com" // Del google-services.json
};

// Dominios autorizados para Firebase Auth
export const AUTHORIZED_DOMAINS = [
  "ya-me-vi.firebaseapp.com",
  "ya-me-vi.web.app",
  "yamevi.com.mx",
  "localhost",
  "gefigueiroaw.github.io",
  "webintoapp.com"
];

// Configuración para detectar entornos
export function detectEnvironment() {
  const ua = navigator.userAgent.toLowerCase();
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  const isWebView = /wv|webview|webintoapp/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isAPK = isWebView && isAndroid;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isHTTPS = protocol === 'https:';
  
  // Verificar disponibilidad de storage
  const hasSessionStorage = (() => {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  })();
  
  const hasLocalStorage = (() => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  })();
  
  return {
    isWebView,
    isAndroid,
    isAPK,
    isLocalhost,
    isHTTPS,
    hasSessionStorage,
    hasLocalStorage,
    userAgent: ua,
    hostname,
    protocol,
    origin: window.location.origin
  };
}

// Función para obtener la configuración apropiada según el entorno
export function getFirebaseConfig() {
  const env = detectEnvironment();
  
  console.log('🔧 Seleccionando configuración Firebase para entorno:', {
    isAPK: env.isAPK,
    isWebView: env.isWebView,
    hostname: env.hostname
  });
  
  // Usar configuración APK si es un entorno APK
  if (env.isAPK) {
    console.log('📱 Usando configuración Firebase para APK');
    return FIREBASE_CONFIG_APK;
  }
  
  // Usar configuración web por defecto
  console.log('🌐 Usando configuración Firebase para Web');
  return FIREBASE_CONFIG;
}

// Lista de emails de administradores
export const ADMIN_EMAILS = [
  'gfigueroa.w@gmail.com',
  'admin@yamevi.com.mx',
  'eugenfw@gmail.com',
  'guillermo.figueroaw@totalplay.com.mx'
];

// Configuración de redirects para diferentes entornos
export const REDIRECT_URLS = {
  // URLs para autenticación externa (WebView que no puede usar popup)
  external: {
    auth: 'https://yamevi.com.mx/auth-external.html',
    callback: 'https://yamevi.com.mx/google-callback.html'
  },
  
  // URLs locales para desarrollo
  local: {
    auth: '/auth-external.html',
    callback: '/google-callback.html'
  }
};

// Configuración específica de autenticación según entorno
export function getAuthConfig() {
  const env = detectEnvironment();
  
  return {
    // Configuraciones específicas para APK
    apk: {
      persistence: 'none', // Evitar problemas con sessionStorage en WebView
      forceRecaptchaFlow: false,
      allowPopups: false,
      preferEmailAuth: true // Preferir autenticación con email/password en APK
    },
    
    // Configuraciones para web
    web: {
      persistence: 'session',
      forceRecaptchaFlow: false,
      allowPopups: true,
      preferEmailAuth: false
    }
  };
}

export default {
  FIREBASE_CONFIG,
  FIREBASE_CONFIG_APK,
  OAUTH_CLIENT_IDS,
  AUTHORIZED_DOMAINS,
  ADMIN_EMAILS,
  REDIRECT_URLS,
  detectEnvironment,
  getFirebaseConfig,
  getAuthConfig
};
