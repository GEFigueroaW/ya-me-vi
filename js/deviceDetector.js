// Device Detection and User State Management
import { auth } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export class DeviceDetector {
  constructor() {
    this.userAgent = navigator.userAgent;
    this.isMobile = this.detectMobile();
    this.isTablet = this.detectTablet();
    this.isDesktop = !this.isMobile && !this.isTablet;
    this.biometricType = null;
    this.biometricIcon = null;
    this.initialized = false;
    this.init();
  }

  detectMobile() {
    // Detectar dispositivos móviles más específicamente
    const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const smallScreen = window.innerWidth <= 768;
    
    return mobileRegex.test(this.userAgent) || (touchDevice && smallScreen);
  }

  detectTablet() {
    // Detectar tablets más específicamente
    const tabletRegex = /iPad|Android.*(?!.*Mobile)|Tablet|PlayBook|Kindle|Silk/i;
    const mediumScreen = window.innerWidth > 768 && window.innerWidth <= 1024;
    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return tabletRegex.test(this.userAgent) || (touchDevice && mediumScreen);
  }

  async init() {
    await this.detectBiometricType();
    this.initialized = true;
  }

  // Método para esperar la inicialización
  async waitForInit() {
    if (this.initialized) return;
    
    // Esperar con timeout máximo de 300ms para ser más rápido
    const timeout = new Promise(resolve => setTimeout(resolve, 300));
    const initPromise = new Promise(resolve => {
      const checkInit = () => {
        if (this.initialized) {
          resolve();
        } else {
          setTimeout(checkInit, 50);
        }
      };
      checkInit();
    });
    
    await Promise.race([initPromise, timeout]);
  }

  async detectBiometricType() {
    try {
      if (window.PublicKeyCredential && 
          typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        
        if (available) {
          // Detectar tipo de biométrico basado en el dispositivo y versión
          if (/iPhone|iPad|iPod/i.test(this.userAgent)) {
            // iOS devices - detectar modelo para Face ID vs Touch ID
            if (/iPhone/i.test(this.userAgent)) {
              // iPhone X (2017) y superiores tienen Face ID
              // Verificar si es un modelo reciente con Face ID
              const hasNotch = window.screen.height / window.screen.width > 2.1; // Aproximación para detectar notch
              if (hasNotch || /iPhone1[2-9]|iPhone[2-9][0-9]/i.test(this.userAgent)) {
                this.biometricType = "Face ID";
                this.biometricIcon = "🆔"; // Emoji de Face ID
              } else {
                this.biometricType = "Touch ID";
                this.biometricIcon = "�"; // Emoji de huella
              }
            } else if (/iPad/i.test(this.userAgent)) {
              // iPad - mayoría tiene Touch ID, algunos nuevos Face ID
              this.biometricType = "Touch ID";
              this.biometricIcon = "👆";
            }
          } else if (/Android/i.test(this.userAgent)) {
            // Android devices - principalmente fingerprint
            this.biometricType = "Huella digital";
            this.biometricIcon = "👆";
          } else if (/Windows/i.test(this.userAgent)) {
            // Windows - Windows Hello
            this.biometricType = "Windows Hello";
            this.biometricIcon = "🔐";
          } else if (/Mac/i.test(this.userAgent)) {
            // macOS - Touch ID en MacBooks recientes
            this.biometricType = "Touch ID";
            this.biometricIcon = "👆";
          } else {
            // Otros dispositivos
            this.biometricType = "Biométrico";
            this.biometricIcon = "🔐";
          }
        }
      }
    } catch (error) {
      console.error("Error detectando tipo biométrico:", error);
    }
  }

  isMobileDevice() {
    return this.isMobile || this.isTablet;
  }

  getBiometricInfo() {
    return {
      type: this.biometricType,
      icon: this.biometricIcon,
      available: this.biometricType !== null
    };
  }

  // Verificar si el usuario tiene datos guardados
  hasStoredUser() {
    const biometricUser = localStorage.getItem('biometric_user_info');
    const firebaseUser = auth.currentUser;
    
    return biometricUser !== null || firebaseUser !== null;
  }

  // Obtener información del usuario almacenado
  async getStoredUserInfo() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // Procesar el nombre para mostrar solo el primer nombre
          let displayName = user.displayName || user.email?.split('@')[0] || 'Usuario';
          
          // Si tiene displayName (viene de Google), tomar solo el primer nombre
          if (user.displayName) {
            displayName = user.displayName.split(' ')[0]; // Solo el primer nombre
          }
          
          resolve({
            type: 'firebase',
            name: displayName,
            email: user.email,
            uid: user.uid,
            fullName: user.displayName // Guardar nombre completo por si se necesita
          });
        } else {
          // Verificar datos biométricos
          const biometricUser = localStorage.getItem('biometric_user_info');
          if (biometricUser) {
            const userData = JSON.parse(biometricUser);
            resolve({
              type: 'biometric',
              name: 'Usuario', // Para biométrico usamos nombre genérico
              registeredAt: userData.registeredAt,
              lastUsed: userData.lastUsed
            });
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  // Determinar flujo de navegación
  async determineUserFlow() {
    const userInfo = await this.getStoredUserInfo();
    
    if (!userInfo) {
      // Usuario nuevo - ir a registro
      return {
        action: 'register',
        page: 'register.html',
        reason: 'new_user'
      };
    } else {
      // Usuario existente - mostrar bienvenida y opciones de login
      return {
        action: 'welcome',
        page: 'welcome.html',
        userInfo: userInfo,
        reason: 'returning_user'
      };
    }
  }
  
  // Determinar flujo para escritorio
  async determineDesktopFlow() {
    // Para computadoras (desktop)
    const userInfo = await this.getStoredUserInfo();
    
    if (!userInfo) {
      // En escritorio, primera vez o caché borrado - ir a registro
      console.log('🖥️ Desktop: Usuario nuevo o caché borrado - redirigiendo a registro');
      return {
        action: 'register',
        page: 'register.html',
        reason: 'new_desktop_user'
      };
    } else {
      // Usuario existente en escritorio - ir directo a ingresar contraseña
      console.log('🖥️ Desktop: Usuario existente - redirigiendo a login con contraseña');
      return {
        action: 'login',
        page: 'login-email.html',
        userInfo: userInfo,
        reason: 'returning_desktop_user'
      };
    }
  }
}

// Exportar instancia única
export const deviceDetector = new DeviceDetector();
