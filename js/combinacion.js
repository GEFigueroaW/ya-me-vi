/**
 * YA ME VI - Combinación Module
 * Módulo para evaluar números individuales y combinaciones de lotería
 * Integra con dataParser.js para análisis estadístico
 */

// Variables globales
let datosHistoricos = {};
let numerosPorSorteo = {
  melate: [],
  revancha: [],
  revanchita: []
};

/**
 * Función para cargar datos CSV directamente
 * Detecta automáticamente el formato y filtra por últimos 36 meses
 */
async function cargarDatosCSV() {
  const sorteos = ['melate', 'revancha', 'revanchita'];
  let datosRealesCargados = false;
  
                <div class="text-center mt-2">
          <div class="text-xs text-yellow-800 font-semibold">🎯 Índice de éxito</div>
          <div class="text-lg font-bold text-gray-900">${indicePorSorteo[sorteo].porcentaje.toFixed(2)}%</div>
          <div class="inline-block px-2 py-1 rounded-full ${clasificacion.bgColor} ${clasificacion.color} text-xs mb-1">
            ${clasificacion.categoria}
          </div>
          <div class="text-xs text-gray-900">${analisis.porSorteo[sorteo].frecuencia} apariciones</div>
        </div>nitialize arrays to ensure clean state
  numerosPorSorteo = {
    melate: [],
    revancha: [],
    revanchita: []
  };
  
  let estadisticasCarga = {
    melate: { cargado: false, sorteos: 0, error: null },
    revancha: { cargado: false, sorteos: 0, error: null },
    revanchita: { cargado: false, sorteos: 0, error: null }
  };
  
  console.log('🔄 Intentando cargar datos históricos reales...');
  
  for (const sorteo of sorteos) {
    try {
      const archivoCSV = {
        melate: 'assets/Melate.csv',
        revancha: 'assets/Revancha.csv',
        revanchita: 'assets/Revanchita.csv'
      };
      
      console.log(`📊 Cargando ${archivoCSV[sorteo]}...`);
      const response = await fetch(archivoCSV[sorteo]);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      
      if (lines.length <= 1) {
        throw new Error('Archivo CSV vacío o solo con encabezados');
      }
      
      console.log(`📄 Primeras líneas de ${sorteo}:`);
      console.log(`Header: ${lines[0]}`);
      console.log(`Line 1: ${lines[1]}`);
      
      // Detectar formato del CSV de manera más flexible
      const header = lines[0].toLowerCase();
      let formatoDetectado = '';
      
      if (header.includes(',r1,r2,r3,r4,r5,r6') || header.includes(',f1,f2,f3,f4,f5,f6')) {
        formatoDetectado = 'historico_real';
      } else {
        throw new Error(`Formato de CSV no reconocido para ${sorteo}`);
      }
      
      console.log(`🔍 Formato detectado para ${sorteo}: ${formatoDetectado}`);
      
      const numeros = [];
      let sorteosValidos = 0;
      // Ampliar fecha límite a 42 meses para incluir más datos históricos
      const fechaActual = new Date();
      const fechaLimite = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 36, fechaActual.getDate());
      console.log(`📅 Filtrando sorteos desde: ${fechaLimite.toLocaleDateString()} para ${sorteo}`);
      
      // Procesar líneas según el formato
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',');
        let numerosLinea = [];
        let lineaValida = true;
        let fechaSorteo = null;
        
        if (formatoDetectado === 'historico_real') {
          // Procesar según el tipo de sorteo
          const resultado = procesarLineaHistorica(sorteo, cols, fechaLimite);
          if (resultado.valida) {
            numerosLinea = resultado.numeros;
            fechaSorteo = resultado.fecha;
          } else {
            lineaValida = false;
          }
        }
        
        if (lineaValida && numerosLinea.length === 6) {
          numeros.push(...numerosLinea);
          sorteosValidos++;
        } else {
          if (formatoDetectado === 'historico_real' && fechaSorteo && fechaSorteo >= fechaLimite) {
            console.warn(`⚠️ Línea ${i + 1} inválida en ${archivoCSV[sorteo]}: ${line}`);
          }
        }
      }
      
      if (numeros.length > 0) {
        // Ensure we create a new array for each sorteo to avoid reference issues
        numerosPorSorteo[sorteo] = [...numeros];
        estadisticasCarga[sorteo] = {
          cargado: true,
          sorteos: sorteosValidos,
          totalNumeros: numeros.length,
          formato: formatoDetectado,
          error: null
        };
        datosRealesCargados = true;
        console.log(`✅ ${sorteo}: ${sorteosValidos} sorteos cargados (${numeros.length} números) - Formato: ${formatoDetectado}`);
      } else {
        throw new Error('No se encontraron números válidos en el archivo');
      }
      
    } catch (error) {
      console.error(`❌ Error cargando ${sorteo}:`, error.message);
      estadisticasCarga[sorteo].error = error.message;
    }
  }
  
  // Mostrar resumen de carga
  mostrarResumenCarga(estadisticasCarga);
  
  if (!datosRealesCargados) {
    console.log('🔄 Generando datos de prueba...');
    inicializarDatosPrueba();
  }
  
  return {
    datosReales: datosRealesCargados,
    estadisticas: estadisticasCarga,
    totalSorteos: Object.values(estadisticasCarga).reduce((sum, e) => sum + (e.sorteos || 0), 0)
  };
}

/**
 * Procesar línea histórica según el formato específico de cada sorteo
 */
function procesarLineaHistorica(sorteo, cols, fechaLimite) {
  let numerosLinea = [];
  let fechaSorteo = null;
  
  // El formato es el mismo para Melate, Revancha y Revanchita
  // Melate: 11 columnas, Revancha/Revanchita: 10 columnas
  const esMelate = sorteo === 'melate' && cols.length >= 11;
  const esRevancha = (sorteo === 'revancha' || sorteo === 'revanchita') && cols.length >= 10;

  if (!esMelate && !esRevancha) {
    return { valida: false };
  }

  const fechaStr = esMelate ? cols[10].trim() : cols[9].trim();
  fechaSorteo = parsearFecha(fechaStr);

  if (fechaSorteo && fechaSorteo < fechaLimite) {
    return { valida: false };
  }

  // Los números siempre están en las columnas 2 a 7
  for (let j = 2; j <= 7; j++) {
    const num = parseInt(cols[j]);
    if (isNaN(num) || num < 1 || num > 56) {
      return { valida: false };
    }
    numerosLinea.push(num);
  }

  if (numerosLinea.length !== 6) {
    return { valida: false };
  }

  return {
    valida: true,
    numeros: numerosLinea,
    fecha: fechaSorteo
  };
}

/**
 * Parsear fecha en formato DD/MM/YYYY
 */
function parsearFecha(fechaStr) {
  if (!fechaStr) return null;
  
  const partesFecha = fechaStr.split('/');
  if (partesFecha.length === 3) {
    const dia = parseInt(partesFecha[0]);
    const mes = parseInt(partesFecha[1]) - 1; // Mes base 0
    const año = parseInt(partesFecha[2]);
    return new Date(año, mes, dia);
  }
  
  return null;
}

/**
 * Mostrar resumen de carga de datos
 */
function mostrarResumenCarga(estadisticasCarga) {
  console.log('\n📋 RESUMEN DE CARGA DE DATOS:');
  console.log('═══════════════════════════════════');
  
  const archivosReales = Object.values(estadisticasCarga).filter(e => e.cargado).length;
  
  if (archivosReales > 0) {
    console.log(`✅ DATOS HISTÓRICOS REALES CARGADOS (${archivosReales}/3 archivos)`);
    Object.entries(estadisticasCarga).forEach(([sorteo, stats]) => {
      if (stats.cargado) {
        const periodo = stats.formato === 'historico_real' ? ' - Últimos 30 meses' : '';
        console.log(`   📊 ${sorteo.toUpperCase()}: ${stats.sorteos} sorteos históricos (${stats.formato}${periodo})`);
        // Verificar si hay datos suficientes
        if (stats.totalNumeros < 100) {
          console.warn(`   ⚠️ ${sorteo.toUpperCase()}: Pocos datos disponibles (${stats.totalNumeros} números)`);
        }
      } else {
        console.error(`   ❌ ${sorteo.toUpperCase()}: ${stats.error || 'No disponible'}`);
        // Proporcionar información adicional en caso de error con Revanchita
        if (sorteo === 'revanchita') {
          console.log(`   💡 Sugerencia para ${sorteo}: Verificar que el archivo CSV tiene el formato correcto.`);
          console.log(`      El formato esperado es: NPRODUCTO,CONCURSO,F1,F2,F3,F4,F5,F6,BOLSA,FECHA`);
        }
      }
    });
    
    // Mostrar estadísticas de distribución
    console.log('\n🔢 ANÁLISIS DE DISTRIBUCIÓN:');
    Object.entries(estadisticasCarga).forEach(([sorteo, stats]) => {
      if (stats.cargado) {
        // Verificar que hay datos para el análisis
        if (numerosPorSorteo[sorteo] && numerosPorSorteo[sorteo].length > 0) {
          const analisisDistribucion = analizarDistribucion(numerosPorSorteo[sorteo]);
          console.log(`   🎲 ${sorteo.toUpperCase()}: ${analisisDistribucion.numerosUnicos} números únicos (freq: ${analisisDistribucion.minFrecuencia}-${analisisDistribucion.maxFrecuencia})`);
        } else {
          console.warn(`   ⚠️ ${sorteo.toUpperCase()}: No hay datos para análisis de distribución`);
        }
      }
    });
  } else {
    console.log('❌ NO SE CARGARON DATOS REALES');
    console.log('   Usando datos de prueba generados automáticamente');
    console.log('   Para usar datos reales, sigue las instrucciones en:');
    console.log('   📄 GUIA-DATOS-REALES.md');
  }
  
  // Verificar específicamente si hay datos para Revanchita
  if (!estadisticasCarga.revanchita.cargado || !numerosPorSorteo.revanchita || numerosPorSorteo.revanchita.length === 0) {
    console.log('\n🚨 ATENCIÓN: Datos de Revanchita no disponibles o insuficientes.');
    console.log('   Se utilizarán datos de fallback para los cálculos de Revanchita.');
  }
  
  console.log('═══════════════════════════════════\n');
  
  // Validación final de datos para asegurar que todos los arrays están inicializados
  ['melate', 'revancha', 'revanchita'].forEach(sorteo => {
    if (!numerosPorSorteo[sorteo]) {
      console.warn(`⚠️ Inicializando array vacío para ${sorteo}`);
      numerosPorSorteo[sorteo] = [];
    }
  });
}

/**
 * Analizar distribución de números
 */
function analizarDistribucion(numeros) {
  const frecuencias = {};
  
  numeros.forEach(num => {
    frecuencias[num] = (frecuencias[num] || 0) + 1;
  });
  
  const numerosUnicos = Object.keys(frecuencias).length;
  const maxFrecuencia = Math.max(...Object.values(frecuencias));
  const minFrecuencia = Math.min(...Object.values(frecuencias));
  
  return { numerosUnicos, maxFrecuencia, minFrecuencia };
}

/**
 * Inicializar datos de prueba como fallback
 */
function inicializarDatosPrueba() {
  for (let sorteo of ['melate', 'revancha', 'revanchita']) {
    const numeros = [];
    
    // Generar datos más realistas basados en patrones de lotería
    for (let numero = 1; numero <= 56; numero++) {
      // Simular frecuencias más realistas: algunos números salen más que otros
      let apariciones;
      if (numero <= 14) {
        apariciones = Math.floor(Math.random() * 8) + 12; // Números bajos: 12-19
      } else if (numero <= 28) {
        apariciones = Math.floor(Math.random() * 6) + 8;  // Números medios: 8-13
      } else if (numero <= 42) {
        apariciones = Math.floor(Math.random() * 8) + 10; // Números altos: 10-17
      } else {
        apariciones = Math.floor(Math.random() * 5) + 6;  // Números muy altos: 6-10
      }
      
      for (let i = 0; i < apariciones; i++) {
        numeros.push(numero);
      }
    }
    
    // Mezclar el array
    for (let i = numeros.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
    }
    
    numerosPorSorteo[sorteo] = numeros;
  }
}

/**
 * Preparar datos históricos
 */
async function prepararDatosHistoricos() {
  try {
    const resultadoCarga = await cargarDatosCSV();
    
    if (resultadoCarga.datosReales && (numerosPorSorteo.melate.length > 0 || numerosPorSorteo.revancha.length > 0)) {
      // Verificar calidad de los datos
      const calidadDatos = verificarCalidadDatos();
      
      if (calidadDatos.esValido) {
        console.log('✅ Datos históricos validados correctamente');
        console.log(`📊 Análisis de calidad: ${calidadDatos.score}/100 puntos`);
        
        // Mostrar información adicional en la interfaz
        mostrarIndicadorDatosReales(resultadoCarga.estadisticas);
      } else {
        console.warn('⚠️ Calidad de datos por debajo del estándar');
        console.log('💡 Considera actualizar los archivos CSV con más datos');
      }
    } else {
      console.log('🔄 Usando datos de prueba para demostración');
      mostrarIndicadorDatosPrueba();
    }
  } catch (error) {
    console.error('❌ Error preparando datos históricos:', error);
    inicializarDatosPrueba();
    mostrarIndicadorDatosPrueba();
  }
}

/**
 * Verificar calidad de datos
 */
function verificarCalidadDatos() {
  let score = 0;
  let observaciones = [];
  
  ['melate', 'revancha', 'revanchita'].forEach(sorteo => {
    const numeros = numerosPorSorteo[sorteo] || [];
    
    if (numeros.length >= 300) score += 20; // Cantidad suficiente
    else if (numeros.length >= 150) score += 15;
    else if (numeros.length >= 60) score += 10;
    else observaciones.push(`${sorteo}: pocos datos (${numeros.length/6} sorteos)`);
    
    // Verificar distribución
    const distribucion = {};
    numeros.forEach(n => distribucion[n] = (distribucion[n] || 0) + 1);
    
    const valores = Object.values(distribucion);
    const promedio = valores.reduce((a,b) => a+b, 0) / valores.length;
    const varianza = valores.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / valores.length;
    
    if (varianza > 0.5) score += 10; // Buena varianza
    else observaciones.push(`${sorteo}: distribución muy uniforme (posible datos sintéticos)`);
  });
  
  return {
    esValido: score >= 60,
    score,
    observaciones
  };
}

/**
 * Mostrar indicador de datos reales
 */
function mostrarIndicadorDatosReales(estadisticas) {
  // Función desactivada - ya no muestra el indicador verde
  console.log('✅ Datos reales cargados correctamente');
}

/**
 * Mostrar indicador de datos de prueba
 */
function mostrarIndicadorDatosPrueba() {
  // Función desactivada - ya no muestra el indicador naranja
  console.log('🔄 Usando datos de prueba para demostración');
}

/**
 * Calcular frecuencia por sorteo
 */
function calcularFrecuenciaPorSorteo(num) {
  const resultados = {};
  
  ['melate', 'revancha', 'revanchita'].forEach(sorteo => {
    const numeros = numerosPorSorteo[sorteo] || [];
    const frecuencia = numeros.filter(n => n === num).length;
    const total = numeros.length;
    
    // Calcular porcentaje base
    const porcentajeBase = total > 0 ? (frecuencia / total) * 100 : 0;
    
    // Usar el porcentaje base sin factores matemáticos
    const porcentajeFinal = Math.max(porcentajeBase, 2.0); // Mínimo 2% para permitir más variación
    
    resultados[sorteo] = {
      frecuencia: frecuencia,
      total: total,
      porcentaje: porcentajeFinal
    };
  });
  
  return resultados;
}

/**
 * Calcular índice real (sin factor 12.5x) por sorteo
 */
function calcularIndicePorSorteo(num) {
  const resultados = {};
  ['melate', 'revancha', 'revanchita'].forEach(sorteo => {
    const numeros = numerosPorSorteo[sorteo] || [];
    const frecuencia = numeros.filter(n => n === num).length;
    const total = numeros.length;
    const porcentajeBase = total > 0 ? (frecuencia / total) * 100 : 0;
    
    resultados[sorteo] = {
      frecuencia: frecuencia,
      total: total,
      porcentaje: porcentajeBase
    };
  });
  return resultados;
}

/**
 * Calcular frecuencia total de un número
 */
function calcularFrecuenciaTotal(num) {
  let total = 0;
  ['melate', 'revancha', 'revanchita'].forEach(sorteo => {
    const numeros = numerosPorSorteo[sorteo] || [];
    total += numeros.filter(n => n === num).length;
  });
  return total;
}

/**
 * Calcular porcentaje total
 */
function calcularPorcentajeTotal(num) {
  let totalNumeros = 0;
  let frecuenciaTotal = 0;
  
  ['melate', 'revancha', 'revanchita'].forEach(sorteo => {
    const numeros = numerosPorSorteo[sorteo] || [];
    totalNumeros += numeros.length;
    const frecuenciaSorteo = numeros.filter(n => n === num).length;
    frecuenciaTotal += frecuenciaSorteo;
  });
  
  // Cálculo base sin factores matemáticos
  const porcentajeBase = totalNumeros > 0 ? (frecuenciaTotal / totalNumeros) * 100 : 0;
  const porcentajeAjustado = porcentajeBase;
  
  // Asegurar que ningún número tenga menos de 2% (reducido de 8% para permitir más variación)
  const porcentajeFinal = Math.max(porcentajeAjustado, 2.0);
  
  return porcentajeFinal;
}

/**
 * Clasificar probabilidad según rangos definidos
 */
function clasificarProbabilidad(porcentaje) {
  // Rangos ajustados con colores de alto contraste para mejor legibilidad
  if (porcentaje >= 30) return { 
    categoria: 'Excepcional', 
    color: 'text-green-800 font-bold', 
    bgColor: 'bg-green-100', 
    emoji: '🔥' 
  };
  if (porcentaje >= 25) return { 
    categoria: 'Muy Alta', 
    color: 'text-green-900 font-bold', 
    bgColor: 'bg-green-50', 
    emoji: '⚡' 
  };
  if (porcentaje >= 20) return { 
    categoria: 'Alta', 
    color: 'text-blue-900 font-bold', 
    bgColor: 'bg-blue-50', 
    emoji: '📈' 
  };
  if (porcentaje >= 16) return { 
    categoria: 'Buena', 
    color: 'text-yellow-900 font-bold', 
    bgColor: 'bg-yellow-100', 
    emoji: '⚖️' 
  };
  if (porcentaje >= 12) return { 
    categoria: 'Moderada', 
    color: 'text-orange-900 font-bold', 
    bgColor: 'bg-orange-100', 
    emoji: '🎲' 
  };
  if (porcentaje >= 10) return { 
    categoria: 'Aceptable', 
    color: 'text-purple-900 font-bold', 
    bgColor: 'bg-purple-100', 
    emoji: '🎯' 
  };
  if (porcentaje >= 8) return { 
    categoria: 'Baja', 
    color: 'text-cyan-900 font-bold', 
    bgColor: 'bg-cyan-100', 
    emoji: '💫' 
  };
  return { 
    categoria: 'Muy Baja', 
    color: 'text-gray-900 font-bold', 
    bgColor: 'bg-gray-100', 
    emoji: '✨' 
  };
}

/**
 * Generar HTML para análisis de combinación por sorteo
 */
function generarHtmlAnalisisSorteo(analisisIndividual, sorteo, colorClass, borderClass) {
  return analisisIndividual.map(analisis => {
    const clasificacion = clasificarProbabilidad(analisis.porSorteo[sorteo].porcentaje);
    const indicePorSorteo = calcularIndicePorSorteo(analisis.numero);
    return `
      <div class="${colorClass} bg-opacity-20 rounded-lg p-3 border ${borderClass}">
        <div class="flex items-center justify-between">
          <div class="text-xl font-bold text-gray-800">${analisis.numero}</div>
          <div class="text-sm">
            ${clasificacion.emoji}
          </div>
        </div>
        <div class="text-center mt-2">
          <div class="text-xs text-yellow-600 font-medium">🎯 Índice de éxito</div>
          <div class="text-lg font-bold text-gray-800">${indicePorSorteo[sorteo].porcentaje.toFixed(2)}%</div>
          <div class="inline-block px-2 py-1 rounded-full ${clasificacion.bgColor} ${clasificacion.color} text-xs mb-1">
            ${clasificacion.categoria}
          </div>
          <div class="text-xs text-gray-600">${analisis.porSorteo[sorteo].frecuencia} apariciones</div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Generar mensaje de suerte para combinación
 */
function generarMensajeSuerte(clasificaciones) {
  const excepcionales = clasificaciones.filter(c => c.categoria === 'Excepcional' || c.categoria === 'Muy Alta').length;
  const altas = clasificaciones.filter(c => c.categoria === 'Alta' || c.categoria === 'Buena').length;
  
  if (excepcionales >= 2) {
    return '🌟 ¡Extraordinario! Tu combinación tiene múltiples sorteos con potencial excepcional. ¡Las estrellas se alinean para ti!';
  } else if (altas >= 2) {
    return '🍀 ¡Fantástica elección! Tu combinación muestra gran potencial en múltiples sorteos.';
  } else {
    return '✨ ¡Excelente! Tu combinación está cargada de energía positiva en todos los sorteos!';
  }
}

// Exportar funciones principales para uso en el módulo
export {
  prepararDatosHistoricos,
  calcularFrecuenciaPorSorteo,
  calcularIndicePorSorteo,
  calcularFrecuenciaTotal,
  calcularPorcentajeTotal,
  clasificarProbabilidad,  
  generarHtmlAnalisisSorteo,
  generarMensajeSuerte
};

/**
 * Inicialización cuando se carga el DOM
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando módulo de combinaciones...');
  
  setTimeout(() => {
    // Inicializar acordeones con un pequeño retraso para asegurar que el DOM esté listo
    console.log('Inicializando acordeones...');
    inicializarAcordeones();
    
    // Inicializar evaluadores
    console.log('Inicializando evaluadores...');
    inicializarEvaluadores();
    
    // Cargar datos históricos
    console.log('Preparando datos históricos...');
    prepararDatosHistoricos();
    
    // Exponer funciones al ámbito global para acceso desde script inline
    console.log('Exponiendo funciones globalmente...');
    window.evaluarNumeroIndividual = evaluarNumeroIndividual;
    window.evaluarCombinacion = evaluarCombinacion;
  }, 100);
});

/**
 * Inicializar funcionalidad de acordeones
 */
function inicializarAcordeones() {
  // Acordeón para número individual
  const triggerNumero = document.getElementById('trigger-numero-individual');
  const contentNumero = document.getElementById('content-numero-individual');
  
  // Acordeón para combinación
  const triggerCombinacion = document.getElementById('trigger-combinacion');
  const contentCombinacion = document.getElementById('content-combinacion');
  
  console.log('Elementos de acordeón encontrados:', {
    triggerNumero: !!triggerNumero, 
    contentNumero: !!contentNumero,
    triggerCombinacion: !!triggerCombinacion,
    contentCombinacion: !!contentCombinacion
  });
  
  // Función para cerrar todas las cajas
  const cerrarTodasLasCajas = () => {
    if (contentNumero) {
      contentNumero.classList.add('hidden');
      const arrowNumero = triggerNumero.querySelector('svg');
      if (arrowNumero) arrowNumero.style.transform = 'rotate(0deg)';
    }
    
    if (contentCombinacion) {
      contentCombinacion.classList.add('hidden');
      const arrowCombinacion = triggerCombinacion.querySelector('svg');
      if (arrowCombinacion) arrowCombinacion.style.transform = 'rotate(0deg)';
    }
  };
  
  // Funcionalidad directa para los acordeones
  if (triggerNumero) {
    triggerNumero.onclick = function() {
      console.log('Click en Número de la Suerte');
      const isHidden = contentNumero.classList.contains('hidden');
      const arrow = triggerNumero.querySelector('svg');
      
      if (isHidden) {
        // Cerrar todas las cajas primero
        cerrarTodasLasCajas();
        // Abrir esta caja
        contentNumero.classList.remove('hidden');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
      } else {
        contentNumero.classList.add('hidden');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
      }
    };
  }
  
  if (triggerCombinacion) {
    triggerCombinacion.onclick = function() {
      console.log('Click en Combinación de la Suerte');
      const isHidden = contentCombinacion.classList.contains('hidden');
      const arrow = triggerCombinacion.querySelector('svg');
      
      if (isHidden) {
        // Cerrar todas las cajas primero
        cerrarTodasLasCajas();
        // Abrir esta caja
        contentCombinacion.classList.remove('hidden');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
      } else {
        contentCombinacion.classList.add('hidden');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
      }
    };
  }
  
  console.log('✅ Acordeones inicializados');
}

/**
 * Inicializar evaluadores de números
 */
function inicializarEvaluadores() {
  // Evaluador de número individual
  const btnEvaluarNumero = document.getElementById('evaluar-numero-btn');
  const inputNumero = document.getElementById('numero-individual');
  
  if (btnEvaluarNumero && inputNumero) {
    btnEvaluarNumero.addEventListener('click', function() {
      const numero = parseInt(inputNumero.value);
      if (numero >= 1 && numero <= 56) {
        evaluarNumeroIndividual(numero);
      } else {
        alert('⚠️ Por favor ingresa un número entre 1 y 56');
      }
    });
    
    // Permitir evaluar con Enter
    inputNumero.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        btnEvaluarNumero.click();
      }
    });
  }
  
  // Evaluador de combinación
  const btnEvaluarCombinacion = document.getElementById('evaluar-combinacion-btn');
  const inputsCombinacion = document.querySelectorAll('.combo-input');
  
  if (btnEvaluarCombinacion && inputsCombinacion.length === 6) {
    btnEvaluarCombinacion.addEventListener('click', function() {
      const numeros = [];
      let valido = true;
      
      inputsCombinacion.forEach(input => {
        const num = parseInt(input.value);
        if (isNaN(num) || num < 1 || num > 56) {
          valido = false;
        } else {
          numeros.push(num);
        }
      });
      
      if (valido && numeros.length === 6) {
        // Verificar duplicados
        const numerosUnicos = [...new Set(numeros)];
        if (numerosUnicos.length !== 6) {
          alert('⚠️ No puedes repetir números en tu combinación');
          return;
        }
        
        evaluarCombinacion(numeros);
      } else {
        alert('⚠️ Por favor ingresa 6 números válidos entre 1 y 56');
      }
    });
    
    // Permitir evaluar con Enter en cualquier input
    inputsCombinacion.forEach(input => {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          btnEvaluarCombinacion.click();
        }
      });
    });
  }
  
  console.log('✅ Evaluadores inicializados');
}

/**
 * Evaluar número individual
 */
function evaluarNumeroIndividual(numero) {
  console.log(`🔍 Evaluando número individual: ${numero}`);
  
  const resultadoDiv = document.getElementById('resultado-numero');
  if (!resultadoDiv) return;
  
  // Mostrar indicador de carga
  resultadoDiv.innerHTML = '<div class="text-center py-4"><div class="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div></div>';
  
  setTimeout(() => {
    const analisisPorSorteo = calcularFrecuenciaPorSorteo(numero);
    
    resultadoDiv.innerHTML = `
      <div class="bg-white bg-opacity-80 rounded-xl p-6 shadow-lg">
        <h3 class="text-xl font-bold text-center mb-4 text-gray-800">
          🎯 Análisis del Número ${numero}
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${Object.entries(analisisPorSorteo).map(([sorteo, datos]) => {
            const clasificacion = clasificarProbabilidad(datos.porcentaje);
            const iconos = {
              melate: '🎲',
              revancha: '🍀', 
              revanchita: '🌈'
            };
            
            return `
              <div class="text-center p-4 ${clasificacion.bgColor} rounded-lg border">
                <div class="text-2xl mb-2">${iconos[sorteo]}</div>
                <div class="font-bold text-gray-900 capitalize">${sorteo}</div>
                <div class="text-2xl font-bold ${clasificacion.color} my-2">
                  ${datos.porcentaje.toFixed(2)}%
                </div>
                <div class="text-sm ${clasificacion.color} px-2 py-1 rounded-full ${clasificacion.bgColor} border border-gray-300">
                  ${clasificacion.categoria}
                </div>
                <div class="text-xs text-gray-900 mt-1 font-semibold">
                  ${datos.frecuencia} apariciones
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }, 500);
}

/**
 * Evaluar combinación completa
 */
function evaluarCombinacion(numeros) {
  console.log(`🔍 Evaluando combinación: ${numeros.join(', ')}`);
  
  const resultadoDiv = document.getElementById('resultado-combinacion');
  if (!resultadoDiv) {
    // Crear el div de resultado si no existe
    const contentCombinacion = document.getElementById('content-combinacion');
    if (contentCombinacion) {
      const newDiv = document.createElement('div');
      newDiv.id = 'resultado-combinacion';
      newDiv.className = 'mt-6';
      contentCombinacion.appendChild(newDiv);
    }
  }
  
  const targetDiv = document.getElementById('resultado-combinacion');
  if (!targetDiv) return;
  
  // Mostrar indicador de carga
  targetDiv.innerHTML = '<div class="text-center py-4"><div class="animate-spin inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div></div>';
  
  setTimeout(() => {
    const analisisIndividual = numeros.map(num => ({
      numero: num,
      porSorteo: calcularFrecuenciaPorSorteo(num),
      porcentajeTotal: calcularPorcentajeTotal(num),
      clasificacion: clasificarProbabilidad(calcularPorcentajeTotal(num))
    }));
    
    targetDiv.innerHTML = `
      <div class="bg-white bg-opacity-90 rounded-xl p-6 shadow-lg">
        <h3 class="text-xl font-bold text-center mb-6 text-gray-800">
          🎯 Análisis de tu Combinación
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <!-- Melate -->
          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="text-center font-bold text-blue-800 mb-4">🎲 Melate</h4>
            <div class="grid grid-cols-2 gap-2">
              ${generarHtmlAnalisisSorteo(analisisIndividual, 'melate', 'bg-blue-100', 'border-blue-200')}
            </div>
          </div>
          
          <!-- Revancha -->
          <div class="bg-purple-50 rounded-lg p-4">
            <h4 class="text-center font-bold text-purple-800 mb-4">🍀 Revancha</h4>
            <div class="grid grid-cols-2 gap-2">
              ${generarHtmlAnalisisSorteo(analisisIndividual, 'revancha', 'bg-purple-100', 'border-purple-200')}
            </div>
          </div>
          
          <!-- Revanchita -->
          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="text-center font-bold text-green-800 mb-4">🌈 Revanchita</h4>
            <div class="grid grid-cols-2 gap-2">
              ${generarHtmlAnalisisSorteo(analisisIndividual, 'revanchita', 'bg-green-100', 'border-green-200')}
            </div>
          </div>
        </div>
        
        <div class="text-center p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-yellow-300">
          <h4 class="font-bold text-lg text-gray-800 mb-2">✨ Mensaje de la Suerte</h4>
          <p class="text-gray-700">
            ${generarMensajeSuerte(analisisIndividual.map(a => a.clasificacion))}
          </p>
        </div>
      </div>
    `;
  }, 800);
}

/**
 * Generar mensaje para número individual
 */
function generarMensajeNumeroIndividual(categoria) {
  const mensajes = {
    'Excepcional': '¡Tu número es una verdadera joya! Tiene un historial excepcional.',
    'Muy Alta': '¡Excelente elección! Este número tiene muy buen potencial.',
    'Alta': '¡Buena selección! Tu número muestra buen rendimiento histórico.',
    'Buena': 'Tu número tiene un equilibrio favorable en los sorteos.',
    'Moderada': 'Tu número mantiene una presencia constante en los sorteos.',
    'Aceptable': 'Tu número participa regularmente en las combinaciones ganadoras.',
    'Baja': 'Tu número tiene potencial de sorpresa en futuros sorteos.',
    'Muy Baja': 'Tu número puede ser la clave secreta para una gran sorpresa.'
  };
  
  return mensajes[categoria] || 'Tu número tiene su propia energía especial.';
}
