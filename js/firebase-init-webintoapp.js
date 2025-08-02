// === firebase-init-webintoapp.js ===
// Configuración específica para WebIntoApp con package name correcto

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithCustomToken,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
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

// Firebase Config específico para WebIntoApp
// NOTA: Esta configuración asume que ya se creó la app con package name com.webintoapp.myapp
const firebaseConfig = {
  apiKey: "AIzaSyAJYWSNUMj5aej7O9u5BwJQts7L2F6Poqw", 
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.firebasestorage.app",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:web:07bd1eb476d38594d002fe", // Web App ID para OAuth
  measurementId: "G-D7R797S5BC"
};

console.log('🔧 Iniciando Firebase con configuración WebIntoApp...');
console.log('📱 Package name esperado: com.webintoapp.myapp');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Función de autenticación Google optimizada para WebIntoApp
export async function signInWithGoogleWebIntoApp() {
  try {
    console.log('🚀 Google Auth para WebIntoApp iniciado');
    
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    // Configuración específica para WebIntoApp
    provider.setCustomParameters({
      'prompt': 'select_account',
      'access_type': 'online',
      'include_granted_scopes': 'true',
      'state': 'webintoapp_' + Date.now()
    });
    
    let result;
    
    try {
      // Intentar popup primero
      console.log('🔄 Intentando autenticación con popup...');
      result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        console.log('✅ Autenticación Google exitosa (popup):', result.user.email);
        return result.user;
      }
    } catch (popupError) {
      console.log('⚠️ Popup falló, intentando redirect:', popupError.message);
      
      // Si popup falla, usar redirect
      if (popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user') {
        console.log('🔄 Usando redirect como fallback...');
        await signInWithRedirect(auth, provider);
        return null; // El resultado se procesará después del redirect
      } else {
        throw popupError;
      }
    }
    
  } catch (error) {
    console.error('❌ Error en Google Auth WebIntoApp:', error);
    
    if (error.code === 'auth/configuration-not-found') {
      console.error('🚨 Error de configuración: Verificar que Firebase tenga el package name correcto');
      console.error('📱 Requerido: com.webintoapp.myapp');
    }
    
    throw error;
  }
}

// Manejar resultados de redirect
export async function handleRedirectResultWebIntoApp() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('✅ Autenticación Google exitosa (redirect):', result.user.email);
      return result.user;
    }
  } catch (error) {
    console.error('❌ Error manejando redirect result:', error);
    
    if (error.code === 'auth/configuration-not-found') {
      console.error('🚨 Configuración incorrecta detectada');
      console.error('📋 Verificar FIREBASE-WEBINTOAPP-CONFIG.md');
    }
    
    throw error;
  }
  return null;
}

// Verificar configuración
function verifyWebIntoAppConfig() {
  const expectedPackage = 'com.webintoapp.myapp';
  console.log(`🔍 Verificando configuración para package: ${expectedPackage}`);
  
  // Esta verificación se hace en el lado del servidor de Firebase
  // Si la autenticación falla, significa que la configuración no coincide
}

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('✅ Usuario autenticado en WebIntoApp:', user.email);
    
    // Registrar en Firestore si es necesario
    registerWebIntoAppUser(user);
  } else {
    console.log('👤 No hay usuario autenticado');
  }
});

// Registrar usuario específico para WebIntoApp
async function registerWebIntoAppUser(user) {
  try {
    const userRef = doc(db, 'users', user.uid);
    
    const userData = {
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      lastAccess: serverTimestamp(),
      device: 'WebIntoApp APK',
      platform: 'Android WebIntoApp',
      packageName: 'com.webintoapp.myapp',
      isOnline: true,
      loginCount: 1,
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
    console.log('✅ Usuario WebIntoApp registrado en Firestore');
    
  } catch (error) {
    console.error('❌ Error registrando usuario WebIntoApp:', error);
  }
}

// Verificar configuración al cargar
verifyWebIntoAppConfig();

console.log('🚀 Firebase WebIntoApp inicializado');

// Exportaciones
export { 
  app, 
  auth, 
  db, 
  onAuthStateChanged, 
  signInWithGoogleWebIntoApp, 
  handleRedirectResultWebIntoApp,
  signOut 
};
