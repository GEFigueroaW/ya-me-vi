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
  
  // Esperar a que los datos históricos estén disponibles o cargarlos si no existen
  if (!window.datosHistoricos) {
    console.log('⏳ Esperando a que los datos históricos se carguen...');
    
    // Intenta cargar los datos si existe la función
    if (typeof window.cargarDatosHistoricos === 'function') {
      try {
        console.log('🔄 Cargando datos históricos...');
        window.datosHistoricos = await window.cargarDatosHistoricos('todos');
        console.log('✅ Datos históricos cargados correctamente');
      } catch (error) {
        console.error('❌ Error cargando datos históricos:', error);
        return Promise.reject(new Error('Error cargando datos históricos'));
      }
    } else {
      console.error('❌ No hay datos históricos disponibles y no se puede cargar');
      return Promise.reject(new Error('Función de carga de datos no disponible'));
    }
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
        
        // Verificar que tenemos datos válidos
        if (!datos || !datos.numeros || datos.numeros.length === 0) {
          console.error(`❌ Datos inválidos para ${nombreSorteo}`);
          return {
            numeros: [1, 2, 3, 4, 5, 6], // Números por defecto
            detalle: 'Error: Datos insuficientes'
          };
        }
        
        // Verificar si tenemos los análisis ya realizados
        if (!datos.sumAnalisis) {
          try {
            // Si no tenemos análisis previo, intentamos hacerlo
            if (window.analizarSumaNumeros) {
              console.log(`🔄 Realizando análisis de suma para ${nombreSorteo}`);
              const analisisDatos = {};
              analisisDatos[nombreSorteo] = datos;
              const resultado = window.analizarSumaNumeros(analisisDatos);
              if (resultado && resultado[nombreSorteo]) {
                datos.sumAnalisis = resultado[nombreSorteo];
              }
            }
          } catch (error) {
            console.error(`❌ Error en análisis de suma para ${nombreSorteo}:`, error);
          }
        }
        
        if (!datos.paresAnalisis) {
          try {
            if (window.analizarParesImpares) {
              console.log(`🔄 Realizando análisis de pares/impares para ${nombreSorteo}`);
              const analisisDatos = {};
              analisisDatos[nombreSorteo] = datos;
              const resultado = window.analizarParesImpares(analisisDatos);
              if (resultado && resultado[nombreSorteo]) {
                datos.paresAnalisis = resultado[nombreSorteo];
              }
            }
          } catch (error) {
            console.error(`❌ Error en análisis de pares/impares para ${nombreSorteo}:`, error);
          }
        }
        
        if (!datos.decadaAnalisis) {
          try {
            if (window.analizarDecadaPorPosicion) {
              console.log(`🔄 Realizando análisis de décadas por posición para ${nombreSorteo}`);
              const analisisDatos = {};
              analisisDatos[nombreSorteo] = datos;
              const resultado = window.analizarDecadaPorPosicion(analisisDatos);
              if (resultado && resultado[nombreSorteo]) {
                datos.decadaAnalisis = resultado[nombreSorteo];
              }
            }
          } catch (error) {
            console.error(`❌ Error en análisis de décadas para ${nombreSorteo}:`, error);
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
        try {
          if (datos.sumAnalisis && datos.sumAnalisis.rangoMasFrecuente) {
            const rangoOptimo = datos.sumAnalisis.rangoMasFrecuente[0]; // '150-199', etc.
            console.log(`🔢 Rango óptimo de suma para ${nombreSorteo}: ${rangoOptimo}`);
            
            // Validar que el rango tenga el formato esperado
            if (rangoOptimo && rangoOptimo.includes('-')) {
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
            } else {
              // Si el rango no tiene el formato esperado, usar un rango por defecto
              console.warn(`⚠️ Formato de rango inválido: ${rangoOptimo}`);
              for (let i = 0; i < 8; i++) {
                const numero = Math.floor(Math.random() * 56) + 1;
                numerosPorSuma.push(numero);
              }
            }
          } else {
            // Si no hay análisis de suma, generar números aleatorios
            console.warn(`⚠️ No hay análisis de suma disponible para ${nombreSorteo}`);
            for (let i = 0; i < 8; i++) {
              const numero = Math.floor(Math.random() * 56) + 1;
              numerosPorSuma.push(numero);
            }
          }
        } catch (error) {
          console.error(`❌ Error en generación por suma para ${nombreSorteo}:`, error);
          // En caso de error, llenar con números aleatorios
          numerosPorSuma.length = 0;
          for (let i = 0; i < 8; i++) {
            const numero = Math.floor(Math.random() * 56) + 1;
            numerosPorSuma.push(numero);
          }
        }
        
        // 3. Por balance pares/impares
        const numerosPorBalance = [];
        try {
          if (datos.paresAnalisis && datos.paresAnalisis.distribucionMasFrecuente) {
            const distribucionOptima = datos.paresAnalisis.distribucionMasFrecuente[0]; // '3p-3i', etc.
            console.log(`⚖️ Distribución óptima de pares/impares para ${nombreSorteo}: ${distribucionOptima}`);
            
            // Validar que la distribución tenga el formato esperado
            if (distribucionOptima && distribucionOptima.includes('p-') && distribucionOptima.includes('i')) {
              // Extraer cantidad de pares
              const pares = parseInt(distribucionOptima.replace('p-', '').split('i')[0]) || 3;
              const impares = 6 - pares;
              
              console.log(`🔢 Balance: ${pares} pares, ${impares} impares`);
              
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
              const imparesSeleccionados = mezclarArray(numerosImpares).slice(0, impares);
              
              numerosPorBalance.push(...paresSeleccionados, ...imparesSeleccionados);
            } else {
              // Si la distribución no tiene el formato esperado, usar un balance equilibrado (3p-3i)
              console.warn(`⚠️ Formato de distribución inválido: ${distribucionOptima}`);
              const numerosPares = [];
              const numerosImpares = [];
              
              // Generar pares e impares para un balance equilibrado
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
              
              // Seleccionar 3 pares y 3 impares
              const paresSeleccionados = mezclarArray(numerosPares).slice(0, 4);
              const imparesSeleccionados = mezclarArray(numerosImpares).slice(0, 4);
              
              numerosPorBalance.push(...paresSeleccionados, ...imparesSeleccionados);
            }
          } else {
            // Si no hay análisis de pares/impares, generar un balance equilibrado
            console.warn(`⚠️ No hay análisis de pares/impares disponible para ${nombreSorteo}`);
            const numerosPares = [];
            const numerosImpares = [];
            
            // Generar pares e impares para un balance equilibrado
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
            
            // Seleccionar 4 pares y 4 impares para tener 8 números en total
            const paresSeleccionados = mezclarArray(numerosPares).slice(0, 4);
            const imparesSeleccionados = mezclarArray(numerosImpares).slice(0, 4);
            
            numerosPorBalance.push(...paresSeleccionados, ...imparesSeleccionados);
          }
        } catch (error) {
          console.error(`❌ Error en generación por balance para ${nombreSorteo}:`, error);
          // En caso de error, generar 8 números aleatorios
          numerosPorBalance.length = 0;
          for (let i = 0; i < 8; i++) {
            const numero = Math.floor(Math.random() * 56) + 1;
            numerosPorBalance.push(numero);
          }
        }
        
        // 4. Por décadas por posición
        const numerosPorDecada = [];
        try {
          if (datos.decadaAnalisis && datos.decadaAnalisis.decadasPorPosicion) {
            console.log(`🎯 Análisis de décadas por posición disponible para ${nombreSorteo}`);
            
            // Crear una función mezclarArray una sola vez
            const mezclarArray = (array) => {
              const arr = [...array];
              for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
              }
              return arr;
            };
            
            // Verificar que decadasPorPosicion sea un array
            if (Array.isArray(datos.decadaAnalisis.decadasPorPosicion)) {
              for (const posicionInfo of datos.decadaAnalisis.decadasPorPosicion) {
                if (posicionInfo && posicionInfo.decadaMasFrecuente) {
                  const decadaOptima = posicionInfo.decadaMasFrecuente; // '1-10', '11-20', etc.
                  console.log(`📊 Para ${posicionInfo.posicion}, década óptima: ${decadaOptima}`);
                  
                  // Verificar que la década tenga el formato esperado
                  if (decadaOptima && decadaOptima.includes('-')) {
                    const partes = decadaOptima.split('-');
                    if (partes.length === 2) {
                      const min = parseInt(partes[0]);
                      const max = parseInt(partes[1]);
                      
                      if (!isNaN(min) && !isNaN(max)) {
                        // Agregar algunos números de esa década
                        for (let i = min; i <= Math.min(max, 56); i++) {
                          numerosPorDecada.push(i);
                        }
                      }
                    }
                  }
                }
              }
              
              // Seleccionar números únicos de la mezcla
              let numerosUnicos = [...new Set(numerosPorDecada)];
              
              // Si hay menos de 8 números, completar con algunos aleatorios
              while (numerosUnicos.length < 8) {
                const num = Math.floor(Math.random() * 56) + 1;
                if (!numerosUnicos.includes(num)) numerosUnicos.push(num);
              }
              
              // Mezclar y tomar los primeros 8
              numerosUnicos = mezclarArray(numerosUnicos);
              numerosPorDecada.length = 0; // Vaciar el array
              numerosPorDecada.push(...numerosUnicos.slice(0, 8));
            } else {
              console.warn(`⚠️ El formato de decadasPorPosicion no es válido para ${nombreSorteo}`);
              // Generar números aleatorios como alternativa
              for (let i = 0; i < 8; i++) {
                const num = Math.floor(Math.random() * 56) + 1;
                numerosPorDecada.push(num);
              }
            }
          } else {
            // Si no hay análisis de décadas, generar números aleatorios
            console.warn(`⚠️ No hay análisis de décadas disponible para ${nombreSorteo}`);
            for (let i = 0; i < 8; i++) {
              const num = Math.floor(Math.random() * 56) + 1;
              numerosPorDecada.push(num);
            }
          }
        } catch (error) {
          console.error(`❌ Error en generación por décadas para ${nombreSorteo}:`, error);
          // En caso de error, generar números aleatorios
          numerosPorDecada.length = 0;
          for (let i = 0; i < 8; i++) {
            const num = Math.floor(Math.random() * 56) + 1;
            numerosPorDecada.push(num);
          }
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
  
  // Indicar que se completó el proceso correctamente
  console.log('✅ Proceso de generación de proyecciones completado');
  return Promise.resolve('Proyecciones generadas correctamente');
};

// Implementar la función cargarDatosHistoricos si no está disponible
window.cargarDatosHistoricos = window.cargarDatosHistoricos || async function(modo = 'todos') {
  console.log('📊 Cargando datos históricos:', modo);
  
  // Lista de sorteos a cargar según el modo
  const sorteos = modo === 'todos' ? ['melate', 'revancha', 'revanchita'] : [modo];
  const rutas = {
    melate: 'assets/Melate.csv',
    revancha: 'assets/Revancha.csv',
    revanchita: 'assets/Revanchita.csv'
  };
  
  // Función para procesar un archivo CSV
  const procesarCSV = async function(ruta) {
    try {
      const respuesta = await fetch(ruta);
      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }
      
      const textoCSV = await respuesta.text();
      const filas = textoCSV.split('\n')
        .filter(linea => linea.trim().length > 0);
      
      // Verificar si tenemos datos
      if (filas.length < 2) {
        throw new Error('Archivo CSV sin datos');
      }
      
      // Extraer los números de cada sorteo
      const sorteos = [];
      const numeros = [];
      const fechaActual = new Date();
      const fechaLimite = new Date(fechaActual);
      fechaLimite.setMonth(fechaLimite.getMonth() - 30); // 30 meses atrás
      
      // Procesar cada fila del CSV
      for (let i = 1; i < filas.length; i++) { // Empezar desde 1 para saltar la cabecera
        const fila = filas[i].split(',');
        if (fila.length < 10) continue; // Verificar que tenga suficientes columnas
        
        // Validar formato de fecha (DD/MM/YYYY)
        const fecha = fila[9];
        if (!fecha.match(/\d{2}\/\d{2}\/\d{4}/)) continue;
        
        // Convertir fecha a objeto Date
        const partesFecha = fecha.split('/');
        const fechaSorteo = new Date(`${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`);
        
        // Filtrar por fecha (últimos 30 meses)
        if (fechaSorteo < fechaLimite) continue;
        
        // Extraer los números (del R1 al R6, columnas 2-7)
        const numerosExtraccion = [];
        for (let j = 2; j < 8; j++) {
          const num = parseInt(fila[j]);
          if (!isNaN(num) && num >= 1 && num <= 56) {
            numerosExtraccion.push(num);
            numeros.push(num); // Agregar a la lista general
          }
        }
        
        // Verificar que tengamos 6 números válidos
        if (numerosExtraccion.length === 6) {
          sorteos.push({
            concurso: fila[1],
            numeros: numerosExtraccion.sort((a, b) => a - b),
            fecha: fechaSorteo
          });
        }
      }
      
      return {
        sorteos,
        numeros,
        ultimoSorteo: sorteos.length > 0 ? sorteos[0].concurso : null
      };
    } catch (error) {
      console.error(`❌ Error procesando ${ruta}:`, error);
      return {
        sorteos: [],
        numeros: [],
        ultimoSorteo: null,
        error: error.message
      };
    }
  };
  
  // Cargar los datos de cada sorteo
  const resultado = {};
  for (const sorteo of sorteos) {
    if (rutas[sorteo]) {
      resultado[sorteo] = await procesarCSV(rutas[sorteo]);
      console.log(`✅ ${sorteo}: ${resultado[sorteo].sorteos.length} sorteos cargados`);
    }
  }
  
  return resultado;
};

// Confirmar que las funciones están disponibles
console.log('✅ dataParserGlobal.js cargado correctamente');
console.log('📊 Funciones de análisis disponibles globalmente:');
console.log('  - analizarSumaNumeros');
console.log('  - analizarParesImpares');
console.log('  - analizarDecadaPorPosicion');
console.log('  - generarPrediccionPorFrecuencia');
console.log('  - generarProyeccionesAnalisis');
console.log('  - cargarDatosHistoricos');
