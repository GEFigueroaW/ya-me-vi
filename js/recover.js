import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app } from './firebase-init.js';

const auth = getAuth(app);

document.getElementById('recover-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('recover-email').value.trim();

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Enlace de recuperación enviado. Revisa tu correo.");
    window.location.href = "login.html";
  } catch (error) {
    console.error(error);
    alert("Error al enviar el enlace. Verifica el correo e intenta nuevamente.");
  }
});
