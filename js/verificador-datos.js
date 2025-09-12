/**
 * VERIFICADOR DE DATOS REALES VS PRUEBA
 * Te dice exactamente qué usuarios son reales y cuáles son de prueba
 */

async function verificarDatosReales() {
  console.log('🔍 === VERIFICANDO ORIGEN DE DATOS ===');
  
  const resultados = {
    timestamp: new Date().toISOString(),
    firestore: { usuarios: [], total: 0, accesible: false },
    localStorage: { usuarios: [], total: 0, existe: false },
    memoria: { usuarios: [], total: 0, existe: false },
    resumen: {}
  };
  
  // 1. Verificar Firestore REAL
  console.log('🔍 1. Verificando Firestore REAL...');
  if (window.db) {
    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snapshot = await getDocs(collection(window.db, 'users'));
      
      resultados.firestore.accesible = true;
      resultados.firestore.total = snapshot.size;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        resultados.firestore.usuarios.push({
          id: doc.id,
          email: data.email,
          displayName: data.displayName,
          isAdmin: data.isAdmin,
          fechaRegistro: data.fechaRegistro,
          source: 'FIRESTORE_REAL'
        });
      });
      
      console.log(`✅ Firestore REAL: ${resultados.firestore.total} usuarios encontrados`);
      
    } catch (error) {
      console.warn('⚠️ No se puede acceder a Firestore REAL:', error.message);
      resultados.firestore.error = error.message;
    }
  }
  
  // 2. Verificar localStorage
  console.log('🔍 2. Verificando localStorage...');
  try {
    const datosLocal = localStorage.getItem('yamevi_usuarios_backup');
    if (datosLocal) {
      const usuarios = JSON.parse(datosLocal);
      resultados.localStorage.existe = true;
      resultados.localStorage.total = usuarios.length;
      resultados.localStorage.usuarios = usuarios.map(u => ({
        ...u,
        source: 'LOCALSTORAGE_PRUEBA'
      }));
      console.log(`📱 localStorage: ${usuarios.length} usuarios de prueba`);
    }
  } catch (error) {
    console.warn('⚠️ Error leyendo localStorage:', error.message);
  }
  
  // 3. Verificar memoria global
  console.log('🔍 3. Verificando memoria global...');
  if (window.usersSolution && window.usersSolution.usuarios) {
    resultados.memoria.existe = true;
    resultados.memoria.total = window.usersSolution.usuarios.length;
    resultados.memoria.usuarios = window.usersSolution.usuarios.map(u => ({
      ...u,
      source: 'MEMORIA_PRUEBA'
    }));
    console.log(`🧠 Memoria: ${resultados.memoria.total} usuarios de prueba`);
  }
  
  // 4. Análisis de lo que se está mostrando actualmente
  console.log('🔍 4. Analizando tabla actual...');
  const tbody = document.getElementById('users-table-body');
  const filasActuales = tbody ? tbody.querySelectorAll('tr').length - 1 : 0; // -1 por la fila de info
  
  // 5. Generar resumen
  resultados.resumen = {
    usuariosFirestoreReales: resultados.firestore.total,
    usuariosPruebaLocal: resultados.localStorage.total,
    usuariosPruebaMemoria: resultados.memoria.total,
    mostrandoActualmente: filasActuales,
    
    // Análisis de procedencia
    fuentePrincipal: resultados.firestore.accesible && resultados.firestore.total > 0 ? 'FIRESTORE_REAL' :
                     resultados.localStorage.existe ? 'LOCALSTORAGE_PRUEBA' : 
                     resultados.memoria.existe ? 'MEMORIA_PRUEBA' : 'NINGUNA',
    
    // Recomendaciones
    sonDatosReales: resultados.firestore.accesible && resultados.firestore.total > 0,
    hayMezcla: (resultados.firestore.total > 0) && (resultados.localStorage.total > 0 || resultados.memoria.total > 0)
  };
  
  // 6. Mostrar resultados
  console.log('📊 === RESULTADOS DE VERIFICACIÓN ===');
  console.log('🔥 Firestore REAL:', resultados.firestore);
  console.log('📱 localStorage PRUEBA:', resultados.localStorage);
  console.log('🧠 Memoria PRUEBA:', resultados.memoria);
  console.log('📋 RESUMEN:', resultados.resumen);
  
  // 7. Mostrar análisis detallado
  console.log('\n🎯 === ANÁLISIS DETALLADO ===');
  
  if (resultados.resumen.sonDatosReales) {
    console.log('✅ HAY DATOS REALES en Firestore');
    resultados.firestore.usuarios.forEach((user, i) => {
      console.log(`   ${i+1}. ${user.email} (${user.isAdmin ? 'ADMIN' : 'USER'}) - REAL`);
    });
  } else {
    console.log('❌ NO hay datos reales accesibles en Firestore');
  }
  
  if (resultados.localStorage.total > 0) {
    console.log('🧪 HAY DATOS DE PRUEBA en localStorage');
    resultados.localStorage.usuarios.forEach((user, i) => {
      console.log(`   ${i+1}. ${user.email} (${user.isAdmin ? 'ADMIN' : 'USER'}) - PRUEBA`);
    });
  }
  
  // 8. Recomendación final
  console.log('\n💡 === RECOMENDACIÓN ===');
  if (resultados.resumen.sonDatosReales) {
    console.log('✅ Los datos que ves SON MAYORMENTE REALES');
    console.log(`📊 ${resultados.firestore.total} usuarios reales + ${resultados.localStorage.total + resultados.memoria.total} de prueba`);
  } else {
    console.log('⚠️ Los datos que ves son DE PRUEBA');
    console.log('🔧 Esto se debe a que no se puede acceder a los datos reales de Firestore');
  }
  
  // 9. Crear reporte visual
  const reporte = `
🔍 VERIFICACIÓN DE DATOS - ${new Date().toLocaleString()}

📊 FUENTES DE DATOS:
├── 🔥 Firestore REAL: ${resultados.firestore.total} usuarios ${resultados.firestore.accesible ? '✅' : '❌'}
├── 📱 localStorage: ${resultados.localStorage.total} usuarios de prueba
└── 🧠 Memoria: ${resultados.memoria.total} usuarios de prueba

🎯 ANÁLISIS:
├── Mostrando actualmente: ${resultados.resumen.mostrandoActualmente} usuarios
├── Fuente principal: ${resultados.resumen.fuentePrincipal}
├── ¿Son datos reales?: ${resultados.resumen.sonDatosReales ? 'SÍ ✅' : 'NO ❌'}
└── ¿Hay mezcla?: ${resultados.resumen.hayMezcla ? 'SÍ (real + prueba)' : 'NO'}

${resultados.resumen.sonDatosReales ? 
  '✅ CONCLUSIÓN: Los datos mostrados SON REALES (con posible complemento de prueba)' :
  '⚠️ CONCLUSIÓN: Los datos mostrados son DE PRUEBA (Firestore no accesible)'
}
  `;
  
  console.log(reporte);
  
  // 10. Mostrar alerta al usuario
  alert(reporte);
  
  return resultados;
}

// Función para limpiar datos de prueba y mostrar solo reales
async function mostrarSoloReales() {
  console.log('🧹 Limpiando datos de prueba y mostrando solo reales...');
  
  try {
    // Limpiar localStorage
    localStorage.removeItem('yamevi_usuarios_backup');
    console.log('🗑️ localStorage limpiado');
    
    // Limpiar memoria
    if (window.usersSolution) {
      delete window.usersSolution.usuarios;
      console.log('🗑️ Memoria limpiada');
    }
    
    // Intentar cargar solo desde Firestore
    if (window.db) {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snapshot = await getDocs(collection(window.db, 'users'));
      
      if (!snapshot.empty) {
        console.log(`✅ Cargando ${snapshot.size} usuarios REALES desde Firestore`);
        
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';
        
        let count = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          const email = data.email || 'Sin email';
          const displayName = data.displayName || 'Usuario';
          const isAdmin = data.isAdmin === true;
          
          const row = document.createElement('tr');
          row.className = 'border-b border-gray-700 hover:bg-gray-800 transition-colors';
          
          const adminBadge = isAdmin ? ' <span class="ml-2 px-2 py-1 bg-yellow-600 text-xs rounded font-medium">ADMIN</span>' : '';
          
          let fechaDisplay = 'Sin fecha';
          if (data.fechaRegistro) {
            const fecha = new Date(data.fechaRegistro);
            fechaDisplay = fecha.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
          
          row.innerHTML = `
            <td class="py-3 px-4">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 shadow-md">
                  ${email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div class="font-medium text-white">${email}${adminBadge}</div>
                  <div class="text-xs text-gray-400">REAL - ID: ${doc.id.substring(0, 12)}...</div>
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
        });
        
        // Info final
        const infoRow = document.createElement('tr');
        infoRow.innerHTML = `
          <td colspan="4" class="py-2 px-4 text-xs text-gray-500 text-center border-t border-gray-600">
            ✅ Solo datos REALES | Fuente: Firestore | Total: ${count} usuarios | ${new Date().toLocaleTimeString()}
          </td>
        `;
        tbody.appendChild(infoRow);
        
        // Actualizar contadores
        document.getElementById('total-users').textContent = count;
        document.getElementById('users-count').textContent = count;
        
        alert(`✅ ¡Datos de prueba eliminados!
        
🔥 Mostrando ${count} usuarios REALES desde Firestore
📊 Todos los datos ahora son 100% reales`);
        
      } else {
        throw new Error('No hay usuarios reales en Firestore');
      }
    } else {
      throw new Error('Base de datos no disponible');
    }
    
  } catch (error) {
    console.error('❌ Error mostrando solo reales:', error);
    alert(`❌ No se pudieron cargar datos reales: ${error.message}`);
  }
}

// Hacer funciones disponibles globalmente
window.verificarDatosReales = verificarDatosReales;
window.mostrarSoloReales = mostrarSoloReales;

console.log('🔍 Verificador de datos cargado. Usar: verificarDatosReales() o mostrarSoloReales()');