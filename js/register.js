
import { auth } from './firebase-init.js';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("register-form");
  const googleBtn = document.getElementById("google-register");
  const biometricBtn = document.getElementById("biometric-register");

  // Limpiar campos al cargar el DOM
  clearFormFields();

  // Verificar si los datos biométricos están disponibles
  checkBiometricAvailability();

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

  if (biometricBtn) {
    biometricBtn.addEventListener("click", function () {
      handleBiometricRegistration();
    });
  }
});

// Función para verificar disponibilidad de datos biométricos
async function checkBiometricAvailability() {
  const biometricBtn = document.getElementById("biometric-register");
  
  try {
    // Verificar si WebAuthn está disponible
    if (window.PublicKeyCredential && 
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      if (available) {
        console.log("✅ Autenticación biométrica disponible");
        biometricBtn.style.display = "flex";
      } else {
        console.log("❌ Autenticación biométrica no disponible en este dispositivo");
      }
    } else {
      console.log("❌ WebAuthn no soportado en este navegador");
    }
  } catch (error) {
    console.error("Error verificando disponibilidad biométrica:", error);
  }
}

// Función para manejar el registro biométrico
async function handleBiometricRegistration() {
  try {
    console.log("🔐 Iniciando registro biométrico...");
    
    // Generar ID único para el usuario
    const userId = new Uint8Array(64);
    crypto.getRandomValues(userId);
    
    // Configuración para crear credenciales
    const publicKeyCredentialCreationOptions = {
      challenge: new Uint8Array(32),
      rp: {
        name: "YA ME VI - Lotería",
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: "usuario@yemevi.com",
        displayName: "Usuario YA ME VI",
      },
      pubKeyCredParams: [{alg: -7, type: "public-key"}],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "direct"
    };

    // Llenar el challenge con datos aleatorios
    crypto.getRandomValues(publicKeyCredentialCreationOptions.challenge);

    // Crear credenciales biométricas
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });

    if (credential) {
      console.log("✅ Credenciales biométricas creadas exitosamente");
      
      // Guardar información básica en localStorage (en producción usar backend seguro)
      const userInfo = {
        id: Array.from(userId).join(','),
        registeredAt: new Date().toISOString(),
        credentialId: Array.from(new Uint8Array(credential.rawId)).join(','),
        authenticatorData: Array.from(new Uint8Array(credential.response.authenticatorData)).join(',')
      };
      
      localStorage.setItem('biometric_user_info', JSON.stringify(userInfo));
      
      // Mostrar mensaje de éxito
      alert("✅ Registro biométrico completado exitosamente!");
      
      // Redirigir a la página de entrada de sueños
      window.location.href = "dream-input.html";
      
    } else {
      throw new Error("No se pudieron crear las credenciales");
    }

  } catch (error) {
    console.error("❌ Error en registro biométrico:", error);
    
    let errorMessage = "Error en el registro biométrico. ";
    
    if (error.name === 'NotAllowedError') {
      errorMessage += "Acceso denegado por el usuario.";
    } else if (error.name === 'NotSupportedError') {
      errorMessage += "Función no soportada en este dispositivo.";
    } else if (error.name === 'SecurityError') {
      errorMessage += "Error de seguridad.";
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
