/**
 * Script para integrar el nuevo módulo AdminUsersLoader en admin.html
 * Reemplaza la función loadUsers existente
 */

// Nueva función loadUsers que usa el módulo optimizado
async function loadUsers() {
  if (!db) {
    console.warn('⚠️ Base de datos no disponible');
    return;
  }
  
  console.log('📊 === INICIANDO CARGA DE USUARIOS OPTIMIZADA ===');
  console.log('🔑 Usuario actual:', currentUser?.email, 'UID:', currentUser?.uid);
  
  try {
    // Usar el módulo optimizado de carga de usuarios
    if (!window.adminUsersLoader) {
      const { AdminUsersLoader } = await import('./js/adminUsersLoader.js');
      window.adminUsersLoader = new AdminUsersLoader(db, currentUser);
    }
    
    // Cargar y mostrar usuarios
    await window.adminUsersLoader.loadAndDisplayUsers();
    
  } catch (error) {
    console.error('❌ Error en loadUsers optimizado:', error);
    
    // Fallback a implementación básica
    await loadUsersBasic();
  }
}

// Fallback básico para carga de usuarios
async function loadUsersBasic() {
  console.log('🔄 Usando fallback básico para carga de usuarios...');
  
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-blue-400">🔄 Cargando con método básico...</td></tr>';
  
  try {
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    
    const snapshot = await getDocs(collection(db, 'users'));
    const userCount = snapshot.size;
    
    console.log(`📊 Usuarios cargados (básico): ${userCount}`);
    
    // Actualizar contadores
    document.getElementById('total-users').textContent = userCount;
    document.getElementById('users-count').textContent = userCount;
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-400">📭 No hay usuarios registrados</td></tr>';
      return;
    }
    
    let rowsAdded = 0;
    
    snapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const email = data.email || 'Sin email';
        const displayName = data.displayName || data.name || 'Usuario';
        const isAdmin = data.isAdmin === true;
        
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-700 hover:bg-gray-800 transition-colors';
        
        const adminBadge = isAdmin ? ' <span class="ml-2 px-2 py-1 bg-yellow-600 text-xs rounded font-medium">ADMIN</span>' : '';
        
        row.innerHTML = `
          <td class="py-3 px-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 shadow-md">
                ${email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="font-medium text-white">${email}${adminBadge}</div>
                <div class="text-xs text-gray-400">ID: ${doc.id.substring(0, 12)}...</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 text-gray-300">${displayName}</td>
          <td class="py-3 px-4 text-gray-400">Sin fecha disponible</td>
          <td class="py-3 px-4">
            <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white shadow-sm">
              ✅ Activo
            </span>
          </td>
        `;
        
        tbody.appendChild(row);
        rowsAdded++;
        
      } catch (rowError) {
        console.warn('⚠️ Error procesando usuario:', doc.id, rowError.message);
      }
    });
    
    console.log(`✅ Fallback básico completado: ${rowsAdded} usuarios procesados`);
    
    // Agregar información al final de la tabla
    const infoRow = document.createElement('tr');
    infoRow.innerHTML = `
      <td colspan="4" class="py-2 px-4 text-xs text-gray-500 text-center border-t border-gray-600">
        📊 Método básico | Total: ${userCount} usuarios | Mostrando: ${rowsAdded}
      </td>
    `;
    tbody.appendChild(infoRow);
    
  } catch (error) {
    console.error('❌ Error en fallback básico:', error);
    
    document.getElementById('total-users').textContent = 'Error';
    document.getElementById('users-count').textContent = 'Error';
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-8">
          <div class="text-red-400 font-medium">❌ Error cargando usuarios</div>
          <div class="text-gray-500 text-sm mt-2">${error.message || 'Problema de conexión'}</div>
          <button onclick="loadUsers()" class="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors">
            🔄 Reintentar
          </button>
        </td>
      </tr>
    `;
  }
}

console.log('✅ Nuevo módulo de carga de usuarios integrado');