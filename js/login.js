import { auth } from './firebase-init.js';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { deviceDetector } from './deviceDetector.js';

import { auth } from './firebase-init.js';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { deviceDetector } from './deviceDetector.js';

document.addEventListener("DOMContentLoaded", async function () {
  console.log('🔄 Iniciando login-email.html...');
  
  // Mostrar loading mientras verificamos el usuario
  showLoadingOverlay('Verificando cuenta...');
  
  // Variables para control de estado
  let detectedUserEmail = null;
  let userInfo = null;
  let interfaceShown = false;
  
  // Timeout para garantizar que algo se muestre
  const fallbackTimeout = setTimeout(() => {
    if (!interfaceShown) {
      console.log('⏰ Timeout: Mostrando interfaz de usuario nuevo por fallback');
      showNewUserInterface();
      hideLoadingOverlay();
      interfaceShown = true;
    }
  }, 3000);
  
  try {
    // Verificar si Firebase está disponible
    if (typeof auth === 'undefined') {
      throw new Error('Firebase auth no disponible');
    }
    
    // Esperar un poco para que deviceDetector se inicialice
    if (deviceDetector && typeof deviceDetector.waitForInit === 'function') {
      await deviceDetector.waitForInit();
    }
    
    // Intentar obtener información del usuario
    if (deviceDetector && typeof deviceDetector.getStoredUserInfo === 'function') {
      userInfo = await deviceDetector.getStoredUserInfo();
    }
    
    if (userInfo && userInfo.email) {
      detectedUserEmail = userInfo.email;
      console.log('📧 Email detectado:', detectedUserEmail);
      console.log('👤 Información del usuario:', userInfo);
      
      // Mostrar interfaz para usuario registrado
      showRegisteredUserInterface(detectedUserEmail);
      interfaceShown = true;
    } else {
      console.log('❌ No se detectó usuario registrado');
      
      // Mostrar interfaz para usuario nuevo
      showNewUserInterface();
      interfaceShown = true;
    }
    
    // Limpiar timeout ya que logramos mostrar una interfaz
    clearTimeout(fallbackTimeout);
    
  } catch (error) {
    console.error('❌ Error obteniendo info del usuario:', error);
    
    // En caso de error, mostrar interfaz para usuario nuevo
    if (!interfaceShown) {
      showNewUserInterface();
      interfaceShown = true;
    }
    
    // Limpiar timeout
    clearTimeout(fallbackTimeout);
  }
  
  // Ocultar loading después de mostrar interfaz
  if (interfaceShown) {
    hideLoadingOverlay();
  }
  
  // Configurar event listeners
  setupEventListeners(detectedUserEmail);
});

function showRegisteredUserInterface(email) {
  console.log('✅ Mostrando interfaz para usuario registrado');
  
  const registeredContainer = document.getElementById('registered-user-login');
  const newUserContainer = document.getElementById('new-user-options');
  const detectedEmailSpan = document.getElementById('detected-email');
  
  if (registeredContainer && newUserContainer && detectedEmailSpan) {
    // Mostrar email detectado
    detectedEmailSpan.textContent = email;
    
    // Mostrar contenedor de usuario registrado
    registeredContainer.style.display = 'block';
    newUserContainer.style.display = 'none';
  }
}

function showNewUserInterface() {
  console.log('✅ Mostrando interfaz para usuario nuevo');
  
  const registeredContainer = document.getElementById('registered-user-login');
  const newUserContainer = document.getElementById('new-user-options');
  
  if (registeredContainer && newUserContainer) {
    registeredContainer.style.display = 'none';
    newUserContainer.style.display = 'block';
  }
}

function setupEventListeners(detectedUserEmail) {
  // Event listener para el formulario de login (solo para usuarios registrados)
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      await handlePasswordLogin(detectedUserEmail);
    });
  }

  // Event listener para el botón de Google (usuarios registrados)
  const googleBtn = document.getElementById("google-login");
  if (googleBtn) {
    googleBtn.addEventListener("click", async function () {
      await handleGoogleLogin();
    });
  }

  // Event listener para el botón de Google (usuarios nuevos)
  const googleBtnNew = document.getElementById("google-login-new");
  if (googleBtnNew) {
    googleBtnNew.addEventListener("click", async function () {
      await handleGoogleLogin();
    });
  }

  // Event listener para crear cuenta nueva
  const createAccountBtn = document.getElementById("create-account-btn");
  if (createAccountBtn) {
    createAccountBtn.addEventListener("click", function () {
      console.log('🔄 Redirigiendo a registro...');
      window.location.href = "register.html";
    });
  }
}

async function handlePasswordLogin(email) {
  if (!email) {
    showErrorMessage('❌ Error: No se pudo detectar tu email.');
    return;
  }

  const password = document.getElementById("password").value;
  if (!password) {
    showErrorMessage('❌ Por favor ingresa tu contraseña.');
    return;
  }

  // Mostrar loading
  showLoadingOverlay('Iniciando sesión...');

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Usuario logueado:", userCredential.user.email);
    
    // Mostrar mensaje de éxito
    showSuccessMessage('¡Bienvenido! Redirigiendo...');
    
    // Redirigir después de un breve delay
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1500);
    
  } catch (error) {
    hideLoadingOverlay();
    console.error("❌ Error al iniciar sesión:", error.code, error.message);
    
    // Manejar diferentes tipos de errores de Firebase
    switch (error.code) {
      case 'auth/user-not-found':
        showErrorMessage('❌ No existe una cuenta con este email. ¿Quizás necesitas registrarte?');
        // Mostrar interfaz de usuario nuevo después de un delay
        setTimeout(() => {
          showNewUserInterface();
        }, 3000);
        break;
        
      case 'auth/wrong-password':
        showErrorMessage('❌ Contraseña incorrecta. Por favor verifica tu contraseña.');
        break;
        
      case 'auth/invalid-email':
        showErrorMessage('❌ El formato del email no es válido.');
        break;
        
      case 'auth/user-disabled':
        showErrorMessage('❌ Esta cuenta ha sido deshabilitada.');
        break;
        
      case 'auth/too-many-requests':
        showErrorMessage('❌ Demasiados intentos fallidos. Inténtalo más tarde.');
        break;
        
      default:
        showErrorMessage(`❌ Error: ${error.message}`);
        break;
    }
  }
}

async function handleGoogleLogin() {
  console.log('🔄 Iniciando login con Google...');
  showLoadingOverlay('Conectando con Google...');

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    console.log("✅ Login con Google exitoso:", result.user.email);
    
    showSuccessMessage('¡Bienvenido! Redirigiendo...');
    
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1500);
    
  } catch (error) {
    hideLoadingOverlay();
    console.error("❌ Error en login con Google:", error);
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        showErrorMessage('❌ Login cancelado. Inténtalo de nuevo.');
        break;
      case 'auth/popup-blocked':
        showErrorMessage('❌ Popup bloqueado. Por favor permite popups para este sitio.');
        break;
      default:
        showErrorMessage(`❌ Error con Google: ${error.message}`);
        break;
    }
  }
}

// Utilidades para mostrar mensajes y loading
function showLoadingOverlay(message) {
  const overlay = document.getElementById('loading-overlay');
  const loadingMessage = document.getElementById('loading-message');
  
  if (overlay && loadingMessage) {
    loadingMessage.textContent = message;
    overlay.classList.remove('hidden');
  }
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

function showErrorMessage(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.innerHTML = `<div class="bg-red-500 bg-opacity-80 backdrop-blur-lg text-white px-4 py-2 rounded-lg text-sm font-medium">${message}</div>`;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      errorDiv.innerHTML = '';
    }, 5000);
  }
}

function showSuccessMessage(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.innerHTML = `<div class="bg-green-500 bg-opacity-80 backdrop-blur-lg text-white px-4 py-2 rounded-lg text-sm font-medium">${message}</div>`;
  }
}

// Funciones para limpiar campos (mantener compatibilidad)
function clearFormFields() {
  const passwordField = document.getElementById('password');
  
  if (passwordField) {
    passwordField.value = '';
    console.log('✅ Campo de contraseña limpiado');
  }
}

// Limpiar campos cuando se enfoca la ventana
window.addEventListener('focus', clearFormFields);

// Limpiar campos al regresar de otras páginas
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    clearFormFields();
  }
});
