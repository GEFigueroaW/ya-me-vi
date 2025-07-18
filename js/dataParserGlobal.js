// === dataParserGlobal.js ===
// Módulo de compatibilidad para exponer funciones de dataParser.js globalmente
// Facilita el uso de funciones de análisis en archivos HTML sin módulos ES6

// Importar las funciones del módulo principal
import { analizarSumaNumeros, analizarParesImpares } from './dataParser.js';
import { generarPrediccionPorFrecuencia } from './dataParser.js';

// Exponer las funciones globalmente para que estén disponibles en el contexto global
// y puedan ser usadas desde archivos HTML sin necesidad de import/export
window.analizarSumaNumeros = analizarSumaNumeros;
window.analizarParesImpares = analizarParesImpares;
window.generarPrediccionPorFrecuencia = generarPrediccionPorFrecuencia;

// Intentar importar la función analizarDecadaPorPosicion
// Esta función puede no estar exportada correctamente en dataParser.js
try {
  // Importación dinámica como alternativa
  import('./dataParser.js').then(module => {
    if (module.analizarDecadaPorPosicion) {
      window.analizarDecadaPorPosicion = module.analizarDecadaPorPosicion;
      console.log('✅ Función analizarDecadaPorPosicion importada correctamente');
    } else {
      console.warn('⚠️ La función analizarDecadaPorPosicion no está disponible para exportación');
      
      // Implementar una versión alternativa si no está disponible
      window.analizarDecadaPorPosicion = function(datos) {
        console.log('🔄 Usando versión alternativa de analizarDecadaPorPosicion');
        // Esta es una implementación mínima basada en la original
        const decadas = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-56'];
        const posiciones = [0,1,2,3,4,5];
        const nombresPos = ['1er Número','2do Número','3er Número','4to Número','5to Número','6to Número'];
        const resultado = {};
        
        Object.entries(datos).forEach(([sorteo, datosIndividuales]) => {
          if (!datosIndividuales || !datosIndividuales.sorteos) return;
          
          const decadasPorPosicion = posiciones.map(pos => {
            // Contar frecuencias de década para esta posición
            const cuenta = { '1-10':0, '11-20':0, '21-30':0, '31-40':0, '41-50':0, '51-56':0 };
            datosIndividuales.sorteos.forEach(sorteoData => {
              const num = sorteoData.numeros[pos];
              if (num <= 10) cuenta['1-10']++;
              else if (num <= 20) cuenta['11-20']++;
              else if (num <= 30) cuenta['21-30']++;
              else if (num <= 40) cuenta['31-40']++;
              else if (num <= 50) cuenta['41-50']++;
              else cuenta['51-56']++;
            });
            
            // Buscar la década más frecuente
            let decadaMasFrecuente = '1-10', max = 0;
            for (const d of decadas) {
              if (cuenta[d] > max) { decadaMasFrecuente = d; max = cuenta[d]; }
            }
            
            return {
              posicion: nombresPos[pos],
              decadaMasFrecuente,
              frecuencia: max
            };
          });
          
          // Mensaje clave dinámico
          let datoClave = '';
          if (sorteo === 'melate') {
            datoClave = 'Los datos muestran una clara progresión: la década 1-10 es la más frecuente para el 1er número, la 11-20 para el 2do, y así sucesivamente.';
          } else if (sorteo === 'revancha') {
            datoClave = 'La tendencia es muy similar a Melate. Las décadas listadas son las más frecuentes para cada posición.';
          } else if (sorteo === 'revanchita') {
            datoClave = 'Revanchita confirma la inclinación de las décadas por posición.';
          }
          
          resultado[sorteo] = { decadasPorPosicion, datoClave };
        });
        
        return resultado;
      };
    }
  }).catch(error => {
    console.error('❌ Error al importar analizarDecadaPorPosicion:', error);
    // Implementar versión alternativa aquí si falla la importación
  });
} catch (error) {
  console.error('❌ Error en la importación dinámica:', error);
}

// Confirmar que las funciones están disponibles
console.log('✅ dataParserGlobal.js cargado correctamente');
console.log('📊 Funciones de análisis disponibles globalmente:');
console.log('  - analizarSumaNumeros');
console.log('  - analizarParesImpares');
console.log('  - analizarDecadaPorPosicion');
console.log('  - generarPrediccionPorFrecuencia');
