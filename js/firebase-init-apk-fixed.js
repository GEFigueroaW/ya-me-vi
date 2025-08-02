// Firebase configuración unificada y corregida para APK/WebView
// Configuración basada en las credenciales mostradas en las imágenes

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signInWithCustomToken,
  onAuthStateChanged,
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

// Configuración Firebase ANDROID/APK - basada en google-services.json
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

// Configuración específica para WebView/APK
auth.settings = {
  // Deshabilitar persistencia problemática en WebView
  persistence: false,
  // Configurar para entornos sin sessionStorage completo
  forceRecaptchaFlow: false
};

// Detección robusta de entorno APK/WebView
export function detectEnvironment() {
  const ua = navigator.userAgent.toLowerCase();
  const isWebView = /wv|webview|webintoapp/i.test(ua);
  const isAndroid = /android/i.test(ua);
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
  
  return {
    isWebView,
    isAndroid,
    hasSessionStorage,
    isAPK: isWebView && isAndroid,
    userAgent: ua,
    hostname: window.location.hostname,
    protocol: window.location.protocol
  };
}

// Función para manejar autenticación con token personalizado (APK)
export async function signInWithAPKToken(customToken) {
  try {
    console.log('🔐 Autenticando con token personalizado para APK...');
    const userCredential = await signInWithCustomToken(auth, customToken);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Error en autenticación con token APK:', error);
    throw error;
  }
}

// Función mejorada para autenticación con email (preferida para APK)
export async function signInWithEmailAPK(email, password) {
  try {
    console.log('📧 Autenticando con email para APK...');
    
    // Configurar auth para entorno APK
    if (detectEnvironment().isAPK) {
      // Deshabilitar persistencia para evitar errores de sessionStorage
      await auth.setPersistence('none');
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Autenticación con email exitosa');
    return userCredential.user;
  } catch (error) {
    console.error('❌ Error en autenticación con email:', error);
    throw error;
  }
}

// Registrar usuario en Firestore con datos del APK
export async function registerUserInFirestore(user) {
  try {
    console.log('👤 Registrando usuario en Firestore...');
    
    if (!user) {
      throw new Error('Usuario no proporcionado');
    }
    
    const env = detectEnvironment();
    const userRef = doc(db, 'users', user.uid);
    
    const userData = {
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      lastAccess: serverTimestamp(),
      device: env.isAPK ? 'Android APK' : 'Web',
      isOnline: true,
      loginCount: 1,
      createdAt: serverTimestamp(),
      isAdmin: user.email ? [
        'gfigueroa.w@gmail.com', 
        'admin@yamevi.com.mx', 
        'eugenfw@gmail.com', 
        'guillermo.figueroaw@totalplay.com.mx'
      ].includes(user.email.toLowerCase()) : false,
      environment: {
        isAPK: env.isAPK,
        isWebView: env.isWebView,
        userAgent: env.userAgent,
        hasSessionStorage: env.hasSessionStorage
      },
      uid: user.uid
    };
    
    await setDoc(userRef, userData, { merge: true });
    console.log('✅ Usuario registrado en Firestore:', user.email);
    
  } catch (error) {
    console.error('❌ Error registrando usuario:', error);
    throw error;
  }
}

// Auth state listener optimizado para APK
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('👤 Usuario autenticado:', user.email || user.uid);
    try {
      await registerUserInFirestore(user);
    } catch (error) {
      console.log('⚠️ Error registrando en Firestore:', error);
    }
  } else {
    console.log('👤 Usuario desconectado');
  }
});

// Función para limpiar estado de autenticación (útil para debugging)
export async function clearAuthState() {
  try {
    await signOut(auth);
    
    // Limpiar almacenamiento local si es posible
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.log('⚠️ No se pudo limpiar almacenamiento:', e);
    }
    
    console.log('🧹 Estado de autenticación limpiado');
  } catch (error) {
    console.error('❌ Error limpiando estado:', error);
  }
}

export { app, onAuthStateChanged };
