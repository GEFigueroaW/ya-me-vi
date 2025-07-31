/**
 * Sistema de autenticación biométrica para la aplicación YA ME VI
 * Compatible con WebView y navegadores web
 */

// Clase para manejar autenticación biométrica
class BiometricAuth {
  constructor() {
    this.isWebView = this.detectWebView();
    this.isSupported = false;
    this.credentials = null;
    this.initBiometricSupport();
  }

  // Detectar si estamos en un WebView (aplicación APK)
  detectWebView() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidWebView = userAgent.includes('android') && userAgent.includes('wv');
    const isIOSWebView = userAgent.includes('ios') && !userAgent.includes('safari');
    
    // Verificar si hay interfaz de aplicación nativa disponible
    const hasNativeInterface = window.AndroidBiometric || window.webkit?.messageHandlers?.biometric;
    
    console.log('🔍 [BIOMETRIC] Detección de WebView:', {
      userAgent,
      isAndroidWebView,
      isIOSWebView,
      hasNativeInterface,
      isWebView: isAndroidWebView || isIOSWebView || hasNativeInterface
    });
    
    return isAndroidWebView || isIOSWebView || hasNativeInterface;
  }

  // Inicializar soporte biométrico
  async initBiometricSupport() {
    try {
      if (this.isWebView) {
        // En WebView, verificar interfaz nativa
        this.isSupported = await this.checkNativeBiometricSupport();
      } else {
        // En navegador web, usar WebAuthn
        this.isSupported = await this.checkWebAuthnSupport();
      }
      
      console.log('✅ [BIOMETRIC] Soporte biométrico:', this.isSupported);
      return this.isSupported;
    } catch (error) {
      console.error('❌ [BIOMETRIC] Error verificando soporte:', error);
      this.isSupported = false;
      return false;
    }
  }

  // Verificar soporte de biometría nativa (WebView)
  async checkNativeBiometricSupport() {
    return new Promise((resolve) => {
      if (window.AndroidBiometric) {
        // Android WebView con interfaz nativa
        try {
          window.AndroidBiometric.isAvailable((available) => {
            console.log('🤖 [BIOMETRIC] Android biométrico disponible:', available);
            resolve(available);
          });
        } catch (error) {
          console.error('❌ [BIOMETRIC] Error Android biométrico:', error);
          resolve(false);
        }
      } else if (window.webkit?.messageHandlers?.biometric) {
        // iOS WebView con interfaz nativa
        try {
          window.webkit.messageHandlers.biometric.postMessage({
            action: 'checkAvailability'
          });
          
          // Escuchar respuesta
          window.biometricCallback = (result) => {
            console.log('🍎 [BIOMETRIC] iOS biométrico disponible:', result.available);
            resolve(result.available);
            delete window.biometricCallback;
          };
          
          // Timeout si no hay respuesta
          setTimeout(() => {
            if (window.biometricCallback) {
              delete window.biometricCallback;
              resolve(false);
            }
          }, 3000);
        } catch (error) {
          console.error('❌ [BIOMETRIC] Error iOS biométrico:', error);
          resolve(false);
        }
      } else {
        // Fallback a WebAuthn si no hay interfaz nativa
        this.checkWebAuthnSupport().then(resolve);
      }
    });
  }

  // Verificar soporte de WebAuthn (navegador web)
  async checkWebAuthnSupport() {
    try {
      if (!window.PublicKeyCredential || !navigator.credentials) {
        return false;
      }

      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      console.log('🌐 [BIOMETRIC] WebAuthn disponible:', available);
      return available;
    } catch (error) {
      console.error('❌ [BIOMETRIC] Error WebAuthn:', error);
      return false;
    }
  }

  // Registrar credenciales biométricas
  async registerCredentials(userEmail, userId) {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported');
    }

    try {
      console.log('🔐 [BIOMETRIC] Registrando credenciales para:', userEmail);

      if (this.isWebView) {
        return await this.registerNativeCredentials(userEmail, userId);
      } else {
        return await this.registerWebAuthnCredentials(userEmail, userId);
      }
    } catch (error) {
      console.error('❌ [BIOMETRIC] Error registrando credenciales:', error);
      throw error;
    }
  }

  // Registrar credenciales nativas (WebView)
  async registerNativeCredentials(userEmail, userId) {
    return new Promise((resolve, reject) => {
      if (window.AndroidBiometric) {
        // Android
        window.AndroidBiometric.register(userEmail, userId, (success, data) => {
          if (success) {
            const credentialData = {
              email: userEmail,
              userId: userId,
              platform: 'android',
              registeredAt: new Date().toISOString(),
              credentialId: data.credentialId || 'native_android'
            };
            
            localStorage.setItem('biometric_user_credentials', JSON.stringify(credentialData));
            console.log('✅ [BIOMETRIC] Credenciales Android registradas');
            resolve(credentialData);
          } else {
            reject(new Error('Android biometric registration failed'));
          }
        });
      } else if (window.webkit?.messageHandlers?.biometric) {
        // iOS
        window.webkit.messageHandlers.biometric.postMessage({
          action: 'register',
          email: userEmail,
          userId: userId
        });
        
        window.biometricRegisterCallback = (result) => {
          delete window.biometricRegisterCallback;
          
          if (result.success) {
            const credentialData = {
              email: userEmail,
              userId: userId,
              platform: 'ios',
              registeredAt: new Date().toISOString(),
              credentialId: result.credentialId || 'native_ios'
            };
            
            localStorage.setItem('biometric_user_credentials', JSON.stringify(credentialData));
            console.log('✅ [BIOMETRIC] Credenciales iOS registradas');
            resolve(credentialData);
          } else {
            reject(new Error(result.error || 'iOS biometric registration failed'));
          }
        };
        
        // Timeout
        setTimeout(() => {
          if (window.biometricRegisterCallback) {
            delete window.biometricRegisterCallback;
            reject(new Error('Biometric registration timeout'));
          }
        }, 30000);
      } else {
        // Fallback a WebAuthn
        this.registerWebAuthnCredentials(userEmail, userId).then(resolve).catch(reject);
      }
    });
  }

  // Registrar credenciales WebAuthn
  async registerWebAuthnCredentials(userEmail, userId) {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    
    const userIdBytes = new TextEncoder().encode(userId);
    
    const publicKeyCredentialCreationOptions = {
      challenge: challenge,
      rp: {
        name: "YA ME VI",
        id: window.location.hostname
      },
      user: {
        id: userIdBytes,
        name: userEmail,
        displayName: userEmail
      },
      pubKeyCredParams: [{alg: -7, type: "public-key"}],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "direct"
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });

    if (credential) {
      const credentialData = {
        email: userEmail,
        userId: userId,
        platform: 'webauthn',
        registeredAt: new Date().toISOString(),
        credentialId: Array.from(new Uint8Array(credential.rawId)),
        publicKey: Array.from(new Uint8Array(credential.response.publicKey || []))
      };
      
      localStorage.setItem('biometric_user_credentials', JSON.stringify(credentialData));
      console.log('✅ [BIOMETRIC] Credenciales WebAuthn registradas');
      return credentialData;
    }
    
    throw new Error('Failed to create WebAuthn credential');
  }

  // Autenticar con biometría
  async authenticate() {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported');
    }

    const storedCredentials = localStorage.getItem('biometric_user_credentials');
    if (!storedCredentials) {
      throw new Error('No biometric credentials found');
    }

    const credentials = JSON.parse(storedCredentials);
    console.log('🔐 [BIOMETRIC] Iniciando autenticación biométrica para:', credentials.email);

    try {
      if (this.isWebView) {
        return await this.authenticateNative(credentials);
      } else {
        return await this.authenticateWebAuthn(credentials);
      }
    } catch (error) {
      console.error('❌ [BIOMETRIC] Error en autenticación:', error);
      throw error;
    }
  }

  // Autenticación nativa (WebView)
  async authenticateNative(credentials) {
    return new Promise((resolve, reject) => {
      if (window.AndroidBiometric) {
        // Android
        window.AndroidBiometric.authenticate(credentials.email, (success, data) => {
          if (success) {
            console.log('✅ [BIOMETRIC] Autenticación Android exitosa');
            resolve({
              success: true,
              email: credentials.email,
              userId: credentials.userId,
              platform: 'android',
              authenticatedAt: new Date().toISOString()
            });
          } else {
            reject(new Error('Android biometric authentication failed'));
          }
        });
      } else if (window.webkit?.messageHandlers?.biometric) {
        // iOS
        window.webkit.messageHandlers.biometric.postMessage({
          action: 'authenticate',
          email: credentials.email,
          credentialId: credentials.credentialId
        });
        
        window.biometricAuthCallback = (result) => {
          delete window.biometricAuthCallback;
          
          if (result.success) {
            console.log('✅ [BIOMETRIC] Autenticación iOS exitosa');
            resolve({
              success: true,
              email: credentials.email,
              userId: credentials.userId,
              platform: 'ios',
              authenticatedAt: new Date().toISOString()
            });
          } else {
            reject(new Error(result.error || 'iOS biometric authentication failed'));
          }
        };
        
        // Timeout
        setTimeout(() => {
          if (window.biometricAuthCallback) {
            delete window.biometricAuthCallback;
            reject(new Error('Biometric authentication timeout'));
          }
        }, 30000);
      } else {
        // Fallback a WebAuthn
        this.authenticateWebAuthn(credentials).then(resolve).catch(reject);
      }
    });
  }

  // Autenticación WebAuthn
  async authenticateWebAuthn(credentials) {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    
    const credentialId = new Uint8Array(credentials.credentialId);
    
    const publicKeyCredentialRequestOptions = {
      challenge: challenge,
      allowCredentials: [{
        id: credentialId,
        type: 'public-key'
      }],
      userVerification: 'required',
      timeout: 60000
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });

    if (assertion) {
      console.log('✅ [BIOMETRIC] Autenticación WebAuthn exitosa');
      return {
        success: true,
        email: credentials.email,
        userId: credentials.userId,
        platform: 'webauthn',
        authenticatedAt: new Date().toISOString()
      };
    }
    
    throw new Error('WebAuthn authentication failed');
  }

  // Verificar si hay credenciales almacenadas
  hasStoredCredentials() {
    const stored = localStorage.getItem('biometric_user_credentials');
    return !!stored;
  }

  // Obtener información de credenciales almacenadas
  getStoredCredentialsInfo() {
    const stored = localStorage.getItem('biometric_user_credentials');
    if (stored) {
      try {
        const credentials = JSON.parse(stored);
        return {
          email: credentials.email,
          platform: credentials.platform,
          registeredAt: credentials.registeredAt
        };
      } catch (error) {
        console.error('❌ [BIOMETRIC] Error parsing stored credentials:', error);
        return null;
      }
    }
    return null;
  }

  // Limpiar credenciales almacenadas
  clearStoredCredentials() {
    localStorage.removeItem('biometric_user_credentials');
    console.log('🗑️ [BIOMETRIC] Credenciales biométricas eliminadas');
  }
}

// Instancia global
export const biometricAuth = new BiometricAuth();

// Funciones de utilidad para compatibilidad
export const BiometricUtils = {
  // Verificar soporte
  async isSupported() {
    return await biometricAuth.initBiometricSupport();
  },
  
  // Registrar después del login exitoso
  async registerAfterLogin(user) {
    if (biometricAuth.isSupported && user.email && !biometricAuth.hasStoredCredentials()) {
      try {
        await biometricAuth.registerCredentials(user.email, user.uid);
        return true;
      } catch (error) {
        console.log('ℹ️ [BIOMETRIC] Registro opcional fallido:', error.message);
        return false;
      }
    }
    return false;
  },
  
  // Autenticar y obtener usuario
  async authenticateAndGetUser() {
    try {
      const result = await biometricAuth.authenticate();
      if (result.success) {
        // Retornar información del usuario para Firebase Auth
        return {
          email: result.email,
          uid: result.userId,
          authenticatedAt: result.authenticatedAt,
          method: 'biometric'
        };
      }
      return null;
    } catch (error) {
      console.error('❌ [BIOMETRIC] Error en autenticación:', error);
      throw error;
    }
  },
  
  // Mostrar botón biométrico si está disponible
  async showBiometricButton(buttonElement) {
    if (await biometricAuth.initBiometricSupport() && biometricAuth.hasStoredCredentials()) {
      if (buttonElement) {
        buttonElement.style.display = 'block';
        return true;
      }
    }
    return false;
  }
};

export default biometricAuth;
