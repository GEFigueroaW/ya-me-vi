// test-sugeridas-fix.js
// Script de prueba para verificar que las funciones de sugeridas.html funcionan correctamente

console.log('🧪 Iniciando test de fixes para sugeridas.html...');

// Función de test principal
async function testSugeridasFunctionality() {
  const results = {
    modulesLoaded: false,
    functionsAvailable: {},
    dataLoading: null,
    predictions: {},
    errors: []
  };
  
  try {
    // 1. Verificar que los módulos se carguen
    console.log('📦 Verificando carga de módulos...');
    
    // Esperar a que se carguen los módulos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Verificar funciones críticas
    const criticalFunctions = [
      'generarPrediccionPersonalizada',
      'generarPrediccionesPorSorteo',
      'generarProyeccionesAnalisis',
      'cargarDatosHistoricos',
      'actualizarTituloSorteo'
    ];
    
    console.log('🔍 Verificando funciones disponibles...');
    for (const funcName of criticalFunctions) {
      const available = typeof window[funcName] === 'function';
      results.functionsAvailable[funcName] = available;
      console.log(`  ${funcName}: ${available ? '✅' : '❌'}`);
    }
    
    // 3. Test de carga de datos
    if (results.functionsAvailable.cargarDatosHistoricos) {
      console.log('📊 Probando carga de datos históricos...');
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );
        
        const datos = await Promise.race([
          window.cargarDatosHistoricos('todos'),
          timeoutPromise
        ]);
        
        if (datos && typeof datos === 'object') {
          const sorteos = ['melate', 'revancha', 'revanchita'];
          const sorteosDisponibles = sorteos.filter(s => datos[s] && datos[s].sorteos);
          results.dataLoading = {
            success: true,
            sorteos: sorteosDisponibles,
            totalSorteos: sorteosDisponibles.reduce((acc, s) => acc + (datos[s].sorteos ? datos[s].sorteos.length : 0), 0)
          };
          console.log(`✅ Datos cargados: ${sorteosDisponibles.length} sorteos, ${results.dataLoading.totalSorteos} concursos`);
          window.testDatosHistoricos = datos;
        } else {
          results.dataLoading = { success: false, error: 'Datos inválidos' };
          console.log('❌ Error: datos históricos inválidos');
        }
      } catch (error) {
        results.dataLoading = { success: false, error: error.message };
        console.log(`❌ Error cargando datos: ${error.message}`);
      }
    }
    
    // 4. Test de predicciones personalizadas
    if (results.functionsAvailable.generarPrediccionPersonalizada) {
      console.log('🤖 Probando generación de predicciones personalizadas...');
      
      const testUserId = 'test-user-fix-verification';
      const sorteos = ['melate', 'revancha', 'revanchita'];
      
      for (const sorteo of sorteos) {
        try {
          const dataSorteo = window.testDatosHistoricos && window.testDatosHistoricos[sorteo] 
            ? window.testDatosHistoricos[sorteo]
            : {
                sorteo: sorteo,
                numeros: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                sorteos: [{concurso: '4082', numeros: [1, 2, 3, 4, 5, 6]}]
              };
          
          const prediccion = await window.generarPrediccionPersonalizada(testUserId, dataSorteo);
          
          if (Array.isArray(prediccion) && prediccion.length === 6) {
            results.predictions[sorteo] = { success: true, numeros: prediccion };
            console.log(`  ✅ ${sorteo}: [${prediccion.join(', ')}]`);
          } else {
            results.predictions[sorteo] = { success: false, error: 'Resultado inválido' };
            console.log(`  ❌ ${sorteo}: resultado inválido`);
          }
        } catch (error) {
          results.predictions[sorteo] = { success: false, error: error.message };
          console.log(`  ❌ ${sorteo}: ${error.message}`);
        }
      }
    }
    
    // 5. Resumen final
    const functionsWorking = Object.values(results.functionsAvailable).filter(Boolean).length;
    const predictionsWorking = Object.values(results.predictions).filter(p => p.success).length;
    
    console.log('\n📋 RESUMEN DE RESULTADOS:');
    console.log(`  🔧 Funciones disponibles: ${functionsWorking}/${criticalFunctions.length}`);
    console.log(`  📊 Carga de datos: ${results.dataLoading?.success ? '✅' : '❌'}`);
    console.log(`  🎯 Predicciones funcionando: ${predictionsWorking}/3`);
    
    if (functionsWorking === criticalFunctions.length && 
        results.dataLoading?.success && 
        predictionsWorking === 3) {
      console.log('🎉 ¡TODOS LOS TESTS PASARON! El sistema está funcionando correctamente.');
      return true;
    } else {
      console.log('⚠️ Algunos componentes necesitan atención.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error durante los tests:', error);
    results.errors.push(error.message);
    return false;
  }
}

// Exportar para uso en la consola
window.testSugeridasFunctionality = testSugeridasFunctionality;

// Auto-ejecutar si estamos en modo debug
if (window.location.search.includes('debug') || window.location.search.includes('test')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(testSugeridasFunctionality, 3000);
  });
}

console.log('✅ Script de test cargado. Ejecuta testSugeridasFunctionality() en la consola para probar.');
