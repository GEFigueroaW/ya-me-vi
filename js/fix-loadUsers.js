/**
 * FIX DIRECTO PARA FUNCIÓN LOADUSERS
 * Este script reemplaza la función loadUsers problemática con una versión simplificada
 */

console.log('🔧 Aplicando fix directo para loadUsers...');

// Función loadUsers simplificada y funcional
async function loadUsersFixed() {
  if (!window.db) {
    console.warn('⚠️ Base de datos no disponible');
    return;
  }
  
  console.log('📊 === CARGA SIMPLIFICADA DE USUARIOS ===');
  console.log('👤 Usuario actual:', window.currentUser?.email, 'UID:', window.currentUser?.uid);
  
  // Mostrar loader
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-blue-400 animate-pulse">🔄 Cargando usuarios...</td></tr>';
  
  try {
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    
    console.log('📦 Importando módulos de Firestore...');
    
    // Acceso directo sin ordenamiento para evitar problemas de índices
    console.log('🎯 Obteniendo usuarios de la colección...');
    const snapshot = await getDocs(collection(window.db, 'users'));
    
    const userCount = snapshot.size;
    console.log(`✅ Usuarios obtenidos: ${userCount}`);
    
    // Actualizar contadores
    document.getElementById('total-users').textContent = userCount;
    document.getElementById('users-count').textContent = userCount;
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-400">📭 No hay usuarios registrados</td></tr>';
      return;
    }
    
    // Convertir a array y ordenar manualmente
    const usersArray = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Extraer mejor fecha disponible
      let bestDate = new Date(); // Fallback a fecha actual
      
      if (data.createdAt && data.createdAt.toDate) {
        bestDate = data.createdAt.toDate();
      } else if (data.fechaRegistro) {
        bestDate = new Date(data.fechaRegistro);
      } else if (data.ultimoAcceso) {
        bestDate = new Date(data.ultimoAcceso);
      }
      
      usersArray.push({
        id: doc.id,
        data: data,
        sortDate: bestDate
      });
    });
    
    // Ordenar por fecha (más recientes primero)
    usersArray.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
    
    console.log('🔄 Usuarios ordenados manualmente por fecha');
    
    // Mostrar usuarios en tabla
    let rowsAdded = 0;
    usersArray.slice(0, 50).forEach((user) => { // Limitar a 50 usuarios
      try {
        const { id, data, sortDate } = user;
        const email = data.email || 'Sin email';
        const displayName = data.displayName || data.name || 'Usuario';
        const isAdmin = data.isAdmin === true;
        
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-700 hover:bg-gray-800 transition-colors';
        
        const adminBadge = isAdmin ? ' <span class="ml-2 px-2 py-1 bg-yellow-600 text-xs rounded font-medium">ADMIN</span>' : '';
        
        // Formatear fecha
        const fechaDisplay = window.formatDate ? window.formatDate(sortDate) : sortDate.toLocaleDateString();
        
        row.innerHTML = `
          <td class="py-3 px-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 shadow-md">
                ${email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="font-medium text-white">${email}${adminBadge}</div>
                <div class="text-xs text-gray-400">ID: ${id.substring(0, 12)}...</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 text-gray-300">${displayName}</td>
          <td class="py-3 px-4 text-gray-400">${fechaDisplay}</td>
          <td class="py-3 px-4">
            <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white shadow-sm">
              ✅ Activo
            </span>
          </td>
        `;
        
        tbody.appendChild(row);
        rowsAdded++;
        
      } catch (rowError) {
        console.warn('⚠️ Error procesando usuario:', user.id, rowError.message);
      }
    });
    
    // Agregar información al final
    const infoRow = document.createElement('tr');
    infoRow.innerHTML = `
      <td colspan="4" class="py-2 px-4 text-xs text-gray-500 text-center border-t border-gray-600">
        📊 Fix aplicado | Total: ${userCount} usuarios | Mostrando: ${rowsAdded} | Ordenado manualmente
      </td>
    `;
    tbody.appendChild(infoRow);
    
    console.log(`✅ USUARIOS CARGADOS EXITOSAMENTE: ${rowsAdded} de ${userCount} procesados`);
    
  } catch (error) {
    console.error('❌ ERROR CARGANDO USUARIOS:', error);
    console.error('🔴 Código:', error.code);
    console.error('🔴 Mensaje:', error.message);
    
    // Mostrar error específico
    let errorMessage = '❌ Error cargando usuarios';
    let errorDetails = error.message || 'Error desconocido';
    
    if (error.code === 'permission-denied') {
      errorMessage = '🚫 Sin permisos para leer usuarios';
      errorDetails = 'Verificar reglas de Firestore y permisos de admin';
    } else if (error.code === 'failed-precondition') {
      errorMessage = '⚙️ Error de configuración de base de datos';
      errorDetails = 'Problema de índices de Firestore';
    }
    
    document.getElementById('total-users').textContent = 'Error';
    document.getElementById('users-count').textContent = 'Error';
    
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-8">
          <div class="text-red-400 font-medium">${errorMessage}</div>
          <div class="text-gray-500 text-sm mt-2">${errorDetails}</div>
          <button onclick="loadUsersFixed()" class="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors">
            🔄 Reintentar
          </button>
        </td>
      </tr>
    `;
  }
}

// Reemplazar la función loadUsers original
if (typeof window !== 'undefined') {
  // Reemplazar función global
  window.loadUsers = loadUsersFixed;
  window.loadUsersFixed = loadUsersFixed;
  
  console.log('✅ Función loadUsers reemplazada exitosamente');
  
  // Auto-ejecutar después de 2 segundos si no se ha cargado nada
  setTimeout(() => {
    const tbody = document.getElementById('users-table-body');
    if (tbody && (tbody.innerHTML.includes('Cargando') || tbody.innerHTML.trim() === '')) {
      console.log('🔄 Auto-ejecutando loadUsers fijo...');
      loadUsersFixed();
    }
  }, 2000);
}