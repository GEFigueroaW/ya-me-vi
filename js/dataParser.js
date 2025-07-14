// dataParser.js - Módulo principal para cargar y procesar datos de sorteos
// Versión limpia y funcional - Julio 2025

export async function cargarDatosHistoricos(modo = 'todos') {
  console.log('🚀 Cargando datos históricos, modo:', modo);
  
  if (modo === 'todos') {
    return await cargarTodosSorteos();
  } else {
    return await cargarSorteoIndividual(modo);
  }
}

async function cargarTodosSorteos() {
  console.log('📊 Cargando todos los sorteos...');
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  const datos = {};
  
  for (const sorteo of sorteos) {
    try {
      const datosIndividuales = await cargarSorteoIndividual(sorteo);
      datos[sorteo] = datosIndividuales;
    } catch (error) {
      console.error(`❌ Error cargando ${sorteo}:`, error);
      datos[sorteo] = { sorteos: [], numeros: [], ultimoSorteo: 'No disponible' };
    }
  }
  
  return datos;
}

async function cargarSorteoIndividual(sorteo) {
  const archivos = {
    melate: 'assets/Melate.csv',
    revancha: 'assets/Revancha.csv',
    revanchita: 'assets/Revanchita.csv'
  };
  
  const archivo = archivos[sorteo];
  if (!archivo) {
    throw new Error(`Sorteo no válido: ${sorteo}`);
  }
  
  console.log(`📁 Cargando ${archivo}...`);
  
  try {
    const response = await fetch(archivo);
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lineas = csvText.trim().split('\n');
    
    if (lineas.length < 2) {
      throw new Error('Archivo CSV vacío o sin datos');
    }
    
    const sorteos = [];
    const numeros = [];
    let ultimoSorteo = 'No disponible';
    
    // Procesar cada línea (saltar encabezado)
    for (let i = 1; i < lineas.length; i++) {
      const linea = lineas[i].trim();
      if (!linea) continue;
      
      const columnas = linea.split(',');
      
      // Detectar formato automáticamente
      let numerosLinea = [];
      let concurso = '';
      
      if (columnas.length >= 11 && sorteo === 'melate') {
        // Formato: NPRODUCTO,CONCURSO,R1,R2,R3,R4,R5,R6,R7,BOLSA,FECHA
        concurso = columnas[1];
        for (let j = 2; j <= 7; j++) {
          const num = parseInt(columnas[j]);
          if (!isNaN(num) && num >= 1 && num <= 56) {
            numerosLinea.push(num);
          }
        }
      } else if (columnas.length >= 10 && (sorteo === 'revancha' || sorteo === 'revanchita')) {
        // Formato: NPRODUCTO,CONCURSO,R1/F1,R2/F2,R3/F3,R4/F4,R5/F5,R6/F6,BOLSA,FECHA
        concurso = columnas[1];
        for (let j = 2; j <= 7; j++) {
          const num = parseInt(columnas[j]);
          if (!isNaN(num) && num >= 1 && num <= 56) {
            numerosLinea.push(num);
          }
        }
      }
      
      if (numerosLinea.length === 6) {
        sorteos.push({
          concurso: concurso,
          numeros: numerosLinea,
          fecha: columnas[columnas.length - 1] || ''
        });
        numeros.push(...numerosLinea);
        
        if (i === 1) {
          ultimoSorteo = concurso;
        }
      }
    }
    
    console.log(`✅ ${sorteo}: ${sorteos.length} sorteos cargados`);
    
    return {
      sorteos: sorteos,
      numeros: numeros,
      ultimoSorteo: ultimoSorteo
    };
    
  } catch (error) {
    console.error(`❌ Error cargando ${sorteo}:`, error);
    throw error;
  }
}

export function graficarEstadisticas(datos) {
  console.log('📊 Generando estadísticas...');
  
  const container = document.getElementById('charts-container');
  if (!container) {
    console.error('❌ Contenedor charts-container no encontrado');
    return;
  }
  
  container.innerHTML = '';
  
  const statsContainer = document.createElement('div');
  statsContainer.className = 'space-y-8';
  
  Object.entries(datos).forEach(([sorteo, datosIndividuales]) => {
    if (!datosIndividuales || !datosIndividuales.numeros || datosIndividuales.numeros.length === 0) {
      console.warn(`⚠️ No hay datos para ${sorteo}`);
      return;
    }
    
    const frecuencias = calcularFrecuencias(datosIndividuales.numeros);
    const estadisticas = generarEstadisticas(frecuencias, sorteo);
    
    statsContainer.appendChild(estadisticas);
  });
  
  container.appendChild(statsContainer);
  
  const loadingDiv = document.querySelector('.animate-spin');
  if (loadingDiv && loadingDiv.parentElement) {
    loadingDiv.parentElement.style.display = 'none';
  }
}

function calcularFrecuencias(numeros) {
  const frecuencias = {};
  
  for (let i = 1; i <= 56; i++) {
    frecuencias[i] = 0;
  }
  
  numeros.forEach(num => {
    if (num >= 1 && num <= 56) {
      frecuencias[num]++;
    }
  });
  
  return frecuencias;
}

function generarEstadisticas(frecuencias, sorteo) {
  const sorteoContainer = document.createElement('div');
  sorteoContainer.className = 'bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm';
  
  const titulo = document.createElement('h3');
  titulo.className = 'text-2xl font-bold text-white mb-6 text-center';
  titulo.textContent = `${sorteo.toUpperCase()} - Análisis de Frecuencias`;
  
  const frecuenciasArray = Object.entries(frecuencias).map(([num, freq]) => ({
    numero: parseInt(num),
    frecuencia: freq
  }));
  
  frecuenciasArray.sort((a, b) => b.frecuencia - a.frecuencia);
  
  const topFrecuentes = frecuenciasArray.slice(0, 10);
  const menosFrecuentes = frecuenciasArray.slice(-10).reverse();
  
  const columnasContainer = document.createElement('div');
  columnasContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-8';
  
  const columnaIzquierda = document.createElement('div');
  columnaIzquierda.innerHTML = `
    <h4 class="text-lg font-semibold text-green-400 mb-4">🔥 Top 10 Más Frecuentes</h4>
    <div class="space-y-2">
      ${topFrecuentes.map((item, index) => `
        <div class="flex items-center justify-between bg-green-500 bg-opacity-20 rounded-lg p-3">
          <span class="text-white font-bold">#${index + 1}</span>
          <span class="text-white text-xl font-bold">${item.numero}</span>
          <span class="text-green-400 font-semibold">${item.frecuencia} veces</span>
        </div>
      `).join('')}
    </div>
  `;
  
  const columnaDerecha = document.createElement('div');
  columnaDerecha.innerHTML = `
    <h4 class="text-lg font-semibold text-blue-400 mb-4">❄️ Top 10 Menos Frecuentes</h4>
    <div class="space-y-2">
      ${menosFrecuentes.map((item, index) => `
        <div class="flex items-center justify-between bg-blue-500 bg-opacity-20 rounded-lg p-3">
          <span class="text-white font-bold">#${index + 1}</span>
          <span class="text-white text-xl font-bold">${item.numero}</span>
          <span class="text-blue-400 font-semibold">${item.frecuencia} veces</span>
        </div>
      `).join('')}
    </div>
  `;
  
  columnasContainer.appendChild(columnaIzquierda);
  columnasContainer.appendChild(columnaDerecha);
  
  sorteoContainer.appendChild(titulo);
  sorteoContainer.appendChild(columnasContainer);
  
  return sorteoContainer;
}

export function mostrarEstadisticasComparativas(datos) {
  console.log('� Mostrando estadísticas comparativas...');
  
  const container = document.getElementById('estadisticas-extra');
  if (!container) return;
  
  let totalSorteos = 0;
  let totalNumeros = 0;
  
  Object.values(datos).forEach(sorteo => {
    if (sorteo && sorteo.sorteos) {
      totalSorteos += sorteo.sorteos.length;
      totalNumeros += sorteo.numeros.length;
    }
  });
  
  container.innerHTML = `
    <div class="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
      <h3 class="text-xl font-bold text-white mb-4 text-center">📈 Resumen General</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div class="bg-purple-500 bg-opacity-20 rounded-lg p-4">
          <div class="text-2xl font-bold text-white">${totalSorteos}</div>
          <div class="text-purple-300">Sorteos Analizados</div>
        </div>
        <div class="bg-blue-500 bg-opacity-20 rounded-lg p-4">
          <div class="text-2xl font-bold text-white">${totalNumeros}</div>
          <div class="text-blue-300">Números Procesados</div>
        </div>
        <div class="bg-green-500 bg-opacity-20 rounded-lg p-4">
          <div class="text-2xl font-bold text-white">56</div>
          <div class="text-green-300">Números Posibles</div>
        </div>
      </div>
    </div>
  `;
}

export function generarCombinacionesAleatorias(cantidad = 1) {
  console.log(`🎲 Generando ${cantidad} combinaciones aleatorias...`);
  
  const combinaciones = [];
  
  for (let i = 0; i < cantidad; i++) {
    const combinacion = [];
    const numerosUsados = new Set();
    
    while (combinacion.length < 6) {
      const numero = Math.floor(Math.random() * 56) + 1;
      if (!numerosUsados.has(numero)) {
        numerosUsados.add(numero);
        combinacion.push(numero);
      }
    }
    
    combinacion.sort((a, b) => a - b);
    combinaciones.push(combinacion);
  }
  
  return combinaciones;
}

console.log('✅ dataParser.js cargado correctamente');

async function cargarSorteoIndividual(modo) {
  const urls = {
    melate: 'assets/Melate.csv',
    revancha: 'assets/Revancha.csv',
    revanchita: 'assets/Revanchita.csv'
  };

  const archivo = urls[modo];
  console.log('📁 Archivo a cargar:', archivo);
  
  let todosLosDatos = [];
  let todosLosNumeros = [];

  try {
    console.log(`📥 Cargando ${archivo}...`);
    const response = await fetch(archivo);
    if (!response.ok) {
      throw new Error(`Error al cargar ${archivo}: ${response.status} - ${response.statusText}`);
    }
    const texto = await response.text();
    console.log(`📄 Texto cargado de ${archivo}:`, texto.substring(0, 200) + '...');
    
    if (!texto.trim()) {
      throw new Error(`El archivo ${archivo} está vacío`);
    }
    
    const lineas = texto.trim().split('\n');
    const headers = lineas[0].split(',');
    console.log(`📄 ${archivo}: ${lineas.length - 1} líneas de datos, Headers:`, headers);

    const nombreSorteo = modo.charAt(0).toUpperCase() + modo.slice(1);
    
    // Calcular fecha límite - últimos 30 meses
    const fechaActual = new Date();
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaActual.getMonth() - 30);
    
    console.log(`📅 Filtrando datos desde: ${fechaLimite.toLocaleDateString()} hasta hoy`);
    
    let ultimoSorteo = 0;
    
    // Procesar cada línea según el formato específico del archivo
    lineas.slice(1).forEach((linea, index) => {
      if (!linea.trim()) return; // Saltar líneas vacías
      
      try {
        const cols = linea.split(',');
        let numeros = [];
        let concurso = 0;
        let fecha = '';
        
        // Validar que tengamos suficientes columnas
        if (cols.length < 8) {
          console.warn(`⚠️ Línea ${index + 1} tiene pocas columnas:`, cols.length);
          return;
        }
        
        if (modo === 'melate') {
          // Melate: NPRODUCTO,CONCURSO,R1,R2,R3,R4,R5,R6,R7,BOLSA,FECHA
          // Índices:    0       1      2  3  4  5  6  7  8     9     10
          concurso = parseInt(cols[1], 10);
          fecha = cols[10] ? cols[10].trim() : 'Sin fecha';
          
          numeros = [
            parseInt(cols[2], 10), // R1
            parseInt(cols[3], 10), // R2  
            parseInt(cols[4], 10), // R3
            parseInt(cols[5], 10), // R4
            parseInt(cols[6], 10), // R5
            parseInt(cols[7], 10)  // R6
          ];
          
          // Actualizar el último sorteo (el más reciente)
          if (index === 0) ultimoSorteo = concurso;
          
        } else if (modo === 'revancha') {
          // Revancha: NPRODUCTO,CONCURSO,R1,R2,R3,R4,R5,R6,BOLSA,FECHA
          // Índices:     0       1      2  3  4  5  6  7    8     9
          concurso = parseInt(cols[1], 10);
          fecha = cols[9] ? cols[9].trim() : 'Sin fecha';
          
          numeros = [
            parseInt(cols[2], 10), // R1
            parseInt(cols[3], 10), // R2  
            parseInt(cols[4], 10), // R3
            parseInt(cols[5], 10), // R4
            parseInt(cols[6], 10), // R5
            parseInt(cols[7], 10)  // R6
          ];
          
        } else if (modo === 'revanchita') {
          // Revanchita: NPRODUCTO,CONCURSO,F1,F2,F3,F4,F5,F6,BOLSA,FECHA
          // Índices:       0       1      2  3  4  5  6  7    8     9
          concurso = parseInt(cols[1], 10);
          fecha = cols[9] ? cols[9].trim() : 'Sin fecha';
          
          numeros = [
            parseInt(cols[2], 10), // F1
            parseInt(cols[3], 10), // F2  
            parseInt(cols[4], 10), // F3
            parseInt(cols[5], 10), // F4
            parseInt(cols[6], 10), // F5
            parseInt(cols[7], 10)  // F6
          ];
        }
        
        // Validar que tengamos exactamente 6 números válidos
        const numerosValidos = numeros.filter(num => !isNaN(num) && num >= 1 && num <= 56);
        
        if (numerosValidos.length === 6 && !isNaN(concurso) && concurso > 0) {
          todosLosDatos.push({
            fecha: fecha,
            numeroSorteo: concurso,
            sorteo: nombreSorteo,
            numeros: numerosValidos
          });
          todosLosNumeros.push(...numerosValidos);
          console.log(`✅ ${modo} - Sorteo ${concurso} agregado (${fecha}):`, numerosValidos);
        } else {
          console.warn(`⚠️ Datos inválidos en línea ${index + 1}:`, { concurso, numerosValidos });
        }
        
      } catch (error) {
        console.error(`❌ Error procesando línea ${index + 1}:`, error.message);
      }
    });
    
    // Eliminar filtro de fechas por ahora para obtener todos los datos
    console.log(`📊 ${modo}: ${todosLosDatos.length} sorteos procesados exitosamente`);
    
  } catch (error) {
    console.error(`❌ Error cargando ${archivo}:`, error);
    
    // NO generar datos de prueba automáticamente - mejor mostrar el error real
    console.log('⚠️ No se generarán datos de prueba automáticamente');
  }

  if (todosLosDatos.length === 0) {
    console.error(`❌ No se cargaron datos para ${modo} - verificar archivo CSV`);
    return { datos: [], numeros: [], modo };
  }

  console.log(`📊 ${modo}: ${todosLosDatos.length} sorteos cargados, ${todosLosNumeros.length} números totales`);
  
  return {
    datos: todosLosDatos,
    numeros: todosLosNumeros,
    totalSorteos: todosLosDatos.length,
    ultimoSorteo: ultimoSorteo
  };
}

async function cargarTodosSorteos() {
  console.log('🔄 Iniciando carga de TODOS los sorteos...');
  const sorteos = ['melate', 'revancha', 'revanchita'];
  const datosPorSorteo = {};
  const ultimosSorteos = {};
  
  for (const sorteo of sorteos) {
    console.log(`📥 Cargando sorteo: ${sorteo}`);
    try {
      const datos = await cargarSorteoIndividual(sorteo);
      console.log(`📊 Datos cargados para ${sorteo}:`, datos);
      
      if (datos && datos.datos && datos.datos.length > 0) {
        datosPorSorteo[sorteo] = datos;
        
        // Obtener el último sorteo (el más reciente está en la primera posición)
        const ultimoSorteo = datos.datos[0]; // Primero es el más reciente
        ultimosSorteos[sorteo] = ultimoSorteo;
        console.log(`✅ ${sorteo} cargado exitosamente: ${datos.datos.length} sorteos, último: ${ultimoSorteo.numeroSorteo}`);
      } else {
        console.log(`⚠️ ${sorteo} no tiene datos válidos, pero se almacenará estructura vacía`);
        // Crear estructura básica vacía
        datosPorSorteo[sorteo] = { 
          datos: [], 
          numeros: [], 
          modo: sorteo,
          ultimoSorteo: 0
        };
        ultimosSorteos[sorteo] = null;
      }
    } catch (error) {
      console.error(`❌ Error cargando ${sorteo}:`, error);
      datosPorSorteo[sorteo] = { datos: [], numeros: [], modo: sorteo };
      ultimosSorteos[sorteo] = null;
    }
  }
  
  // Mostrar información de últimos sorteos
  mostrarUltimosSorteos(ultimosSorteos);
  
  console.log('🎯 Datos completos por sorteo:', datosPorSorteo);
  
  return { 
    datosPorSorteo, 
    ultimosSorteos,
    modo: 'todos',
    esComparativo: true 
  };
}

function mostrarUltimosSorteos(ultimosSorteos) {
  const container = document.getElementById('ultimo-sorteo');
  if (!container) return;
  
  // Obtener el número de sorteo más alto de todos los sorteos
  let ultimoNumeroSorteo = 0;
  const sorteos = ['melate', 'revancha', 'revanchita'];
  
  console.log('🔍 Buscando último sorteo en:', ultimosSorteos);
  
  sorteos.forEach(sorteo => {
    const ultimo = ultimosSorteos[sorteo];
    console.log(`📊 ${sorteo}:`, ultimo);
    if (ultimo && ultimo.numeroSorteo) {
      ultimoNumeroSorteo = Math.max(ultimoNumeroSorteo, ultimo.numeroSorteo);
      console.log(`📈 Número más alto encontrado: ${ultimoNumeroSorteo}`);
    }
  });
  
  if (ultimoNumeroSorteo > 0) {
    container.innerHTML = `ULTIMO SORTEO ${ultimoNumeroSorteo}`;
    console.log(`✅ Último sorteo actualizado: ${ultimoNumeroSorteo}`);
    
    // Actualizar también el título de predicción con el siguiente número
    const prediccionTitle = document.querySelector('#prediccion-container h2');
    if (prediccionTitle) {
      prediccionTitle.textContent = `🎯 Combinaciones sugeridas`;
    }
  } else {
    console.warn('⚠️ No se encontró número de sorteo válido');
    container.innerHTML = 'ULTIMO SORTEO 0000';
  }
}

export function graficarEstadisticas(datos) {
  console.log('🔍 Datos recibidos en graficarEstadisticas:', datos);
  
  // Si es modo comparativo (todos los sorteos)
  if (datos.esComparativo) {
    console.log('🔄 Modo comparativo detectado, mostrando estadísticas comparativas');
    mostrarEstadisticasComparativas(datos.datosPorSorteo);
    return;
  }
  
  // Modo individual
  console.log('🔍 Modo individual detectado');
  const numeros = datos.numeros || [];
  const sorteos = datos.datos || [];
  const modo = datos.modo || 'melate';
  
  console.log('🔍 Datos individuales recibidos:', { 
    totalNumeros: numeros.length, 
    totalSorteos: sorteos.length,
    modo: modo,
    primerosNumeros: numeros.slice(0, 10),
    primerSorteo: sorteos[0]
  });
  
  if (numeros.length === 0) {
    console.error('❌ No hay números para analizar');
    
    // Mostrar mensaje de error en la UI
    const contenedorCharts = document.getElementById('charts-container');
    if (contenedorCharts) {
      contenedorCharts.innerHTML = `
        <div class="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> No se pudieron cargar los datos históricos para ${modo}. Verifica que el archivo CSV esté disponible.
        </div>
      `;
    }
    return;
  }

  // Cálculo de frecuencia para cada número (1-56)
  const frecuencia = Array(56).fill(0);
  numeros.forEach(n => {
    if (n >= 1 && n <= 56) {
      frecuencia[n - 1]++;
    }
  });

  // Mostrar las estadísticas en la UI
  console.log('📊 Mostrando estadísticas completas...');
  mostrarEstadisticasCompletas(frecuencia, numeros.length, sorteos.length, modo);
}

function mostrarEstadisticasComparativas(datosPorSorteo) {
  console.log('Generando análisis estadístico para cada sorteo...');
  console.log('Datos recibidos en mostrarEstadisticasComparativas:', datosPorSorteo);
  
  // Validar que datosPorSorteo contenga los datos esperados
  if (!datosPorSorteo) {
    console.error('No se recibieron datos para mostrar estadísticas');
    const contenedorCharts = document.getElementById('charts-container');
    if (contenedorCharts) {
      contenedorCharts.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> No se recibieron datos para el análisis estadístico.
        </div>
      `;
    }
    return;
  }
  
  // Versión simplificada para debug
  const contenedorCharts = document.getElementById('charts-container');
  if (contenedorCharts) {
    let htmlContent = `
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-white mb-2">Análisis Estadístico Completo</h2>
        <p class="text-gray-300">Números más y menos frecuentes + Análisis por bloques</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    `;
    
    const sorteos = ['melate', 'revancha', 'revanchita'];
    
    sorteos.forEach(sorteo => {
      const datos = datosPorSorteo[sorteo];
      const nombre = sorteo.charAt(0).toUpperCase() + sorteo.slice(1);
      
      console.log('Procesando sorteo:', sorteo, datos);
      
      // Procesar datos si existen
      let stats = null;
      if (datos && datos.datos && datos.datos.length > 0) {
        console.log('Procesando', datos.datos.length, 'sorteos de', sorteo);
        
        // Calcular frecuencias
        const frecuencia = Array(56).fill(0);
        datos.datos.forEach(sorteoData => {
          const numeros = sorteoData.numeros || [];
          numeros.forEach(num => {
            if (num >= 1 && num <= 56) {
              frecuencia[num - 1]++;
            }
          });
        });
        
        // Top 10 más y menos frecuentes
        const numerosConFrecuencia = frecuencia.map((freq, index) => ({
          numero: index + 1,
          frecuencia: freq
        }));
        
        const top10Mas = numerosConFrecuencia
          .sort((a, b) => b.frecuencia - a.frecuencia)
          .slice(0, 10);
        
        const top10Menos = numerosConFrecuencia
          .sort((a, b) => a.frecuencia - b.frecuencia)
          .slice(0, 10);
        
        stats = {
          top10Mas,
          top10Menos,
          totalSorteos: datos.datos.length
        };
        
        console.log(sorteo, 'procesado:', stats);
      } else {
        console.warn('No hay datos válidos para', sorteo);
        stats = {
          top10Mas: [],
          top10Menos: [],
          totalSorteos: 0
        };
      }
      
      // Generar HTML
      htmlContent += `
        <div class="analisis-transparente rounded-xl p-6 text-white">
          <div class="text-center mb-4">
            <h3 class="text-xl font-bold text-white mb-2">${nombre}</h3>
            <p class="text-gray-300 text-sm">${stats.totalSorteos} sorteos analizados</p>
          </div>
          
          <!-- Top 10 MÁS frecuentes -->
          <div class="mb-4">
            <h4 class="text-lg font-semibold text-white mb-2">Top 10 MÁS frecuentes</h4>
            <div class="grid grid-cols-5 gap-2">
      `;
      
      if (stats.top10Mas && stats.top10Mas.length > 0) {
        stats.top10Mas.forEach(item => {
          htmlContent += `
            <div class="analisis-transparente rounded-lg p-2 text-center border border-white border-opacity-30">
              <div class="text-lg font-bold text-white">${item.numero}</div>
              <div class="text-xs text-gray-300">${item.frecuencia}</div>
            </div>
          `;
        });
      } else {
        htmlContent += `
          <div class="col-span-5 text-center text-gray-400 py-4">
            <p>No hay datos disponibles</p>
          </div>
        `;
      }
      
      htmlContent += `
            </div>
          </div>
          
          <!-- Top 10 MENOS frecuentes -->
          <div class="mb-4">
            <h4 class="text-lg font-semibold text-white mb-2">Top 10 MENOS frecuentes</h4>
            <div class="grid grid-cols-5 gap-2">
      `;
      
      if (stats.top10Menos && stats.top10Menos.length > 0) {
        stats.top10Menos.forEach(item => {
          htmlContent += `
            <div class="analisis-transparente rounded-lg p-2 text-center border border-white border-opacity-30">
              <div class="text-lg font-bold text-white">${item.numero}</div>
              <div class="text-xs text-gray-300">${item.frecuencia}</div>
            </div>
          `;
        });
      } else {
        htmlContent += `
          <div class="col-span-5 text-center text-gray-400 py-4">
            <p>No hay datos disponibles</p>
          </div>
        `;
      }
      
      htmlContent += `
            </div>
          </div>
        </div>
      `;
    });
    
    htmlContent += `
      </div>
    `;
    
    contenedorCharts.innerHTML = htmlContent;
    console.log('✅ Análisis estadístico simplificado mostrado exitosamente');
  } else {
    console.error('❌ No se encontró el contenedor charts-container');
  }
}
    if (contenedorCharts) {
      contenedorCharts.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> No se recibieron datos para el análisis estadístico.
    console.log('✅ Análisis estadístico simplificado mostrado exitosamente');
  } else {
    console.error('❌ No se encontró el contenedor charts-container');
  }
}

function crearEstadisticasVacias(bloques) {
  return {
    top10Mas: [
      { numero: 1, frecuencia: 5 },
      { numero: 7, frecuencia: 4 },
      { numero: 14, frecuencia: 3 },
      { numero: 21, frecuencia: 3 },
      { numero: 28, frecuencia: 2 },
      { numero: 35, frecuencia: 2 },
      { numero: 42, frecuencia: 1 },
      { numero: 49, frecuencia: 1 },
      { numero: 56, frecuencia: 1 },
      { numero: 13, frecuencia: 1 }
    ],
    top10Menos: [
      { numero: 2, frecuencia: 0 },
      { numero: 8, frecuencia: 0 },
      { numero: 15, frecuencia: 0 },
      { numero: 22, frecuencia: 0 },
      { numero: 29, frecuencia: 0 },
      { numero: 36, frecuencia: 0 },
      { numero: 43, frecuencia: 0 },
      { numero: 50, frecuencia: 0 },
      { numero: 55, frecuencia: 0 },
      { numero: 12, frecuencia: 0 }
    ],
    bloques: bloques.map(bloque => ({
      bloque: bloque.nombre,
      promedio: 1.5,
      porcentaje: 25,
      numerosProbables: 1
    })),
    totalSorteos: 0
  };
}



function mostrarEstadisticasCompletas(frecuencia, totalNumeros, totalSorteos, modo) {
  // Top 10 números más frecuentes
  const top10Mas = frecuencia
    .map((freq, i) => ({ numero: i + 1, frecuencia: freq }))
    .sort((a, b) => b.frecuencia - a.frecuencia)
    .slice(0, 10);

  // Top 10 números menos frecuentes
  const top10Menos = frecuencia
    .map((freq, i) => ({ numero: i + 1, frecuencia: freq }))
    .sort((a, b) => a.frecuencia - b.frecuencia)
    .slice(0, 10);

  // Nombre del sorteo para mostrar
  const nombreSorteo = modo.charAt(0).toUpperCase() + modo.slice(1);

  // Reemplazar el contenedor de gráficos con estadísticas simplificadas
  const contenedorCharts = document.getElementById('charts-container');
  if (contenedorCharts) {
    contenedorCharts.innerHTML = 
      '<div class="mb-6">' +
        '<h2 class="text-2xl font-bold text-white mb-2">Análisis de ' + nombreSorteo + '</h2>' +
        '<p class="text-gray-300">Datos históricos de ' + totalSorteos + ' sorteos</p>' +
      '</div>' +
      '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">' +
        '<div class="bg-white text-gray-800 rounded-xl shadow-lg p-6">' +
          '<h3 class="text-lg font-bold mb-4 text-green-600">Los 10 que Más Salen</h3>' +
          '<div class="grid grid-cols-2 gap-2">' +
            top10Mas.map(item => 
              '<div class="flex items-center justify-between p-2 bg-green-50 rounded border-l-3 border-green-500">' +
                '<span class="text-green-800 font-bold">' + item.numero + '</span>' +
                '<span class="text-green-600 text-sm">' + item.frecuencia + 'x</span>' +
              '</div>'
            ).join('') +
          '</div>' +
        '</div>' +
        '<div class="bg-white text-gray-800 rounded-xl shadow-lg p-6">' +
          '<h3 class="text-lg font-bold mb-4 text-red-600">Los 10 que Menos Salen</h3>' +
          '<div class="grid grid-cols-2 gap-2">' +
            top10Menos.map(item => 
              '<div class="flex items-center justify-between p-2 bg-red-50 rounded border-l-3 border-red-500">' +
                '<span class="text-red-800 font-bold">' + item.numero + '</span>' +
                '<span class="text-red-600 text-sm">' + item.frecuencia + 'x</span>' +
              '</div>'
            ).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="bg-white text-gray-800 rounded-xl shadow-lg p-6">' +
        '<h3 class="text-lg font-bold mb-3 text-blue-600">Resumen de ' + nombreSorteo + '</h3>' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">' +
          '<div class="p-4 bg-blue-50 rounded-lg">' +
            '<div class="text-2xl font-bold text-blue-600">' + totalSorteos + '</div>' +
            '<div class="text-sm text-gray-600">Sorteos Analizados</div>' +
          '</div>' +
          '<div class="p-4 bg-purple-50 rounded-lg">' +
            '<div class="text-2xl font-bold text-purple-600">' + totalNumeros + '</div>' +
            '<div class="text-sm text-gray-600">Números Extraídos</div>' +
          '</div>' +
          '<div class="p-4 bg-green-50 rounded-lg">' +
            '<div class="text-2xl font-bold text-green-600">' + Math.round(totalNumeros / totalSorteos) + '</div>' +
            '<div class="text-sm text-gray-600">Números por Sorteo</div>' +
          '</div>' +
        '</div>' +
        '<div class="mt-4 p-3 bg-gray-50 rounded-lg">' +
          '<div class="text-sm text-gray-600">' +
            '<strong>Número más frecuente:</strong> ' + top10Mas[0].numero + ' (' + top10Mas[0].frecuencia + ' veces)' +
          '</div>' +
          '<div class="text-sm text-gray-600">' +
            '<strong>Número menos frecuente:</strong> ' + top10Menos[0].numero + ' (' + top10Menos[0].frecuencia + ' veces)' +
          '</div>' +
        '</div>' +
      '</div>';
  }
  
  console.log('✅ Estadísticas mostradas exitosamente para', nombreSorteo);
}

// Función para generar predicción por frecuencia (usado por mlPredictor.js)
export function generarPrediccionPorFrecuencia(userId, datos) {
  const numeros = datos.numeros || [];
  const seed = hashCode(userId);
  
  if (numeros.length === 0) {
    return [1, 7, 14, 21, 28, 35];
  }
  
  const frecuencia = Array(56).fill(0);
  numeros.forEach(n => {
    if (n >= 1 && n <= 56) {
      frecuencia[n - 1]++;
    }
  });
  
  const ponderados = frecuencia.map((freq, i) => ({
    numero: i + 1,
    score: freq + ((seed % (i + 7)) / 100)
  }));
  
  return ponderados
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(n => n.numero)
    .sort((a, b) => a - b);
}

// Función auxiliar para hash
function hashCode(str) {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}
