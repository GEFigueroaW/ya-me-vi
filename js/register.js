
import { auth } from './firebase-init.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebase-init.js';

const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("register-form");

  // Limpiar campos al cargar el DOM
  clearFormFields();

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        showMessage("❌ Las contraseñas no coinciden. Por favor verifica que ambas sean iguales.", "error");
        return;
      }

      // Validar longitud mínima de contraseña
      if (password.length < 6) {
        showMessage("❌ La contraseña debe tener al menos 6 caracteres.", "error");
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          console.log("✅ Usuario registrado:", userCredential.user);
          
          // Mostrar mensaje de éxito
          showMessage("✅ Cuenta creada exitosamente", "success");
          
          // Actualizar el perfil del usuario con el nombre
          try {
            await updateProfile(userCredential.user, {
              displayName: name
            });
            console.log("✅ Perfil actualizado con nombre:", name);
          } catch (profileError) {
            console.error("⚠️ Error actualizando perfil:", profileError);
          }
          
          // No necesitamos guardar aquí porque firebase-init.js ya lo hace automáticamente
          console.log("✅ Registro completado - el listener global guardará en Firestore");
          
          // Redirigir después de un breve delay
          setTimeout(() => {
            window.location.href = "dream-input.html";
          }, 1500);
        })
        .catch((error) => {
          console.error("❌ Error al registrarse:", error);
          
          let errorMessage = "Error al crear cuenta: ";
          switch (error.code) {
            case 'auth/email-already-in-use':
              errorMessage = "Este email ya está registrado. Intenta iniciar sesión.";
              break;
            case 'auth/invalid-email':
              errorMessage = "Email inválido. Verifica el formato.";
              break;
            case 'auth/operation-not-allowed':
              errorMessage = "Registro con email no habilitado. Contacta al administrador.";
              break;
            case 'auth/weak-password':
              errorMessage = "Contraseña muy débil. Debe tener al menos 6 caracteres.";
              break;
            case 'auth/network-request-failed':
              errorMessage = "Error de conexión. Verifica tu internet.";
              break;
            case 'auth/too-many-requests':
              errorMessage = "Demasiados intentos. Espera unos minutos.";
              break;
            default:
              errorMessage += error.message;
              break;
          }
          
          showMessage(errorMessage, "error");
        });
    });
  }
});

// Función para limpiar campos del formulario
function clearFormFields() {
  const emailField = document.getElementById('email');
  const passwordField = document.getElementById('password');
  const confirmPasswordField = document.getElementById('confirmPassword');
  
  if (emailField) {
    emailField.value = '';
    emailField.defaultValue = '';
  }
  
  if (passwordField) {
    passwordField.value = '';
    passwordField.defaultValue = '';
  }
  
  if (confirmPasswordField) {
    confirmPasswordField.value = '';
    confirmPasswordField.defaultValue = '';
  }
  
  console.log('✅ Campos de email, contraseña y confirmación limpiados');
}

// Limpiar campos cuando se enfoca la ventana
window.addEventListener('focus', clearFormFields);

// Limpiar campos al regresar de otras páginas
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    clearFormFields();
  }
});

// Función para mostrar mensajes de error/éxito
function showMessage(message, type = 'info') {
  // Remover mensaje anterior si existe
  const existingMessage = document.querySelector('.message-overlay');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-overlay fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 animate__animated animate__fadeInDown';
  
  // Estilos según el tipo
  if (type === 'success') {
    messageDiv.classList.add('bg-green-500', 'bg-opacity-90', 'backdrop-blur-lg', 'text-white');
  } else if (type === 'error') {
    messageDiv.classList.add('bg-red-500', 'bg-opacity-90', 'backdrop-blur-lg', 'text-white');
  } else {
    messageDiv.classList.add('bg-blue-500', 'bg-opacity-90', 'backdrop-blur-lg', 'text-white');
  }
  
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  
  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.classList.remove('animate__fadeInDown');
      messageDiv.classList.add('animate__fadeOutUp');
      setTimeout(() => {
        messageDiv.remove();
      }, 500);
    }
  }, 5000);
}
