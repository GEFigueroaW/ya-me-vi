
import { auth } from './firebase-init.js';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const googleBtn = document.getElementById("google-login");
  const biometricBtn = document.getElementById("biometric-login");

  // Limpiar campos al cargar el DOM
  clearFormFields();

  // Verificar si los datos biométricos están disponibles
  checkBiometricAvailability();

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

  if (biometricBtn) {
    biometricBtn.addEventListener("click", function () {
      handleBiometricLogin();
    });
  }
});

// Función para verificar disponibilidad de datos biométricos
async function checkBiometricAvailability() {
  const biometricBtn = document.getElementById("biometric-login");
  
  try {
    // Verificar si WebAuthn está disponible
    if (window.PublicKeyCredential && 
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      // También verificar si hay credenciales biométricas guardadas
      const savedUserInfo = localStorage.getItem('biometric_user_info');
      
      if (available && savedUserInfo) {
        console.log("✅ Autenticación biométrica disponible y usuario registrado");
        biometricBtn.style.display = "flex";
      } else if (available && !savedUserInfo) {
        console.log("⚠️ Autenticación biométrica disponible pero usuario no registrado");
        // Mostrar botón pero con texto diferente
        biometricBtn.style.display = "flex";
        biometricBtn.innerHTML = `
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14.05 4.04 17.15 5.66c1.5.77 2.76 1.86 3.75 3.27.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.29-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4 0-1.36.69-2.5 1.65-3.4 2.94-.08.14-.23.21-.39.21z"/>
            <path d="M9.75 21.79c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.24-1.16-2.63-1.14-3.85 0-1.63.79-3.15 2.11-4.06 1.7-1.18 4.5-1.18 6.2 0 1.32.91 2.11 2.43 2.11 4.06.02 1.22-.45 2.61-1.14 3.85-.67 1.21-1.14 1.77-2.01 2.64-.09.1-.22.15-.35.15-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.24-1.16-2.63-1.14-3.85 0-1.63.79-3.15 2.11-4.06.85-.59 1.85-.59 2.7 0 1.32.91 2.11 2.43 2.11 4.06.02 1.22-.45 2.61-1.14 3.85-.67 1.21-1.14 1.77-2.01 2.64-.09.1-.22.15-.35.15z"/>
          </svg>
          Configurar datos biométricos
        `;
      } else {
        console.log("❌ Autenticación biométrica no disponible");
      }
    } else {
      console.log("❌ WebAuthn no soportado en este navegador");
    }
  } catch (error) {
    console.error("Error verificando disponibilidad biométrica:", error);
  }
}

// Función para manejar el login biométrico
async function handleBiometricLogin() {
  try {
    const savedUserInfo = localStorage.getItem('biometric_user_info');
    
    if (!savedUserInfo) {
      // Si no hay datos biométricos, redirigir al registro
      alert("No tienes datos biométricos registrados. Te redirigiremos al registro.");
      window.location.href = "register.html";
      return;
    }

    console.log("🔐 Iniciando login biométrico...");
    
    const userInfo = JSON.parse(savedUserInfo);
    
    // Configuración para autenticación
    const publicKeyCredentialRequestOptions = {
      challenge: new Uint8Array(32),
      allowCredentials: [{
        id: new Uint8Array(userInfo.credentialId.split(',').map(x => parseInt(x))),
        type: 'public-key',
      }],
      userVerification: 'required',
      timeout: 60000,
    };

    // Llenar el challenge con datos aleatorios
    crypto.getRandomValues(publicKeyCredentialRequestOptions.challenge);

    // Solicitar autenticación biométrica
    const credential = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });

    if (credential) {
      console.log("✅ Autenticación biométrica exitosa");
      
      // Actualizar última vez de uso
      userInfo.lastUsed = new Date().toISOString();
      localStorage.setItem('biometric_user_info', JSON.stringify(userInfo));
      
      // Mostrar mensaje de éxito
      alert("✅ Inicio de sesión biométrico exitoso!");
      
      // Redirigir a la página principal
      window.location.href = "home.html";
      
    } else {
      throw new Error("No se pudo verificar la autenticación biométrica");
    }

  } catch (error) {
    console.error("❌ Error en login biométrico:", error);
    
    let errorMessage = "Error en el inicio de sesión biométrico. ";
    
    if (error.name === 'NotAllowedError') {
      errorMessage += "Acceso denegado por el usuario.";
    } else if (error.name === 'SecurityError') {
      errorMessage += "Error de seguridad.";
    } else if (error.name === 'AbortError') {
      errorMessage += "Operación cancelada.";
    } else {
      errorMessage += error.message || "Error desconocido.";
    }
    
    alert(errorMessage);
  }
}

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
