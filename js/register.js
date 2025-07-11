
import { auth } from './firebase-init.js';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("register-form");
  const googleBtn = document.getElementById("google-register");

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log("Usuario registrado:", userCredential.user);
          window.location.href = "dream-input.html";
        })
        .catch((error) => {
          console.error("Error al registrarse:", error);
          alert("Error al registrarse: " + error.message);
        });
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener("click", function () {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then((result) => {
          console.log("Usuario registrado con Google:", result.user);
          window.location.href = "dream-input.html";
        })
        .catch((error) => {
          console.error("Error al registrarse con Google:", error);
          alert("Error al registrarse con Google: " + error.message);
        });
    });
  }
});
