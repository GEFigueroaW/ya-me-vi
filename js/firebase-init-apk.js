// firebase-init-apk.js - Configuración optimizada para APKs

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB4bCGyyPuQo-3-ONMPFKtqPEJDFl8Cb54",
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.firebasestorage.app",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:web:070d1eb476d38594d002fe",
  measurementId: "G-D7R797S5BC"
};

// Detectar entorno de ejecución
function detectEnvironment() {
  const ua = navigator.userAgent.toLowerCase();
  const isWebView = !window.chrome || /wv|android.*version\/[.\d]+ chrome/.test(ua);
  const isApp = ua.includes('webintoapp') || ua.includes('app') || window.location.protocol === 'file:';
  const isMobile = /android|iphone|ipad|mobile/.test(ua);
  
  return {
    isWebView,
    isApp,
    isMobile,
    userAgent: ua,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  };
}

// Configuración específica para APK/WebView
function configureForAPK() {
  const env = detectEnvironment();
  
  console.log('🔍 Entorno detectado:', {
    isWebView: env.isWebView,
    isApp: env.isApp,
    isMobile: env.isMobile,
    protocol: env.protocol,
    hostname: env.hostname
  });
  
  // Configuraciones específicas para APK
  if (env.isWebView || env.isApp) {
    console.log('📱 Configurando para entorno APK/WebView');
    
    // Desactivar características que pueden fallar en WebView
    if (typeof window !== 'undefined') {
      // Evitar errores de sessionStorage en algunos WebViews
      try {
        window.sessionStorage.setItem('apk_mode', 'true');
      } catch (e) {
        console.warn('⚠️ SessionStorage no disponible en WebView');
      }
      
      // Configurar localStorage como método principal de persistencia
      try {
        window.localStorage.setItem('firebase_persistence', 'local');
      } catch (e) {
        console.warn('⚠️ LocalStorage limitado en WebView');
      }
    }
  }
  
  return env;
}

// Inicializar Firebase con configuración APK-compatible
let app, auth, db;

try {
  // Configurar entorno
  const env = configureForAPK();
  
  // Inicializar Firebase
  console.log('🔥 Inicializando Firebase...');
  app = initializeApp(firebaseConfig);
  
  // Inicializar Auth con persistencia local para APKs
  auth = getAuth(app);
  
  // Configurar persistencia (especialmente importante para APKs)
  if (env.isWebView || env.isApp) {
    console.log('💾 Configurando persistencia local para APK');
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('✅ Persistencia local configurada');
      })
      .catch((error) => {
        console.warn('⚠️ Error configurando persistencia:', error);
      });
  }
  
  // Inicializar Firestore
  db = getFirestore(app);
  
  console.log('✅ Firebase inicializado correctamente');
  
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
  
  // Fallback para entornos con problemas
  console.log('🔄 Intentando inicialización simplificada...');
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Inicialización simplificada exitosa');
  } catch (fallbackError) {
    console.error('❌ Error en inicialización simplificada:', fallbackError);
  }
}

// Función para registrar usuario en Firestore (APK-compatible)
export async function registerUserInFirestore(user) {
  try {
    console.log('🔄 Registrando usuario en Firestore:', user.email || user.uid);
    
    if (!user) {
      console.error('❌ No se proporcionó usuario para registrar');
      return;
    }
    
    // Importación dinámica para mejor compatibilidad
    const { doc, setDoc, serverTimestamp, getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    
    const userRef = doc(db, 'users', user.uid);
    
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
