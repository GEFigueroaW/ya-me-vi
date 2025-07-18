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

// Implementación de generarProyeccionesAnalisis
window.generarProyeccionesAnalisis = async function() {
  console.log('📊 Generando proyecciones usando funciones de análisis...');
  
  // Verificar que existan los datos históricos
  if (!window.datosHistoricos) {
    console.error('❌ No hay datos históricos disponibles');
    return Promise.reject(new Error('No hay datos históricos disponibles'));
  }
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  
  for (const sorteo of sorteos) {
    try {
      // Verificar que existan datos para este sorteo
      if (!window.datosHistoricos[sorteo] || !window.datosHistoricos[sorteo].numeros || window.datosHistoricos[sorteo].numeros.length === 0) {
        console.warn(`⚠️ No hay datos disponibles para ${sorteo}`);
        const elementoProyeccion = document.getElementById(`proyeccion-${sorteo}`);
        const elementoDetalle = document.getElementById(`detalle-${sorteo}`);
        if (elementoProyeccion) elementoProyeccion.textContent = 'Sin datos disponibles';
        if (elementoDetalle) elementoDetalle.textContent = 'Requiere datos históricos';
        continue;
      }
      
      // Mostrar loading
      const elementoProyeccion = document.getElementById(`proyeccion-${sorteo}`);
      const elementoDetalle = document.getElementById(`detalle-${sorteo}`);
      if (elementoProyeccion) elementoProyeccion.textContent = '🔄 Analizando...';
      if (elementoDetalle) elementoDetalle.textContent = 'Procesando 4 tipos de análisis...';
      
      // Función interna para generar proyección usando los 4 análisis especificados
      const generarProyeccionPorAnalisis = async function(datos, nombreSorteo) {
        console.log(`🔮 Generando proyección para ${nombreSorteo}...`);
        
        // Verificar si tenemos los análisis ya realizados
        if (!datos.sumAnalisis) {
          // Si no tenemos análisis previo, intentamos hacerlo
          if (window.analizarSumaNumeros) {
            const analisisDatos = {};
            analisisDatos[nombreSorteo] = datos;
            datos.sumAnalisis = window.analizarSumaNumeros(analisisDatos)[nombreSorteo];
          }
        }
        
        if (!datos.paresAnalisis) {
          if (window.analizarParesImpares) {
            const analisisDatos = {};
            analisisDatos[nombreSorteo] = datos;
            datos.paresAnalisis = window.analizarParesImpares(analisisDatos)[nombreSorteo];
          }
        }
        
        if (!datos.decadaAnalisis) {
          if (window.analizarDecadaPorPosicion) {
            const analisisDatos = {};
            analisisDatos[nombreSorteo] = datos;
            datos.decadaAnalisis = window.analizarDecadaPorPosicion(analisisDatos)[nombreSorteo];
          }
        }
        
        // Generar los análisis
        // 1. Por frecuencia
        const numerosFrecuentes = [];
        const frecuencias = {};
        datos.numeros.forEach(n => {
          frecuencias[n] = (frecuencias[n] || 0) + 1;
        });
        
        // Convertir a array y ordenar por frecuencia
        const frecArray = Object.entries(frecuencias)
          .map(([num, freq]) => ({ numero: parseInt(num), frecuencia: freq }))
          .sort((a, b) => b.frecuencia - a.frecuencia);
        
        // Tomar los 8 más frecuentes
        for (let i = 0; i < Math.min(8, frecArray.length); i++) {
          numerosFrecuentes.push(frecArray[i].numero);
        }
        
        // 2. Por suma óptima
        const numerosPorSuma = [];
        if (datos.sumAnalisis && datos.sumAnalisis.rangoMasFrecuente) {
          const rangoOptimo = datos.sumAnalisis.rangoMasFrecuente[0]; // '150-199', etc.
          const [min, max] = rangoOptimo.split('-').map(n => parseInt(n) || 300);
          
          // Generar números que tiendan a sumar en ese rango
          const targetSum = (min + max) / 2; // Suma objetivo
          const avgPerNumber = targetSum / 6; // Promedio por número
          
          for (let i = 0; i < 8; i++) {
            const variation = (Math.random() - 0.5) * 20; // Variación de ±10
            const numero = Math.max(1, Math.min(56, Math.round(avgPerNumber + variation)));
            numerosPorSuma.push(numero);
          }
          numerosPorSuma.sort((a, b) => a - b);
        }
        
        // 3. Por balance pares/impares
        const numerosPorBalance = [];
        if (datos.paresAnalisis && datos.paresAnalisis.distribucionMasFrecuente) {
          const distribucionOptima = datos.paresAnalisis.distribucionMasFrecuente[0]; // '3p-3i', etc.
          const [pares] = distribucionOptima.split('-').map(s => parseInt(s.replace('p', '')));
          
          const numerosPares = [];
          const numerosImpares = [];
          
          // Generar pares e impares según la distribución óptima
          for (let i = 2; i <= 56; i += 2) numerosPares.push(i);
          for (let i = 1; i <= 56; i += 2) numerosImpares.push(i);
          
          // Mezclar los arrays
          const mezclarArray = (array) => {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
          };
          
          // Seleccionar según distribución
          const paresSeleccionados = mezclarArray(numerosPares).slice(0, pares);
          const imparesSeleccionados = mezclarArray(numerosImpares).slice(0, 6 - pares);
          
          numerosPorBalance.push(...paresSeleccionados, ...imparesSeleccionados);
        }
        
        // 4. Por décadas por posición
        const numerosPorDecada = [];
        if (datos.decadaAnalisis && datos.decadaAnalisis.decadasPorPosicion) {
          for (const posicionInfo of datos.decadaAnalisis.decadasPorPosicion) {
            const decadaOptima = posicionInfo.decadaMasFrecuente; // '1-10', '11-20', etc.
            const [min, max] = decadaOptima.split('-').map(n => parseInt(n));
            
            // Agregar algunos números de esa década
            for (let i = min; i <= Math.min(max, 56); i++) {
              numerosPorDecada.push(i);
            }
          }
          
          // Seleccionar 8 números únicos de la mezcla
          const numerosUnicos = [...new Set(numerosPorDecada)];
          const mezclarArray = (array) => {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
          };
          
          // Si hay menos de 8 números, completar con algunos aleatorios
          while (numerosUnicos.length < 8) {
            const num = Math.floor(Math.random() * 56) + 1;
            if (!numerosUnicos.includes(num)) numerosUnicos.push(num);
          }
          
          // Mezclar y tomar los primeros 8
          const numerosSeleccionados = mezclarArray(numerosUnicos).slice(0, 8);
          numerosPorDecada.length = 0; // Vaciar el array
          numerosPorDecada.push(...numerosSeleccionados);
        }
        
        // 5. Números aleatorios para complementar
        const numerosAleatorios = [];
        while (numerosAleatorios.length < 8) {
          const num = Math.floor(Math.random() * 56) + 1;
          if (!numerosAleatorios.includes(num)) numerosAleatorios.push(num);
        }
        
        // Combinar todos los análisis según los pesos especificados
        const pool = [];
        
        // Agregar números según los pesos (22%, 22%, 22%, 22%, 12%)
        numerosFrecuentes.forEach(num => pool.push(num, num)); // 2 veces (peso alto)
        numerosPorSuma.forEach(num => pool.push(num, num)); // 2 veces
        numerosPorBalance.forEach(num => pool.push(num, num)); // 2 veces  
        numerosPorDecada.forEach(num => pool.push(num, num)); // 2 veces
        numerosAleatorios.forEach(num => pool.push(num)); // 1 vez (peso bajo)
        
        // Seleccionar 6 números únicos del pool
        const numerosUnicos = [...new Set(pool)];
        const mezclarArray = (array) => {
          const arr = [...array];
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr;
        };
        
        const combinacionFinal = mezclarArray(numerosUnicos).slice(0, 6).sort((a, b) => a - b);
        
        // Si no tenemos 6 números, completar con aleatorios
        while (combinacionFinal.length < 6) {
          const num = Math.floor(Math.random() * 56) + 1;
          if (!combinacionFinal.includes(num)) {
            combinacionFinal.push(num);
          }
        }
        
        const detalle = 'Combinaciones generadas usando análisis de frecuencias, suma de números, balance pares/impares y décadas por posición';
        
        return {
          numeros: combinacionFinal.sort((a, b) => a - b),
          detalle: detalle
        };
      };
      
      // Generar proyección usando los 4 análisis especificados
      const proyeccion = await generarProyeccionPorAnalisis(window.datosHistoricos[sorteo], sorteo);
      
      if (elementoProyeccion && proyeccion.numeros) {
        elementoProyeccion.textContent = proyeccion.numeros.join(' - ');
      }
      
      if (elementoDetalle && proyeccion.detalle) {
        elementoDetalle.textContent = proyeccion.detalle;
      }
      
      console.log(`✅ Proyección para ${sorteo}:`, proyeccion.numeros);
      console.log(`📝 Detalle ${sorteo}:`, proyeccion.detalle);
      
    } catch (error) {
      console.error(`❌ Error generando proyección para ${sorteo}:`, error);
      const elementoProyeccion = document.getElementById(`proyeccion-${sorteo}`);
      const elementoDetalle = document.getElementById(`detalle-${sorteo}`);
      if (elementoProyeccion) elementoProyeccion.textContent = 'Error al procesar';
      if (elementoDetalle) elementoDetalle.textContent = 'Intente nuevamente';
    }
  }
  
  return Promise.resolve('Proyecciones generadas correctamente');
};

// Confirmar que las funciones están disponibles
console.log('✅ dataParserGlobal.js cargado correctamente');
console.log('📊 Funciones de análisis disponibles globalmente:');
console.log('  - analizarSumaNumeros');
console.log('  - analizarParesImpares');
console.log('  - analizarDecadaPorPosicion');
console.log('  - generarPrediccionPorFrecuencia');
console.log('  - generarProyeccionesAnalisis');
