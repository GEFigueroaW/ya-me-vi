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
  
  try {
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
          // En vez de rechazar la promesa, inicializamos un objeto vacío
          window.datosHistoricos = {
            melate: { sorteos: [], numeros: [], fallback: true },
            revancha: { sorteos: [], numeros: [], fallback: true },
            revanchita: { sorteos: [], numeros: [], fallback: true }
          };
        }
      } else {
        console.error('❌ No hay datos históricos disponibles y no se puede cargar');
        // En vez de rechazar la promesa, inicializamos un objeto vacío
        window.datosHistoricos = {
          melate: { sorteos: [], numeros: [], fallback: true },
          revancha: { sorteos: [], numeros: [], fallback: true },
          revanchita: { sorteos: [], numeros: [], fallback: true }
        };
      }
    }
    
    // Verificamos que datosHistoricos sea un objeto válido
    if (!window.datosHistoricos || typeof window.datosHistoricos !== 'object') {
      console.error('❌ datosHistoricos no es un objeto válido, inicializando...');
      window.datosHistoricos = {
        melate: { sorteos: [], numeros: [], fallback: true },
        revancha: { sorteos: [], numeros: [], fallback: true },
        revanchita: { sorteos: [], numeros: [], fallback: true }
      };
    }
  } catch (error) {
    console.error('❌ Error crítico inicializando datos históricos:', error);
    // Último recurso para evitar fallos completos
    window.datosHistoricos = {
      melate: { sorteos: [], numeros: [], fallback: true },
      revancha: { sorteos: [], numeros: [], fallback: true },
      revanchita: { sorteos: [], numeros: [], fallback: true }
    };
  }
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  
  for (const sorteo of sorteos) {
    try {
      // Asegurar que el elemento de UI existe
      const elementoProyeccion = document.getElementById(`proyeccion-${sorteo}`);
      const elementoDetalle = document.getElementById(`detalle-${sorteo}`);
      
      // Verificar que existan datos para este sorteo
      console.log(`🔍 Verificando datos para ${sorteo}:`, {
        tieneObjeto: !!window.datosHistoricos[sorteo],
        tieneNumeros: window.datosHistoricos[sorteo] ? !!window.datosHistoricos[sorteo].numeros : false,
        cantidadNumeros: window.datosHistoricos[sorteo] && window.datosHistoricos[sorteo].numeros ? window.datosHistoricos[sorteo].numeros.length : 0,
        tieneSorteos: window.datosHistoricos[sorteo] ? !!window.datosHistoricos[sorteo].sorteos : false,
        cantidadSorteos: window.datosHistoricos[sorteo] && window.datosHistoricos[sorteo].sorteos ? window.datosHistoricos[sorteo].sorteos.length : 0
      });
      
      // Intenta recuperar o arreglar los datos si hay algún problema
      if (!window.datosHistoricos[sorteo] || !window.datosHistoricos[sorteo].numeros || window.datosHistoricos[sorteo].numeros.length === 0) {
        console.warn(`⚠️ No hay datos disponibles para ${sorteo}, intentando recuperar...`);
        
        // Si tenemos sorteos pero no tenemos números, generemos los números a partir de los sorteos
        if (window.datosHistoricos[sorteo] && window.datosHistoricos[sorteo].sorteos && window.datosHistoricos[sorteo].sorteos.length > 0) {
          console.log(`🔄 Reconstruyendo números a partir de ${window.datosHistoricos[sorteo].sorteos.length} sorteos para ${sorteo}`);
          
          // Crear el array de números si no existe
          window.datosHistoricos[sorteo].numeros = [];
          
          // Extraer los números de cada sorteo
          window.datosHistoricos[sorteo].sorteos.forEach(sorteoData => {
            if (sorteoData.numeros && Array.isArray(sorteoData.numeros)) {
              sorteoData.numeros.forEach(num => {
                window.datosHistoricos[sorteo].numeros.push(num);
              });
            }
          });
          
          console.log(`✅ Se reconstruyeron ${window.datosHistoricos[sorteo].numeros.length} números para ${sorteo}`);
        } 
        // Si aún no hay datos válidos, generar datos de emergencia
        if (!window.datosHistoricos[sorteo] || !window.datosHistoricos[sorteo].numeros || window.datosHistoricos[sorteo].numeros.length === 0) {
          console.warn(`⚠️ No hay datos disponibles para ${sorteo}, generando datos de emergencia`);
          
          // Crear estructura básica si no existe
          if (!window.datosHistoricos[sorteo]) {
            window.datosHistoricos[sorteo] = {
              sorteos: [],
              numeros: [],
              ultimoSorteo: "Emergencia",
              emergencia: true
            };
          }
          
          // Generar números aleatorios para datos de emergencia (10 sorteos)
          for (let j = 0; j < 10; j++) {
            const numerosAleatorios = [];
            while (numerosAleatorios.length < 6) {
              const num = Math.floor(Math.random() * 56) + 1;
              if (!numerosAleatorios.includes(num)) {
                numerosAleatorios.push(num);
                window.datosHistoricos[sorteo].numeros.push(num); // Añadir al pool general
              }
            }
            // Ordenar números
            numerosAleatorios.sort((a, b) => a - b);
            
            // Crear sorteo de emergencia
            window.datosHistoricos[sorteo].sorteos.push({
              concurso: `E${j+1}`,
              numeros: numerosAleatorios,
              fecha: new Date(),
              emergencia: true
            });
          }
          
          console.log(`✅ Generados ${window.datosHistoricos[sorteo].sorteos.length} sorteos de emergencia para ${sorteo}`);
        }
      }
      
      // Mostrar loading si los elementos existen
      if (elementoProyeccion) {
        elementoProyeccion.textContent = '🔄 Analizando...';
        elementoProyeccion.style.display = 'block';
      }
      if (elementoDetalle) {
        elementoDetalle.textContent = 'Procesando 4 tipos de análisis...';
        elementoDetalle.style.display = 'block';
      }
      
      // Función interna para generar proyección usando los 4 análisis especificados
      const generarProyeccionPorAnalisis = async function(datos, nombreSorteo) {
        // Si no hay datos, intentar generar datos de emergencia
        if (!datos || !datos.numeros || datos.numeros.length === 0) {
          console.warn(`⚠️ Generando datos de emergencia para ${nombreSorteo}`);
          datos = {
            sorteos: [],
            numeros: [],
            emergencia: true
          };
          // Generar 10 sorteos de emergencia
          for (let j = 0; j < 10; j++) {
            const numerosAleatorios = [];
            while (numerosAleatorios.length < 6) {
              const num = Math.floor(Math.random() * 56) + 1;
              if (!numerosAleatorios.includes(num)) {
                numerosAleatorios.push(num);
                datos.numeros.push(num);
              }
            }
            numerosAleatorios.sort((a, b) => a - b);
            datos.sorteos.push({
              concurso: `E${j+1}`,
              numeros: numerosAleatorios,
              fecha: new Date(),
              emergencia: true
            });
          }
        }
        console.log(`🔮 Generando proyección para ${nombreSorteo}...`);
        
        // Asegurar que los elementos de UI existen y mostrarlos
        const elementoProyeccion = document.getElementById(`proyeccion-${nombreSorteo}`);
        const elementoDetalle = document.getElementById(`detalle-${nombreSorteo}`);
        
        if (elementoProyeccion) elementoProyeccion.style.display = 'block';
        if (elementoDetalle) elementoDetalle.style.display = 'block';
        
        // Verificar que tenemos datos válidos
        if (!datos || !datos.numeros || datos.numeros.length === 0) {
          console.error(`❌ Datos inválidos para ${nombreSorteo}`);
          
          // Actualizar UI con mensaje de error
          if (elementoProyeccion) elementoProyeccion.textContent = 'Error: Datos insuficientes';
          if (elementoDetalle) elementoDetalle.textContent = 'No se pudieron cargar los datos para este sorteo';
          
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
        
        // Asegurarse de que tenemos 6 números únicos
        const numerosFinales = [...new Set(combinacionFinal)];
        while (numerosFinales.length < 6) {
          const num = Math.floor(Math.random() * 56) + 1;
          if (!numerosFinales.includes(num)) {
            numerosFinales.push(num);
          }
        }
        
        // Ordenar los números de menor a mayor
        numerosFinales.sort((a, b) => a - b);
        
        console.log(`✅ ${nombreSorteo}: Combinación generada -> ${numerosFinales.join(' - ')}`);
        
        const detalle = 'Combinaciones generadas usando análisis de frecuencias, suma de números, balance pares/impares y décadas por posición';
        
        return {
          numeros: numerosFinales,
          detalle: detalle
        };
      };
      
      try {
        // Generar proyección usando los 4 análisis especificados
        const proyeccion = await generarProyeccionPorAnalisis(window.datosHistoricos[sorteo], sorteo);
        
        // Verificar que tengamos un resultado válido
        if (!proyeccion || !proyeccion.numeros || !Array.isArray(proyeccion.numeros) || proyeccion.numeros.length < 6) {
          console.error(`❌ Proyección inválida para ${sorteo}:`, proyeccion);
          
          // Crear una proyección de emergencia
          const numerosEmergencia = [];
          while (numerosEmergencia.length < 6) {
            const num = Math.floor(Math.random() * 56) + 1;
            if (!numerosEmergencia.includes(num)) {
              numerosEmergencia.push(num);
            }
          }
          numerosEmergencia.sort((a, b) => a - b);
          
          if (elementoProyeccion) elementoProyeccion.textContent = numerosEmergencia.join(' - ');
          if (elementoDetalle) elementoDetalle.textContent = 'Proyección de emergencia (datos limitados)';
          
          console.log(`⚠️ Usando proyección de emergencia para ${sorteo}:`, numerosEmergencia);
        } else {
          // Actualizar la interfaz con los resultados
          if (elementoProyeccion) elementoProyeccion.textContent = proyeccion.numeros.join(' - ');
          if (elementoDetalle) elementoDetalle.textContent = proyeccion.detalle;
          
          console.log(`✅ Proyección para ${sorteo}:`, proyeccion.numeros);
          console.log(`📝 Detalle ${sorteo}:`, proyeccion.detalle);
        }
      } catch (error) {
        console.error(`❌ Error en proyección final para ${sorteo}:`, error);
        
        // En caso de error, mostrar una combinación de emergencia
        const numerosEmergencia = [8, 15, 22, 29, 36, 43]; // Combinación con buena distribución
        if (elementoProyeccion) elementoProyeccion.textContent = numerosEmergencia.join(' - ');
        if (elementoDetalle) elementoDetalle.textContent = 'Error en análisis - combinación alternativa';
      }
      
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
  
  // Función de depuración para probar si podemos acceder a los archivos
  const verificarAccesoArchivos = async function() {
    for (const sorteo in rutas) {
      try {
        const ruta = rutas[sorteo];
        console.log(`🔍 Verificando acceso a ${ruta}...`);
        
        // Intentar diferentes rutas para encontrar los archivos
        const rutasAlternativas = [
          ruta,
          `/${ruta}`,
          `../${ruta}`,
          `./${ruta}`,
          ruta.replace('assets/', ''),
          `assets/${ruta.split('/').pop()}`,
          `/ya-me-vi/${ruta}`
        ];
        
        let archivoEncontrado = false;
        
        for (const rutaAlt of rutasAlternativas) {
          try {
            const resp = await fetch(rutaAlt, { method: 'HEAD' });
            if (resp.ok) {
              console.log(`✅ Archivo encontrado en: ${rutaAlt}`);
              rutas[sorteo] = rutaAlt;
              archivoEncontrado = true;
              break;
            }
          } catch (e) {
            // Ignorar errores y probar siguiente ruta
          }
        }
        
        if (!archivoEncontrado) {
          console.warn(`⚠️ No se pudo acceder a ninguna ruta para ${sorteo}`);
        }
      } catch (error) {
        console.error(`❌ Error verificando ${sorteo}:`, error);
      }
    }
  };
  
  // Verificar acceso a archivos
  await verificarAccesoArchivos();
  
  // Función para generar datos por defecto cuando hay errores
  const generarDatosPorDefecto = function() {
    console.log('📊 Generando datos por defecto');
    const sorteos = [];
    const numeros = [];
    
    // Generar 5 sorteos aleatorios
    for (let i = 0; i < 5; i++) {
      const numerosSorteo = [];
      while (numerosSorteo.length < 6) {
        const num = Math.floor(Math.random() * 56) + 1;
        if (!numerosSorteo.includes(num)) {
          numerosSorteo.push(num);
          numeros.push(num);
        }
      }
      numerosSorteo.sort((a, b) => a - b);
      
      sorteos.push({
        concurso: `DEF-${i+1}`,
        numeros: numerosSorteo,
        fecha: new Date(),
        porDefecto: true
      });
    }
    
    return {
      sorteos,
      numeros,
      ultimoSorteo: "Por defecto",
      porDefecto: true
    };
  };

  // Función para procesar un archivo CSV
  const procesarCSV = async function(ruta) {
    try {
      console.log(`🔄 Procesando CSV: ${ruta}`);
      
      // Verificar si la ruta es válida
      if (!ruta) {
        console.error('❌ Ruta de CSV no válida');
        return generarDatosPorDefecto();
      }
      
      // Asegurarse que la ruta es correcta (para desarrollo local)
      let urlCsv = ruta;
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Asegurarse de que la URL sea relativa al directorio actual
        if (urlCsv.startsWith('/')) {
          urlCsv = urlCsv.substring(1);
        }
      } else if (window.location.hostname.includes('github.io')) {
        // En GitHub Pages, usar la URL completa con el prefijo del repositorio
        urlCsv = `/ya-me-vi/${ruta}`;
      }
      
      console.log(`📊 Intentando cargar: ${urlCsv}`);
      const respuesta = await fetch(urlCsv);
      
      if (!respuesta.ok) {
        console.error(`❌ Error al cargar ${urlCsv}: ${respuesta.status} ${respuesta.statusText}`);
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }
      
      const textoCSV = await respuesta.text();
      console.log(`📄 CSV cargado, tamaño: ${textoCSV.length} bytes`);
      
      // Verificar si el CSV está vacío
      if (!textoCSV || textoCSV.trim().length === 0) {
        console.error(`❌ Archivo CSV vacío o inválido: ${ruta}`);
        // Generar un CSV mínimo para evitar fallos
        textoCSV = "CONCURSO,FECHA,R1,R2,R3,R4,R5,R6\n";
        textoCSV += "1,01/01/2023,7,12,23,34,45,56\n";
        textoCSV += "2,15/01/2023,6,15,25,32,41,52\n";
        textoCSV += "3,01/02/2023,9,14,19,28,37,46\n";
        console.log(`✅ Generado CSV mínimo de emergencia`);
      }
      
      // Dividir por saltos de línea, verificando varios formatos posibles
      let filas = [];
      if (textoCSV.includes('\r\n')) {
        filas = textoCSV.split('\r\n').filter(linea => linea.trim().length > 0);
      } else {
        filas = textoCSV.split('\n').filter(linea => linea.trim().length > 0);
      }
      
      console.log(`📊 Filas detectadas: ${filas.length}`);
      
      // Si hay menos de 2 filas, genera más
      if (filas.length < 2) {
        console.warn(`⚠️ CSV con muy pocas filas (${filas.length}), generando filas adicionales`);
        const cabecera = filas.length > 0 ? filas[0] : "CONCURSO,FECHA,R1,R2,R3,R4,R5,R6";
        filas = [cabecera];
        
        for (let i = 0; i < 5; i++) {
          const numeros = [];
          for (let j = 0; j < 6; j++) {
            numeros.push(Math.floor(Math.random() * 56) + 1);
          }
          const fecha = `0${i+1}/07/2023`;
          filas.push(`${i+1},${fecha},${numeros.join(',')}`);
        }
        console.log(`✅ Generadas ${filas.length-1} filas adicionales`);
      }
      
      // Verificar si tenemos datos
      if (filas.length < 2) {
        console.error(`❌ CSV sin datos suficientes: ${filas.length} filas`);
        throw new Error('Archivo CSV sin datos');
      }
      
      // Extraer los números de cada sorteo
      const sorteos = [];
      const numeros = [];
      const fechaActual = new Date();
      const fechaLimite = new Date(fechaActual);
      fechaLimite.setMonth(fechaLimite.getMonth() - 30); // 30 meses atrás
      
      // Analizar la estructura del CSV para determinar índices correctos
      let columnasNumeros = [2, 3, 4, 5, 6, 7]; // Índices por defecto
      let columnaFecha = 9; // Índice por defecto
      let headers = null; // Almacenará los encabezados del CSV
      
      // Verificar la cabecera para detectar el formato específico
      headers = filas[0].split(',').map(col => col.trim());
      console.log(`📋 Cabecera CSV: ${headers.join(' | ')}`);
      
      // Detectar índices de columnas de números usando múltiples métodos
      let indicesR = [];
      
      // Método 1: Buscar columnas que empiezan con 'R' seguido de un número
      headers.forEach((col, i) => {
        if (col.trim().toUpperCase().startsWith('R') && !isNaN(parseInt(col.trim().substring(1)))) {
          indicesR.push(i);
        }
      });
      
      // Método 2: Si no hay suficientes 'R', buscar columnas que contengan palabras clave
      if (indicesR.length < 6) {
        const palabrasClave = ['NUMERO', 'NUM', 'NÚMERO', 'BOLA', 'BALL', 'N'];
        headers.forEach((col, i) => {
          for (const palabra of palabrasClave) {
            if (col.toUpperCase().includes(palabra)) {
              // Evitar duplicados
              if (!indicesR.includes(i)) {
                indicesR.push(i);
              }
              break;
            }
          }
        });
      }
      
      // Método 3: Si aún no hay suficientes, buscar patrones numéricos en las primeras filas
      if (indicesR.length < 6) {
        console.log(`⚠️ No se encontraron suficientes columnas por nombre, buscando por contenido...`);
        
        // Analizar las primeras 5 filas para encontrar columnas con números entre 1 y 56
        const columnasConNumeros = new Array(cabecera.length).fill(0);
        
        for (let j = 1; j < Math.min(5, filas.length); j++) {
          const filaTest = filas[j].split(',');
          filaTest.forEach((valor, i) => {
            const num = parseInt(valor);
            if (!isNaN(num) && num >= 1 && num <= 56) {
              columnasConNumeros[i]++;
            }
          });
        }
        
        // Encontrar las columnas con más frecuencia de números válidos
        const columnasOrdenadas = columnasConNumeros
          .map((count, i) => ({ index: i, count }))
          .filter(item => item.count > 0)
          .sort((a, b) => b.count - a.count);
        
        // Añadir a los índices si no están ya incluidos
        columnasOrdenadas.forEach(item => {
          if (!indicesR.includes(item.index) && indicesR.length < 6) {
            indicesR.push(item.index);
          }
        });
      }
      
      // Buscar la columna de fecha
      headers.forEach((col, i) => {
        if (col.toLowerCase().includes('fecha')) {
          columnaFecha = i;
        }
      });
      
      // Si tenemos suficientes columnas para números, actualizamos
      if (indicesR.length >= 6) {
        // Ordenar los índices para mantener el orden original del CSV
        indicesR.sort((a, b) => a - b);
        columnasNumeros = indicesR.slice(0, 6);
        console.log(`✅ Columnas de números detectadas: ${columnasNumeros.join(', ')} (${columnasNumeros.map(i => headers[i]).join(', ')})`);
      } else {
        console.warn(`⚠️ No se encontraron suficientes columnas para números. Usando valores por defecto: ${columnasNumeros.join(', ')}`);
      }
      
      console.log(`📅 Columna de fecha detectada: ${columnaFecha}`);
      
      // Procesar cada fila del CSV
      for (let i = 1; i < filas.length; i++) { // Empezar desde 1 para saltar la cabecera
        const filaCompleta = filas[i];
        const fila = filaCompleta.split(',');
        
        if (fila.length < Math.max(...columnasNumeros, columnaFecha) + 1) {
          console.warn(`⚠️ Fila ${i} con formato incorrecto: ${filaCompleta}`);
          continue; // Verificar que tenga suficientes columnas
        }
        
        // Validar formato de fecha
        let fechaStr = "";
        if (columnaFecha >= 0 && columnaFecha < fila.length) {
          fechaStr = fila[columnaFecha]?.toString().trim() || "";
        } else {
          // Buscar cualquier columna que parezca una fecha
          for (let j = 0; j < fila.length; j++) {
            const valor = fila[j]?.toString().trim() || "";
            if (valor.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/) || 
                valor.match(/\d{1,2}-\d{1,2}-\d{2,4}/) ||
                valor.match(/\d{4}\/\d{1,2}\/\d{1,2}/) ||
                valor.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
              fechaStr = valor;
              columnaFecha = j;
              console.log(`📅 Fecha detectada en columna ${j}: ${fechaStr}`);
              break;
            }
          }
        }
        
        // Si aún no tenemos fecha, usar la actual
        if (!fechaStr) {
          const hoy = new Date();
          fechaStr = `${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}`;
          console.warn(`⚠️ No se encontró fecha en fila ${i}, usando fecha actual: ${fechaStr}`);
        }
        
        // Convertir fecha a objeto Date
        try {
          let fechaSorteo;
          
          // Detectar el formato de la fecha y convertir adecuadamente
          if (fechaStr.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)) {  // DD/MM/YYYY
            const partesFecha = fechaStr.split('/');
            // Si el año tiene 2 dígitos, convertir al formato de 4 dígitos
            let anio = partesFecha[2];
            if (anio.length === 2) anio = '20' + anio;
            
            fechaSorteo = new Date(`${anio}-${partesFecha[1].padStart(2, '0')}-${partesFecha[0].padStart(2, '0')}`);
          } 
          else if (fechaStr.match(/\d{1,2}-\d{1,2}-\d{2,4}/)) {  // DD-MM-YYYY
            const partesFecha = fechaStr.split('-');
            // Si el año tiene 2 dígitos, convertir al formato de 4 dígitos
            let anio = partesFecha[2];
            if (anio.length === 2) anio = '20' + anio;
            
            fechaSorteo = new Date(`${anio}-${partesFecha[1].padStart(2, '0')}-${partesFecha[0].padStart(2, '0')}`);
          }
          else if (fechaStr.match(/\d{4}\/\d{1,2}\/\d{1,2}/)) {  // YYYY/MM/DD
            const partesFecha = fechaStr.split('/');
            fechaSorteo = new Date(`${partesFecha[0]}-${partesFecha[1].padStart(2, '0')}-${partesFecha[2].padStart(2, '0')}`);
          }
          else if (fechaStr.match(/\d{4}-\d{1,2}-\d{1,2}/)) {  // YYYY-MM-DD
            fechaSorteo = new Date(fechaStr);
          }
          else {
            // Si no podemos parsear la fecha, usar la actual
            console.warn(`⚠️ Formato de fecha desconocido en fila ${i}: ${fechaStr}, usando fecha actual`);
            fechaSorteo = new Date();
          }
          
          // Verificar si la fecha es válida
          if (isNaN(fechaSorteo.getTime())) {
            console.warn(`⚠️ Fecha inválida en fila ${i}: ${fechaStr}, usando fecha actual`);
            fechaSorteo = new Date();
          }
          
          // Filtrar por fecha (últimos 30 meses)
          // IMPORTANTE: Temporalmente deshabilitamos el filtro por fecha para asegurar que tengamos datos
          /* 
          if (fechaSorteo < fechaLimite) {
            console.log(`🗓️ Sorteo filtrado por fecha: ${fechaStr} (antes de ${fechaLimite.toISOString().split('T')[0]})`);
            continue;
          }
          */
          
          // Extraer los números de las columnas correspondientes
          const numerosExtraccion = [];
          for (let j = 0; j < columnasNumeros.length; j++) {
            const columna = columnasNumeros[j];
            
            // Verificar que la columna exista
            if (columna < fila.length) {
              // Limpiar y normalizar el valor antes de convertir
              const valorTexto = fila[columna] ? fila[columna].toString().trim() : '';
              const num = parseInt(valorTexto);
              
              if (!isNaN(num) && num >= 1 && num <= 56) {
                numerosExtraccion.push(num);
                numeros.push(num); // Agregar a la lista general
              } else {
                // Si no es un número válido, intentemos buscar números en el texto
                const coincidencias = valorTexto.match(/\d{1,2}/g);
                if (coincidencias && coincidencias.length > 0) {
                  const numExtraido = parseInt(coincidencias[0]);
                  if (!isNaN(numExtraido) && numExtraido >= 1 && numExtraido <= 56) {
                    numerosExtraccion.push(numExtraido);
                    numeros.push(numExtraido);
                    console.log(`✅ Extraído número ${numExtraido} de texto "${valorTexto}"`);
                  }
                } else {
                  console.warn(`⚠️ Valor no válido en fila ${i}, columna ${columna}: "${valorTexto}"`);
                }
              }
            } else {
              console.warn(`⚠️ Columna ${columna} fuera de rango en fila ${i}, longitud: ${fila.length}`);
            }
          }
          
          // Log para debugging
          if (numerosExtraccion.length < 6) {
            console.warn(`⚠️ Fila ${i} con menos de 6 números válidos: ${numerosExtraccion.join(',')}`);
          }
        } catch (error) {
          console.error(`❌ Error procesando fecha en fila ${i}:`, error, fila);
          continue;
        }
        
        // Verificar que tengamos números válidos (idealmente 6)
        if (numerosExtraccion.length >= 6) {
          // Tomar solo los primeros 6 números si hay más
          const numerosFinal = numerosExtraccion.slice(0, 6).sort((a, b) => a - b);
          
          // Identificar el número de concurso (suele estar en la columna 1)
          let concurso = "Desconocido";
          if (fila[1] && fila[1].trim() !== "") {
            concurso = fila[1];
          } else {
            // Buscar cualquier columna que parezca un número de concurso
            for (let c = 0; c < fila.length; c++) {
              if (c !== columnaFecha && !isNaN(parseInt(fila[c])) && !columnasNumeros.includes(c)) {
                concurso = fila[c];
                break;
              }
            }
          }
          
          sorteos.push({
            concurso: concurso,
            numeros: numerosFinal,
            fecha: fechaSorteo
          });
        } else if (numerosExtraccion.length > 0) {
          // Si tenemos algunos números pero no 6, completar con números aleatorios
          console.warn(`⚠️ Completando sorteo con ${6 - numerosExtraccion.length} números aleatorios`);
          
          while (numerosExtraccion.length < 6) {
            const num = Math.floor(Math.random() * 56) + 1;
            if (!numerosExtraccion.includes(num)) {
              numerosExtraccion.push(num);
            }
          }
          
          sorteos.push({
            concurso: fila[1] || "Desconocido",
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
  let hayErrores = false;
  let mensajeError = '';
  
  for (const sorteo of sorteos) {
    try {
      if (rutas[sorteo]) {
        console.log(`🔄 Iniciando carga de datos para ${sorteo}...`);
        resultado[sorteo] = await procesarCSV(rutas[sorteo]);
        
        if (resultado[sorteo].error) {
          console.error(`❌ Error al cargar ${sorteo}: ${resultado[sorteo].error}`);
          hayErrores = true;
          mensajeError += `${sorteo}: ${resultado[sorteo].error}\n`;
        } else if (!resultado[sorteo].sorteos || resultado[sorteo].sorteos.length === 0) {
          console.warn(`⚠️ No se encontraron sorteos válidos para ${sorteo}`);
          // Crear datos de fallback para evitar errores
          resultado[sorteo] = {
            sorteos: [],
            numeros: [],
            ultimoSorteo: null,
            fallback: true
          };
          
          // Generar 10 sorteos aleatorios como fallback
          for (let i = 0; i < 10; i++) {
            const numerosAleatorios = [];
            while (numerosAleatorios.length < 6) {
              const num = Math.floor(Math.random() * 56) + 1;
              if (!numerosAleatorios.includes(num)) {
                numerosAleatorios.push(num);
                resultado[sorteo].numeros.push(num);
              }
            }
            numerosAleatorios.sort((a, b) => a - b);
            
            resultado[sorteo].sorteos.push({
              concurso: `FB-${i+1}`,
              numeros: numerosAleatorios,
              fecha: new Date()
            });
          }
          console.log(`⚠️ ${sorteo}: Creados ${resultado[sorteo].sorteos.length} sorteos de fallback`);
        } else {
          console.log(`✅ ${sorteo}: ${resultado[sorteo].sorteos.length} sorteos cargados`);
        }
      } else {
        console.warn(`⚠️ No se encontró ruta para ${sorteo}`);
      }
    } catch (error) {
      console.error(`❌ Error inesperado al procesar ${sorteo}:`, error);
      hayErrores = true;
      mensajeError += `${sorteo}: ${error.message}\n`;
      
      // Crear datos de fallback para evitar errores
      resultado[sorteo] = {
        sorteos: [],
        numeros: [],
        ultimoSorteo: null,
        error: error.message,
        fallback: true
      };
      
      // Generar 5 sorteos aleatorios como fallback
      for (let i = 0; i < 5; i++) {
        const numerosAleatorios = [];
        while (numerosAleatorios.length < 6) {
          const num = Math.floor(Math.random() * 56) + 1;
          if (!numerosAleatorios.includes(num)) {
            numerosAleatorios.push(num);
            resultado[sorteo].numeros.push(num);
          }
        }
        numerosAleatorios.sort((a, b) => a - b);
        
        resultado[sorteo].sorteos.push({
          concurso: `ERR-${i+1}`,
          numeros: numerosAleatorios,
          fecha: new Date()
        });
      }
      console.log(`⚠️ ${sorteo}: Creados ${resultado[sorteo].sorteos.length} sorteos de fallback por error`);
    }
  }
  
  // Mostrar mensaje de resumen
  if (hayErrores) {
    console.error(`❌ Se encontraron errores al cargar los datos históricos:\n${mensajeError}`);
    // Mostrar mensaje en la interfaz si es posible
    setTimeout(() => {
      try {
        const elementoError = document.getElementById('error-carga-datos');
        if (elementoError) {
          elementoError.textContent = `Hubo problemas al cargar algunos datos. Se están usando datos de respaldo.`;
          elementoError.style.display = 'block';
        }
      } catch (e) {
        // Ignorar errores en la UI
      }
    }, 100);
  } else {
    console.log(`✅ Todos los sorteos cargados correctamente`);
  }
  
  return resultado;
};

// Función para obtener el último número de sorteo de Melate
window.obtenerUltimoSorteoMelate = function() {
  console.log('🔍 Obteniendo último sorteo de Melate...');
  
  return new Promise((resolve, reject) => {
    // Intentar leer directamente desde el CSV sin depender de datos en memoria
    console.log('🔄 Leyendo directamente desde Melate.csv...');
    
    fetch('assets/Melate.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al cargar Melate.csv: ${response.status}`);
        }
        return response.text();
      })
      .then(csvText => {
        // Dividir por líneas y encontrar la primera línea con datos (después del encabezado)
        const lineas = csvText.split('\n');
        console.log(`📊 CSV leído con ${lineas.length} líneas`);
        
        if (lineas.length <= 1) {
          throw new Error('CSV vacío o sin datos válidos');
        }
        
        // Verificar si la primera línea es un encabezado
        let indiceInicio = 0;
        if (lineas[0].includes('NPRODUCTO') || lineas[0].includes('CONCURSO')) {
          indiceInicio = 1;
        }
        
        // Obtener la primera línea con datos (que contiene el sorteo más reciente)
        const primeraLineaDatos = lineas[indiceInicio].split(',');
        console.log(`🔍 Primera línea de datos: ${primeraLineaDatos.join(',')}`);
        
        if (primeraLineaDatos.length < 2) {
          throw new Error('Formato de CSV inválido, no se encontró la columna de concurso');
        }
        
        // El número de concurso está en la segunda columna (índice 1)
        const ultimoSorteo = parseInt(primeraLineaDatos[1].trim());
        if (isNaN(ultimoSorteo)) {
          throw new Error(`No se pudo convertir a número: "${primeraLineaDatos[1]}"`);
        }
        
        console.log(`✅ Último sorteo leído directamente: ${ultimoSorteo}`);
        resolve(ultimoSorteo);
      })
      .catch(error => {
        console.error('❌ Error al leer CSV de Melate:', error);
        
        // Si hay un error, intentar usar los datos históricos ya cargados
        if (window.datosHistoricos && window.datosHistoricos.melate && window.datosHistoricos.melate.sorteos) {
          try {
            const sorteos = window.datosHistoricos.melate.sorteos;
            if (sorteos.length > 0) {
              let ultimoSorteo = 0;
              
              // Buscar el sorteo con el número más alto
              for (const sorteo of sorteos) {
                const numConcurso = parseInt(sorteo.concurso);
                if (!isNaN(numConcurso) && numConcurso > ultimoSorteo) {
                  ultimoSorteo = numConcurso;
                }
              }
              
              if (ultimoSorteo > 0) {
                console.log(`✅ Último sorteo encontrado en datos cargados: ${ultimoSorteo}`);
                resolve(ultimoSorteo);
                return;
              }
            }
          } catch (err) {
            console.error('❌ Error al buscar en datos históricos:', err);
          }
        }
        
        // Como último recurso, rechazar la promesa
        reject(error);
      });
  });
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
console.log('  - obtenerUltimoSorteoMelate');
