/**
 * Interfaz JavaScript para la comunicación entre WebView y aplicación nativa
 * Este archivo debe ser incluido en la aplicación APK para habilitar funcionalidades biométricas
 */

// === INTERFAZ ANDROID ===
window.AndroidBiometric = {
  // Verificar disponibilidad de biometría
  isAvailable: function(callback) {
    try {
      // Esta función debe ser implementada en el código Java/Kotlin de Android
      if (typeof AndroidInterface !== 'undefined' && AndroidInterface.isBiometricAvailable) {
        AndroidInterface.isBiometricAvailable(callback);
      } else {
        callback(false);
      }
    } catch (error) {
      console.error('Error verificando biometría Android:', error);
      callback(false);
    }
  },

  // Registrar credenciales biométricas
  register: function(email, userId, callback) {
    try {
      if (typeof AndroidInterface !== 'undefined' && AndroidInterface.registerBiometric) {
        AndroidInterface.registerBiometric(email, userId, callback);
      } else {
        callback(false, { error: 'Android biometric interface not available' });
      }
    } catch (error) {
      console.error('Error registrando biometría Android:', error);
      callback(false, { error: error.message });
    }
  },

  // Autenticar con biometría
  authenticate: function(email, callback) {
    try {
      if (typeof AndroidInterface !== 'undefined' && AndroidInterface.authenticateWithBiometric) {
        AndroidInterface.authenticateWithBiometric(email, callback);
      } else {
        callback(false, { error: 'Android biometric interface not available' });
      }
    } catch (error) {
      console.error('Error en autenticación biométrica Android:', error);
      callback(false, { error: error.message });
    }
  }
};

// === INTERFAZ iOS ===
// Para iOS, la comunicación se maneja a través de webkit.messageHandlers
window.iOSBiometric = {
  // Verificar disponibilidad
  checkAvailability: function() {
    if (window.webkit?.messageHandlers?.biometric) {
      window.webkit.messageHandlers.biometric.postMessage({
        action: 'checkAvailability'
      });
    } else {
      // Fallback - simular respuesta negativa
      setTimeout(() => {
        if (window.biometricCallback) {
          window.biometricCallback({ available: false });
        }
      }, 100);
    }
  },

  // Registrar credenciales
  register: function(email, userId) {
    if (window.webkit?.messageHandlers?.biometric) {
      window.webkit.messageHandlers.biometric.postMessage({
        action: 'register',
        email: email,
        userId: userId
      });
    } else {
      setTimeout(() => {
        if (window.biometricRegisterCallback) {
          window.biometricRegisterCallback({ 
            success: false, 
            error: 'iOS biometric interface not available' 
          });
        }
      }, 100);
    }
  },

  // Autenticar
  authenticate: function(email, credentialId) {
    if (window.webkit?.messageHandlers?.biometric) {
      window.webkit.messageHandlers.biometric.postMessage({
        action: 'authenticate',
        email: email,
        credentialId: credentialId
      });
    } else {
      setTimeout(() => {
        if (window.biometricAuthCallback) {
          window.biometricAuthCallback({ 
            success: false, 
            error: 'iOS biometric interface not available' 
          });
        }
      }, 100);
    }
  }
};

// === DETECCIÓN DE PLATAFORMA Y CONFIGURACIÓN ===
window.BiometricNativeInterface = {
  platform: null,
  isAvailable: false,

  // Detectar plataforma y configurar interfaz
  init: function() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('android')) {
      this.platform = 'android';
      this.isAvailable = typeof AndroidInterface !== 'undefined';
      console.log('🤖 [NATIVE] Plataforma Android detectada, interfaz disponible:', this.isAvailable);
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      this.platform = 'ios';
      this.isAvailable = !!(window.webkit?.messageHandlers?.biometric);
      console.log('🍎 [NATIVE] Plataforma iOS detectada, interfaz disponible:', this.isAvailable);
    } else {
      this.platform = 'web';
      this.isAvailable = false;
      console.log('🌐 [NATIVE] Plataforma web detectada, usando WebAuthn');
    }

    return {
      platform: this.platform,
      isAvailable: this.isAvailable
    };
  },

  // Verificar disponibilidad de biometría
  checkBiometricAvailability: function() {
    return new Promise((resolve) => {
      if (this.platform === 'android' && this.isAvailable) {
        window.AndroidBiometric.isAvailable((available) => {
          resolve(available);
        });
      } else if (this.platform === 'ios' && this.isAvailable) {
        window.biometricCallback = (result) => {
          delete window.biometricCallback;
          resolve(result.available);
        };
        window.iOSBiometric.checkAvailability();
        
        // Timeout para evitar espera infinita
        setTimeout(() => {
          if (window.biometricCallback) {
            delete window.biometricCallback;
            resolve(false);
          }
        }, 5000);
      } else {
        resolve(false);
      }
    });
  },

  // Registrar credenciales biométricas
  registerBiometric: function(email, userId) {
    return new Promise((resolve, reject) => {
      if (this.platform === 'android' && this.isAvailable) {
        window.AndroidBiometric.register(email, userId, (success, data) => {
          if (success) {
            resolve(data);
          } else {
            reject(new Error(data.error || 'Android biometric registration failed'));
          }
        });
      } else if (this.platform === 'ios' && this.isAvailable) {
        window.biometricRegisterCallback = (result) => {
          delete window.biometricRegisterCallback;
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'iOS biometric registration failed'));
          }
        };
        
        window.iOSBiometric.register(email, userId);
        
        // Timeout
        setTimeout(() => {
          if (window.biometricRegisterCallback) {
            delete window.biometricRegisterCallback;
            reject(new Error('Biometric registration timeout'));
          }
        }, 30000);
      } else {
        reject(new Error('Native biometric interface not available'));
      }
    });
  },

  // Autenticar con biometría
  authenticateWithBiometric: function(email, credentialId = null) {
    return new Promise((resolve, reject) => {
      if (this.platform === 'android' && this.isAvailable) {
        window.AndroidBiometric.authenticate(email, (success, data) => {
          if (success) {
            resolve(data);
          } else {
            reject(new Error(data.error || 'Android biometric authentication failed'));
          }
        });
      } else if (this.platform === 'ios' && this.isAvailable) {
        window.biometricAuthCallback = (result) => {
          delete window.biometricAuthCallback;
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'iOS biometric authentication failed'));
          }
        };
        
        window.iOSBiometric.authenticate(email, credentialId);
        
        // Timeout
        setTimeout(() => {
          if (window.biometricAuthCallback) {
            delete window.biometricAuthCallback;
            reject(new Error('Biometric authentication timeout'));
          }
        }, 30000);
      } else {
        reject(new Error('Native biometric interface not available'));
      }
    });
  }
};

// === FUNCIONES DE UTILIDAD PARA LA APLICACIÓN ===
window.YameMeBiometric = {
  // Inicializar sistema biométrico
  init: async function() {
    const platformInfo = window.BiometricNativeInterface.init();
    console.log('🔐 [YAMEVI-BIOMETRIC] Inicializando sistema biométrico:', platformInfo);
    
    if (platformInfo.isAvailable) {
      const biometricAvailable = await window.BiometricNativeInterface.checkBiometricAvailability();
      console.log('🔍 [YAMEVI-BIOMETRIC] Biometría disponible:', biometricAvailable);
      return biometricAvailable;
    }
    
    return false;
  },

  // Configurar después del login exitoso
  setupAfterLogin: async function(userEmail, userId) {
    try {
      const isAvailable = await this.init();
      if (!isAvailable) {
        console.log('ℹ️ [YAMEVI-BIOMETRIC] Biometría no disponible en este dispositivo');
        return false;
      }

      // Verificar si ya está registrado
      const stored = localStorage.getItem('biometric_user_credentials');
      if (stored) {
        const credentials = JSON.parse(stored);
        if (credentials.email === userEmail) {
          console.log('✅ [YAMEVI-BIOMETRIC] Credenciales ya registradas para:', userEmail);
          return true;
        }
      }

      // Registrar nuevas credenciales
      const result = await window.BiometricNativeInterface.registerBiometric(userEmail, userId);
      
      // Guardar información local
      const credentialData = {
        email: userEmail,
        userId: userId,
        platform: window.BiometricNativeInterface.platform,
        registeredAt: new Date().toISOString(),
        credentialId: result.credentialId || 'native_' + window.BiometricNativeInterface.platform
      };
      
      localStorage.setItem('biometric_user_credentials', JSON.stringify(credentialData));
      console.log('✅ [YAMEVI-BIOMETRIC] Credenciales biométricas registradas exitosamente');
      
      return true;
    } catch (error) {
      console.error('❌ [YAMEVI-BIOMETRIC] Error configurando biometría:', error);
      return false;
    }
  },

  // Autenticar usuario
  authenticate: async function() {
    try {
      const stored = localStorage.getItem('biometric_user_credentials');
      if (!stored) {
        throw new Error('No hay credenciales biométricas almacenadas');
      }

      const credentials = JSON.parse(stored);
      console.log('🔐 [YAMEVI-BIOMETRIC] Iniciando autenticación para:', credentials.email);

      const result = await window.BiometricNativeInterface.authenticateWithBiometric(
        credentials.email, 
        credentials.credentialId
      );

      console.log('✅ [YAMEVI-BIOMETRIC] Autenticación exitosa');
      
      return {
        success: true,
        email: credentials.email,
        userId: credentials.userId,
        platform: credentials.platform,
        authenticatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [YAMEVI-BIOMETRIC] Error en autenticación:', error);
      throw error;
    }
  },

  // Verificar estado
  getStatus: function() {
    const stored = localStorage.getItem('biometric_user_credentials');
    const platformInfo = window.BiometricNativeInterface.init();
    
    return {
      hasCredentials: !!stored,
      platform: platformInfo.platform,
      nativeInterfaceAvailable: platformInfo.isAvailable,
      credentials: stored ? JSON.parse(stored) : null
    };
  },

  // Limpiar credenciales
  clear: function() {
    localStorage.removeItem('biometric_user_credentials');
    console.log('🗑️ [YAMEVI-BIOMETRIC] Credenciales biométricas eliminadas');
  }
};

// === INICIALIZACIÓN AUTOMÁTICA ===
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar automáticamente si estamos en WebView
  const isWebView = window.AndroidInterface || window.webkit?.messageHandlers?.biometric;
  
  if (isWebView) {
    console.log('🔐 [YAMEVI-BIOMETRIC] WebView detectado, inicializando sistema biométrico...');
    window.YameMeBiometric.init().then((available) => {
      console.log('🔍 [YAMEVI-BIOMETRIC] Sistema inicializado, disponible:', available);
      
      // Disparar evento personalizado para que la aplicación web pueda reaccionar
      window.dispatchEvent(new CustomEvent('biometricSystemReady', {
        detail: { available: available }
      }));
    });
  }
});

console.log('✅ [YAMEVI-BIOMETRIC] Interfaz nativa cargada');

// Export para uso en módulos ES6 si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AndroidBiometric: window.AndroidBiometric,
    iOSBiometric: window.iOSBiometric,
    BiometricNativeInterface: window.BiometricNativeInterface,
    YameMeBiometric: window.YameMeBiometric
  };
}
