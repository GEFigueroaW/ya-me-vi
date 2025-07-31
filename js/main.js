// === Firebase ===
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebase-init.js';
import { isUserAdmin, toggleAdminElements } from './adminCheck.js';
import { authGuard } from './authGuard.js';
import { BiometricUtils } from './biometric-auth.js';

const auth = getAuth(app);
const db = getFirestore(app);

// === Función para mostrar el sueño guardado del usuario ===
async function mostrarBienvenidaConSueño(user) {
  try {
    // Obtener datos del usuario de Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg) {
      // Obtener el nombre del usuario con múltiples fallbacks
      let userName = '';
      let userDream = '';
      let needsOnboarding = false;
      
      // 1. Intentar desde los datos guardados en Firestore
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('📋 [MAIN] Datos de usuario desde Firestore:', userData);
        
        if (userData.displayName || userData.name) {
          userName = (userData.displayName || userData.name).split(' ')[0]; // Solo primer nombre
        }
        if (userData.dream) {
          userDream = userData.dream;
        }
        
        // Verificar si necesita completar onboarding - LÓGICA CORREGIDA
        // Solo necesita onboarding si NO tiene sueño Y NO ha completado onboarding
        needsOnboarding = (!userData.dream || userData.dream === '') && 
                         (userData.onboardingCompleted !== true);
        
        console.log('🔍 [MAIN] Verificación onboarding:', {
          hasDream: !!userData.dream,
          onboardingCompleted: userData.onboardingCompleted,
          needsOnboarding: needsOnboarding
        });
      } else {
        // Usuario nuevo sin documento en Firestore
        needsOnboarding = true;
        console.log('👤 [MAIN] Usuario nuevo detectado, creando documento base...');
        
        // Crear documento base para nuevos usuarios de Google
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            emailVerified: user.emailVerified || false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            onboardingCompleted: false
          });
          console.log('✅ [MAIN] Documento base creado para usuario:', user.email);
        } catch (createError) {
          console.error('❌ [MAIN] Error creando documento base:', createError);
        }
      }
      
      // 2. Si no, usar displayName de Firebase Auth (Google login)
      if (!userName && user.displayName) {
        userName = user.displayName.split(' ')[0];
      }
      
      // 3. Si no, usar la parte del email antes del @
      if (!userName && user.email) {
        userName = user.email.split('@')[0];
      }
      
      // 4. Verificar si hay datos biométricos y usar fallback
      const biometricUserInfo = localStorage.getItem('biometric_user_info');
      if (biometricUserInfo && !userName) {
        try {
          const bioData = JSON.parse(biometricUserInfo);
          userName = bioData.name || 'Usuario';
        } catch (e) {
          userName = 'Usuario';
        }
      }
      
      // Si el usuario necesita onboarding, redirigir a dream-input
      if (needsOnboarding) {
        console.log('🎯 [MAIN] Usuario necesita completar onboarding, redirigiendo...');
        
        // Verificar si ya estamos en proceso de onboarding para evitar loops
        const currentPage = window.location.pathname.split('/').pop();
        const onboardingInProgress = localStorage.getItem('onboarding_in_progress');
        
        if (currentPage === 'dream-input.html') {
          console.log('ℹ️ [MAIN] Ya estamos en dream-input.html, no redirigir');
          return;
        }
        
        // Marcar que estamos en proceso de onboarding
        localStorage.setItem('onboarding_in_progress', 'true');
        
        setTimeout(() => {
          window.location.href = 'dream-input.html';
        }, 2000);
        
        welcomeMsg.innerHTML = `
          <div class="text-2xl md:text-3xl font-semibold drop-shadow-lg">
            ¡Bienvenido ${userName}!
          </div>
          <div class="text-lg md:text-xl font-normal text-yellow-300 mt-2 drop-shadow-md">
            Configurando tu perfil...
          </div>
        `;
        return;
      }
      
      // Limpiar flag de onboarding si ya no es necesario
      localStorage.removeItem('onboarding_in_progress');
      
      // Crear mensaje de bienvenida personalizado
      if (userDream && userName) {
        // Mapear categorías de sueños a textos más naturales
        const dreamDisplayMap = {
          'casa': 'comprar tu casa',
          'auto': 'comprar tu auto',
          'viaje': 'viajar por el mundo',
          'negocio': 'iniciar tu negocio',
          'familia': 'ayudar a tu familia',
          'estudios': 'continuar tus estudios',
          'libertad': 'lograr libertad financiera',
          'otro': userDream
        };
        
        const dreamDisplay = dreamDisplayMap[userDream] || userDream;
        welcomeMsg.innerHTML = `
          <div class="text-2xl md:text-3xl font-semibold drop-shadow-lg">
            ¡Bienvenido ${userName}!
          </div>
          <div class="text-lg md:text-xl font-normal text-yellow-300 mt-2 drop-shadow-md">
            Listo para cumplir tu sueño: ${dreamDisplay}
          </div>
        `;
      } else if (userName) {
        welcomeMsg.innerHTML = `
          <div class="text-2xl md:text-3xl font-semibold drop-shadow-lg">
            ¡Bienvenido ${userName}!
          </div>
          <div class="text-lg md:text-xl font-normal text-yellow-300 mt-2 drop-shadow-md">
            ¡Listo para ganar!
          </div>
        `;
      } else {
        welcomeMsg.textContent = '¡Bienvenido!';
      }
      
      console.log(`✅ Usuario identificado: ${userName || 'Anónimo'}, Sueño: ${userDream || 'No definido'}, Onboarding: ${!needsOnboarding}`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo datos del usuario:', error);
    const welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg) {
      // Intentar mostrar al menos el nombre aunque falle el sueño
      let userName = '';
      
      if (user && user.displayName) {
        userName = user.displayName.split(' ')[0];
      } else if (user && user.email) {
        userName = user.email.split('@')[0];
      }
      
      if (userName) {
        welcomeMsg.textContent = `¡Bienvenido ${userName}!`;
      } else {
        welcomeMsg.textContent = '¡Bienvenido!';
      }
    }
  }
}

// === Manejo de sesión activa y bienvenida ===
let authChecked = false;
onAuthStateChanged(auth, async (user) => {
  // Evitar múltiples verificaciones de autenticación
  if (authChecked) return;
  authChecked = true;
  
  console.log('🔍 Verificando estado de autenticación en home.html');
  
  if (user) {
    console.log('✅ Usuario autenticado en home.html:', user.email);
    // Limpiar contador de redirecciones cuando la auth es exitosa
    authGuard.clearRedirectCount();
    
    await mostrarBienvenidaConSueño(user);
    
    // Registrar credenciales biométricas si es la primera vez
    try {
      await BiometricUtils.registerAfterLogin(user);
    } catch (error) {
      console.log('ℹ️ [MAIN] No se pudo registrar biometría (opcional):', error.message);
    }
    
    // Verificar si el usuario es administrador y mostrar/ocultar elementos
    const isAdmin = await isUserAdmin();
    console.log('🔐 Verificación de admin completada:', isAdmin);
    toggleAdminElements(isAdmin);
    
    // Mostrar botón de admin si es administrador
    const btnAdmin = document.getElementById('btn-admin');
    if (btnAdmin && isAdmin) {
      btnAdmin.classList.remove('hidden');
      console.log('✅ Botón de administrador mostrado');
    }
    
    if (isAdmin) {
      console.log('✅ Usuario identificado como administrador');
    }
  } else {
    console.log('❌ Usuario no autenticado, redirigiendo a index.html');
    // Usar redirección segura para prevenir loops
    authGuard.safeRedirect('index.html', 'no_auth_home');
  }
});

// === Inicialización cuando el DOM está listo ===
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 DOM cargado, inicializando botones...');
  
  // === Referencias DOM ===
  const btnAnalizar = document.getElementById('btn-analizar');
  const btnCombinacion = document.getElementById('btn-combinacion');
  const btnSugeridas = document.getElementById('btn-sugeridas');
  const btnAdmin = document.getElementById('btn-admin');

  // Verificar que los elementos existen
  console.log('🔍 Elementos encontrados:', {
    btnAnalizar: !!btnAnalizar,
    btnCombinacion: !!btnCombinacion,
    btnSugeridas: !!btnSugeridas,
    btnAdmin: !!btnAdmin
  });

  // === Botones: alternar visibilidad y redirigir ===
  if (btnAnalizar && btnCombinacion && btnSugeridas) {
    console.log('✅ Configurando event listeners para botones principales');
    
    btnAnalizar.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🎯 Botón Analizar clickeado');
      // Mostrar feedback visual inmediato
      btnAnalizar.style.opacity = '0.5';
      setTimeout(() => {
        window.location.href = "analisis.html";
      }, 100);
    });

    btnCombinacion.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🎯 Botón Combinación clickeado');
      // Mostrar feedback visual inmediato
      btnCombinacion.style.opacity = '0.5';
      setTimeout(() => {
        window.location.href = "combinacion.html";
      }, 100);
    });

    btnSugeridas.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🎯 Botón Sugeridas clickeado');
      // Mostrar feedback visual inmediato
      btnSugeridas.style.opacity = '0.5';
      setTimeout(() => {
        window.location.href = "sugeridas.html";
      }, 100);
    });
  } else {
    console.warn('❌ No se encontraron todos los botones principales');
  }
  
  // Botón de administración (solo visible para admins)
  if (btnAdmin) {
    console.log('✅ Configurando event listener para botón de admin');
    btnAdmin.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🔐 Accediendo al panel de administración');
      btnAdmin.style.opacity = '0.5';
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 100);
    });
    
    // Verificación adicional de administrador después de un tiempo
    setTimeout(async () => {
      try {
        const isAdmin = await isUserAdmin();
        console.log('🔍 Verificación tardía de admin:', isAdmin);
        if (isAdmin) {
          btnAdmin.classList.remove('hidden');
          console.log('✅ Botón de admin mostrado por verificación tardía');
        }
      } catch (error) {
        console.error('❌ Error en verificación tardía de admin:', error);
      }
    }, 2000);
  } else {
    console.warn('❌ No se encontró el botón de administración');
  }
});
