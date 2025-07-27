
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
    const { doc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    
    if (!user) return;
    
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
    
    const userData = {
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      lastAccess: serverTimestamp(),
      device: `${browser} ${deviceInfo}`,
      isOnline: true,
      loginCount: 1,
      createdAt: serverTimestamp(),
      // Campos específicos para admin
      isAdmin: ['gfigueroa.w@gmail.com', 'admin@yamevi.com.mx', 'eugenfw@gmail.com'].includes(user.email),
      totalAnalysis: 0,
      totalQueries: 0
    };
    
    // Usar merge para no sobrescribir datos existentes, solo actualizar lastAccess y isOnline
    await setDoc(userRef, userData, { merge: true });
    
    console.log('✅ Usuario registrado/actualizado en Firestore:', user.email);
    
  } catch (error) {
    console.error('❌ Error registrando usuario en Firestore:', error);
  }
}

// Listener global para registrar usuarios automáticamente
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('👤 Usuario autenticado:', user.email);
    // Registrar automáticamente en Firestore
    await registerUserInFirestore(user);
  } else {
    console.log('👤 Usuario desconectado');
    // Aquí podrías marcar como offline si tuvieras el UID
  }
});
