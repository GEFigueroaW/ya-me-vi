
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
      // Mostrar loading
      const loadingOverlay = document.createElement('div');
      loadingOverlay.id = 'loading-overlay';
      loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      loadingOverlay.innerHTML = `
        <div class="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl p-8 text-center text-gray-800">
          <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-4"></div>
          <p>Creando cuenta con Google...</p>
        </div>
      `;
      document.body.appendChild(loadingOverlay);
      
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then(async (result) => {
          console.log("✅ Usuario registrado con Google:", result.user);
          
          // Verificar si es usuario nuevo
          const isNewUser = result._tokenResponse?.isNewUser || 
                           result.user.metadata?.creationTime === result.user.metadata?.lastSignInTime;
          
          // Guardar información del usuario en Firestore
          try {
            await setDoc(doc(db, `users/${result.user.uid}/profile`, 'info'), {
              name: result.user.displayName || result.user.email.split('@')[0],
              email: result.user.email,
              registeredAt: new Date().toISOString(),
              registeredWith: 'google'
            });
          } catch (firestoreError) {
            console.error("Error guardando en Firestore:", firestoreError);
            // Continuar aunque falle Firestore
          }
          
          // Actualizar loading
          const loadingMessage = loadingOverlay.querySelector('p');
          if (loadingMessage) {
            loadingMessage.textContent = isNewUser ? '¡Cuenta creada! Configurando tu experiencia...' : '¡Bienvenido de vuelta! Redirigiendo...';
          }
          
          setTimeout(() => {
            if (isNewUser) {
              window.location.href = "dream-input.html";
            } else {
              window.location.href = "home.html";
            }
          }, 1500);
        })
        .catch((error) => {
          // Ocultar loading
          if (loadingOverlay) {
            loadingOverlay.remove();
          }
          
          console.error("❌ Error al registrarse con Google:", error);
          
          let errorMessage = "Error al crear cuenta con Google: ";
          switch (error.code) {
            case 'auth/popup-closed-by-user':
              errorMessage += "Proceso cancelado. Inténtalo de nuevo.";
              break;
            case 'auth/popup-blocked':
              errorMessage += "Popup bloqueado. Por favor permite popups para este sitio.";
              break;
            case 'auth/account-exists-with-different-credential':
              errorMessage += "Ya existe una cuenta con este email. Intenta iniciar sesión.";
              break;
            default:
              errorMessage += error.message;
              break;
          }
          
          // Mostrar error de manera elegante
          const errorDiv = document.createElement('div');
          errorDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 bg-opacity-90 backdrop-blur-lg text-white px-6 py-3 rounded-lg shadow-lg z-50';
          errorDiv.textContent = errorMessage;
          document.body.appendChild(errorDiv);
          
          // Auto-ocultar error después de 5 segundos
          setTimeout(() => {
            errorDiv.remove();
          }, 5000);
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
