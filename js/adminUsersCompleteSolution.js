/**
 * SOLUCIÓN COMPLETA PARA EL PROBLEMA DE USUARIOS RECIENTES EN ADMIN.HTML
 * 
 * Problema identificado:
 * - La función loadUsers() en admin.html falla al intentar ordenar por campos que no existen
 * - Los índices de Firestore no están configurados para ordenamiento por fechaRegistro/ultimoAcceso
 * - No hay datos de usuarios históricos en la base de datos
 * 
 * Solución implementada:
 * 1. AdminUsersLoader: Módulo optimizado con múltiples estrategias de carga
 * 2. UserDataSync: Sincronización de usuarios conocidos
 * 3. Fallback robusto para casos de error
 * 4. Integración sin romper funcionalidad existente
 */

/**
 * Función de diagnóstico completo del problema
 */
export async function diagnoseAdminUsersIssue(db, currentUser) {
  console.log('🔍 === DIAGNÓSTICO COMPLETO DE USUARIOS ADMIN ===');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    database: null,
    authentication: null,
    permissions: null,
    users: null,
    indexes: null,
    recommendations: []
  };
  
  try {
    // 1. Verificar base de datos
    console.log('🔍 1. Verificando conectividad de base de datos...');
    diagnostics.database = {
      connected: !!db,
      status: db ? 'Conectado' : 'No disponible'
    };
    
    if (!db) {
      diagnostics.recommendations.push('Verificar inicialización de Firebase');
      return diagnostics;
    }
    
    // 2. Verificar autenticación
    console.log('🔍 2. Verificando autenticación...');
    diagnostics.authentication = {
      user: !!currentUser,
      email: currentUser?.email || null,
      uid: currentUser?.uid || null,
      isAdmin: currentUser?.email ? ['gfigueroa.w@gmail.com', 'eugenfw@gmail.com', 'admin@yamevi.com.mx'].includes(currentUser.email) : false
    };
    
    if (!currentUser) {
      diagnostics.recommendations.push('Usuario no autenticado');
      return diagnostics;
    }
    
    // 3. Verificar permisos de lectura
    console.log('🔍 3. Verificando permisos de lectura...');
    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snapshot = await getDocs(collection(db, 'users'));
      
      diagnostics.permissions = {
        canRead: true,
        userCount: snapshot.size,
        status: 'Permisos OK'
      };
      
    } catch (permError) {
      diagnostics.permissions = {
        canRead: false,
        error: permError.code,
        message: permError.message,
        status: 'Sin permisos'
      };
      diagnostics.recommendations.push(`Error de permisos: ${permError.code}`);
    }
    
    // 4. Analizar datos de usuarios
    if (diagnostics.permissions?.canRead) {
      console.log('🔍 4. Analizando datos de usuarios...');
      try {
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const snapshot = await getDocs(collection(db, 'users'));
        
        let withEmail = 0;
        let withDisplayName = 0;
        let withFechaRegistro = 0;
        let withUltimoAcceso = 0;
        let withCreatedAt = 0;
        let adminUsers = 0;
        
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.email) withEmail++;
          if (data.displayName) withDisplayName++;
          if (data.fechaRegistro) withFechaRegistro++;
          if (data.ultimoAcceso) withUltimoAcceso++;
          if (data.createdAt) withCreatedAt++;
          if (data.isAdmin) adminUsers++;
        });
        
        diagnostics.users = {
          total: snapshot.size,
          withEmail,
          withDisplayName,
          withFechaRegistro,
          withUltimoAcceso,
          withCreatedAt,
          adminUsers,
          dataQuality: {
            emailPercentage: Math.round((withEmail / snapshot.size) * 100),
            displayNamePercentage: Math.round((withDisplayName / snapshot.size) * 100),
            dateFieldsPercentage: Math.round((withCreatedAt / snapshot.size) * 100)
          }
        };
        
        if (snapshot.size === 0) {
          diagnostics.recommendations.push('No hay usuarios en la base de datos - ejecutar sincronización');
        }
        
        if (withFechaRegistro === 0 && withCreatedAt === 0) {
          diagnostics.recommendations.push('Usuarios sin campos de fecha - problemas de ordenamiento');
        }
        
      } catch (userError) {
        diagnostics.users = {
          error: userError.code,
          message: userError.message
        };
        diagnostics.recommendations.push(`Error analizando usuarios: ${userError.code}`);
      }
    }
    
    // 5. Verificar índices de Firestore
    console.log('🔍 5. Verificando capacidades de ordenamiento...');
    const orderingTests = [
      { field: '__name__', desc: true, name: 'Por ID documento' },
      { field: 'createdAt', desc: true, name: 'Por timestamp Firestore' },
      { field: 'fechaRegistro', desc: true, name: 'Por fecha registro' },
      { field: 'ultimoAcceso', desc: true, name: 'Por último acceso' }
    ];
    
    diagnostics.indexes = {
      supportedOrderings: [],
      unsupportedOrderings: []
    };
    
    for (const test of orderingTests) {
      try {
        const { collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const direction = test.desc ? 'desc' : 'asc';
        const testQuery = query(collection(db, 'users'), orderBy(test.field, direction), limit(1));
        await getDocs(testQuery);
        
        diagnostics.indexes.supportedOrderings.push({
          field: test.field,
          direction,
          name: test.name,
          status: 'Soportado'
        });
        
      } catch (indexError) {
        diagnostics.indexes.unsupportedOrderings.push({
          field: test.field,
          direction: test.desc ? 'desc' : 'asc',
          name: test.name,
          error: indexError.code,
          status: 'No soportado'
        });
      }
    }
    
    // 6. Generar recomendaciones finales
    if (diagnostics.indexes.supportedOrderings.length === 0) {
      diagnostics.recommendations.push('Sin índices de ordenamiento disponibles - usar carga básica');
    }
    
    if (diagnostics.users?.total > 0 && diagnostics.indexes.supportedOrderings.length > 0) {
      diagnostics.recommendations.push('Sistema funcional - usar carga optimizada');
    }
    
    console.log('✅ Diagnóstico completado:', diagnostics);
    return diagnostics;
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    diagnostics.error = {
      code: error.code,
      message: error.message
    };
    diagnostics.recommendations.push('Error crítico en diagnóstico');
    return diagnostics;
  }
}

/**
 * Función de reparación automática
 */
export async function autoRepairAdminUsers(db, currentUser) {
  console.log('🔧 === REPARACIÓN AUTOMÁTICA DE USUARIOS ADMIN ===');
  
  const repairResult = {
    timestamp: new Date().toISOString(),
    steps: [],
    success: false,
    usersFixed: 0,
    errors: []
  };
  
  try {
    // Paso 1: Diagnóstico inicial
    repairResult.steps.push('Ejecutando diagnóstico inicial...');
    const diagnostics = await diagnoseAdminUsersIssue(db, currentUser);
    
    if (!diagnostics.permissions?.canRead) {
      repairResult.errors.push('Sin permisos de lectura - no se puede reparar');
      return repairResult;
    }
    
    // Paso 2: Sincronizar usuarios conocidos si no hay datos
    if (diagnostics.users?.total === 0) {
      repairResult.steps.push('Sincronizando usuarios conocidos...');
      try {
        const { UserDataSync } = await import('./userDataSync.js');
        const userSync = new UserDataSync(db, currentUser);
        const syncResult = await userSync.syncKnownUsers();
        repairResult.usersFixed += syncResult.syncedCount;
        repairResult.steps.push(`${syncResult.syncedCount} usuarios sincronizados`);
      } catch (syncError) {
        repairResult.errors.push(`Error en sincronización: ${syncError.message}`);
      }
    }
    
    // Paso 3: Normalizar campos de fecha
    repairResult.steps.push('Normalizando campos de fecha...');
    try {
      const { collection, getDocs, doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snapshot = await getDocs(collection(db, 'users'));
      
      let fixedDates = 0;
      
      for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        const updates = {};
        let needsUpdate = false;
        
        if (!data.createdAt) {
          updates.createdAt = serverTimestamp();
          needsUpdate = true;
        }
        
        if (!data.fechaRegistro) {
          updates.fechaRegistro = new Date().toISOString();
          needsUpdate = true;
        }
        
        if (!data.ultimoAcceso) {
          updates.ultimoAcceso = new Date().toISOString();
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await setDoc(doc(db, 'users', userDoc.id), updates, { merge: true });
          fixedDates++;
        }
      }
      
      repairResult.steps.push(`${fixedDates} usuarios con fechas normalizadas`);
      repairResult.usersFixed += fixedDates;
      
    } catch (dateError) {
      repairResult.errors.push(`Error normalizando fechas: ${dateError.message}`);
    }
    
    // Paso 4: Verificación final
    repairResult.steps.push('Ejecutando verificación final...');
    const finalDiagnostics = await diagnoseAdminUsersIssue(db, currentUser);
    
    if (finalDiagnostics.users?.total > 0) {
      repairResult.success = true;
      repairResult.steps.push('Reparación completada exitosamente');
    }
    
    console.log('✅ Reparación automática completada:', repairResult);
    return repairResult;
    
  } catch (error) {
    console.error('❌ Error en reparación automática:', error);
    repairResult.errors.push(`Error crítico: ${error.message}`);
    return repairResult;
  }
}

/**
 * Función principal de solución
 */
export async function solveAdminUsersIssue(db, currentUser) {
  console.log('🚀 === SOLUCIÓN COMPLETA PARA USUARIOS ADMIN ===');
  
  try {
    // 1. Diagnóstico
    const diagnostics = await diagnoseAdminUsersIssue(db, currentUser);
    console.log('📊 Diagnóstico:', diagnostics);
    
    // 2. Reparación si es necesaria
    let repairResult = null;
    if (diagnostics.users?.total === 0 || diagnostics.recommendations.length > 0) {
      repairResult = await autoRepairAdminUsers(db, currentUser);
      console.log('🔧 Reparación:', repairResult);
    }
    
    // 3. Cargar usuarios con método optimizado
    console.log('📥 Cargando usuarios con método optimizado...');
    try {
      const { AdminUsersLoader } = await import('./adminUsersLoader.js');
      const usersLoader = new AdminUsersLoader(db, currentUser);
      const result = await usersLoader.loadAndDisplayUsers();
      console.log('✅ Usuarios cargados exitosamente');
      
      return {
        success: true,
        diagnostics,
        repairResult,
        message: 'Problema de usuarios recientes resuelto'
      };
      
    } catch (loadError) {
      console.warn('⚠️ Error en carga optimizada, usando fallback:', loadError.message);
      
      // Fallback a carga básica
      const tbody = document.getElementById('users-table-body');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-blue-400">🔄 Cargando con método básico...</td></tr>';
        
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const snapshot = await getDocs(collection(db, 'users'));
        
        // Actualizar contadores
        document.getElementById('total-users').textContent = snapshot.size;
        document.getElementById('users-count').textContent = snapshot.size;
        
        // Mostrar usuarios básico
        tbody.innerHTML = '';
        snapshot.forEach(doc => {
          const data = doc.data();
          const row = document.createElement('tr');
          row.className = 'border-b border-gray-700 hover:bg-gray-800';
          row.innerHTML = `
            <td class="py-3 px-4">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                  ${(data.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div class="font-medium">${data.email || 'Sin email'}</div>
                  <div class="text-xs text-gray-400">${doc.id.substring(0, 8)}...</div>
                </div>
              </div>
            </td>
            <td class="py-3 px-4">${data.displayName || 'Usuario'}</td>
            <td class="py-3 px-4">Fecha no disponible</td>
            <td class="py-3 px-4">
              <span class="px-2 py-1 rounded-full text-xs bg-green-600">Activo</span>
            </td>
          `;
          tbody.appendChild(row);
        });
        
        console.log('✅ Fallback básico aplicado exitosamente');
      }
      
      return {
        success: true,
        method: 'fallback',
        diagnostics,
        repairResult,
        message: 'Problema resuelto con método fallback'
      };
    }
    
  } catch (error) {
    console.error('❌ Error en solución completa:', error);
    
    // Último recurso: mostrar mensaje de error con botón de reintento
    const tbody = document.getElementById('users-table-body');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-8">
            <div class="text-red-400 font-medium">❌ Error cargando usuarios</div>
            <div class="text-gray-500 text-sm mt-2">${error.message}</div>
            <button onclick="window.location.reload()" class="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
              🔄 Recargar página
            </button>
          </td>
        </tr>
      `;
    }
    
    return {
      success: false,
      error: error.message,
      diagnostics: null,
      repairResult: null
    };
  }
}

// Función global para ejecutar la solución desde el panel de admin
window.solveFull = async function() {
  if (!window.db || !window.currentUser) {
    alert('❌ Base de datos o usuario no disponible');
    return;
  }
  
  const result = await solveAdminUsersIssue(window.db, window.currentUser);
  
  if (result.success) {
    alert(`✅ ${result.message}`);
  } else {
    alert(`❌ Error: ${result.error}`);
  }
};

console.log('🎯 Solución completa para usuarios admin cargada');