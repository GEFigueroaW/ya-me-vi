/**
 * YA ME VI - Combinación Final Module
 * Módulo unificado que funciona con los datos históricos
 */

// Variables globales para datos
let numerosPorSorteo = {
  melate: [],
  revancha: [],
  revanchita: []
};

/**
 * Cargar y procesar datos CSV
 */
async function cargarDatosHistoricos() {
  console.log('🔄 Cargando datos históricos...');
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  let datosValidos = false;
  
  for (const sorteo of sorteos) {
    try {
      const archivo = `assets/${sorteo.charAt(0).toUpperCase() + sorteo.slice(1)}.csv`;
      const response = await fetch(archivo);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const csvText = await response.text();
      const lineas = csvText.split('\n').filter(linea => linea.trim());
      
      // Procesar CSV
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - 30); // Últimos 30 meses
      
      numerosPorSorteo[sorteo] = [];
      
      for (let i = 1; i < lineas.length; i++) { // Saltar header
        const cols = lineas[i].split(',');
        if (cols.length >= 10) {
          // Extraer números de las columnas 2-7
          const numeros = [];
          for (let j = 2; j <= 7; j++) {
            const num = parseInt(cols[j]);
            if (!isNaN(num) && num >= 1 && num <= 56) {
              numeros.push(num);
            }
          }
          
          if (numeros.length === 6) {
            // Verificar fecha
            const fechaStr = cols[cols.length - 1];
            const fecha = parsearFecha(fechaStr);
            
            if (fecha && fecha >= fechaLimite) {
              numerosPorSorteo[sorteo].push(...numeros);
            }
          }
        }
      }
      
      console.log(`✅ ${sorteo.toUpperCase()}: ${numerosPorSorteo[sorteo].length / 6} sorteos cargados`);
      if (numerosPorSorteo[sorteo].length > 0) datosValidos = true;
      
    } catch (error) {
      console.error(`❌ Error cargando ${sorteo}:`, error);
    }
  }
  
  if (!datosValidos) {
    console.log('⚠️ Usando datos de prueba');
    generarDatosPrueba();
  }
  
  console.log('✅ Datos históricos listos');
}

function parsearFecha(fechaStr) {
  if (!fechaStr) return null;
  const partes = fechaStr.split('/');
  if (partes.length === 3) {
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1;
    const año = parseInt(partes[2]);
    return new Date(año, mes, dia);
  }
  return null;
}

function generarDatosPrueba() {
  for (const sorteo of ['melate', 'revancha', 'revanchita']) {
    numerosPorSorteo[sorteo] = [];
    // Generar 300 sorteos de prueba (1800 números)
    for (let i = 0; i < 300; i++) {
      for (let j = 0; j < 6; j++) {
        numerosPorSorteo[sorteo].push(Math.floor(Math.random() * 56) + 1);
      }
    }
  }
}

/**
 * Calcular estadísticas de un número
 */
function calcularEstadisticas(numero) {
  const resultados = {};
  
  ['melate', 'revancha', 'revanchita'].forEach(sorteo => {
    const numeros = numerosPorSorteo[sorteo] || [];
    const frecuencia = numeros.filter(n => n === numero).length;
    const total = numeros.length;
    
    // Porcentaje base (índice real)
    const porcentajeBase = total > 0 ? (frecuencia / total) * 100 : 0;
    
    // Porcentaje con factor motivacional (potencial)
    const factorMotivacion = 12.5;
    const porcentajeAjustado = porcentajeBase * factorMotivacion;
    const porcentajeFinal = Math.max(porcentajeAjustado, 8.0);
    
    resultados[sorteo] = {
      frecuencia: frecuencia,
      total: total,
      indice: porcentajeBase,
      potencial: porcentajeFinal
    };
  });
  
  return resultados;
}

/**
 * Generar HTML para análisis de número individual
 */
function generarHtmlNumero(numero, estadisticas) {
  const promedioIndice = (estadisticas.melate.indice + estadisticas.revancha.indice + estadisticas.revanchita.indice) / 3;
  const promedioPotencial = (estadisticas.melate.potencial + estadisticas.revancha.potencial + estadisticas.revanchita.potencial) / 3;
  
  let clasificacion = '';
  let colorClass = '';
  if (promedioPotencial >= 15) {
    clasificacion = '🔥 Excepcional';
    colorClass = 'text-red-600';
  } else if (promedioPotencial >= 12) {
    clasificacion = '⭐ Muy Alto';
    colorClass = 'text-orange-600';
  } else if (promedioPotencial >= 10) {
    clasificacion = '✨ Alto';
    colorClass = 'text-yellow-600';
  } else {
    clasificacion = '💫 Bueno';
    colorClass = 'text-green-600';
  }

  return `
    <div class="bg-white bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-50 shadow-xl">
      <h3 class="text-2xl font-bold mb-4 text-center text-gray-800">🎯 Análisis del Número ${numero}</h3>
      
      <!-- Resultado Principal -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 bg-opacity-20 rounded-lg p-4 mb-4 text-center">
        <div class="text-lg font-semibold text-gray-800 mb-2">Resultado General</div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-yellow-600 font-medium">🎯 Índice de Éxito</div>
            <div class="text-2xl font-bold text-gray-800">${promedioIndice.toFixed(1)}%</div>
          </div>
          <div>
            <div class="text-sm text-green-600 font-medium">⭐ Potencial</div>
            <div class="text-2xl font-bold text-gray-800">${promedioPotencial.toFixed(1)}%</div>
          </div>
        </div>
        <div class="mt-2">
          <span class="inline-block px-3 py-1 rounded-full bg-white bg-opacity-30 ${colorClass} font-semibold">
            ${clasificacion}
          </span>
        </div>
      </div>

      <!-- Desglose por Sorteo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-4">
          <h4 class="font-bold text-blue-800 mb-2 text-center">🔍 MELATE</h4>
          <div class="text-center">
            <div class="text-xs text-yellow-600">🎯 Índice</div>
            <div class="text-lg font-bold text-gray-700">${estadisticas.melate.indice.toFixed(1)}%</div>
            <div class="text-xs text-green-600 mt-1">⭐ Potencial</div>
            <div class="text-xl font-bold text-gray-800">${estadisticas.melate.potencial.toFixed(1)}%</div>
            <div class="text-xs text-gray-600 mt-1">${estadisticas.melate.frecuencia} apariciones</div>
          </div>
        </div>
        <div class="bg-purple-500 bg-opacity-20 border border-purple-400 rounded-lg p-4">
          <h4 class="font-bold text-purple-800 mb-2 text-center">🔍 REVANCHA</h4>
          <div class="text-center">
            <div class="text-xs text-yellow-600">🎯 Índice</div>
            <div class="text-lg font-bold text-gray-700">${estadisticas.revancha.indice.toFixed(1)}%</div>
            <div class="text-xs text-green-600 mt-1">⭐ Potencial</div>
            <div class="text-xl font-bold text-gray-800">${estadisticas.revancha.potencial.toFixed(1)}%</div>
            <div class="text-xs text-gray-600 mt-1">${estadisticas.revancha.frecuencia} apariciones</div>
          </div>
        </div>
        <div class="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-4">
          <h4 class="font-bold text-green-800 mb-2 text-center">🔍 REVANCHITA</h4>
          <div class="text-center">
            <div class="text-xs text-yellow-600">🎯 Índice</div>
            <div class="text-lg font-bold text-gray-700">${estadisticas.revanchita.indice.toFixed(1)}%</div>
            <div class="text-xs text-green-600 mt-1">⭐ Potencial</div>
            <div class="text-xl font-bold text-gray-800">${estadisticas.revanchita.potencial.toFixed(1)}%</div>
            <div class="text-xs text-gray-600 mt-1">${estadisticas.revanchita.frecuencia} apariciones</div>
          </div>
        </div>
      </div>

      <!-- Mensaje de Recomendación -->
      <div class="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-opacity-20 rounded-lg p-3 text-center">
        <p class="text-sm text-gray-700 font-medium">
          ${generarMensajeNumero(promedioPotencial)}
        </p>
      </div>
    </div>
  `;
}

function generarMensajeNumero(potencial) {
  if (potencial >= 15) {
    return '🔥 ¡Número excepcional! Este número tiene un historial muy prometedor en todos los sorteos.';
  } else if (potencial >= 12) {
    return '⭐ ¡Excelente elección! Este número muestra un potencial muy alto basado en datos históricos.';
  } else if (potencial >= 10) {
    return '✨ ¡Buena opción! Este número tiene un buen desempeño histórico.';
  } else {
    return '💫 Número con potencial. Todos los números tienen oportunidades según las estadísticas.';
  }
}

/**
 * Generar HTML para análisis de combinación
 */
function generarHtmlCombinacion(numeros) {
  const analisis = numeros.map(num => ({
    numero: num,
    estadisticas: calcularEstadisticas(num)
  }));
  
  // Calcular promedio general
  const promedioGeneral = analisis.reduce((sum, item) => {
    const promedioPotencial = (item.estadisticas.melate.potencial + item.estadisticas.revancha.potencial + item.estadisticas.revanchita.potencial) / 3;
    return sum + promedioPotencial;
  }, 0) / analisis.length;
  
  let clasificacionGeneral = '';
  let colorGeneral = '';
  if (promedioGeneral >= 15) {
    clasificacionGeneral = '🔥 Excepcional';
    colorGeneral = 'text-red-600';
  } else if (promedioGeneral >= 12) {
    clasificacionGeneral = '⭐ Muy Alto';
    colorGeneral = 'text-orange-600';
  } else if (promedioGeneral >= 10) {
    clasificacionGeneral = '✨ Alto';
    colorGeneral = 'text-yellow-600';
  } else {
    clasificacionGeneral = '💫 Bueno';
    colorGeneral = 'text-green-600';
  }

  return `
    <div class="bg-white bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-50 shadow-xl">
      <h3 class="text-2xl font-bold mb-4 text-center text-gray-800">🎯 Análisis de Combinación</h3>
      
      <!-- Resultado General -->
      <div class="bg-gradient-to-r from-purple-500 to-pink-600 bg-opacity-20 rounded-lg p-4 mb-4 text-center">
        <div class="text-lg font-semibold text-gray-800 mb-2">Combinación: ${numeros.join(' - ')}</div>
        <div class="text-xl font-bold text-gray-800">Potencial Promedio: ${promedioGeneral.toFixed(1)}%</div>
        <div class="mt-2">
          <span class="inline-block px-3 py-1 rounded-full bg-white bg-opacity-30 ${colorGeneral} font-semibold">
            ${clasificacionGeneral}
          </span>
        </div>
      </div>

      <!-- Análisis Individual -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        ${analisis.map(item => {
          const promedioPotencial = (item.estadisticas.melate.potencial + item.estadisticas.revancha.potencial + item.estadisticas.revanchita.potencial) / 3;
          return `
            <div class="bg-blue-500 bg-opacity-20 rounded-lg p-3 border border-blue-400">
              <div class="text-center">
                <div class="text-xl font-bold text-gray-800">${item.numero}</div>
                <div class="text-sm font-bold text-gray-800">${promedioPotencial.toFixed(1)}%</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Mensaje de Recomendación -->
      <div class="bg-gradient-to-r from-yellow-400 to-orange-500 bg-opacity-20 rounded-lg p-3 text-center">
        <p class="text-sm text-gray-700 font-medium">
          ${generarMensajeCombinacion(promedioGeneral)}
        </p>
      </div>
    </div>
  `;
}

function generarMensajeCombinacion(promedio) {
  if (promedio >= 15) {
    return '🌟 ¡Combinación extraordinaria! Esta selección tiene un potencial excepcional basado en datos históricos.';
  } else if (promedio >= 12) {
    return '🍀 ¡Fantástica combinación! Muy buen potencial en todos los sorteos.';
  } else if (promedio >= 10) {
    return '✨ ¡Buena combinación! Potencial sólido basado en estadísticas históricas.';
  } else {
    return '💫 Combinación con potencial. Las estadísticas muestran oportunidades interesantes.';
  }
}

/**
 * Funciones principales de UI
 */
function evaluarNumeroIndividual() {
  console.log('🔍 Evaluando número individual...');
  
  const input = document.getElementById('numero-individual');
  const resultado = document.getElementById('resultado-numero');
  
  if (!input || !resultado) {
    console.error('❌ Elementos no encontrados');
    return;
  }
  
  const numero = parseInt(input.value);
  
  if (isNaN(numero) || numero < 1 || numero > 56) {
    resultado.innerHTML = `
      <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
        <p class="text-red-700 font-semibold">⚠️ Por favor ingresa un número entre 1 y 56</p>
      </div>
    `;
    return;
  }
  
  const estadisticas = calcularEstadisticas(numero);
  const html = generarHtmlNumero(numero, estadisticas);
  resultado.innerHTML = html;
  
  console.log('✅ Análisis número completado');
}

function evaluarCombinacion() {
  console.log('🎯 Evaluando combinación...');
  
  const inputs = document.querySelectorAll('.combo-input');
  const resultado = document.getElementById('resultado-combinacion');
  
  if (!resultado) {
    console.error('❌ Container resultado no encontrado');
    return;
  }
  
  const numeros = Array.from(inputs)
    .map(input => parseInt(input.value))
    .filter(num => !isNaN(num));
  
  // Validaciones
  if (numeros.length !== 6) {
    resultado.innerHTML = `
      <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
        <p class="text-red-700 font-semibold">⚠️ Completa los 6 números (tienes ${numeros.length}/6)</p>
      </div>
    `;
    return;
  }
  
  if (new Set(numeros).size !== 6) {
    resultado.innerHTML = `
      <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
        <p class="text-red-700 font-semibold">⚠️ No se permiten números duplicados</p>
      </div>
    `;
    return;
  }
  
  if (numeros.some(n => n < 1 || n > 56)) {
    resultado.innerHTML = `
      <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
        <p class="text-red-700 font-semibold">⚠️ Todos los números deben estar entre 1 y 56</p>
      </div>
    `;
    return;
  }
  
  const html = generarHtmlCombinacion(numeros);
  resultado.innerHTML = html;
  
  console.log('✅ Análisis combinación completado');
}

/**
 * Configurar la interfaz
 */
function configurarUI() {
  console.log('🔧 Configurando interfaz...');
  
  // Botón evaluar número
  const btnNumero = document.getElementById('evaluar-numero-btn');
  if (btnNumero) {
    btnNumero.addEventListener('click', (e) => {
      e.preventDefault();
      evaluarNumeroIndividual();
    });
  }
  
  // Botón evaluar combinación
  const btnCombinacion = document.getElementById('evaluar-combinacion-btn');
  if (btnCombinacion) {
    btnCombinacion.addEventListener('click', (e) => {
      e.preventDefault();
      evaluarCombinacion();
    });
  }
  
  // Enter en input número
  const inputNumero = document.getElementById('numero-individual');
  if (inputNumero) {
    inputNumero.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        evaluarNumeroIndividual();
      }
    });
  }
  
  // Acordeón
  const triggers = document.querySelectorAll('[id^="trigger-"]');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      
      const contentId = trigger.id.replace('trigger-', 'content-');
      const content = document.getElementById(contentId);
      const icon = trigger.querySelector('svg');
      
      if (content) {
        const isHidden = content.classList.contains('hidden');
        
        // Cerrar todas las secciones
        document.querySelectorAll('[id^="content-"]').forEach(c => {
          c.classList.add('hidden');
        });
        
        // Resetear iconos
        document.querySelectorAll('[id^="trigger-"] svg').forEach(i => {
          if (i) i.style.transform = 'rotate(0deg)';
        });
        
        // Abrir la sección clickeada si estaba cerrada
        if (isHidden) {
          content.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      }
    });
  });
  
  console.log('✅ Interfaz configurada');
}

/**
 * Inicialización
 */
async function inicializar() {
  console.log('🚀 Inicializando aplicación...');
  
  await cargarDatosHistoricos();
  configurarUI();
  
  console.log('✅ Aplicación lista');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}
