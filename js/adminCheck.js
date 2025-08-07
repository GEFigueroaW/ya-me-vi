// adminCheck.js - Utilidades para verificación de administradores
import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/**
 * Verifica si el usuario actual es administrador
 * @returns {Promise<boolean>} Promise que resuelve a true si el usuario es administrador
 */
export async function isUserAdmin() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log('❌ [ADMIN] No hay usuario autenticado');
        resolve(false);
        return;
      }
      
      console.log('🔍 [ADMIN] Verificando admin para usuario:', user.email);
      
      try {
        // Lista de emails de administradores autorizados
        const adminEmails = ['gfigueroa.w@gmail.com', 'admin@yamevi.com.mx', 'eugenfw@gmail.com'];
        
        console.log('📋 [ADMIN] Lista de admins:', adminEmails);
        console.log('📧 [ADMIN] Email del usuario:', user.email);
        
        // Verificación primaria por email
        if (adminEmails.includes(user.email)) {
          console.log('✅ [ADMIN] Admin verificado por email:', user.email);
          resolve(true);
          return;
        }
        
        console.log('❌ [ADMIN] Email no está en lista de admins');
        
        // Verificación secundaria por Firestore
        console.log('🔍 [ADMIN] Verificando en Firestore...');
        const userRef = collection(db, "users");
        const q = query(userRef, where("email", "==", user.email), where("isAdmin", "==", true));
        const querySnapshot = await getDocs(q);
        
        const isAdmin = !querySnapshot.empty;
        console.log('🔍 [ADMIN] Verificación Firestore completada:', isAdmin, 'para', user.email);
        resolve(isAdmin);
      } catch (error) {
        console.error('❌ [ADMIN] Error verificando permisos de administrador:', error);
        resolve(false);
      }
    });
  });
}

/**
 * Muestra u oculta elementos para administradores
 * @param {boolean} showAdminElements - Si es true, muestra los elementos para administradores
 */
export function toggleAdminElements(showAdminElements) {
  console.log(`🔧 [ADMIN] toggleAdminElements llamado con:`, showAdminElements);
  const adminElements = document.querySelectorAll('.admin-only');
  
  console.log(`🔍 [ADMIN] Encontrados ${adminElements.length} elementos admin-only`);
  
  adminElements.forEach((element, index) => {
    console.log(`🔍 [ADMIN] Elemento ${index + 1}:`, element.id || element.className);
    if (showAdminElements) {
      element.classList.remove('hidden');
      element.style.display = 'block';
      console.log(`✅ [ADMIN] Elemento admin ${index + 1} mostrado`);
    } else {
      element.classList.add('hidden');
      element.style.display = 'none';
      console.log(`⛔ [ADMIN] Elemento admin ${index + 1} ocultado`);
    }
  });
  
  console.log(`${showAdminElements ? '✅ [ADMIN] Mostrando' : '⛔ [ADMIN] Ocultando'} elementos de administrador`);
}

/**
 * Redirige al usuario si no es administrador
 * @returns {Promise<void>}
 */
export async function redirectIfNotAdmin() {
  const isAdmin = await isUserAdmin();
  
  if (!isAdmin) {
    console.log('❌ Usuario no tiene permisos de administrador, redirigiendo...');
    alert('No tienes permisos para acceder a esta sección');
    window.location.href = 'home.html';
  }
  
  return isAdmin;
}

/**
 * Inicializa los elementos de administrador en la página actual
 */
export async function initAdminElements() {
  const isAdmin = await isUserAdmin();
  toggleAdminElements(isAdmin);
  
  return isAdmin;
}
