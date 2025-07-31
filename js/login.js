import { auth } from './firebase-init.js';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { deviceDetector } from './deviceDetector.js';

// Función para mostrar interfaz de usuario registrado
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
    
    hideLoadingOverlay();
  }
}

// Función para mostrar interfaz de usuario nuevo
function showNewUserInterface() {
  console.log('✅ Mostrando interfaz para usuario nuevo');
  
  const registeredContainer = document.getElementById('registered-user-login');
  const newUserContainer = document.getElementById('new-user-options');
  
  if (registeredContainer && newUserContainer) {
    registeredContainer.style.display = 'none';
    newUserContainer.style.display = 'block';
    
    hideLoadingOverlay();
  }
}

// Función para ocultar loading
function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// Función para mostrar loading
function showLoadingOverlay(message) {
  const overlay = document.getElementById('loading-overlay');
  const loadingMessage = document.getElementById('loading-message');
  
  if (overlay && loadingMessage) {
    loadingMessage.textContent = message;
    overlay.classList.remove('hidden');
  }
}

// Función para mostrar mensajes de error
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

// Función para mostrar mensajes de éxito
function showSuccessMessage(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.innerHTML = `<div class="bg-green-500 bg-opacity-80 backdrop-blur-lg text-white px-4 py-2 rounded-lg text-sm font-medium">${message}</div>`;
  }
}

// Inicialización principal - VERSION SIMPLIFICADA
document.addEventListener("DOMContentLoaded", function () {
  console.log('🔄 Iniciando login-email.html (versión simplificada)...');
  
  // Mostrar loading inicial
  showLoadingOverlay('Verificando cuenta...');
  
  // Verificar si estamos en desktop para ajustar la experiencia
  import('./deviceDetector.js').then(({ deviceDetector }) => {
    deviceDetector.waitForInit().then(() => {
      if (deviceDetector.isDesktop) {
        console.log('🖥️ Detectado escritorio - ajustando experiencia para desktop');
        // En desktop, queremos que el botón de "Usar otra cuenta" sea más visible
        const useAnotherAccountBtn = document.getElementById("use-another-account-btn");
        if (useAnotherAccountBtn) {
          useAnotherAccountBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
          useAnotherAccountBtn.classList.remove('bg-transparent', 'hover:bg-white', 'hover:bg-opacity-10');
        }
      }
    });
  }).catch(error => {
    console.error('Error detectando tipo de dispositivo:', error);
  });
  
  // Intentar cargar Firebase y deviceDetector de forma asíncrona
  initializeWithFirebase();
  
  // Fallback inmediato - mostrar interfaz después de 1 segundo
  setTimeout(() => {
    const registeredContainer = document.getElementById('registered-user-login');
    const newUserContainer = document.getElementById('new-user-options');
    
    // Si ninguna interfaz está visible, mostrar la de usuario nuevo
    if (registeredContainer && newUserContainer) {
      const registeredVisible = registeredContainer.style.display === 'block';
      const newUserVisible = newUserContainer.style.display === 'block';
      
      if (!registeredVisible && !newUserVisible) {
        console.log('⚠️ Fallback activado: Mostrando interfaz de usuario nuevo');
        showNewUserInterface();
      }
    }
  }, 1000);
  
  // Configurar event listeners básicos
  setupBasicEventListeners();
});

// Función para inicializar con Firebase (de forma asíncrona)
async function initializeWithFirebase() {
  try {
    // Importar Firebase dinámicamente
    const { auth } = await import('./firebase-init.js');
    const { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
    const { deviceDetector } = await import('./deviceDetector.js');
    
    console.log('✅ Firebase cargado exitosamente');
    
    // Esperar a que deviceDetector se inicialice
    if (deviceDetector && typeof deviceDetector.waitForInit === 'function') {
      await deviceDetector.waitForInit();
    }
    
    // Obtener información del usuario
    const userInfo = await deviceDetector.getStoredUserInfo();
    
    if (userInfo && userInfo.email) {
      console.log('📧 Email detectado:', userInfo.email);
      showRegisteredUserInterface(userInfo.email);
      
      // Configurar event listeners avanzados
      setupFirebaseEventListeners(userInfo.email, auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider);
    } else {
      console.log('❌ No se detectó usuario registrado');
      showNewUserInterface();
    }
    
  } catch (error) {
    console.error('❌ Error cargando Firebase:', error);
    
    // Si falla Firebase, mostrar interfaz básica
    showNewUserInterface();
  }
}

// Event listeners básicos (sin Firebase)
function setupBasicEventListeners() {
  // Botón para crear cuenta nueva
  const createAccountBtn = document.getElementById("create-account-btn");
  if (createAccountBtn) {
    createAccountBtn.addEventListener("click", function () {
      console.log('🔄 Redirigiendo a registro...');
      window.location.href = "register.html";
    });
  }
  
  // Botón para usar otra cuenta (nueva funcionalidad para desktop)
  const useAnotherAccountBtn = document.getElementById("use-another-account-btn");
  if (useAnotherAccountBtn) {
    useAnotherAccountBtn.addEventListener("click", function () {
      console.log('🔄 Mostrando opciones para nueva cuenta...');
      // Mostrar interfaz de usuario nuevo para permitir cambiar de cuenta
      showNewUserInterface();
    });
  }
  
  // Botones de Google (sin funcionalidad real si no hay Firebase)
  const googleBtn = document.getElementById("google-login");
  const googleBtnNew = document.getElementById("google-login-new");
  
  if (googleBtn) {
    googleBtn.addEventListener("click", function () {
      showErrorMessage('⚠️ Funcionalidad de Google no disponible temporalmente. Usa contraseña o regístrate.');
    });
  }
  
  if (googleBtnNew) {
    googleBtnNew.addEventListener("click", function () {
      showErrorMessage('⚠️ Redirigiendo a registro con Google...');
      setTimeout(() => {
        window.location.href = "register.html";
      }, 1000);
    });
  }
  
  // Formulario de login básico
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showErrorMessage('⚠️ Sistema de autenticación cargando. Intenta en unos momentos.');
    });
  }
}

// Event listeners avanzados (con Firebase)
function setupFirebaseEventListeners(detectedUserEmail, auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider) {
  // Reemplazar event listeners básicos con los de Firebase
  
  // Botón para usar otra cuenta (nueva funcionalidad para desktop)
  const useAnotherAccountBtn = document.getElementById("use-another-account-btn");
  if (useAnotherAccountBtn) {
    // Remover event listener anterior
    const newBtn = useAnotherAccountBtn.cloneNode(true);
    useAnotherAccountBtn.parentNode.replaceChild(newBtn, useAnotherAccountBtn);
    
    newBtn.addEventListener("click", function () {
      console.log('🔄 Mostrando opciones para nueva cuenta...');
      // Mostrar interfaz de usuario nuevo para permitir cambiar de cuenta
      showNewUserInterface();
    });
  }
  
  // Formulario de login
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    // Remover event listener anterior
    const newForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newForm, loginForm);
    
    newForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      await handlePasswordLogin(detectedUserEmail, auth, signInWithEmailAndPassword);
    });
  }
  
  // Botones de Google
  const googleBtn = document.getElementById("google-login");
  const googleBtnNew = document.getElementById("google-login-new");
  
  if (googleBtn) {
    const newGoogleBtn = googleBtn.cloneNode(true);
    googleBtn.parentNode.replaceChild(newGoogleBtn, googleBtn);
    
    newGoogleBtn.addEventListener("click", async function () {
      await handleGoogleLogin(auth, signInWithPopup, GoogleAuthProvider);
    });
  }
  
  if (googleBtnNew) {
    const newGoogleBtnNew = googleBtnNew.cloneNode(true);
    googleBtnNew.parentNode.replaceChild(newGoogleBtnNew, googleBtnNew);
    
    newGoogleBtnNew.addEventListener("click", async function () {
      await handleGoogleRegistration(auth, signInWithPopup, GoogleAuthProvider);
    });
  }
}

// Manejo de login con contraseña
async function handlePasswordLogin(email, auth, signInWithEmailAndPassword) {
  if (!email) {
    showErrorMessage('❌ Error: No se pudo detectar tu email.');
    return;
  }

  const password = document.getElementById("password").value;
  if (!password) {
    showErrorMessage('❌ Por favor ingresa tu contraseña.');
    return;
  }

  showLoadingOverlay('Iniciando sesión...');

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Usuario logueado:", userCredential.user.email);
    
    showSuccessMessage('¡Bienvenido! Redirigiendo...');
    
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1500);
    
  } catch (error) {
    hideLoadingOverlay();
    console.error("❌ Error al iniciar sesión:", error.code, error.message);
    
    switch (error.code) {
      case 'auth/user-not-found':
        showErrorMessage('❌ No existe una cuenta con este email. ¿Quizás necesitas registrarte?');
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
      default:
        showErrorMessage(`❌ Error: ${error.message}`);
        break;
    }
  }
}

// Manejo de registro con Google (lleva a login-email.html)
async function handleGoogleRegistration(auth, signInWithPopup, GoogleAuthProvider) {
  console.log('🔄 Iniciando registro con Google...');
  showLoadingOverlay('Creando cuenta con Google...');

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    console.log("✅ Registro con Google exitoso:", result.user.email);
    
    // Verificar si es usuario nuevo o existente
    const isNewUser = result._tokenResponse?.isNewUser || 
                     result.user.metadata?.creationTime === result.user.metadata?.lastSignInTime;
    
    if (isNewUser) {
      console.log("🎉 Usuario nuevo detectado, redirigiendo a login confirmación");
      showSuccessMessage('¡Cuenta creada! Configurando tu experiencia...');
      
      setTimeout(() => {
        window.location.href = "login-email.html?registered=true";
      }, 1500);
    } else {
      console.log("👋 Usuario existente, redirigiendo a home");
      showSuccessMessage('¡Bienvenido de vuelta! Redirigiendo...');
      
      setTimeout(() => {
        window.location.href = "home.html";
      }, 1500);
    }
    
  } catch (error) {
    hideLoadingOverlay();
    console.error("❌ Error en registro con Google:", error);
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        showErrorMessage('❌ Registro cancelado. Inténtalo de nuevo.');
        break;
      case 'auth/popup-blocked':
        showErrorMessage('❌ Popup bloqueado. Por favor permite popups para este sitio.');
        break;
      case 'auth/account-exists-with-different-credential':
        showErrorMessage('❌ Ya existe una cuenta con este email. Intenta iniciar sesión.');
        break;
      default:
        showErrorMessage(`❌ Error en registro: ${error.message}`);
        break;
    }
  }
}

// Manejo de login con Google
async function handleGoogleLogin(auth, signInWithPopup, GoogleAuthProvider) {
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
