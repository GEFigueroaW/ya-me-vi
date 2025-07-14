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
