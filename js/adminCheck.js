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
        resolve(false);
        return;
      }
      
      try {
        // Comprobar si el usuario es administrador en Firestore
        const userRef = collection(db, "users");
        const q = query(userRef, where("email", "==", user.email), where("isAdmin", "==", true));
        const querySnapshot = await getDocs(q);
        
        resolve(!querySnapshot.empty);
      } catch (error) {
        console.error('Error verificando permisos de administrador:', error);
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
  const adminElements = document.querySelectorAll('.admin-only');
  
  adminElements.forEach(element => {
    if (showAdminElements) {
      element.style.display = 'block';
    } else {
      element.style.display = 'none';
    }
  });
  
  console.log(`${showAdminElements ? '✅ Mostrando' : '⛔ Ocultando'} elementos de administrador`);
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
