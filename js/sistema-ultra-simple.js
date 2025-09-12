/**
 * SISTEMA ULTRA SIMPLE - USUARIOS REALES ÚNICAMENTE
 * Versión robusta que maneja todos los casos de error
 */

console.log('🚀 Sistema Ultra Simple v2.0 - Solo Usuarios Reales');

// Configuración Firebase consolidada
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB4bCGyyPuQo-3-ONMPFKtqPEJDFl8Cb54",
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.firebasestorage.app",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:web:07bd1eb476d38594d002fe",
  measurementId: "G-D7R797S5BC"
};

// Estado global
let firebaseApp = null;
let firestore = null;
let auth = null;

// Inicializar Firebase de forma robusta
async function inicializarFirebase() {
  try {
    if (firebaseApp) {
      console.log('✅ Firebase ya inicializado');
      return { app: firebaseApp, db: firestore, auth };
    }

    console.log('🔥 Inicializando Firebase...');
    
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    
    firebaseApp = initializeApp(FIREBASE_CONFIG);
    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    
    console.log('✅ Firebase inicializado correctamente');
    console.log(`📱 Proyecto: ${FIREBASE_CONFIG.projectId}`);
    
    return { app: firebaseApp, db: firestore, auth };
    
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    throw error;
  }
}

// Función principal para cargar usuarios
async function cargarUsuariosRealesUltraSimple() {
  console.log('🔍 === CARGA ULTRA SIMPLE DE USUARIOS REALES ===');
  
  const tbody = document.getElementById('users-table-body');
  if (!tbody) {
    console.error('❌ Tabla no encontrada');
    return;
  }
  
  // Mostrar estado de carga
  tbody.innerHTML = `
    <tr>
      <td colspan="4" class="text-center py-8">
        <div class="text-blue-400 animate-pulse">
          🔄 Conectando a Firebase...
        </div>
      </td>
    </tr>
  `;
  
  try {
    // Paso 1: Inicializar Firebase
    const { db, auth } = await inicializarFirebase();
    
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-8">
          <div class="text-blue-400 animate-pulse">
            🔍 Buscando usuarios en Firestore...
          </div>
        </td>
      </tr>
    `;
    
    // Paso 2: Verificar autenticación
    if (!auth.currentUser) {
      console.warn('⚠️ Usuario no autenticado - continuando con reglas temporales');
    } else {
      console.log(`👤 Usuario autenticado: ${auth.currentUser.email}`);
    }
    
    // Paso 3: Consultar Firestore
    const { collection, getDocs, query, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    
    console.log('📡 Ejecutando consulta a Firestore...');
    
    // Consulta simple sin filtros complejos
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    console.log(`📊 Consulta exitosa: ${snapshot.size} documentos encontrados`);
    
    // Paso 4: Procesar datos
    if (snapshot.empty) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-8">
            <div class="text-yellow-400">
              📭 No hay usuarios registrados
            </div>
            <div class="text-gray-500 text-sm mt-2">
              La base de datos está vacía o no hay usuarios con permisos de lectura
            </div>
          </td>
        </tr>
      `;
      
      // Actualizar contadores
      document.getElementById('total-users').textContent = '0';
      return;
    }
    
    // Paso 5: Renderizar usuarios
    let html = '';
    let count = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      count++;
      
      console.log(`👤 Usuario ${count}: ${doc.id} - ${data.email || 'Sin email'}`);
      
      const email = data.email || 'Sin email';
      const displayName = data.displayName || data.nombre || 'Sin nombre';
      const createdAt = data.createdAt || data.fechaRegistro || 'Sin fecha';
      const isActive = data.isActive !== false;
      
      // Formatear fecha
      let fechaFormateada = 'Sin fecha';
      if (createdAt && createdAt.toDate) {
        fechaFormateada = createdAt.toDate().toLocaleDateString();
      } else if (createdAt) {
        fechaFormateada = new Date(createdAt).toLocaleDateString();
      }
      
      html += `
        <tr class="border-b border-gray-700 hover:bg-gray-800/50">
          <td class="py-3 px-4 text-blue-300">${email}</td>
          <td class="py-3 px-4 text-gray-300">${displayName}</td>
          <td class="py-3 px-4 text-gray-400">${fechaFormateada}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-1 rounded text-xs ${isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}">
              ${isActive ? '✅ Activo' : '❌ Inactivo'}
            </span>
          </td>
        </tr>
      `;
    });
    
    tbody.innerHTML = html;
    
    // Actualizar contadores
    document.getElementById('total-users').textContent = count;
    
    // Mensaje de éxito
    setTimeout(() => {
      console.log(`🎉 ¡${count} usuarios reales cargados exitosamente!`);
      
      // Mostrar notificación de éxito
      if (typeof showNotification === 'function') {
        showNotification(`✅ ${count} usuarios reales cargados`, 'success');
      }
    }, 500);
    
  } catch (error) {
    console.error('❌ Error cargando usuarios:', error);
    
    // Análisis detallado del error
    let errorMsg = 'Error desconocido';
    let solution = 'Verificar conexión';
    let technicalDetails = error.message;
    
    if (error.code === 'permission-denied') {
      errorMsg = 'Permisos denegados en Firestore';
      solution = 'Las reglas temporales no están activas. Ejecutar: ./deploy-debug-rules.ps1';
    } else if (error.code === 'unavailable') {
      errorMsg = 'Firestore no disponible';
      solution = 'Verificar conexión a internet y estado de Firebase';
    } else if (error.code === 'unauthenticated') {
      errorMsg = 'Usuario no autenticado';
      solution = 'Iniciar sesión primero';
    } else if (error.message.includes('network')) {
      errorMsg = 'Error de red';
      solution = 'Verificar conexión a internet';
    } else if (error.message.includes('quota')) {
      errorMsg = 'Cuota de Firestore excedida';
      solution = 'Esperar reset de cuota o verificar plan de Firebase';
    }
    
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-8">
          <div class="text-red-400 font-medium text-lg mb-2">
            ❌ ${errorMsg}
          </div>
          <div class="text-gray-500 text-sm mb-3">
            ${technicalDetails}
          </div>
          <div class="text-blue-400 text-sm mb-4">
            💡 Solución: ${solution}
          </div>
          <button onclick="cargarUsuariosRealesUltraSimple()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
            🔄 Reintentar
          </button>
        </td>
      </tr>
    `;
    
    // Actualizar contadores
    document.getElementById('total-users').textContent = 'Error';
    
    // Mostrar notificación de error
    if (typeof showNotification === 'function') {
      showNotification(`❌ ${errorMsg}`, 'error');
    }
  }
}

// Función de limpieza (mantener por compatibilidad)
function limpiarTodosFalsoDatos() {
  console.log('🧹 Limpieza ejecutada (no hay datos falsos que limpiar)');
  localStorage.removeItem('yamevi_usuarios_backup');
  if (window.usersSolution) {
    delete window.usersSolution;
  }
}

// Exportar funciones globalmente
window.cargarUsuariosRealesUltraSimple = cargarUsuariosRealesUltraSimple;
window.cargarUsuariosRealesSimple = cargarUsuariosRealesUltraSimple; // Alias
window.limpiarTodosFalsoDatos = limpiarTodosFalsoDatos;

console.log('✅ Sistema Ultra Simple cargado - Funciones disponibles:');
console.log('   - cargarUsuariosRealesUltraSimple()');
console.log('   - cargarUsuariosRealesSimple() [alias]');
console.log('   - limpiarTodosFalsoDatos()');