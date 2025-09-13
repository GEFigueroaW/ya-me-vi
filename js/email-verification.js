// Utilidades para verificación de email
import { auth } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/**
 * Verifica si el usuario actual tiene email verificado
 * @returns {Promise<boolean>} True si está verificado, false si no
 */
export function isEmailVerified() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user.emailVerified);
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * Obtiene información del usuario y su estado de verificación
 * @returns {Promise<Object>} Objeto con información del usuario
 */
export function getUserVerificationInfo() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve({
          user: user,
          email: user.email,
          isVerified: user.emailVerified,
          displayName: user.displayName
        });
      } else {
        resolve({
          user: null,
          email: null,
          isVerified: false,
          displayName: null
        });
      }
    });
  });
}

/**
 * Verifica si el usuario puede acceder a funciones premium
 * (requiere email verificado)
 * @returns {Promise<boolean>} True si puede acceder
 */
export function canAccessPremiumFeatures() {
  return isEmailVerified();
}

/**
 * Muestra banner de verificación de email si no está verificado
 */
export function showEmailVerificationBanner() {
  getUserVerificationInfo().then(info => {
    if (info.user && !info.isVerified) {
      // Crear banner de verificación
      const banner = document.createElement('div');
      banner.id = 'email-verification-banner';
      banner.className = 'fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 px-4 z-50 shadow-lg';
      
      banner.innerHTML = `
        <div class="flex items-center justify-between max-w-4xl mx-auto">
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-sm font-medium">
              ⚠️ Verifica tu email (${info.email}) para acceder a todas las funciones
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <button id="verify-email-btn" class="bg-white text-yellow-600 px-3 py-1 rounded text-sm font-bold hover:bg-gray-100 transition-colors">
              Verificar
            </button>
            <button id="close-banner-btn" class="text-white hover:text-gray-200">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      
      document.body.insertBefore(banner, document.body.firstChild);
      
      // Ajustar padding del body para compensar el banner
      document.body.style.paddingTop = '60px';
      
      // Event listeners
      document.getElementById('verify-email-btn').addEventListener('click', () => {
        window.location.href = `email-verification.html?email=${encodeURIComponent(info.email)}`;
      });
      
      document.getElementById('close-banner-btn').addEventListener('click', () => {
        banner.remove();
        document.body.style.paddingTop = '0';
        
        // Guardar que el usuario cerró el banner (opcional)
        sessionStorage.setItem('email-banner-closed', 'true');
      });
      
      // No mostrar banner si ya lo cerró en esta sesión
      if (sessionStorage.getItem('email-banner-closed') === 'true') {
        banner.style.display = 'none';
        document.body.style.paddingTop = '0';
      }
    }
  });
}

/**
 * Bloquea funciones premium si el email no está verificado
 * @param {string} featureName Nombre de la función
 * @returns {Promise<boolean>} True si puede acceder, false si está bloqueado
 */
export function checkPremiumAccess(featureName = 'esta función') {
  return new Promise(async (resolve) => {
    const canAccess = await canAccessPremiumFeatures();
    
    if (!canAccess) {
      const info = await getUserVerificationInfo();
      
      if (info.user && !info.isVerified) {
        // Mostrar modal de verificación requerida
        showVerificationRequiredModal(info.email, featureName);
        resolve(false);
      } else {
        // No hay usuario autenticado
        window.location.href = 'login.html';
        resolve(false);
      }
    } else {
      resolve(true);
    }
  });
}

/**
 * Muestra modal indicando que se requiere verificación de email
 */
function showVerificationRequiredModal(email, featureName) {
  // Remover modal anterior si existe
  const existingModal = document.getElementById('verification-required-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'verification-required-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  
  modal.innerHTML = `
    <div class="bg-white rounded-xl p-6 max-w-md mx-auto text-center shadow-2xl animate__animated animate__zoomIn">
      <div class="mb-4">
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">🔒 Verificación Requerida</h3>
        <p class="text-gray-600 text-sm mb-4">
          Para acceder a <strong>${featureName}</strong> debes verificar tu email primero.
        </p>
      </div>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p class="text-blue-800 text-sm">
          📧 <strong>${email}</strong><br>
          Revisa tu bandeja de entrada y haz clic en el enlace de verificación.
        </p>
      </div>
      
      <div class="space-y-3">
        <button id="verify-now-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
          📧 Verificar Ahora
        </button>
        <button id="cancel-modal-btn" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-6 rounded-lg transition-all duration-300">
          Cancelar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners
  document.getElementById('verify-now-btn').addEventListener('click', () => {
    window.location.href = `email-verification.html?email=${encodeURIComponent(email)}`;
  });
  
  document.getElementById('cancel-modal-btn').addEventListener('click', () => {
    modal.remove();
  });
  
  // Cerrar con click fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

/**
 * Inicializa la verificación de email en la página
 * Debe llamarse en cada página que requiera verificación
 */
export function initEmailVerification() {
  // Mostrar banner si no está verificado
  showEmailVerificationBanner();
  
  console.log('✅ Sistema de verificación de email inicializado');
}