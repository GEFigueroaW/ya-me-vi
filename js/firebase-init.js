
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyB4bCGyyPuQo-3-ONMPFKtqPEJDFl8Cb54",
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.firebasestorage.app",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:web:070d1eb476d38594d002fe",
  measurementId: "G-D7R797S5BC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// VAPID Key para Web Push (necesitarás generarla en la consola de Firebase)
export const VAPID_KEY = 'TU_VAPID_KEY_AQUI'; // Te ayudo a obtenerla después

export { app, onAuthStateChanged, getToken, onMessage };

// Función para registrar usuario en Firestore automáticamente
export async function registerUserInFirestore(user) {
  try {
    console.log('🔄 Iniciando registro en Firestore para:', user.email);
    const { doc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    
    if (!user) {
      console.error('❌ No se proporcionó usuario para registrar');
      return;
    }
    
    const userRef = doc(db, 'users', user.uid);
    
    // Detectar información del dispositivo
    const userAgent = navigator.userAgent;
    let deviceInfo = 'Desktop';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceInfo = 'Mobile';
    } else if (/Tablet/.test(userAgent)) {
      deviceInfo = 'Tablet';
    }
    
    // Detectar navegador
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    // Verificar si el email existe antes de determinar isAdmin
    const userEmail = user.email;
    console.log('📧 Email del usuario para verificar admin:', userEmail);
    
    const userData = {
      email: userEmail,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      lastAccess: serverTimestamp(),
      device: `${browser} ${deviceInfo}`,
      isOnline: true,
      loginCount: 1,
      createdAt: serverTimestamp(),
      // Campos específicos para admin - VALIDACIÓN MEJORADA
      isAdmin: userEmail ? ['gfigueroa.w@gmail.com', 'admin@yamevi.com.mx', 'eugenfw@gmail.com', 'guillermo.figueroaw@totalplay.com.mx'].includes(userEmail.toLowerCase()) : false,
      totalAnalysis: 0,
      totalQueries: 0,
      uid: user.uid // Agregar UID para referencia
    };
    
    console.log('👤 Datos del usuario a guardar:', {
      email: userData.email,
      isAdmin: userData.isAdmin,
      displayName: userData.displayName
    });
    
    // Usar merge para no sobrescribir datos existentes, solo actualizar campos importantes
    await setDoc(userRef, userData, { merge: true });
    
    console.log('✅ Usuario registrado/actualizado en Firestore:', userEmail, '- Admin:', userData.isAdmin);
    
  } catch (error) {
    console.error('❌ Error registrando usuario en Firestore:', error);
    console.error('❌ Stack trace:', error.stack);
  }
}

// Listener global para registrar usuarios automáticamente - MEJORADO
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('👤 Usuario autenticado globalmente:', user.email || 'Email no disponible');
    console.log('� Proveedor de autenticación:', user.providerData);
    
    // Registrar automáticamente en Firestore siempre que haya cambios de estado
    await registerUserInFirestore(user);
    
    // Limpiar indicadores de redirección si la auth es exitosa
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('authRedirectCount');
    }
    
    // Forzar actualización del estado online
    try {
      const { doc, updateDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isOnline: true,
        lastAccess: serverTimestamp(),
        lastLoginDevice: navigator.userAgent.includes('Mobile') ? 'Mobile' : 
                        navigator.userAgent.includes('Tablet') ? 'Tablet' : 'Desktop'
      });
      console.log('✅ Estado online actualizado para:', user.email || user.uid);
    } catch (error) {
      console.log('⚠️ Error actualizando estado online:', error);
    }
    
  } else {
    console.log('👤 Usuario desconectado globalmente');
  }
});
