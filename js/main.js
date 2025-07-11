// === Firebase ===
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebase-init.js';

const auth = getAuth(app);
const db = getFirestore(app);

// === Referencias DOM ===
const welcomeMsg = document.getElementById('welcome-msg');
const btnAnalizar = document.getElementById('btn-analizar');
const btnCombinacion = document.getElementById('btn-combinacion');

// === Función para mostrar el sueño guardado del usuario ===
async function mostrarBienvenidaConSueño(user) {
  try {
    const ref = doc(db, `users/${user.uid}/dream`, 'info');
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const { sueño } = snap.data();
      welcomeMsg.textContent = `¡Bienvenido! Vas tras tu sueño: ${sueño}.`;
    } else {
      welcomeMsg.textContent = '¡Bienvenido!';
    }
  } catch (error) {
    console.error('Error obteniendo el sueño:', error);
    welcomeMsg.textContent = '¡Bienvenido!';
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

// === Botones: alternar visibilidad y redirigir ===
if (btnAnalizar && btnCombinacion) {
  btnAnalizar.addEventListener('click', () => {
    btnAnalizar.classList.add('hidden');
    btnCombinacion.classList.remove('hidden');
    window.location.href = "analisis.html";
  });

  btnCombinacion.addEventListener('click', () => {
    btnCombinacion.classList.add('hidden');
    btnAnalizar.classList.remove('hidden');
    window.location.href = "combinacion.html";
  });
}
