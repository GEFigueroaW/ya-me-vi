// === Firebase ===
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebase-init.js';

const auth = getAuth(app);
const db = getFirestore(app);

// === Función para mostrar el sueño guardado del usuario ===
async function mostrarBienvenidaConSueño(user) {
  try {
    const dreamRef = doc(db, `users/${user.uid}/dream`, 'info');
    const dreamSnap = await getDoc(dreamRef);

    // Intentar obtener el perfil del usuario para el nombre
    const profileRef = doc(db, `users/${user.uid}/profile`, 'info');
    const profileSnap = await getDoc(profileRef);

    const welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg) {
      // Obtener el nombre del usuario con múltiples fallbacks
      let userName = '';
      
      // 1. Intentar desde el perfil guardado en Firestore
      if (profileSnap.exists() && profileSnap.data().name) {
        userName = profileSnap.data().name.split(' ')[0]; // Solo primer nombre
      }
      // 2. Si no, usar displayName de Firebase Auth (Google login)
      else if (user.displayName) {
        userName = user.displayName.split(' ')[0];
      }
      // 3. Si no, usar la parte del email antes del @
      else if (user.email) {
        userName = user.email.split('@')[0];
      }
      
      // 4. Verificar si hay datos biométricos y usar fallback
      const biometricUserInfo = localStorage.getItem('biometric_user_info');
      if (biometricUserInfo && !userName) {
        userName = 'Usuario'; // Fallback para usuarios biométricos
      }
      
      if (dreamSnap.exists()) {
        const { sueño } = dreamSnap.data();
        if (userName) {
          welcomeMsg.textContent = `¡Bienvenido ${userName}! Vas tras tu sueño: ${sueño}.`;
        } else {
          welcomeMsg.textContent = `¡Bienvenido! Vas tras tu sueño: ${sueño}.`;
        }
      } else {
        if (userName) {
          welcomeMsg.textContent = `¡Bienvenido ${userName}!`;
        } else {
          welcomeMsg.textContent = '¡Bienvenido!';
        }
      }
      
      console.log(`Usuario identificado como: ${userName || 'Anónimo'}`);
    }
  } catch (error) {
    console.error('Error obteniendo datos del usuario:', error);
    const welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg) {
      // Intentar mostrar al menos el nombre aunque falle el sueño
      let userName = '';
      
      if (user && user.displayName) {
        userName = user.displayName.split(' ')[0];
      } else if (user && user.email) {
        userName = user.email.split('@')[0];
      }
      
      if (userName) {
        welcomeMsg.textContent = `¡Bienvenido ${userName}!`;
      } else {
        welcomeMsg.textContent = '¡Bienvenido!';
      }
    }
  }
}

// === Manejo de sesión activa y bienvenida ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    mostrarBienvenidaConSueño(user);
  } else {
    window.location.href = "index.html";
  }
});

// === Inicialización cuando el DOM está listo ===
document.addEventListener('DOMContentLoaded', () => {
  // === Referencias DOM ===
  const btnAnalizar = document.getElementById('btn-analizar');
  const btnCombinacion = document.getElementById('btn-combinacion');
  const btnSugeridas = document.getElementById('btn-sugeridas');

  // === Botones: alternar visibilidad y redirigir ===
  if (btnAnalizar && btnCombinacion && btnSugeridas) {
    btnAnalizar.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Botón Analizar clickeado');
      btnAnalizar.classList.add('hidden');
      btnCombinacion.classList.remove('hidden');
      btnSugeridas.classList.remove('hidden');
      window.location.href = "analisis.html";
    });

    btnCombinacion.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Botón Combinación clickeado');
      btnCombinacion.classList.add('hidden');
      btnAnalizar.classList.remove('hidden');
      btnSugeridas.classList.remove('hidden');
      window.location.href = "combinacion.html";
    });

    btnSugeridas.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Botón Sugeridas clickeado');
      btnSugeridas.classList.add('hidden');
      btnAnalizar.classList.remove('hidden');
      btnCombinacion.classList.remove('hidden');
      window.location.href = "sugeridas.html";
    });
  } else {
    console.warn('No se encontraron los botones principales');
  }
});
