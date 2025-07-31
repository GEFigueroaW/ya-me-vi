// === Firebase ===
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebase-init.js';
import { isUserAdmin, toggleAdminElements } from './adminCheck.js';
import { authGuard } from './authGuard.js';

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
      
      // 1. Intentar desde los datos guardados en Firestore
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.displayName || userData.name) {
          userName = (userData.displayName || userData.name).split(' ')[0]; // Solo primer nombre
        }
        if (userData.dream) {
          userDream = userData.dream;
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
        welcomeMsg.textContent = `¡Bienvenido ${userName}!`;
      } else {
        welcomeMsg.textContent = '¡Bienvenido!';
      }
      
      console.log(`✅ Usuario identificado: ${userName || 'Anónimo'}, Sueño: ${userDream || 'No definido'}`);
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
    
    mostrarBienvenidaConSueño(user);
    
    // Verificar si el usuario es administrador y mostrar/ocultar elementos
    const isAdmin = await isUserAdmin();
    toggleAdminElements(isAdmin);
    
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
  // === Referencias DOM ===
  const btnAnalizar = document.getElementById('btn-analizar');
  const btnCombinacion = document.getElementById('btn-combinacion');
  const btnSugeridas = document.getElementById('btn-sugeridas');
  const btnAdmin = document.getElementById('btn-admin');

  // === Botones: alternar visibilidad y redirigir ===
  if (btnAnalizar && btnCombinacion && btnSugeridas) {
    btnAnalizar.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Botón Analizar clickeado');
      btnAnalizar.classList.add('hidden');
      btnCombinacion.classList.remove('hidden');
      btnSugeridas.classList.remove('hidden');
      window.location.href = "analisis.html";
    });

    btnCombinacion.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Botón Combinación clickeado');
      btnCombinacion.classList.add('hidden');
      btnAnalizar.classList.remove('hidden');
      btnSugeridas.classList.remove('hidden');
      window.location.href = "combinacion.html";
    });

    btnSugeridas.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Botón Sugeridas clickeado');
      btnSugeridas.classList.add('hidden');
      btnAnalizar.classList.remove('hidden');
      btnCombinacion.classList.remove('hidden');
      window.location.href = "sugeridas.html";
    });
  } else {
    console.warn('No se encontraron los botones principales');
  }
  
  // Botón de administración (solo visible para admins)
  if (btnAdmin) {
    btnAdmin.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🔐 Accediendo al panel de administración');
      window.location.href = "admin.html";
    });
    
    // Verificación adicional de administrador
    isUserAdmin().then(isAdmin => {
      if (isAdmin) {
        btnAdmin.classList.remove('hidden');
      }
    });
  }
});
