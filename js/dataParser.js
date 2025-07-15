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
    
    // Calcular fecha límite (30 meses atrás desde hoy)
    const fechaActual = new Date();
    const fechaLimite = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 30, fechaActual.getDate());
    console.log(`📅 Filtrando sorteos desde: ${fechaLimite.toLocaleDateString()}`);
    
    // Procesar cada línea (saltar encabezado)
    for (let i = 1; i < lineas.length; i++) {
      const linea = lineas[i].trim();
      if (!linea) continue;
      
      const columnas = linea.split(',');
      
      // Detectar formato automáticamente
      let numerosLinea = [];
      let concurso = '';
      let fechaSorteo = null;
      
      if (columnas.length >= 11 && sorteo === 'melate') {
        // Formato: NPRODUCTO,CONCURSO,R1,R2,R3,R4,R5,R6,R7,BOLSA,FECHA
        concurso = columnas[1];
        
        // Verificar fecha - últimos 30 meses
        const fechaStr = columnas[10].trim();
        if (fechaStr) {
          const partesFecha = fechaStr.split('/');
          if (partesFecha.length === 3) {
            const dia = parseInt(partesFecha[0]);
            const mes = parseInt(partesFecha[1]) - 1; // Mes base 0
            const año = parseInt(partesFecha[2]);
            fechaSorteo = new Date(año, mes, dia);
            
            if (fechaSorteo < fechaLimite) {
              continue; // Saltar sorteos más antiguos de 30 meses
            }
          }
        }
        
        for (let j = 2; j <= 7; j++) {
          const num = parseInt(columnas[j]);
          if (!isNaN(num) && num >= 1 && num <= 56) {
            numerosLinea.push(num);
          }
        }
      } else if (columnas.length >= 10 && (sorteo === 'revancha' || sorteo === 'revanchita')) {
        // Formato: NPRODUCTO,CONCURSO,R1/F1,R2/F2,R3/F3,R4/F4,R5/F5,R6/F6,BOLSA,FECHA
        concurso = columnas[1];
        
        // Verificar fecha - últimos 30 meses
        const fechaStr = columnas[9].trim();
        if (fechaStr) {
          const partesFecha = fechaStr.split('/');
          if (partesFecha.length === 3) {
            const dia = parseInt(partesFecha[0]);
            const mes = parseInt(partesFecha[1]) - 1; // Mes base 0
            const año = parseInt(partesFecha[2]);
            fechaSorteo = new Date(año, mes, dia);
            
            if (fechaSorteo < fechaLimite) {
              continue; // Saltar sorteos más antiguos de 30 meses
            }
          }
        }
        
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
    
    console.log(`✅ ${sorteo}: ${sorteos.length} sorteos cargados (últimos 30 meses) - ${numeros.length} números`);
    
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
  console.log('📊 Generando estadísticas unificadas...');
  
  const container = document.getElementById('charts-container');
  if (!container) {
    console.error('❌ Contenedor charts-container no encontrado');
    return;
  }
  
  container.innerHTML = '';
  
  // Crear tarjeta unificada
  const tarjetaUnificada = document.createElement('div');
  tarjetaUnificada.className = 'bg-white bg-opacity-50 rounded-xl backdrop-blur-sm border border-white border-opacity-30';
  
  const botonTitulo = document.createElement('button');
  botonTitulo.className = 'w-full p-6 text-left hover:bg-white hover:bg-opacity-10 transition-all duration-300';
  botonTitulo.onclick = () => toggleAnalisis('frecuencias-unificadas');
  botonTitulo.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="text-2xl">📊</div>
      <div class="flex-1">
        <h3 class="text-2xl font-bold text-white text-center">FRECUENCIAS</h3>
      </div>
    </div>
  `;
  
  const contenidoExpandible = document.createElement('div');
  contenidoExpandible.id = 'frecuencias-unificadas-content';
  contenidoExpandible.className = 'hidden px-6 pb-6';
  
  // Generar contenido para cada sorteo
  const sorteos = ['melate', 'revancha', 'revanchita'];
  let contenidoHTML = '';
  
  // Contenedor principal responsive
  contenidoHTML += `
    <div class="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-8 divide-y xl:divide-y-0 xl:divide-x divide-white divide-opacity-20">
  `;
  
  sorteos.forEach(sorteo => {
    const datosIndividuales = datos[sorteo];
    if (!datosIndividuales || !datosIndividuales.numeros || datosIndividuales.numeros.length === 0) {
      console.warn(`⚠️ No hay datos para ${sorteo}`);
      return;
    }
    
    console.log(`📊 ${sorteo}: ${datosIndividuales.sorteos ? datosIndividuales.sorteos.length : 0} sorteos, ${datosIndividuales.numeros.length} números`);
    
    const frecuencias = calcularFrecuencias(datosIndividuales.numeros);
    const frecuenciasArray = Object.entries(frecuencias).map(([num, freq]) => ({
      numero: parseInt(num),
      frecuencia: freq
    }));
    
    frecuenciasArray.sort((a, b) => b.frecuencia - a.frecuencia);
    
    const topFrecuentes = frecuenciasArray.slice(0, 10);
    const menosFrecuentes = frecuenciasArray.slice(-10).reverse();
    
    contenidoHTML += `
      <div class="space-y-8 pt-8 xl:pt-0 xl:px-4 first:pt-0">
        <!-- Título del sorteo -->
        <div class="text-center">
          <h4 class="text-2xl font-bold text-white mb-2">🎲 ${sorteo.toUpperCase()}</h4>
        </div>
        
        <!-- Top 10 MÁS frecuentes -->
        <div>
          <h5 class="text-lg font-semibold text-orange-400 mb-4 text-center">🔥 Top 10 MÁS frecuentes</h5>
          <div class="grid grid-cols-5 sm:grid-cols-5 gap-3">
            ${topFrecuentes.map((item, index) => `
              <div class="bg-white bg-opacity-75 rounded-xl p-4 text-center backdrop-blur-sm hover:bg-opacity-80 transition-all">
                <div class="text-red-600 text-2xl font-bold mb-1">${item.numero}</div>
                <div class="text-red-600 text-sm font-semibold">${item.frecuencia}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Top 10 MENOS frecuentes -->
        <div>
          <h5 class="text-lg font-semibold text-white mb-4 text-center">❄️ Top 10 MENOS frecuentes</h5>
          <div class="grid grid-cols-5 sm:grid-cols-5 gap-3">
            ${menosFrecuentes.map((item, index) => `
              <div class="bg-white bg-opacity-75 rounded-xl p-4 text-center backdrop-blur-sm hover:bg-opacity-80 transition-all">
                <div class="text-blue-600 text-2xl font-bold mb-1">${item.numero}</div>
                <div class="text-blue-600 text-sm font-semibold">${item.frecuencia}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  });
  
  contenidoHTML += `
    </div>
  `;
  
  contenidoExpandible.innerHTML = contenidoHTML;
  
  tarjetaUnificada.appendChild(botonTitulo);
  tarjetaUnificada.appendChild(contenidoExpandible);
  
  container.appendChild(tarjetaUnificada);
  
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

export function mostrarEstadisticasComparativas(datos) {
  console.log('📊 Mostrando estadísticas comparativas...');
  
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
  
  container.innerHTML = '';
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

// === NUEVAS FUNCIONES DE ANÁLISIS AVANZADO ===

// Análisis de Suma de Números
export function analizarSumaNumeros(datos) {
  console.log('🔢 Analizando suma de números...');
  
  const resultados = {};
  
  Object.entries(datos).forEach(([sorteo, datosIndividuales]) => {
    if (!datosIndividuales || !datosIndividuales.sorteos) return;
    
    const sumas = datosIndividuales.sorteos.map(sorteoData => {
      const suma = sorteoData.numeros.reduce((acc, num) => acc + num, 0);
      return suma;
    });
    
    // Agrupar por rangos de suma
    const rangos = {
      '50-99': 0,
      '100-149': 0,
      '150-199': 0,
      '200-249': 0,
      '250-299': 0,
      '300+': 0
    };
    
    sumas.forEach(suma => {
      if (suma < 100) rangos['50-99']++;
      else if (suma < 150) rangos['100-149']++;
      else if (suma < 200) rangos['150-199']++;
      else if (suma < 250) rangos['200-249']++;
      else if (suma < 300) rangos['250-299']++;
      else rangos['300+']++;
    });
    
    const sumaPromedio = sumas.reduce((acc, suma) => acc + suma, 0) / sumas.length;
    const rangoMasFrecuente = Object.entries(rangos).reduce((a, b) => rangos[a[0]] > rangos[b[0]] ? a : b);
    
    resultados[sorteo] = {
      sumaPromedio: sumaPromedio.toFixed(1),
      rangos: rangos,
      rangoMasFrecuente: rangoMasFrecuente,
      totalSorteos: sumas.length
    };
  });
  
  return resultados;
}

// Análisis de Pares e Impares
export function analizarParesImpares(datos) {
  console.log('⚖️ Analizando pares e impares...');
  
  const resultados = {};
  
  Object.entries(datos).forEach(([sorteo, datosIndividuales]) => {
    if (!datosIndividuales || !datosIndividuales.sorteos) return;
    
    const distribuciones = {
      '6p-0i': 0,
      '5p-1i': 0,
      '4p-2i': 0,
      '3p-3i': 0,
      '2p-4i': 0,
      '1p-5i': 0,
      '0p-6i': 0
    };
    
    datosIndividuales.sorteos.forEach(sorteoData => {
      const pares = sorteoData.numeros.filter(num => num % 2 === 0).length;
      const impares = 6 - pares;
      const clave = `${pares}p-${impares}i`;
      distribuciones[clave]++;
    });
    
    const distribucionMasFrecuente = Object.entries(distribuciones).reduce((a, b) => distribuciones[a[0]] > distribuciones[b[0]] ? a : b);
    
    resultados[sorteo] = {
      distribuciones: distribuciones,
      distribucionMasFrecuente: distribucionMasFrecuente,
      totalSorteos: datosIndividuales.sorteos.length
    };
  });
  
  return resultados;
}

// Análisis de Frecuencia por Década y Terminación
export function analizarDecadaTerminacion(datos) {
  console.log('🎯 Analizando década y terminación...');
  
  const resultados = {};
  
  Object.entries(datos).forEach(([sorteo, datosIndividuales]) => {
    if (!datosIndividuales || !datosIndividuales.numeros) return;
    
    // Análisis por década
    const decadas = {
      '1-10': 0,
      '11-20': 0,
      '21-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51-56': 0
    };
    
    // Análisis por terminación
    const terminaciones = {};
    for (let i = 0; i <= 9; i++) {
      terminaciones[i] = 0;
    }
    
    datosIndividuales.numeros.forEach(num => {
      // Década
      if (num <= 10) decadas['1-10']++;
      else if (num <= 20) decadas['11-20']++;
      else if (num <= 30) decadas['21-30']++;
      else if (num <= 40) decadas['31-40']++;
      else if (num <= 50) decadas['41-50']++;
      else decadas['51-56']++;
      
      // Terminación
      const terminacion = num % 10;
      terminaciones[terminacion]++;
    });
    
    const decadaMasFrecuente = Object.entries(decadas).reduce((a, b) => decadas[a[0]] > decadas[b[0]] ? a : b);
    const terminacionMasFrecuente = Object.entries(terminaciones).reduce((a, b) => terminaciones[a[0]] > terminaciones[b[0]] ? a : b);
    
    resultados[sorteo] = {
      decadas: decadas,
      terminaciones: terminaciones,
      decadaMasFrecuente: decadaMasFrecuente,
      terminacionMasFrecuente: terminacionMasFrecuente,
      totalNumeros: datosIndividuales.numeros.length
    };
  });
  
  return resultados;
}

// Función para mostrar todos los análisis avanzados
export function mostrarAnalisisAvanzados(datos) {
  console.log('📊 Mostrando análisis avanzados...');
  
  const container = document.getElementById('analisis-avanzados');
  if (!container) return;
  
  const sumAnalisis = analizarSumaNumeros(datos);
  const paresImparesAnalisis = analizarParesImpares(datos);
  const decadaTerminacionAnalisis = analizarDecadaTerminacion(datos);
  
  let htmlContent = '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">';
  
  // Tarjeta 1: Análisis de Suma
  htmlContent += `
    <div class="bg-white bg-opacity-50 rounded-xl backdrop-blur-sm border border-white border-opacity-30">
      <button class="w-full p-6 text-left hover:bg-white hover:bg-opacity-10 transition-all duration-300" onclick="toggleAnalisis('suma')">
        <div class="flex items-center justify-between">
          <div class="text-2xl">🔢</div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-white text-center">Suma de Números</h3>
          </div>
        </div>
      </button>
      <div id="suma-content" class="hidden px-6 pb-6">
        <div class="space-y-4">
  `;
  
  Object.entries(sumAnalisis).forEach(([sorteo, datos]) => {
    const colores = {
      melate: 'bg-blue-500',
      revancha: 'bg-purple-500',
      revanchita: 'bg-green-500'
    };
    
    htmlContent += `
      <div class="${colores[sorteo]} bg-opacity-50 rounded-lg p-4">
        <h4 class="font-bold text-white mb-2">${sorteo.toUpperCase()}</h4>
        <div class="text-sm text-gray-300">
          <p><strong>Suma promedio:</strong> ${datos.sumaPromedio}</p>
          <p><strong>Rango más frecuente:</strong> ${datos.rangoMasFrecuente[0]} (${datos.rangoMasFrecuente[1]} veces)</p>
          <div class="mt-2 text-xs">
            <div class="grid grid-cols-2 gap-1">
              ${Object.entries(datos.rangos).map(([rango, freq]) => `
                <span>${rango}: ${freq}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  htmlContent += '</div></div></div>';
  
  // Tarjeta 2: Análisis de Pares e Impares
  htmlContent += `
    <div class="bg-white bg-opacity-50 rounded-xl backdrop-blur-sm border border-white border-opacity-30">
      <button class="w-full p-6 text-left hover:bg-white hover:bg-opacity-10 transition-all duration-300" onclick="toggleAnalisis('pares')">
        <div class="flex items-center justify-between">
          <div class="text-2xl">⚖️</div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-white text-center">Pares e Impares</h3>
          </div>
        </div>
      </button>
      <div id="pares-content" class="hidden px-6 pb-6">
        <div class="space-y-4">
  `;
  
  Object.entries(paresImparesAnalisis).forEach(([sorteo, datos]) => {
    const colores = {
      melate: 'bg-blue-500',
      revancha: 'bg-purple-500',
      revanchita: 'bg-green-500'
    };
    
    htmlContent += `
      <div class="${colores[sorteo]} bg-opacity-50 rounded-lg p-4">
        <h4 class="font-bold text-white mb-2">${sorteo.toUpperCase()}</h4>
        <div class="text-sm text-gray-300">
          <p><strong>Distribución más frecuente:</strong> ${datos.distribucionMasFrecuente[0]} (${datos.distribucionMasFrecuente[1]} veces)</p>
          <div class="mt-2 text-xs">
            <div class="grid grid-cols-2 gap-1">
              ${Object.entries(datos.distribuciones).map(([dist, freq]) => `
                <span>${dist}: ${freq}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  htmlContent += '</div></div></div>';
  
  // Tarjeta 3: Análisis de Década y Terminación
  htmlContent += `
    <div class="bg-white bg-opacity-50 rounded-xl backdrop-blur-sm border border-white border-opacity-30">
      <button class="w-full p-6 text-left hover:bg-white hover:bg-opacity-10 transition-all duration-300" onclick="toggleAnalisis('decada')">
        <div class="flex items-center justify-between">
          <div class="text-2xl">🎯</div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-white text-center">Década y Terminación</h3>
          </div>
        </div>
      </button>
      <div id="decada-content" class="hidden px-6 pb-6">
        <div class="space-y-4">
  `;
  
  Object.entries(decadaTerminacionAnalisis).forEach(([sorteo, datos]) => {
    const colores = {
      melate: 'bg-blue-500',
      revancha: 'bg-purple-500',
      revanchita: 'bg-green-500'
    };
    
    htmlContent += `
      <div class="${colores[sorteo]} bg-opacity-50 rounded-lg p-4">
        <h4 class="font-bold text-white mb-2">${sorteo.toUpperCase()}</h4>
        <div class="text-sm text-gray-300">
          <p><strong>Década más frecuente:</strong> ${datos.decadaMasFrecuente[0]} (${datos.decadaMasFrecuente[1]} veces)</p>
          <p><strong>Terminación más frecuente:</strong> ${datos.terminacionMasFrecuente[0]} (${datos.terminacionMasFrecuente[1]} veces)</p>
          <div class="mt-2 text-xs">
            <div class="mb-1"><strong>Por década:</strong></div>
            <div class="grid grid-cols-3 gap-1 mb-2">
              ${Object.entries(datos.decadas).map(([decada, freq]) => `
                <span>${decada}: ${freq}</span>
              `).join('')}
            </div>
            <div class="mb-1"><strong>Por terminación:</strong></div>
            <div class="grid grid-cols-5 gap-1">
              ${Object.entries(datos.terminaciones).map(([term, freq]) => `
                <span>${term}: ${freq}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  htmlContent += '</div></div></div>';
  htmlContent += '</div>';
  
  container.innerHTML = htmlContent;
}
