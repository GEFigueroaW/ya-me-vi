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
    console.log('🏠 [MAIN] Iniciando verificación de bienvenida para:', user.email);
    
    // VERIFICAR CACHE PRIMERO PARA PREVENIR LOOPS
    const onboardingCached = localStorage.getItem('onboarding_completed_cache');
    const dreamCached = localStorage.getItem('user_dream_cache');
    const nameCached = localStorage.getItem('user_name_cache');
    
    console.log('💾 [MAIN] Cache disponible:', {
      onboardingCached: onboardingCached,
      dreamCached: dreamCached,
      nameCached: nameCached
    });

    const welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg) {
      // Variables principales
      let userName = '';
      let userDream = '';
      let needsOnboarding = false;
      
      // OBTENER SUEÑO DEL LOCALSTORAGE INMEDIATAMENTE
      const dreamFromStorage = localStorage.getItem('user_dream');
      const nameFromStorage = localStorage.getItem('user_name');
      
      if (dreamFromStorage) {
        userDream = dreamFromStorage;
        console.log('💾 [MAIN] Sueño recuperado del localStorage:', userDream);
      }
      
      if (nameFromStorage) {
        userName = nameFromStorage;
        console.log('💾 [MAIN] Nombre recuperado del localStorage:', userName);
      }
      
      // VERIFICACIÓN DE EMERGENCIA ANTI-LOOP
      const emergencyFlag = localStorage.getItem('emergency_no_onboarding');
      const justCompletedFlag = localStorage.getItem('just_completed_onboarding');
      const returnedFromPage = localStorage.getItem('returned_from_page');
      const cameFromHome = localStorage.getItem('came_from_home');
      const emergencyStopUsed = localStorage.getItem('emergency_stop_used');
      
      console.log('🚨 [MAIN] Flags de emergencia:', {
        emergencyFlag: emergencyFlag,
        justCompletedFlag: justCompletedFlag,
        returnedFromPage: returnedFromPage,
        cameFromHome: cameFromHome,
        emergencyStopUsed: emergencyStopUsed
      });
      
      // Si se usó parada de emergencia, mostrar mensaje especial
      if (emergencyStopUsed === 'true') {
        console.log('🚨 [MAIN] Parada de emergencia detectada - mostrando mensaje especial');
        localStorage.removeItem('emergency_stop_used');
        
        welcomeMsg.innerHTML = `
          <div class="text-2xl md:text-3xl font-semibold drop-shadow-lg">
            ¡Sistema Restaurado!
          </div>
          <div class="text-lg md:text-xl font-normal text-green-300 mt-2 drop-shadow-md">
            El loop ha sido detenido exitosamente 🛡️
          </div>
        `;
        
        // Evitar verificaciones adicionales
        return;
      }
      
      // Si hay flag de emergencia O si viene de una página secundaria, usar cache y no verificar onboarding
      if (emergencyFlag === 'true' || returnedFromPage === 'true' || cameFromHome === 'true') {
        console.log('🛡️ [MAIN] Flag de emergencia activo - usando cache y saltando verificación');
        needsOnboarding = false;
        userName = nameCached || (user.displayName ? user.displayName.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'Usuario'));
        userDream = dreamCached || '';
        
        // Limpiar flags después de usar
        localStorage.removeItem('emergency_no_onboarding');
        localStorage.removeItem('returned_from_page');
        localStorage.removeItem('came_from_home');
        
        // Marcar que regresó de una página para futuras referencias
        if (cameFromHome === 'true') {
          console.log('🔄 [MAIN] Usuario regresó de una página secundaria - marcando flag');
          localStorage.setItem('returned_from_page', 'true');
        }
      } else {
        // Obtener datos del usuario de Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
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
          
          // LÓGICA ANTI-LOOP MEJORADA
          // Si el usuario tiene onboardingCompleted = true O si acabó de completar, NUNCA necesita onboarding
          if (userData.onboardingCompleted === true || justCompletedFlag === 'true') {
            needsOnboarding = false;
            console.log('✅ [MAIN] Onboarding ya completado, no redirigir');
            
            // Guardar en cache para futuras visitas
            localStorage.setItem('onboarding_completed_cache', 'true');
            if (userData.dream) {
              localStorage.setItem('user_dream_cache', userData.dream);
            }
            if (userName) {
              localStorage.setItem('user_name_cache', userName);
            }
          } else {
            // Solo necesita onboarding si NO lo ha completado Y no hay cache válido
            if (onboardingCached === 'true') {
              console.log('💾 [MAIN] Cache indica onboarding completado - usando cache');
              needsOnboarding = false;
              userName = nameCached || userName;
              userDream = dreamCached || userDream;
            } else {
              needsOnboarding = true;
              console.log('⚠️ [MAIN] Onboarding no completado, necesita completar');
            }
          }
          
          console.log('🔍 [MAIN] Verificación onboarding:', {
            hasDream: !!userData.dream,
            dreamValue: userData.dream,
            onboardingCompleted: userData.onboardingCompleted,
            needsOnboarding: needsOnboarding,
            cacheUsed: onboardingCached === 'true'
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
      }
      
      // 2. Si no, usar displayName de Firebase Auth (Google login)
      if (!userName && user.displayName) {
        userName = user.displayName.split(' ')[0];
      }
      
      // 3. Si no, usar la parte del email antes del @
      if (!userName && user.email) {
        userName = user.email.split('@')[0];
      }
      
      // 4. Verificar si hay datos biométricos y usar fallback (primera instancia)
      const biometricUserData1 = localStorage.getItem('biometric_user_info');
      if (biometricUserData1 && !userName) {
        try {
          const bioData = JSON.parse(biometricUserData1);
          userName = bioData.name || 'Usuario';
        } catch (e) {
          userName = 'Usuario';
        }
      }
      
      // Si el usuario necesita onboarding, redirigir a dream-input
      if (needsOnboarding) {
        console.log('🎯 [MAIN] Usuario necesita completar onboarding, verificando condiciones...');
        
        // VERIFICACIÓN DE PREVENCIÓN DE LOOPS MEJORADA
        const currentPage = window.location.pathname.split('/').pop();
        const onboardingInProgress = localStorage.getItem('onboarding_in_progress');
        const lastOnboardingAttempt = localStorage.getItem('last_onboarding_attempt');
        const now = Date.now();
        
        // Si el último intento fue hace menos de 30 segundos, no intentar de nuevo
        if (lastOnboardingAttempt && (now - parseInt(lastOnboardingAttempt)) < 30000) {
          console.log('🛡️ [MAIN] Último intento de onboarding muy reciente, saltando para evitar loop');
          needsOnboarding = false;
          localStorage.setItem('emergency_no_onboarding', 'true');
        }
        
        console.log('🔍 [MAIN] Verificación de flags mejorada:', {
          currentPage: currentPage,
          onboardingInProgress: onboardingInProgress,
          justCompletedOnboarding: justCompletedFlag,
          needsOnboarding: needsOnboarding,
          lastAttempt: lastOnboardingAttempt,
          timeSinceLastAttempt: lastOnboardingAttempt ? (now - parseInt(lastOnboardingAttempt)) : 'nunca'
        });
        
        // Si acaba de completar onboarding, no redirigir
        if (justCompletedFlag === 'true') {
          console.log('ℹ️ [MAIN] Usuario acaba de completar onboarding, limpiando flag y permitiendo acceso');
          localStorage.removeItem('just_completed_onboarding');
          needsOnboarding = false;
          
          // Marcar como completado en cache
          localStorage.setItem('onboarding_completed_cache', 'true');
          console.log('✅ [MAIN] Flag limpiado, needsOnboarding = false, continuando con flujo normal');
        } else if (currentPage === 'dream-input.html') {
          console.log('ℹ️ [MAIN] Ya estamos en dream-input.html, no redirigir');
          return;
        } else if (needsOnboarding) {
          console.log('🚀 [MAIN] Iniciando redirección a dream-input.html...');
          
          // Marcar intento de onboarding
          localStorage.setItem('onboarding_in_progress', 'true');
          localStorage.setItem('last_onboarding_attempt', now.toString());
          
          setTimeout(() => {
            console.log('🚀 [MAIN] Ejecutando redirección a dream-input.html');
            window.location.href = 'dream-input.html';
          }, 2000);
          
          welcomeMsg.innerHTML = `
            <div class="text-2xl md:text-3xl font-semibold drop-shadow-lg">
              ¡Bienvenido ${userName || 'Usuario'}!
            </div>
            <div class="text-lg md:text-xl font-normal text-yellow-300 mt-2 drop-shadow-md">
              Configurando tu perfil...
            </div>
          `;
          return;
        }
      }
      
      // Limpiar flag de onboarding si ya no es necesario
      localStorage.removeItem('onboarding_in_progress');
      
      // 2. Si no hay nombre desde Firestore, usar displayName de Firebase Auth (Google login)
      if (!userName && user.displayName) {
        userName = user.displayName.split(' ')[0];
      }
      
      // 3. Si no, usar la parte del email antes del @
      if (!userName && user.email) {
        userName = user.email.split('@')[0];
      }
      
      // 4. Verificar si hay datos biométricos y usar fallback (segunda instancia)
      const biometricUserData2 = localStorage.getItem('biometric_user_info');
      if (biometricUserData2 && !userName) {
        try {
          const bioData = JSON.parse(biometricUserData2);
          userName = bioData.name || 'Usuario';
        } catch (e) {
          userName = 'Usuario';
        }
      }
      
      // Crear mensaje de bienvenida personalizado MEJORADO
      console.log('🎨 [MAIN] Creando mensaje de bienvenida:', {
        userName: userName,
        userDream: userDream,
        needsOnboarding: needsOnboarding
      });
      
      if (userDream && userDream.trim() !== '' && userName) {
        // Mapear sueños de dream-input.html a textos mostrados
        const dreamDisplayMap = {
          'comprar el coche de tus sueños': 'comprar el coche de tus sueños',
          'hacer el viaje de tus sueños': 'hacer el viaje de tus sueños',
          'comprar la casa de tus sueños': 'comprar la casa de tus sueños',
          'invertir en tu propio negocio': 'invertir en tu propio negocio',
          'lograr libertad financiera': 'lograr libertad financiera',
          'asegurar tu jubilación': 'asegurar tu jubilación',
          'pagar tus estudios': 'pagar tus estudios',
          'apoyar a tu familia': 'apoyar a tu familia',
          // Mapeos legacy para compatibilidad
          'casa': 'comprar tu casa soñada',
          'auto': 'comprar tu auto ideal',
          'viaje': 'viajar por el mundo',
          'negocio': 'iniciar tu propio negocio',
          'familia': 'ayudar a tu familia',
          'estudios': 'continuar tus estudios',
          'libertad': 'lograr libertad financiera',
          'otro': userDream
        };
        
        const dreamDisplay = dreamDisplayMap[userDream] || userDream;
        
        // Actualizar mensaje de bienvenida
        welcomeMsg.innerHTML = `¡Bienvenido ${userName}!`;
        
        // Actualizar mensaje del sueño
        const dreamMessage = document.getElementById('dream-message');
        if (dreamMessage) {
          dreamMessage.innerHTML = `🌟 Listo para cumplir tu sueño: ${dreamDisplay}`;
          dreamMessage.classList.add('animate__pulse');
        }
        
        console.log('✨ [MAIN] Mensaje de bienvenida personalizado con sueño mostrado');
      } else if (userName) {
        welcomeMsg.innerHTML = `¡Bienvenido ${userName}!`;
        
        // Ocultar o mostrar mensaje genérico del sueño
        const dreamMessage = document.getElementById('dream-message');
        if (dreamMessage) {
          dreamMessage.innerHTML = `🎯 ¡Listo para ganar!`;
          dreamMessage.classList.remove('animate__pulse');
        }
        
        console.log('✨ [MAIN] Mensaje de bienvenida con nombre mostrado');
      } else {
        welcomeMsg.innerHTML = `¡Bienvenido!`;
        
        // Mensaje genérico del sueño
        const dreamMessage = document.getElementById('dream-message');
        if (dreamMessage) {
          dreamMessage.innerHTML = `🎯 ¡Listo para ganar!`;
          dreamMessage.classList.remove('animate__pulse');
        }
          <div class="text-2xl md:text-3xl font-semibold drop-shadow-lg">
            ¡Bienvenido!
          </div>
          <div class="text-lg md:text-xl font-normal text-yellow-300 mt-2 drop-shadow-md">
            ¡Listo para cumplir tus sueños!
          </div>
        `;
        console.log('✨ [MAIN] Mensaje de bienvenida genérico mostrado');
      }
      
      console.log(`✅ [MAIN] Usuario identificado: ${userName || 'Anónimo'}, Sueño: ${userDream || 'No definido'}, Onboarding completado: ${!needsOnboarding}`);
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
    
    // Registrar credenciales biométricas si es la primera vez - TEMPORALMENTE DESACTIVADO
    try {
      // await BiometricUtils.registerAfterLogin(user);
      console.log('ℹ️ [MAIN] Registro biométrico temporalmente desactivado');
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
      // Marcar que viene de home para evitar loop al regresar
      localStorage.setItem('came_from_home', 'true');
      // Mostrar feedback visual inmediato
      btnAnalizar.style.opacity = '0.5';
      setTimeout(() => {
        window.location.href = "analisis.html";
      }, 100);
    });

    btnCombinacion.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🎯 Botón Combinación clickeado');
      // Marcar que viene de home para evitar loop al regresar
      localStorage.setItem('came_from_home', 'true');
      // Mostrar feedback visual inmediato
      btnCombinacion.style.opacity = '0.5';
      setTimeout(() => {
        window.location.href = "combinacion.html";
      }, 100);
    });

    btnSugeridas.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🎯 Botón Sugeridas clickeado');
      // Marcar que viene de home para evitar loop al regresar
      localStorage.setItem('came_from_home', 'true');
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

  // Cargar último sorteo con un pequeño delay para asegurar que el DOM esté listo
  setTimeout(() => {
    cargarUltimoSorteo();
  }, 500);
});

// === Función para cargar y mostrar el último sorteo ===
async function cargarUltimoSorteo() {
  console.log('🎯 Cargando último sorteo...');
  
  try {
    // Cargar el CSV de Melate para obtener el último sorteo
    const response = await fetch('assets/Melate.csv');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const csvText = await response.text();
    const lineas = csvText.trim().split('\n');
    
    if (lineas.length < 2) {
      throw new Error('CSV sin datos');
    }
    
    // La primera línea después del encabezado contiene el último sorteo
    const primeraLinea = lineas[1].trim();
    const columnas = primeraLinea.split(',');
    
    // El concurso está en la columna 1 (índice 1)
    const ultimoSorteo = parseInt(columnas[1]);
    
    if (isNaN(ultimoSorteo)) {
      throw new Error('Número de sorteo inválido');
    }
    
    // Actualizar el elemento en la página
    const ultimoSorteoElemento = document.getElementById('ultimo-sorteo-numero');
    if (ultimoSorteoElemento) {
      ultimoSorteoElemento.textContent = `🎯 ULTIMO SORTEO ${ultimoSorteo}`;
    }
    
    console.log(`✅ Último sorteo cargado: ${ultimoSorteo}`);
    
  } catch (error) {
    console.error('❌ Error al cargar último sorteo:', error);
    
    // Fallback con número aproximado
    const ultimoSorteoElemento = document.getElementById('ultimo-sorteo-numero');
    if (ultimoSorteoElemento) {
      ultimoSorteoElemento.textContent = '🎯 ULTIMO SORTEO 4090';
    }
    
    console.log('⚠️ Usando fallback para último sorteo: 4090');
  }
}
