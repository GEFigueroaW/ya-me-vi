/**
 * Integración de autenticación biométrica para las páginas de login
 * Compatible con navegadores web y aplicaciones WebView (APK)
 */

import { BiometricUtils, biometricAuth } from './biometric-auth.js';
import { auth } from './firebase-init.js';
import { signInWithCustomToken } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Clase para manejar login biométrico
export class BiometricLogin {
  constructor() {
    this.initialized = false;
    this.biometricButton = null;
  }

  // Inicializar el sistema de login biométrico
  async initialize(buttonId = 'biometricLoginBtn') {
    try {
      console.log('🔐 [BIOMETRIC-LOGIN] Inicializando sistema biométrico...');
      
      this.biometricButton = document.getElementById(buttonId);
      
      // Verificar soporte y credenciales almacenadas
      const isSupported = await BiometricUtils.isSupported();
      const hasCredentials = biometricAuth.hasStoredCredentials();
      
      console.log('🔍 [BIOMETRIC-LOGIN] Estado:', {
        isSupported,
        hasCredentials,
        buttonExists: !!this.biometricButton
      });
      
      if (isSupported && hasCredentials && this.biometricButton) {
        // Mostrar botón biométrico
        this.biometricButton.style.display = 'block';
        
        // Configurar event listener
        this.biometricButton.addEventListener('click', this.handleBiometricLogin.bind(this));
        
        // Mostrar información de la cuenta registrada
        this.showRegisteredAccountInfo();
        
        console.log('✅ [BIOMETRIC-LOGIN] Sistema biométrico inicializado');
        this.initialized = true;
        return true;
      } else {
        console.log('ℹ️ [BIOMETRIC-LOGIN] Sistema biométrico no disponible');
        return false;
      }
    } catch (error) {
      console.error('❌ [BIOMETRIC-LOGIN] Error inicializando:', error);
      return false;
    }
  }

  // Mostrar información de la cuenta registrada
  showRegisteredAccountInfo() {
    const credentialsInfo = biometricAuth.getStoredCredentialsInfo();
    if (credentialsInfo && this.biometricButton) {
      // Actualizar el texto del botón para mostrar el email
      const displayEmail = credentialsInfo.email.length > 25 
        ? credentialsInfo.email.substring(0, 22) + '...' 
        : credentialsInfo.email;
      
      this.biometricButton.innerHTML = `
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.69-2.5 1.68-3.4 2.94-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-2.04-1.34-3.28 0-2.54 2.07-4.61 4.61-4.61s4.61 2.07 4.61 4.61c0 1.24-.47 2.41-1.34 3.28-.19.19-.49.19-.68 0-.19-.19-.19-.49 0-.68.68-.68 1.02-1.58 1.02-2.6 0-2.02-1.64-3.61-3.61-3.61s-3.61 1.59-3.61 3.61c0 1.02.34 1.92 1.02 2.6.19.19.19.49 0 .68-.09.1-.22.15-.35.15z"/>
          <path d="M12 18.72c-.7 0-1.26-.56-1.26-1.26s.56-1.26 1.26-1.26 1.26.56 1.26 1.26-.56 1.26-1.26 1.26z"/>
        </svg>
        <div class="flex flex-col items-start">
          <span class="font-medium">Continuar como</span>
          <span class="text-sm opacity-90">${displayEmail}</span>
        </div>
      `;
    }
  }

  // Manejar el click del botón biométrico
  async handleBiometricLogin(event) {
    event.preventDefault();
    
    try {
      console.log('🔐 [BIOMETRIC-LOGIN] Iniciando autenticación biométrica...');
      
      // Mostrar estado de carga
      this.showLoadingState();
      
      // Intentar autenticación biométrica
      const authResult = await BiometricUtils.authenticateAndGetUser();
      
      if (authResult && authResult.email) {
        console.log('✅ [BIOMETRIC-LOGIN] Autenticación biométrica exitosa:', authResult.email);
        
        // Simular login exitoso con Firebase Auth
        // En una implementación real, deberías validar con tu backend
        await this.processBiometricAuthResult(authResult);
        
      } else {
        throw new Error('Autenticación biométrica falló');
      }
      
    } catch (error) {
      console.error('❌ [BIOMETRIC-LOGIN] Error en autenticación biométrica:', error);
      this.showError('Error en autenticación biométrica: ' + error.message);
    } finally {
      this.hideLoadingState();
    }
  }

  // Procesar resultado de autenticación biométrica
  async processBiometricAuthResult(authResult) {
    try {
      // Guardar información del usuario para uso posterior
      localStorage.setItem('biometric_user_info', JSON.stringify({
        email: authResult.email,
        uid: authResult.uid,
        authenticatedAt: authResult.authenticatedAt,
        method: 'biometric'
      }));
      
      console.log('🎯 [BIOMETRIC-LOGIN] Procesando autenticación exitosa para:', authResult.email);
      
      // Verificar si es administrador
      const adminEmails = [
        'gfigueroa.w@gmail.com', 
        'admin@yamevi.com.mx', 
        'eugenfw@gmail.com',
        'guillermo.figueroaw@totalplay.com.mx'
      ];
      
      const isAdmin = adminEmails.includes(authResult.email.toLowerCase());
      
      // Verificar si viene de redirección de admin
      const urlParams = new URLSearchParams(window.location.search);
      const isAdminRedirect = urlParams.get('redirect') === 'admin';
      
      if (isAdminRedirect && isAdmin) {
        console.log('🔄 [BIOMETRIC-LOGIN] Redirigiendo a admin panel...');
        localStorage.setItem('admin_verified', 'true');
        window.location.href = "admin.html";
      } else if (isAdminRedirect && !isAdmin) {
        throw new Error(`Sin permisos de administrador para: ${authResult.email}`);
      } else {
        console.log('✅ [BIOMETRIC-LOGIN] Redirigiendo a home.html');
        window.location.href = "home.html";
      }
      
    } catch (error) {
      console.error('❌ [BIOMETRIC-LOGIN] Error procesando resultado:', error);
      throw error;
    }
  }

  // Mostrar estado de carga
  showLoadingState() {
    if (this.biometricButton) {
      this.biometricButton.disabled = true;
      this.biometricButton.innerHTML = `
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        <span>Verificando identidad...</span>
      `;
    }
  }

  // Ocultar estado de carga
  hideLoadingState() {
    if (this.biometricButton) {
      this.biometricButton.disabled = false;
      this.showRegisteredAccountInfo();
    }
  }

  // Mostrar error
  showError(message) {
    // Buscar elemento de error existente o crear uno nuevo
    let errorElement = document.getElementById('biometricError');
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = 'biometricError';
      errorElement.className = 'mt-4 p-3 bg-red-600 bg-opacity-80 backdrop-blur-lg rounded-lg text-white text-sm text-center';
      
      // Insertar después del botón biométrico
      if (this.biometricButton && this.biometricButton.parentNode) {
        this.biometricButton.parentNode.insertBefore(errorElement, this.biometricButton.nextSibling);
      }
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }, 5000);
  }

  // Limpiar credenciales biométricas almacenadas
  clearStoredCredentials() {
    biometricAuth.clearStoredCredentials();
    localStorage.removeItem('biometric_user_info');
    
    if (this.biometricButton) {
      this.biometricButton.style.display = 'none';
    }
    
    console.log('🗑️ [BIOMETRIC-LOGIN] Credenciales biométricas eliminadas');
  }

  // Verificar si el usuario actual coincide con las credenciales almacenadas
  validateStoredCredentials(currentUserEmail) {
    const credentialsInfo = biometricAuth.getStoredCredentialsInfo();
    
    if (credentialsInfo && currentUserEmail) {
      return credentialsInfo.email.toLowerCase() === currentUserEmail.toLowerCase();
    }
    
    return false;
  }
}

// Función de utilidad para inicializar en páginas de login
export async function initBiometricLogin(buttonId = 'biometricLoginBtn') {
  const biometricLogin = new BiometricLogin();
  const initialized = await biometricLogin.initialize(buttonId);
  
  if (initialized) {
    console.log('✅ Sistema de login biométrico inicializado');
  } else {
    console.log('ℹ️ Sistema de login biométrico no disponible');
  }
  
  return biometricLogin;
}

export default BiometricLogin;
