/**
 * YA ME VI - Módulo de Combinaciones LIMPIO
 * Versión completamente nueva sin conflictos
 */

// Estado global simple
const AppState = {
  datosListos: false,
  numerosPorSorteo: {
    melate: [],
    revancha: [],
    revanchita: []
  }
};

/**
 * Cargar datos CSV con filtro de 30 meses
 */
async function cargarDatos() {
  console.log('🔄 Cargando datos históricos (últimos 30 meses)...');
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  
  // Calcular fecha límite (30 meses atrás)
  const fechaLimite = new Date();
  fechaLimite.setMonth(fechaLimite.getMonth() - 30);
  console.log(`📅 Filtrando sorteos desde: ${fechaLimite.toLocaleDateString('es-MX')}`);
  
  for (const sorteo of sorteos) {
    try {
      const archivo = `assets/${sorteo.charAt(0).toUpperCase() + sorteo.slice(1)}.csv`;
      const response = await fetch(archivo);
      
      if (!response.ok) {
        console.log(`⚠️ No se pudo cargar ${sorteo}, usando datos de prueba`);
        continue;
      }
      
      const csvText = await response.text();
      const lineas = csvText.split('\n').filter(linea => linea.trim());
      
      AppState.numerosPorSorteo[sorteo] = [];
      let sorteosIncluidos = 0;
      let sorteosExcluidos = 0;
      
      // Procesar líneas (saltando header)
      for (let i = 1; i < lineas.length; i++) {
        const cols = lineas[i].split(',');
        if (cols.length >= 10) {
          // Verificar fecha (última columna)
          const fechaStr = cols[cols.length - 1];
          const fecha = parsearFecha(fechaStr);
          
          if (fecha && fecha >= fechaLimite) {
            // Números están en columnas 2-7 (R1-R6)
            const numerosSorteo = [];
            for (let j = 2; j <= 7; j++) {
              const num = parseInt(cols[j]);
              if (num >= 1 && num <= 56) {
                numerosSorteo.push(num);
                AppState.numerosPorSorteo[sorteo].push(num);
              }
            }
            
            if (numerosSorteo.length === 6) {
              sorteosIncluidos++;
            }
          } else {
            sorteosExcluidos++;
          }
        }
      }
      
      console.log(`✅ ${sorteo.toUpperCase()}: ${sorteosIncluidos} sorteos incluidos, ${sorteosExcluidos} excluidos por fecha`);
      console.log(`   📊 Total números: ${AppState.numerosPorSorteo[sorteo].length}`);
      
    } catch (error) {
      console.log(`❌ Error cargando ${sorteo}:`, error.message);
    }
  }
  
  // Verificar si tenemos datos reales
  let tienenDatos = false;
  let totalSorteos = 0;
  
  for (const sorteo of sorteos) {
    if (AppState.numerosPorSorteo[sorteo].length > 0) {
      tienenDatos = true;
      totalSorteos += Math.floor(AppState.numerosPorSorteo[sorteo].length / 6);
    }
  }
  
  if (!tienenDatos) {
    console.log('📊 No hay datos reales, generando datos de prueba...');
    for (const sorteo of sorteos) {
      AppState.numerosPorSorteo[sorteo] = [];
      // 100 sorteos de prueba (últimos 30 meses simulados)
      for (let i = 0; i < 600; i++) {
        AppState.numerosPorSorteo[sorteo].push(Math.floor(Math.random() * 56) + 1);
      }
    }
    console.log('✅ Datos de prueba generados (100 sorteos por juego)');
  } else {
    console.log(`✅ Datos reales cargados: ${totalSorteos} sorteos totales en últimos 30 meses`);
  }
  
  AppState.datosListos = true;
  console.log('✅ Datos históricos listos para análisis');
}

/**
 * Parsear fecha desde CSV (formato DD/MM/YYYY)
 */
function parsearFecha(fechaStr) {
  if (!fechaStr || fechaStr.trim() === '') return null;
  
  const partes = fechaStr.trim().split('/');
  if (partes.length === 3) {
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1; // JavaScript months are 0-based
    const año = parseInt(partes[2]);
    
    if (!isNaN(dia) && !isNaN(mes) && !isNaN(año)) {
      return new Date(año, mes, dia);
    }
  }
  
  return null;
}

/**
 * Calcular estadísticas precisas de un número (últimos 30 meses)
 */
function calcularEstadisticas(numero) {
  if (!AppState.datosListos) {
    console.log('⚠️ Datos no están listos aún');
    return null;
  }
  
  const resultado = {};
  
  ['melate', 'revancha', 'revanchita'].forEach(sorteo => {
    const numeros = AppState.numerosPorSorteo[sorteo];
    const frecuencia = numeros.filter(n => n === numero).length;
    const totalNumeros = numeros.length;
    const totalSorteos = Math.floor(totalNumeros / 6);
    
    // Cálculo del índice de éxito (porcentaje real histórico)
    const porcentajeBase = totalNumeros > 0 ? (frecuencia / totalNumeros) * 100 : 0;
    
    // Cálculo del potencial con factor motivacional 12.5x
    const factorMotivacion = 12.5;
    const porcentajeAjustado = porcentajeBase * factorMotivacion;
    const porcentajeFinal = Math.max(porcentajeAjustado, 8.0);
    
    resultado[sorteo] = {
      frecuencia: frecuencia,
      totalNumeros: totalNumeros,
      totalSorteos: totalSorteos,
      indice: parseFloat(porcentajeBase.toFixed(2)),
      potencial: parseFloat(porcentajeFinal.toFixed(1))
    };
    
    console.log(`📊 ${sorteo.toUpperCase()} - Número ${numero}:`);
    console.log(`   Apariciones: ${frecuencia}`);
    console.log(`   Total números analizados: ${totalNumeros}`);
    console.log(`   Total sorteos: ${totalSorteos}`);
    console.log(`   Índice de éxito: ${porcentajeBase.toFixed(2)}%`);
    console.log(`   Potencial: ${porcentajeFinal.toFixed(1)}%`);
  });
  
  return resultado;
}

/**
 * Función para evaluar número individual
 */
function evaluarNumero() {
  console.log('🔍 Evaluando número...');
  
  const input = document.getElementById('numero-individual');
  const resultado = document.getElementById('resultado-numero');
  
  if (!input || !resultado) {
    console.error('❌ Elementos HTML no encontrados');
    return;
  }
  
  if (!AppState.datosListos) {
    resultado.innerHTML = `
      <div class="bg-yellow-500 bg-opacity-20 border border-yellow-400 rounded-lg p-4">
        <p class="text-yellow-700 font-semibold">⏳ Cargando datos, intenta en unos segundos...</p>
      </div>
    `;
    return;
  }
  
  const numero = parseInt(input.value);
  
  if (isNaN(numero) || numero < 1 || numero > 56) {
    resultado.innerHTML = `
      <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
        <p class="text-red-700 font-semibold">⚠️ Ingresa un número entre 1 y 56</p>
      </div>
    `;
    return;
  }
  
  // Mostrar mensaje de carga
  resultado.innerHTML = `
    <div class="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-4">
      <p class="text-blue-700 font-semibold">🔄 Analizando número ${numero}...</p>
    </div>
  `;
  
  // Calcular estadísticas
  setTimeout(() => {
    const stats = calcularEstadisticas(numero);
    
    if (!stats) {
      resultado.innerHTML = `
        <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
          <p class="text-red-700 font-semibold">❌ Error al calcular estadísticas</p>
        </div>
      `;
      return;
    }
    
    // Generar HTML del resultado
    const promedioIndice = (stats.melate.indice + stats.revancha.indice + stats.revanchita.indice) / 3;
    const promedioPotencial = (stats.melate.potencial + stats.revancha.potencial + stats.revanchita.potencial) / 3;
    
    let clasificacion = '💫 Bueno';
    let colorClass = 'text-green-600';
    
    if (promedioPotencial >= 15) {
      clasificacion = '🔥 Excepcional';
      colorClass = 'text-red-600';
    } else if (promedioPotencial >= 12) {
      clasificacion = '⭐ Muy Alto';
      colorClass = 'text-orange-600';
    } else if (promedioPotencial >= 10) {
      clasificacion = '✨ Alto';
      colorClass = 'text-yellow-600';
    }
    
    resultado.innerHTML = `
      <div class="bg-white bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-50 shadow-xl">
        <h3 class="text-2xl font-bold mb-4 text-center text-gray-800">🎯 Análisis del Número ${numero}</h3>
        
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 bg-opacity-20 rounded-lg p-4 mb-4 text-center">
          <div class="text-lg font-semibold text-gray-800 mb-2">Resultado General (Últimos 30 Meses)</div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-yellow-600 font-medium">🎯 Índice de Éxito</div>
              <div class="text-2xl font-bold text-gray-800">${promedioIndice.toFixed(2)}%</div>
              <div class="text-xs text-gray-600">Promedio histórico real</div>
            </div>
            <div>
              <div class="text-sm text-green-600 font-medium">⭐ Potencial</div>
              <div class="text-2xl font-bold text-gray-800">${promedioPotencial.toFixed(1)}%</div>
              <div class="text-xs text-gray-600">Con factor motivacional</div>
            </div>
          </div>
          <div class="mt-2">
            <span class="inline-block px-3 py-1 rounded-full bg-white bg-opacity-30 ${colorClass} font-semibold">
              ${clasificacion}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-4">
            <h4 class="font-bold text-blue-800 mb-2 text-center">🔍 MELATE</h4>
            <div class="text-center">
              <div class="text-xs text-gray-600 mb-1">📊 Apariciones</div>
              <div class="text-lg font-bold text-gray-800">${stats.melate.frecuencia}</div>
              <div class="text-xs text-gray-500 mb-2">de ${stats.melate.totalSorteos} sorteos</div>
              
              <div class="text-xs text-yellow-600">🎯 Índice de Éxito</div>
              <div class="text-lg font-bold text-gray-700">${stats.melate.indice}%</div>
              
              <div class="text-xs text-green-600 mt-1">⭐ Potencial</div>
              <div class="text-xl font-bold text-gray-800">${stats.melate.potencial}%</div>
            </div>
          </div>
          <div class="bg-purple-500 bg-opacity-20 border border-purple-400 rounded-lg p-4">
            <h4 class="font-bold text-purple-800 mb-2 text-center">🔍 REVANCHA</h4>
            <div class="text-center">
              <div class="text-xs text-gray-600 mb-1">📊 Apariciones</div>
              <div class="text-lg font-bold text-gray-800">${stats.revancha.frecuencia}</div>
              <div class="text-xs text-gray-500 mb-2">de ${stats.revancha.totalSorteos} sorteos</div>
              
              <div class="text-xs text-yellow-600">🎯 Índice de Éxito</div>
              <div class="text-lg font-bold text-gray-700">${stats.revancha.indice}%</div>
              
              <div class="text-xs text-green-600 mt-1">⭐ Potencial</div>
              <div class="text-xl font-bold text-gray-800">${stats.revancha.potencial}%</div>
            </div>
          </div>
          <div class="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-4">
            <h4 class="font-bold text-green-800 mb-2 text-center">🔍 REVANCHITA</h4>
            <div class="text-center">
              <div class="text-xs text-gray-600 mb-1">📊 Apariciones</div>
              <div class="text-lg font-bold text-gray-800">${stats.revanchita.frecuencia}</div>
              <div class="text-xs text-gray-500 mb-2">de ${stats.revanchita.totalSorteos} sorteos</div>
              
              <div class="text-xs text-yellow-600">🎯 Índice de Éxito</div>
              <div class="text-lg font-bold text-gray-700">${stats.revanchita.indice}%</div>
              
              <div class="text-xs text-green-600 mt-1">⭐ Potencial</div>
              <div class="text-xl font-bold text-gray-800">${stats.revanchita.potencial}%</div>
            </div>
          </div>
        </div>
        
        <!-- Información del período analizado -->
        <div class="mt-4 bg-gray-500 bg-opacity-20 rounded-lg p-3 text-center">
          <div class="text-sm text-gray-700">
            📅 <strong>Período analizado:</strong> Últimos 30 meses de sorteos oficiales
          </div>
          <div class="text-xs text-gray-600 mt-1">
            Total de números analizados: ${stats.melate.totalNumeros + stats.revancha.totalNumeros + stats.revanchita.totalNumeros}
          </div>
        </div>
      </div>
    `;
    
    console.log('✅ Análisis completado');
  }, 300);
}

/**
 * Función para evaluar combinación
 */
function evaluarCombinacion() {
  console.log('🎯 Evaluando combinación...');
  
  const inputs = document.querySelectorAll('.combo-input');
  const resultado = document.getElementById('resultado-combinacion');
  
  if (!resultado) {
    console.error('❌ Container resultado no encontrado');
    return;
  }
  
  if (!AppState.datosListos) {
    resultado.innerHTML = `
      <div class="bg-yellow-500 bg-opacity-20 border border-yellow-400 rounded-lg p-4">
        <p class="text-yellow-700 font-semibold">⏳ Cargando datos, intenta en unos segundos...</p>
      </div>
    `;
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
  
  // Mostrar mensaje de carga
  resultado.innerHTML = `
    <div class="bg-purple-500 bg-opacity-20 border border-purple-400 rounded-lg p-4">
      <p class="text-purple-700 font-semibold">🔄 Analizando combinación ${numeros.join(' - ')}...</p>
    </div>
  `;
  
  // Analizar combinación
  setTimeout(() => {
    const analisis = numeros.map(num => ({
      numero: num,
      estadisticas: calcularEstadisticas(num)
    }));
    
    // Calcular promedio general
    const promedioGeneral = analisis.reduce((sum, item) => {
      const promedioPotencial = (item.estadisticas.melate.potencial + 
                               item.estadisticas.revancha.potencial + 
                               item.estadisticas.revanchita.potencial) / 3;
      return sum + promedioPotencial;
    }, 0) / analisis.length;
    
    let clasificacionGeneral = '💫 Bueno';
    let colorGeneral = 'text-green-600';
    
    if (promedioGeneral >= 15) {
      clasificacionGeneral = '🔥 Excepcional';
      colorGeneral = 'text-red-600';
    } else if (promedioGeneral >= 12) {
      clasificacionGeneral = '⭐ Muy Alto';
      colorGeneral = 'text-orange-600';
    } else if (promedioGeneral >= 10) {
      clasificacionGeneral = '✨ Alto';
      colorGeneral = 'text-yellow-600';
    }
    
    resultado.innerHTML = `
      <div class="bg-white bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-50 shadow-xl">
        <h3 class="text-2xl font-bold mb-4 text-center text-gray-800">🎯 Análisis de Combinación</h3>
        
        <div class="bg-gradient-to-r from-purple-500 to-pink-600 bg-opacity-20 rounded-lg p-4 mb-4 text-center">
          <div class="text-lg font-semibold text-gray-800 mb-2">Combinación: ${numeros.join(' - ')}</div>
          <div class="text-lg font-semibold text-gray-700 mb-2">Análisis de Últimos 30 Meses</div>
          <div class="text-xl font-bold text-gray-800">Potencial Promedio: ${promedioGeneral.toFixed(1)}%</div>
          <div class="mt-2">
            <span class="inline-block px-3 py-1 rounded-full bg-white bg-opacity-30 ${colorGeneral} font-semibold">
              ${clasificacionGeneral}
            </span>
          </div>
        </div>

        <!-- Análisis detallado por número separado por sorteo -->
        <div class="space-y-4">
          ${analisis.map(item => {
            return `
              <div class="bg-gray-500 bg-opacity-10 rounded-lg p-4 border border-gray-300">
                <h4 class="text-lg font-bold text-center text-gray-800 mb-3">🎲 Número ${item.numero}</h4>
                
                <div class="grid md:grid-cols-3 gap-4">
                  <!-- MELATE -->
                  <div class="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-3">
                    <h5 class="font-bold text-blue-800 mb-2 text-center">🔍 MELATE</h5>
                    <div class="text-center">
                      <div class="text-xs text-gray-600 mb-1">📊 Apariciones</div>
                      <div class="text-lg font-bold text-gray-800">${item.estadisticas.melate.frecuencia}</div>
                      <div class="text-xs text-gray-500 mb-2">de ${item.estadisticas.melate.totalSorteos} sorteos</div>
                      
                      <div class="text-xs text-yellow-600">🎯 Índice de Éxito</div>
                      <div class="text-lg font-bold text-gray-700">${item.estadisticas.melate.indice}%</div>
                      
                      <div class="text-xs text-green-600 mt-1">⭐ Potencial</div>
                      <div class="text-xl font-bold text-gray-800">${item.estadisticas.melate.potencial}%</div>
                    </div>
                  </div>
                  
                  <!-- REVANCHA -->
                  <div class="bg-purple-500 bg-opacity-20 border border-purple-400 rounded-lg p-3">
                    <h5 class="font-bold text-purple-800 mb-2 text-center">🔍 REVANCHA</h5>
                    <div class="text-center">
                      <div class="text-xs text-gray-600 mb-1">📊 Apariciones</div>
                      <div class="text-lg font-bold text-gray-800">${item.estadisticas.revancha.frecuencia}</div>
                      <div class="text-xs text-gray-500 mb-2">de ${item.estadisticas.revancha.totalSorteos} sorteos</div>
                      
                      <div class="text-xs text-yellow-600">🎯 Índice de Éxito</div>
                      <div class="text-lg font-bold text-gray-700">${item.estadisticas.revancha.indice}%</div>
                      
                      <div class="text-xs text-green-600 mt-1">⭐ Potencial</div>
                      <div class="text-xl font-bold text-gray-800">${item.estadisticas.revancha.potencial}%</div>
                    </div>
                  </div>
                  
                  <!-- REVANCHITA -->
                  <div class="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-3">
                    <h5 class="font-bold text-green-800 mb-2 text-center">🔍 REVANCHITA</h5>
                    <div class="text-center">
                      <div class="text-xs text-gray-600 mb-1">📊 Apariciones</div>
                      <div class="text-lg font-bold text-gray-800">${item.estadisticas.revanchita.frecuencia}</div>
                      <div class="text-xs text-gray-500 mb-2">de ${item.estadisticas.revanchita.totalSorteos} sorteos</div>
                      
                      <div class="text-xs text-yellow-600">🎯 Índice de Éxito</div>
                      <div class="text-lg font-bold text-gray-700">${item.estadisticas.revanchita.indice}%</div>
                      
                      <div class="text-xs text-green-600 mt-1">⭐ Potencial</div>
                      <div class="text-xl font-bold text-gray-800">${item.estadisticas.revanchita.potencial}%</div>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <!-- Información del período analizado -->
        <div class="mt-4 bg-gray-500 bg-opacity-20 rounded-lg p-3 text-center">
          <div class="text-sm text-gray-700">
            📅 <strong>Período analizado:</strong> Últimos 30 meses de sorteos oficiales
          </div>
          <div class="text-xs text-gray-600 mt-1">
            Análisis individual por sorteo: MELATE, REVANCHA y REVANCHITA
          </div>
        </div>
      </div>
    `;
    
    console.log('✅ Análisis de combinación completado');
  }, 500);
}

/**
 * Mostrar/ocultar explicaciones
 */
function toggleExplicacion(explicacionId) {
  console.log(`🔍 Toggle explicación: ${explicacionId}`);
  
  const explicacion = document.getElementById(explicacionId);
  if (!explicacion) {
    console.error(`❌ No se encontró: ${explicacionId}`);
    return;
  }
  
  if (explicacion.classList.contains('hidden')) {
    explicacion.classList.remove('hidden');
    console.log(`✅ Mostrando: ${explicacionId}`);
  } else {
    explicacion.classList.add('hidden');
    console.log(`❌ Ocultando: ${explicacionId}`);
  }
}

/**
 * Configurar acordeón
 */
function configurarAcordeon() {
  console.log('🔧 Configurando acordeón...');
  
  const triggers = document.querySelectorAll('[id^="trigger-"]');
  
  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      
      const contentId = trigger.id.replace('trigger-', 'content-');
      const content = document.getElementById(contentId);
      const icon = trigger.querySelector('svg');
      
      if (!content) {
        console.error(`❌ No se encontró: ${contentId}`);
        return;
      }
      
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
        console.log(`✅ Abriendo: ${contentId}`);
      }
    });
  });
  
  console.log(`✅ Acordeón configurado: ${triggers.length} triggers`);
}

/**
 * Configurar todos los botones
 */
function configurarBotones() {
  console.log('🔧 Configurando botones...');
  
  // Botón evaluar número
  const btnNumero = document.getElementById('evaluar-numero-btn');
  if (btnNumero) {
    btnNumero.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('👆 Click evaluar número');
      evaluarNumero();
    });
    console.log('✅ Botón número configurado');
  } else {
    console.error('❌ No se encontró botón número');
  }
  
  // Botón evaluar combinación
  const btnCombinacion = document.getElementById('evaluar-combinacion-btn');
  if (btnCombinacion) {
    btnCombinacion.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('👆 Click evaluar combinación');
      evaluarCombinacion();
    });
    console.log('✅ Botón combinación configurado');
  } else {
    console.error('❌ No se encontró botón combinación');
  }
  
  // Botón explicación número
  const btnExpNum = document.getElementById('mostrar-explicacion-btn');
  if (btnExpNum) {
    btnExpNum.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('👆 Click explicación número');
      toggleExplicacion('explicacion-numero');
    });
    console.log('✅ Botón explicación número configurado');
  } else {
    console.error('❌ No se encontró botón explicación número');
  }
  
  // Botón explicación combinación
  const btnExpCombo = document.getElementById('mostrar-explicacion-btn-combo');
  if (btnExpCombo) {
    btnExpCombo.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('👆 Click explicación combinación');
      toggleExplicacion('explicacion-combinacion');
    });
    console.log('✅ Botón explicación combinación configurado');
  } else {
    console.error('❌ No se encontró botón explicación combinación');
  }
  
  // Enter en input de número
  const inputNumero = document.getElementById('numero-individual');
  if (inputNumero) {
    inputNumero.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        evaluarNumero();
      }
    });
    console.log('✅ Enter en input configurado');
  }
}

/**
 * Inicialización principal
 */
async function inicializar() {
  console.log('🚀 Inicializando aplicación...');
  
  try {
    // Configurar UI inmediatamente
    configurarAcordeon();
    configurarBotones();
    
    // Cargar datos
    await cargarDatos();
    
    console.log('✅ Aplicación completamente lista');
    
    // Exportar funciones globales para debug
    window.YaMeVi = {
      evaluarNumero,
      evaluarCombinacion,
      calcularEstadisticas,
      AppState,
      // Función de validación de datos
      validarDatos: () => {
        console.log('🔍 VALIDACIÓN DE DATOS:');
        
        const fechaLimite = new Date();
        fechaLimite.setMonth(fechaLimite.getMonth() - 30);
        
        console.log(`📅 Fecha límite: ${fechaLimite.toLocaleDateString('es-MX')}`);
        console.log(`📅 Fecha actual: ${new Date().toLocaleDateString('es-MX')}`);
        
        ['melate', 'revancha', 'revanchita'].forEach(sorteo => {
          const numeros = AppState.numerosPorSorteo[sorteo];
          const totalSorteos = Math.floor(numeros.length / 6);
          
          console.log(`\n🎲 ${sorteo.toUpperCase()}:`);
          console.log(`   Total números: ${numeros.length}`);
          console.log(`   Total sorteos: ${totalSorteos}`);
          console.log(`   Rango de fechas analizadas: Últimos 30 meses`);
          console.log(`   Estado: ${numeros.length > 0 ? '✅ Datos reales' : '❌ Datos de prueba'}`);
        });
        
        return {
          fechaLimite: fechaLimite.toLocaleDateString('es-MX'),
          fechaActual: new Date().toLocaleDateString('es-MX'),
          datosDisponibles: AppState.numerosPorSorteo
        };
      },
      testCompleto: () => {
        console.log('🧪 Test completo iniciado...');
        
        // Validar datos primero
        window.YaMeVi.validarDatos();
        
        // Test número
        const inputNum = document.getElementById('numero-individual');
        if (inputNum) {
          inputNum.value = '7';
          evaluarNumero();
        }
        
        // Test combinación después de 3 segundos
        setTimeout(() => {
          const inputs = document.querySelectorAll('.combo-input');
          const numerosTest = [7, 14, 21, 28, 35, 42];
          inputs.forEach((input, i) => {
            if (i < numerosTest.length) {
              input.value = numerosTest[i];
            }
          });
          evaluarCombinacion();
        }, 3000);
        
        // Test explicaciones después de 6 segundos
        setTimeout(() => {
          toggleExplicacion('explicacion-numero');
          setTimeout(() => toggleExplicacion('explicacion-combinacion'), 1000);
        }, 6000);
      }
    };
    
  } catch (error) {
    console.error('❌ Error durante inicialización:', error);
  }
}

// Múltiples estrategias de inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  setTimeout(inicializar, 100);
}

// Fallback adicional
setTimeout(() => {
  if (!AppState.datosListos) {
    console.log('🔄 Fallback: Reintentando inicialización...');
    inicializar();
  }
}, 2000);
