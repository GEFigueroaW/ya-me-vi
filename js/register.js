import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app } from './firebase-init.js';

const auth = getAuth(app);

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCred.user, { displayName: name });
    window.location.href = "dream-input.html";
  } catch (error) {
    console.error(error);
    alert("No se pudo registrar el usuario. Verifica los datos o intenta más tarde.");
  }
});


import { auth } from './firebase-init.js';
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.getElementById('google-register')?.addEventListener('click', () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(() => {
      window.location.href = 'dream-input.html';
    })
    .catch(error => {
      console.error(error);
      alert("Error al registrarse con Google.");
    });
});
