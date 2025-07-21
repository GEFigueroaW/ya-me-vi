
import { auth } from './firebase-init.js';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebase-init.js';

const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("register-form");
  const googleBtn = document.getElementById("google-register");

  // Limpiar campos al cargar el DOM
  clearFormFields();

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          console.log("Usuario registrado:", userCredential.user);
          
          // Actualizar el perfil del usuario con el nombre
          await updateProfile(userCredential.user, {
            displayName: name
          });
          
          // Guardar el nombre en Firestore también
          await setDoc(doc(db, `users/${userCredential.user.uid}/profile`, 'info'), {
            name: name,
            email: email,
            registeredAt: new Date().toISOString()
          });
          
          console.log("Perfil actualizado con nombre:", name);
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

// Función para limpiar campos del formulario
function clearFormFields() {
  const emailField = document.getElementById('email');
  const passwordField = document.getElementById('password');
  
  if (emailField) {
    emailField.value = '';
    emailField.defaultValue = '';
  }
  
  if (passwordField) {
    passwordField.value = '';
    passwordField.defaultValue = '';
  }
  
  console.log('✅ Campos de email y contraseña limpiados');
}

// Limpiar campos cuando se enfoca la ventana
window.addEventListener('focus', clearFormFields);

// Limpiar campos al regresar de otras páginas
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    clearFormFields();
  }
});
