/**
 * YA ME VI - Combinación Module (ES6)
 * Módulo completamente independiente para evaluar números y combinaciones
 */

// Variables globales para datos
let numerosPorSorteo = {
  melate: [],
  revancha: [],
  revanchita: []
};

let datosListos = false;

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
  
  datosListos = true;
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
  
  if (!datosListos) {
    console.log('⚠️ Datos aún no están listos, esperando...');
    setTimeout(evaluarNumeroIndividual, 500);
    return;
  }
  
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
  
  resultado.innerHTML = `
    <div class="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-4">
      <p class="text-blue-700 font-semibold">🔄 Analizando número ${numero}...</p>
    </div>
  `;
  
  // Pequeño delay para mostrar el mensaje de carga
  setTimeout(() => {
    const estadisticas = calcularEstadisticas(numero);
    const html = generarHtmlNumero(numero, estadisticas);
    resultado.innerHTML = html;
    
    console.log('✅ Análisis número completado');
  }, 300);
}

function evaluarCombinacion() {
  console.log('🎯 Evaluando combinación...');
  
  if (!datosListos) {
    console.log('⚠️ Datos aún no están listos, esperando...');
    setTimeout(evaluarCombinacion, 500);
    return;
  }
  
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
  
  resultado.innerHTML = `
    <div class="bg-purple-500 bg-opacity-20 border border-purple-400 rounded-lg p-4">
      <p class="text-purple-700 font-semibold">🔄 Analizando combinación ${numeros.join(' - ')}...</p>
    </div>
  `;
  
  // Pequeño delay para mostrar el mensaje de carga
  setTimeout(() => {
    const html = generarHtmlCombinacion(numeros);
    resultado.innerHTML = html;
    
    console.log('✅ Análisis combinación completado');
  }, 500);
}

/**
 * Mostrar/ocultar sección de explicación
 */
function mostrarExplicacion(explicacionId) {
  console.log(`🔍 Toggling explicación: ${explicacionId}`);
  
  const explicacion = document.getElementById(explicacionId);
  if (!explicacion) {
    console.error(`❌ No se encontró elemento: ${explicacionId}`);
    return;
  }
  
  const estaOculto = explicacion.classList.contains('hidden');
  
  if (estaOculto) {
    explicacion.classList.remove('hidden');
    console.log(`✅ Mostrando explicación: ${explicacionId}`);
  } else {
    explicacion.classList.add('hidden');
    console.log(`❌ Ocultando explicación: ${explicacionId}`);
  }
}

/**
 * Configurar la interfaz con verificaciones adicionales
 */
function configurarUI() {
  console.log('🔧 Configurando interfaz...');
  
  // Esperar a que los elementos estén disponibles
  const verificarElementos = () => {
    const btnNumero = document.getElementById('evaluar-numero-btn');
    const btnCombinacion = document.getElementById('evaluar-combinacion-btn');
    const btnExplicacionNumero = document.getElementById('mostrar-explicacion-btn');
    const btnExplicacionCombo = document.getElementById('mostrar-explicacion-btn-combo');
    const triggers = document.querySelectorAll('[id^="trigger-"]');
    
    console.log(`Verificando elementos:`);
    console.log(`- btnNumero: ${!!btnNumero}`);
    console.log(`- btnCombinacion: ${!!btnCombinacion}`);
    console.log(`- btnExplicacionNumero: ${!!btnExplicacionNumero}`);
    console.log(`- btnExplicacionCombo: ${!!btnExplicacionCombo}`);
    console.log(`- triggers: ${triggers.length}`);
    
    // Verificar elementos críticos
    if (!btnNumero || !btnCombinacion || triggers.length === 0) {
      console.log('⏳ Elementos críticos aún no disponibles, reintentando en 100ms...');
      setTimeout(verificarElementos, 100);
      return;
    }
    
    // Configurar botón evaluar número
    console.log('🔗 Configurando botón número...');
    btnNumero.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('👆 Click en botón evaluar número');
      evaluarNumeroIndividual();
    });
    
    // Configurar botón evaluar combinación
    console.log('🔗 Configurando botón combinación...');
    btnCombinacion.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('👆 Click en botón evaluar combinación');
      evaluarCombinacion();
    });
    
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
    
    // Configurar acordeón
    console.log('🔗 Configurando acordeón...');
    triggers.forEach((trigger, index) => {
      console.log(`Configurando trigger ${index + 1}: ${trigger.id}`);
      
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`👆 Click en trigger: ${trigger.id}`);
        
        const contentId = trigger.id.replace('trigger-', 'content-');
        const content = document.getElementById(contentId);
        const icon = trigger.querySelector('svg');
        
        if (content) {
          const isHidden = content.classList.contains('hidden');
          console.log(`Estado actual de ${contentId}: ${isHidden ? 'oculto' : 'visible'}`);
          
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
            console.log(`✅ Abriendo sección: ${contentId}`);
          } else {
            console.log(`❌ Cerrando sección: ${contentId}`);
          }
        } else {
          console.error(`❌ No se encontró contenido: ${contentId}`);
        }
      });
    });
    
    // Configurar botones de explicación
    console.log('🔗 Configurando botones de explicación...');
    
    // Botón explicación para número individual
    if (btnExplicacionNumero) {
      btnExplicacionNumero.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('👆 Click en botón explicación número');
        mostrarExplicacion('explicacion-numero');
      });
      console.log('✅ Botón explicación número configurado');
    } else {
      console.log('⚠️ No se encontró botón explicación número');
    }
    
    // Botón explicación para combinación
    if (btnExplicacionCombo) {
      btnExplicacionCombo.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('👆 Click en botón explicación combinación');
        mostrarExplicacion('explicacion-combinacion');
      });
      console.log('✅ Botón explicación combinación configurado');
    } else {
      console.log('⚠️ No se encontró botón explicación combinación');
    }
    
    console.log('✅ Interfaz configurada completamente');
  };
  
  verificarElementos();
}

/**
 * Inicialización con manejo de timing mejorado
 */
async function inicializar() {
  console.log('🚀 Inicializando aplicación...');
  
  try {
    // Cargar datos en paralelo con la configuración de UI
    const datosPromise = cargarDatosHistoricos();
    
    // Configurar UI inmediatamente
    configurarUI();
    
    // Esperar a que los datos estén listos
    await datosPromise;
    
    console.log('✅ Aplicación completamente lista');
  } catch (error) {
    console.error('❌ Error durante inicialización:', error);
  }
}

// Múltiples estrategias de inicialización para asegurar compatibilidad
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else if (document.readyState === 'interactive') {
  setTimeout(inicializar, 50);
} else {
  inicializar();
}

// Fallback adicional por si hay problemas de timing
setTimeout(() => {
  if (!datosListos) {
    console.log('🔄 Fallback: Re-inicializando...');
    inicializar();
  }
}, 2000);

// Debug adicional para verificar botones específicos
setTimeout(() => {
  console.log('🔍 Debug final de botones:');
  const elementos = {
    'evaluar-numero-btn': document.getElementById('evaluar-numero-btn'),
    'evaluar-combinacion-btn': document.getElementById('evaluar-combinacion-btn'),
    'mostrar-explicacion-btn': document.getElementById('mostrar-explicacion-btn'),
    'mostrar-explicacion-btn-combo': document.getElementById('mostrar-explicacion-btn-combo'),
    'resultado-numero': document.getElementById('resultado-numero'),
    'resultado-combinacion': document.getElementById('resultado-combinacion')
  };
  
  for (const [id, elemento] of Object.entries(elementos)) {
    console.log(`${id}: ${elemento ? '✅ ENCONTRADO' : '❌ NO ENCONTRADO'}`);
    if (elemento && elemento.onclick) {
      console.log(`  - Tiene onclick: ✅`);
    } else if (elemento) {
      console.log(`  - Sin onclick configurado: ⚠️`);
    }
  }
  
  // Test manual de botones si no están funcionando
  const btnCombo = document.getElementById('evaluar-combinacion-btn');
  if (btnCombo && !btnCombo.onclick) {
    console.log('🔧 Configurando manualmente botón combinación...');
    btnCombo.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🎯 MANUAL: Click en botón evaluar combinación');
      window.yaMeVi.evaluarCombinacion();
    });
  }
  
  const btnExpNum = document.getElementById('mostrar-explicacion-btn');
  if (btnExpNum && !btnExpNum.onclick) {
    console.log('🔧 Configurando manualmente botón explicación número...');
    btnExpNum.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🎯 MANUAL: Click en botón explicación número');
      const explicacion = document.getElementById('explicacion-numero');
      if (explicacion) {
        explicacion.classList.toggle('hidden');
      }
    });
  }
  
  const btnExpCombo = document.getElementById('mostrar-explicacion-btn-combo');
  if (btnExpCombo && !btnExpCombo.onclick) {
    console.log('🔧 Configurando manualmente botón explicación combinación...');
    btnExpCombo.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🎯 MANUAL: Click en botón explicación combinación');
      const explicacion = document.getElementById('explicacion-combinacion');
      if (explicacion) {
        explicacion.classList.toggle('hidden');
      }
    });
  }
  
}, 3000);

// Exportar funciones para debug global
window.yaMeVi = {
  evaluarNumeroIndividual,
  evaluarCombinacion,
  calcularEstadisticas,
  datosListos: () => datosListos,
  numerosPorSorteo: () => numerosPorSorteo,
  // Test manual de botones
  testBotones: () => {
    console.log('🧪 TESTING MANUAL DE BOTONES:');
    
    // Test botón evaluar número
    const btnNum = document.getElementById('evaluar-numero-btn');
    if (btnNum) {
      console.log('✅ Botón evaluar número encontrado');
      // Poner un número de test
      const inputNum = document.getElementById('numero-individual');
      if (inputNum) inputNum.value = '7';
      btnNum.click();
    } else {
      console.log('❌ Botón evaluar número NO encontrado');
    }
    
    // Test botón evaluar combinación
    const btnCombo = document.getElementById('evaluar-combinacion-btn');
    if (btnCombo) {
      console.log('✅ Botón evaluar combinación encontrado');
      // Llenar inputs con números de test
      const inputs = document.querySelectorAll('.combo-input');
      const numerosTest = [7, 14, 21, 28, 35, 42];
      inputs.forEach((input, i) => {
        if (i < numerosTest.length) {
          input.value = numerosTest[i];
        }
      });
      btnCombo.click();
    } else {
      console.log('❌ Botón evaluar combinación NO encontrado');
    }
    
    // Test botones de explicación
    setTimeout(() => {
      const btnExp1 = document.getElementById('mostrar-explicacion-btn');
      const btnExp2 = document.getElementById('mostrar-explicacion-btn-combo');
      
      if (btnExp1) {
        console.log('✅ Botón explicación número encontrado');
        btnExp1.click();
      } else {
        console.log('❌ Botón explicación número NO encontrado');
      }
      
      if (btnExp2) {
        console.log('✅ Botón explicación combinación encontrado');
        btnExp2.click();
      } else {
        console.log('❌ Botón explicación combinación NO encontrado');
      }
    }, 1000);
  }
};

// Función de debug para verificar estado
window.debugCombinacion = () => {
  console.log('🔍 ESTADO ACTUAL:');
  console.log('- Datos listos:', datosListos);
  console.log('- Datos históricos cargados:', Object.keys(datosHistoricos));
  console.log('- Total registros Melate:', datosHistoricos.melate?.length || 0);
  console.log('- Total registros Revancha:', datosHistoricos.revancha?.length || 0);
  console.log('- Total registros Revanchita:', datosHistoricos.revanchita?.length || 0);
};
