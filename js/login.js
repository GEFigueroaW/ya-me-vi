
import { auth } from './firebase-init.js';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const googleBtn = document.getElementById("google-login");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log("Usuario logueado:", userCredential.user);
          window.location.href = "home.html";
        })
        .catch((error) => {
          console.error("Error al iniciar sesión:", error);
          alert("Error al iniciar sesión: " + error.message);
        });
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener("click", function () {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then((result) => {
          console.log("Usuario logueado con Google:", result.user);
          window.location.href = "home.html";
        })
        .catch((error) => {
          console.error("Error al iniciar sesión con Google:", error);
          alert("Error al iniciar sesión con Google: " + error.message);
        });
    });
  }
});
