/**
 * SOLUCIÓN SIMPLE Y REAL
 * Solo usuarios reales, sin datos de prueba, sin complicaciones
 */

console.log('🧹 === LIMPIEZA TOTAL - SOLO DATOS REALES ===');

// Limpiar todo lo anterior
function limpiarTodosFalsoDatos() {
  console.log('🗑️ Eliminando todos los datos falsos...');
  
  // Limpiar localStorage
  localStorage.removeItem('yamevi_usuarios_backup');
  
  // Limpiar variables globales
  if (window.usersSolution) {
    delete window.usersSolution.usuarios;
    delete window.usersSolution;
  }
  
  console.log('✅ Datos falsos eliminados');
}

// Función SIMPLE para cargar usuarios reales
async function cargarUsuariosRealesSimple() {
  console.log('📥 === CARGANDO SOLO USUARIOS REALES ===');
  
  const tbody = document.getElementById('users-table-body');
  if (!tbody) {
    console.error('❌ No se encontró la tabla');
    return;
  }
  
  // Mostrar loader
  tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-blue-400 animate-pulse">🔄 Cargando usuarios reales...</td></tr>';
  
  try {
    // Intentar Firestore REAL sin crear nada
    if (!window.db) {
      throw new Error('Base de datos no disponible');
    }
    
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    
    console.log('🔍 Consultando Firestore REAL...');
    const snapshot = await getDocs(collection(window.db, 'users'));
    
    console.log(`📊 Encontrados: ${snapshot.size} usuarios en Firestore`);
    
    // Actualizar contadores
    document.getElementById('total-users').textContent = snapshot.size;
    document.getElementById('users-count').textContent = snapshot.size;
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (snapshot.empty) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-8">
            <div class="text-yellow-400 font-medium">⚠️ No hay usuarios en Firestore</div>
            <div class="text-gray-500 text-sm mt-2">La base de datos está vacía o no tienes permisos de lectura</div>
            <div class="text-xs text-gray-600 mt-2">Si el botón 'Exportar' muestra usuarios, hay un problema de permisos</div>
          </td>
        </tr>
      `;
      return;
    }
    
    // Mostrar usuarios reales
    let count = 0;
    const usuarios = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      usuarios.push({
        id: doc.id,
        data: data
      });
    });
    
    // Ordenar por ID (más simple y no requiere índices)
    usuarios.sort((a, b) => a.id.localeCompare(b.id));
    
    usuarios.forEach(usuario => {
      try {
        const { id, data } = usuario;
        const email = data.email || 'Sin email';
        const displayName = data.displayName || data.name || 'Usuario';
        const isAdmin = data.isAdmin === true;
        
        // Extraer fecha real
        let fechaDisplay = 'Sin fecha';
        if (data.createdAt && data.createdAt.toDate) {
          fechaDisplay = data.createdAt.toDate().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } else if (data.fechaRegistro) {
          try {
            const fecha = new Date(data.fechaRegistro);
            if (!isNaN(fecha.getTime())) {
              fechaDisplay = fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            }
          } catch (e) {
            console.warn('Error parseando fecha:', e);
          }
        }
        
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-700 hover:bg-gray-800 transition-colors';
        
        const adminBadge = isAdmin ? ' <span class="ml-2 px-2 py-1 bg-yellow-600 text-xs rounded font-medium">ADMIN</span>' : '';
        
        row.innerHTML = `
          <td class="py-3 px-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 shadow-md">
                ${email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="font-medium text-white">${email}${adminBadge}</div>
                <div class="text-xs text-green-400">✅ REAL - ID: ${id.substring(0, 12)}...</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 text-gray-300">${displayName}</td>
          <td class="py-3 px-4 text-gray-400">${fechaDisplay}</td>
          <td class="py-3 px-4">
            <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white shadow-sm">
              ✅ REAL
            </span>
          </td>
        `;
        
        tbody.appendChild(row);
        count++;
        
        // Log de cada usuario real encontrado
        console.log(`👤 Usuario real ${count}: ${email} (${isAdmin ? 'ADMIN' : 'USER'})`);
        
      } catch (rowError) {
        console.warn('⚠️ Error procesando usuario real:', rowError);
      }
    });
    
    // Agregar info final
    const infoRow = document.createElement('tr');
    infoRow.innerHTML = `
      <td colspan="4" class="py-2 px-4 text-xs text-green-600 text-center border-t border-gray-600 font-medium">
        ✅ SOLO USUARIOS REALES | Firestore directo | Total: ${count} | ${new Date().toLocaleTimeString()}
      </td>
    `;
    tbody.appendChild(infoRow);
    
    console.log(`✅ ÉXITO: ${count} usuarios REALES cargados desde Firestore`);
    
    // Mostrar alerta de éxito
    setTimeout(() => {
      alert(`✅ ¡Usuarios REALES cargados!

📊 Total: ${count} usuarios
🔍 Fuente: Firestore directo
✅ Sin datos de prueba

${count === 0 ? 
  '⚠️ Si el botón "Exportar" muestra usuarios pero aquí no aparecen, hay un problema de permisos de lectura en Firestore.' :
  '🎉 Estos son tus usuarios reales registrados en la aplicación.'
}`);
    }, 500);
    
  } catch (error) {
    console.error('❌ Error cargando usuarios reales:', error);
    
    let errorMsg = 'Error desconocido';
    let solution = 'Revisar conexión';
    
    if (error.code === 'permission-denied') {
      errorMsg = 'Sin permisos de lectura en Firestore';
      solution = 'Verificar reglas de seguridad de Firestore';
    } else if (error.code === 'unavailable') {
      errorMsg = 'Firestore temporalmente no disponible';
      solution = 'Reintentar en unos minutos';
    }
    
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-8">
          <div class="text-red-400 font-medium">❌ ${errorMsg}</div>
          <div class="text-gray-500 text-sm mt-2">${error.message}</div>
          <div class="text-blue-400 text-xs mt-2">💡 ${solution}</div>
          <div class="mt-4 p-3 bg-yellow-900 bg-opacity-50 rounded text-yellow-200 text-xs">
            <strong>Nota:</strong> Si el botón "Exportar" funciona pero esto no,<br>
            significa que tienes usuarios pero hay restricciones de permisos<br>
            en las reglas de Firestore para lectura desde el panel admin.
          </div>
          <button onclick="cargarUsuariosRealesSimple()" class="mt-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm">
            🔄 Reintentar
          </button>
        </td>
      </tr>
    `;
    
    // Actualizar contadores con error
    document.getElementById('total-users').textContent = 'Error';
    document.getElementById('users-count').textContent = 'Error';
  }
}

// Función de inicialización simple
function inicializarSistemaSimple() {
  console.log('🚀 Inicializando sistema simple...');
  
  // Limpiar datos falsos primero
  limpiarTodosFalsoDatos();
  
  // Reemplazar función loadUsers original
  window.loadUsers = cargarUsuariosRealesSimple;
  
  // Cargar usuarios reales automáticamente
  setTimeout(() => {
    cargarUsuariosRealesSimple();
  }, 1000);
}

// Hacer funciones disponibles globalmente
window.cargarUsuariosRealesSimple = cargarUsuariosRealesSimple;
window.limpiarTodosFalsoDatos = limpiarTodosFalsoDatos;
window.inicializarSistemaSimple = inicializarSistemaSimple;

console.log('✅ Sistema simple cargado. Ejecutando inicialización...');

// Auto-inicializar
inicializarSistemaSimple();