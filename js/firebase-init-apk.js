// Firebase configuración específica para APK/WebView
// Este archivo maneja la autenticación optimizada para entornos WebIntoApp

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithCustomToken,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase Config - ANDROID/APK específico basado en google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyAJYWSNUMj5aej7O9u5BwJQts7L2F6Poqw", // Android API Key del google-services.json
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.firebasestorage.app",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:android:315d26696c8142e4d002fe", // Android App ID del google-services.json
  measurementId: "G-D7R797S5BC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Detección avanzada de entorno WebIntoApp
export function detectWebIntoAppEnvironment() {
  const ua = navigator.userAgent.toLowerCase();
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Indicadores específicos de WebIntoApp
  const webIntoAppSignatures = [
    'webintoapp',
    'android.*wv',
    '; wv)',
    /android.*version\/[.\d]+.*chrome\/[.\d]+.*mobile.*safari/i.test(navigator.userAgent),
    /android.*version\/[.\d]+.*mobile.*safari/i.test(navigator.userAgent) && !ua.includes('chrome'),
    !window.chrome && /android/i.test(ua)
  ];
  
  const isWebIntoApp = webIntoAppSignatures.some(signature => {
    if (typeof signature === 'string') {
      return ua.includes(signature);
    }
    return signature; // para expresiones booleanas y regex
  });
  
  // Otros indicadores
  const isWebView = isWebIntoApp || 
                   !window.chrome || 
                   ua.includes('wv') ||
                   window.navigator.standalone ||
                   window.matchMedia('(display-mode: standalone)').matches;
  
  const isMobile = /android|iphone|ipad|mobile/i.test(ua);
  const isLocalhost = ['localhost', '127.0.0.1', ''].includes(hostname);
  const isHTTPS = protocol === 'https:';
  
  // Capacidades de almacenamiento
  const hasLocalStorage = (() => {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  })();
  
  const hasSessionStorage = (() => {
    try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  })();
  
  const hasCookies = navigator.cookieEnabled;
  
  return {
    // Detección del entorno
    isWebIntoApp,
    isWebView,
    isMobile,
    isLocalhost,
    isHTTPS,
    
    // Información técnica
    userAgent: ua,
    hostname,
    protocol,
    
    // Capacidades
    hasLocalStorage,
    hasSessionStorage,
    hasCookies,
    
    // Métodos de autenticación recomendados
    canUsePopup: !isWebView && window.chrome && hasLocalStorage,
    canUseRedirect: hasSessionStorage && !isWebIntoApp,
    shouldUseExternal: isWebIntoApp || (!hasLocalStorage && !hasSessionStorage),
    
    // Nivel de compatibilidad
    compatibilityLevel: getCompatibilityLevel(isWebIntoApp, hasLocalStorage, hasSessionStorage, hasCookies)
  };
}

function getCompatibilityLevel(isWebIntoApp, hasLocalStorage, hasSessionStorage, hasCookies) {
  if (!hasLocalStorage && !hasSessionStorage && !hasCookies) {
    return 'INCOMPATIBLE'; // No puede usar Firebase Auth
  } else if (isWebIntoApp || (!hasLocalStorage && !hasSessionStorage)) {
    return 'LIMITED'; // Necesita autenticación externa
  } else if (!hasLocalStorage || !hasSessionStorage) {
    return 'PARTIAL'; // Algunos métodos pueden fallar
  } else {
    return 'FULL'; // Completamente compatible
  }
}

// Listener mejorado para entornos APK
export function setupAPKAuthListener() {
  const env = detectWebIntoAppEnvironment();
  
  console.log('🔍 Entorno detectado:', env);
  
  // Listener principal de auth state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('👤 Usuario autenticado:', user.email || user.uid);
      await registerUserInFirestore(user, env);
      
      // Notificar a la app que la auth fue exitosa
      if (env.isWebIntoApp) {
        notifyAppAuthSuccess(user);
      }
    } else {
      console.log('👤 Usuario desconectado');
      
      // En WebIntoApp, verificar si hay token externo guardado
      if (env.isWebIntoApp) {
        await checkExternalAuthToken();
      }
    }
  });
  
  // Listener para mensajes de autenticación externa
  if (env.isWebIntoApp) {
    window.addEventListener('message', handleExternalAuthMessage);
    
    // Check for external auth token on load
    setTimeout(checkExternalAuthToken, 1000);
  }
}
    
    // Desactivar características que pueden fallar en WebView
    if (typeof window !== 'undefined') {
      // Evitar errores de sessionStorage en algunos WebViews
      try {
        window.sessionStorage.setItem('apk_mode', 'true');
      } catch (e) {
        console.warn('⚠️ SessionStorage no disponible en WebView');
      }
      
      // Configurar localStorage como método principal de persistencia
// Verificar token de autenticación externa
async function checkExternalAuthToken() {
  try {
    const externalAuth = localStorage.getItem('yamevi_external_auth');
    
    if (externalAuth) {
      const authData = JSON.parse(externalAuth);
      const tokenAge = new Date().getTime() - authData.timestamp;
      
      // Token válido por 1 hora
      if (tokenAge < 3600000) {
        console.log('✅ Token externo encontrado:', authData.email);
        
        // Simular autenticación exitosa
        await simulateAuthSuccess(authData);
        
        // Limpiar token usado
        localStorage.removeItem('yamevi_external_auth');
      } else {
        console.log('⏰ Token externo expirado');
        localStorage.removeItem('yamevi_external_auth');
      }
    }
  } catch (error) {
    console.error('❌ Error verificando token externo:', error);
  }
}

// Simular autenticación exitosa con datos externos
async function simulateAuthSuccess(authData) {
  try {
    // Crear o actualizar usuario en Firestore directamente
    await registerExternalUser(authData);
    
    // Notificar éxito
    notifyAppAuthSuccess(authData);
    
    // Redirigir
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error simulando auth exitosa:', error);
  }
}

// Registrar usuario externo en Firestore
async function registerExternalUser(authData) {
  try {
    const userRef = doc(db, 'users', authData.uid);
    
    // Verificar si ya existe
    const userDoc = await getDoc(userRef);
    
    const userData = {
      email: authData.email,
      displayName: authData.displayName || null,
      photoURL: authData.photoURL || null,
      lastAccess: serverTimestamp(),
      isOnline: true,
      loginCount: userDoc.exists() ? (userDoc.data().loginCount || 0) + 1 : 1,
      lastLoginMethod: 'external_google',
      uid: authData.uid,
      device: `External Auth ${getDeviceInfo()}`,
      
      // Admin check
      isAdmin: authData.email ? [
        'gfigueroa.w@gmail.com', 
        'admin@yamevi.com.mx', 
        'eugenfw@gmail.com',
        'guillermo.figueroaw@totalplay.com.mx'
      ].includes(authData.email.toLowerCase()) : false
    };
    
    if (!userDoc.exists()) {
      userData.createdAt = serverTimestamp();
      userData.totalAnalysis = 0;
      userData.totalQueries = 0;
    }
    
    await setDoc(userRef, userData, { merge: true });
    
    console.log('✅ Usuario externo registrado en Firestore:', authData.email);
    
  } catch (error) {
    console.error('❌ Error registrando usuario externo:', error);
  }
}

// Función de registro en Firestore optimizada para APK
export async function registerUserInFirestore(user, environment = null) {
  try {
    console.log('🔄 Iniciando registro APK para:', user.email);
    
    if (!user) {
      console.error('❌ No se proporcionó usuario para registrar');
      return;
    }
    
    const env = environment || detectWebIntoAppEnvironment();
    const userRef = doc(db, 'users', user.uid);
    
    const userData = {
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      lastAccess: serverTimestamp(),
      device: `${getDeviceInfo()} (${env.isWebIntoApp ? 'WebIntoApp' : env.isWebView ? 'WebView' : 'Browser'})`,
      isOnline: true,
      loginCount: 1,
      uid: user.uid,
      
      // Información del entorno
      environment: {
        isWebIntoApp: env.isWebIntoApp,
        isWebView: env.isWebView,
        isMobile: env.isMobile,
        compatibilityLevel: env.compatibilityLevel,
        userAgent: env.userAgent.substring(0, 200) // Limitar longitud
      },
      
      // Verificación de admin
      isAdmin: user.email ? [
        'gfigueroa.w@gmail.com', 
        'admin@yamevi.com.mx', 
        'eugenfw@gmail.com',
        'guillermo.figueroaw@totalplay.com.mx'
      ].includes(user.email.toLowerCase()) : false,
      
      totalAnalysis: 0,
      totalQueries: 0,
      createdAt: serverTimestamp()
    };
    
    console.log('👤 Datos del usuario APK a guardar:', {
      email: userData.email,
      isAdmin: userData.isAdmin,
      environment: userData.environment.compatibilityLevel
    });
    
    await setDoc(userRef, userData, { merge: true });
    
    console.log('✅ Usuario APK registrado en Firestore:', user.email);
    
  } catch (error) {
    console.error('❌ Error registrando usuario APK:', error);
  }
}

// Manejar mensajes de autenticación externa
function handleExternalAuthMessage(event) {
  if (event.data.type === 'YAMEVI_AUTH_SUCCESS') {
    console.log('� Mensaje de auth externa recibido:', event.data.data);
    simulateAuthSuccess(event.data.data);
  }
}

// Notificar a la app sobre autenticación exitosa
function notifyAppAuthSuccess(user) {
  try {
    // Intentar notificar por varios medios
    const authEvent = new CustomEvent('yamevi:auth:success', {
      detail: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }
    });
    
    window.dispatchEvent(authEvent);
    
    // También guardar en localStorage como respaldo
    localStorage.setItem('yamevi_auth_success', JSON.stringify({
      uid: user.uid,
      email: user.email,
      timestamp: new Date().getTime()
    }));
    
    console.log('📢 Notificación de auth enviada');
  } catch (error) {
    console.error('❌ Error notificando auth success:', error);
  }
}

// Obtener información del dispositivo
function getDeviceInfo() {
  const ua = navigator.userAgent;
  
  if (/Mobile|Android|iPhone|iPad/.test(ua)) {
    if (/Android/i.test(ua)) {
      return 'Android Mobile';
    } else if (/iPhone|iPad/i.test(ua)) {
      return 'iOS Mobile';
    }
    return 'Mobile';
  } else if (/Tablet/i.test(ua)) {
    return 'Tablet';
  }
  
  return 'Desktop';
}

// Función para crear URL de autenticación externa
export function createExternalAuthUrl() {
  const currentUrl = window.location.href;
  const baseUrl = window.location.origin;
  
  return `${baseUrl}/auth-external.html?return_to=${encodeURIComponent(currentUrl)}&auto_start=true`;
}

// Función para abrir autenticación externa
export function openExternalAuth() {
  const env = detectWebIntoAppEnvironment();
  const authUrl = createExternalAuthUrl();
  
  console.log('🌐 Abriendo autenticación externa:', authUrl);
  
  try {
    // Intentar abrir ventana
    const popup = window.open(authUrl, '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes');
    
    if (!popup || popup.closed) {
      // Si falla, redireccionar directamente
      window.location.href = authUrl;
    } else {
      // Monitorear el popup
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // Verificar si la auth fue exitosa
          setTimeout(checkExternalAuthToken, 1000);
        }
      }, 1000);
    }
    
  } catch (error) {
    console.error('❌ Error abriendo auth externa:', error);
    // Fallback: redirección directa
    window.location.href = authUrl;
  }
}

// Exportar funciones principales
export { 
  detectWebIntoAppEnvironment, 
  setupAPKAuthListener, 
  checkExternalAuthToken,
  openExternalAuth,
  createExternalAuthUrl 
};

console.log('🚀 Firebase APK Init cargado');
    
    // Verificar si el usuario ya existe
    let existingUser;
    try {
      const userDoc = await getDoc(userRef);
      existingUser = userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.warn('⚠️ Error verificando usuario existente:', error);
      existingUser = null;
    }
    
    // Detectar información del dispositivo de forma segura
    let deviceInfo = 'Unknown';
    let browser = 'Unknown';
    
    try {
      const userAgent = navigator.userAgent || '';
      
      if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        deviceInfo = 'Mobile';
      } else if (/Tablet/.test(userAgent)) {
        deviceInfo = 'Tablet';
      } else {
        deviceInfo = 'Desktop';
      }
      
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';
      else if (userAgent.includes('webintoapp')) browser = 'WebIntoApp';
    } catch (error) {
      console.warn('⚠️ Error detectando dispositivo:', error);
    }
    
    // Configurar datos del usuario
    const userEmail = user.email || '';
    const adminEmails = [
      'gfigueroa.w@gmail.com', 
      'admin@yamevi.com.mx', 
      'eugenfw@gmail.com',
      'guillermo.figueroaw@totalplay.com.mx'
    ];
    
    const userData = {
      email: userEmail,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      lastAccess: serverTimestamp(),
      device: `${browser} ${deviceInfo}`,
      isOnline: true,
      loginCount: existingUser ? (existingUser.loginCount || 0) + 1 : 1,
      isAdmin: adminEmails.includes(userEmail.toLowerCase()),
      totalAnalysis: existingUser?.totalAnalysis || 0,
      totalQueries: existingUser?.totalQueries || 0,
      uid: user.uid,
      // Campos específicos para APK
      lastLoginMethod: user.providerData?.[0]?.providerId || 'unknown',
      lastLoginTimestamp: new Date().toISOString(),
      // Mantener fecha de creación si existe
      createdAt: existingUser?.createdAt || serverTimestamp()
    };
    
    console.log('👤 Guardando datos de usuario:', {
      email: userData.email,
      isAdmin: userData.isAdmin,
      device: userData.device,
      loginCount: userData.loginCount
    });
    
    // Guardar con merge para preservar datos existentes
    await setDoc(userRef, userData, { merge: true });
    
    console.log('✅ Usuario registrado/actualizado en Firestore');
    
  } catch (error) {
    console.error('❌ Error registrando usuario en Firestore:', error);
    
    // En caso de error, continuar sin bloquear la aplicación
    console.log('🔄 Continuando sin registro en Firestore...');
  }
}

// Listener global de autenticación optimizado para APK
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('👤 Usuario autenticado:', user.email || user.uid);
      console.log('🔐 Método de autenticación:', user.providerData?.[0]?.providerId || 'unknown');
      
      // Registrar en Firestore de forma asíncrona
      try {
        await registerUserInFirestore(user);
      } catch (error) {
        console.warn('⚠️ Error en registro automático:', error);
      }
      
      // Limpiar indicadores de redirección
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('authRedirectCount');
        }
      } catch (error) {
        console.warn('⚠️ Error limpiando sessionStorage:', error);
      }
      
    } else {
      console.log('👤 Usuario desconectado');
    }
  });
}

// Exportaciones
export { app, auth, db, onAuthStateChanged };

// Log de inicialización
console.log('🚀 Firebase APK-compatible inicializado');
console.log('📱 Entorno:', detectEnvironment());
