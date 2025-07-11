import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app } from './firebase-init.js';

const auth = getAuth(app);

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    window.location.href = "dream-input.html";
  } catch (error) {
    console.error(error);
    alert("Correo o contraseña incorrectos. Intenta de nuevo.");
  }
});
