// === Firebase ===
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebase-init.js';

const auth = getAuth(app);
const db = getFirestore(app);

// === Función para mostrar el sueño guardado del usuario ===
async function mostrarBienvenidaConSueño(user) {
  try {
    const ref = doc(db, `users/${user.uid}/dream`, 'info');
    const snap = await getDoc(ref);

    const welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg) {
      if (snap.exists()) {
        const { sueño } = snap.data();
        welcomeMsg.textContent = `¡Bienvenido! Vas tras tu sueño: ${sueño}.`;
      } else {
        welcomeMsg.textContent = '¡Bienvenido!';
      }
    }
  } catch (error) {
    console.error('Error obteniendo el sueño:', error);
    const welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg) {
      welcomeMsg.textContent = '¡Bienvenido!';
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
