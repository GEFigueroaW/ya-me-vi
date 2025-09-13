
import { auth } from './firebase-init.js';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
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
          
          // Actualizar el perfil del usuario con el nombre
          try {
            await updateProfile(userCredential.user, {
              displayName: name
            });
            console.log("✅ Perfil actualizado con nombre:", name);
          } catch (profileError) {
            console.error("⚠️ Error actualizando perfil:", profileError);
          }
          
          // Enviar email de verificación
          try {
            await sendEmailVerification(userCredential.user, {
              url: window.location.origin + '/welcome.html',
              handleCodeInApp: true
            });
            
            console.log("📧 Email de verificación enviado");
            
            // Mostrar mensaje especial con instrucciones
            showEmailVerificationMessage(email);
            
            // Redirigir a una página de verificación después de mostrar el mensaje
            setTimeout(() => {
              window.location.href = "email-verification.html?email=" + encodeURIComponent(email);
            }, 3000);
            
          } catch (verificationError) {
            console.error("❌ Error enviando verificación:", verificationError);
            
            // Aunque falle la verificación, permitir continuar pero avisar
            showMessage("✅ Cuenta creada. Verificación de email pendiente.", "success");
            
            setTimeout(() => {
              window.location.href = "dream-input.html";
            }, 2000);
          }
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

// Función para mostrar mensaje especial de verificación de email
function showEmailVerificationMessage(email) {
  // Remover mensaje anterior si existe
  const existingMessage = document.querySelector('.verification-overlay');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'verification-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  
  messageDiv.innerHTML = `
    <div class="bg-white rounded-xl p-8 max-w-md mx-auto text-center shadow-2xl animate__animated animate__zoomIn">
      <div class="mb-6">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">¡Verifica tu Email!</h3>
        <p class="text-gray-600 text-sm mb-4">
          Hemos enviado un email de verificación a:<br>
          <strong class="text-blue-600">${email}</strong>
        </p>
      </div>
      
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <div class="text-left">
            <p class="text-yellow-800 text-sm font-medium">Importante:</p>
            <p class="text-yellow-700 text-xs mt-1">
              Debes verificar tu email para acceder a todas las funciones de YA ME VI
            </p>
          </div>
        </div>
      </div>
      
      <div class="space-y-3">
        <p class="text-xs text-gray-500">
          📧 Revisa tu bandeja de entrada y spam<br>
          🔗 Haz clic en el enlace de verificación<br>
          ✅ Regresa para continuar
        </p>
      </div>
      
      <div class="mt-6 pt-4 border-t border-gray-200">
        <p class="text-xs text-gray-400">
          Redirigiendo automáticamente...
        </p>
      </div>
    </div>
  `;
  
  document.body.appendChild(messageDiv);
}

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
