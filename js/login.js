
import { auth } from './firebase-init.js';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { deviceDetector } from './deviceDetector.js';

document.addEventListener("DOMContentLoaded", async function () {
  const loginForm = document.getElementById("login-form");
  const googleBtn = document.getElementById("google-login");

  // Limpiar campos al cargar el DOM
  clearFormFields();

  // Obtener información del usuario detectado
  let detectedUserEmail = null;
  try {
    const userInfo = await deviceDetector.getStoredUserInfo();
    if (userInfo && userInfo.email) {
      detectedUserEmail = userInfo.email;
      console.log('📧 Email detectado:', detectedUserEmail);
    }
  } catch (error) {
    console.error('Error obteniendo info del usuario:', error);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const password = document.getElementById("password").value;

      // Usar el email detectado o solicitar al usuario que use Google
      if (!detectedUserEmail) {
        if (window.showErrorMessage) {
          window.showErrorMessage('❌ No se pudo detectar tu email. Por favor, usa "Continuar con Google".');
        } else {
          alert('No se pudo detectar tu email. Por favor, usa "Continuar con Google".');
        }
        return;
      }

      // Mostrar loading
      if (window.showLoading) {
        window.showLoading('Iniciando sesión...');
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, detectedUserEmail, password);
        console.log("✅ Usuario logueado:", userCredential.user.email);
        
        // Ocultar loading
        if (window.hideLoading) {
          window.hideLoading();
        }
        
        // Mostrar mensaje de éxito
        if (window.showSuccessMessage) {
          window.showSuccessMessage('¡Bienvenido! Redirigiendo...');
        }
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          window.location.href = "home.html";
        }, 1500);
        
      } catch (error) {
        // Ocultar loading
        if (window.hideLoading) {
          window.hideLoading();
        }
        
        console.error("❌ Error al iniciar sesión:", error.code, error.message);
        console.log("🔍 Tipo de error:", typeof error.code);
        console.log("🔍 Error completo:", error);
        
        // Manejar diferentes tipos de errores de Firebase
        switch (error.code) {
          case 'auth/user-not-found':
            console.log('👤 Usuario no encontrado, mostrando diálogo de registro');
            if (window.showUserNotFoundDialog) {
              window.showUserNotFoundDialog(detectedUserEmail || 'usuario');
            } else {
              alert('No existe una cuenta con este email. Por favor regístrate primero.');
            }
            break;
            
          case 'auth/wrong-password':
            if (window.showErrorMessage) {
              window.showErrorMessage('❌ Contraseña incorrecta. Por favor verifica tu contraseña.');
            } else {
              alert('Contraseña incorrecta');
            }
            break;
            
          case 'auth/invalid-email':
            if (window.showErrorMessage) {
              window.showErrorMessage('❌ El formato del email no es válido.');
            } else {
              alert('Email inválido');
            }
            break;
            
          case 'auth/user-disabled':
            if (window.showErrorMessage) {
              window.showErrorMessage('❌ Esta cuenta ha sido deshabilitada. Contacta al soporte.');
            } else {
              alert('Cuenta deshabilitada');
            }
            break;
            
          case 'auth/too-many-requests':
            if (window.showErrorMessage) {
              window.showErrorMessage('❌ Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo.');
            } else {
              alert('Demasiados intentos. Espera unos minutos.');
            }
            break;
            
          case 'auth/network-request-failed':
            if (window.showErrorMessage) {
              window.showErrorMessage('❌ Error de conexión. Verifica tu conexión a internet.');
            } else {
              alert('Error de conexión');
            }
            break;
            
          default:
            console.error('🔥 Error no manejado:', error.code);
            console.log('📧 Email usado:', email);
            // Forzar modal de registro para emails no encontrados
            if (error.message && error.message.includes('no user record') || 
                error.message && error.message.includes('user not found') ||
                error.code === 'auth/invalid-credential') {
              console.log('🚨 Detectado error de usuario no encontrado por mensaje');
              if (window.showUserNotFoundDialog) {
                window.showUserNotFoundDialog(email);
              } else {
                alert('No existe una cuenta con este email. Por favor regístrate primero.');
              }
            } else {
              if (window.showErrorMessage) {
                window.showErrorMessage('❌ Error inesperado. Por favor intenta de nuevo.');
              } else {
                alert('Error al iniciar sesión: ' + error.message);
              }
            }
        }
      }
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener("click", async function () {
      const provider = new GoogleAuthProvider();
      
      // Mostrar loading
      if (window.showLoading) {
        window.showLoading('Conectando con Google...');
      }
      
      try {
        const result = await signInWithPopup(auth, provider);
        console.log("✅ Usuario logueado con Google:", result.user.email);
        
        // Ocultar loading
        if (window.hideLoading) {
          window.hideLoading();
        }
        
        // Mostrar mensaje de éxito
        if (window.showSuccessMessage) {
          window.showSuccessMessage('¡Bienvenido! Redirigiendo...');
        }
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          window.location.href = "home.html";
        }, 1500);
        
      } catch (error) {
        // Ocultar loading
        if (window.hideLoading) {
          window.hideLoading();
        }
        
        console.error("❌ Error al iniciar sesión con Google:", error.code, error.message);
        
        // Manejar errores específicos de Google Auth
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            if (window.showErrorMessage) {
              window.showErrorMessage('⚠️ Inicio de sesión cancelado. Intenta de nuevo.');
            }
            break;
            
          case 'auth/popup-blocked':
            if (window.showErrorMessage) {
              window.showErrorMessage('❌ Popup bloqueado. Habilita los popups para este sitio.');
            }
            break;
            
          case 'auth/network-request-failed':
            if (window.showErrorMessage) {
              window.showErrorMessage('❌ Error de conexión. Verifica tu conexión a internet.');
            }
            break;
            
          default:
            console.error('🔥 Error no manejado en Google Auth:', error.code);
            if (window.showErrorMessage) {
              window.showErrorMessage('❌ Error al conectar con Google. Intenta de nuevo.');
            } else {
              alert("Error al iniciar sesión con Google: " + error.message);
            }
        }
      }
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
