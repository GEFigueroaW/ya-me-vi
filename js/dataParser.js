export async function cargarDatosHistoricos(modo) {
  console.log('🚀 Iniciando carga de datos históricos para modo:', modo);
  
  // Si el modo es específico, cargar solo ese sorteo
  if (modo === 'melate' || modo === 'revancha' || modo === 'revanchita') {
    console.log('📁 Cargando sorteo individual:', modo);
    return await cargarSorteoIndividual(modo);
  }
  
  // Si el modo es 'todos', cargar los 3 sorteos para comparación
  if (modo === 'todos') {
    console.log('📊 Cargando TODOS los sorteos para comparación');
    return await cargarTodosSorteos();
  }
  
  // Modo por defecto
  console.log('📁 Modo por defecto, cargando Melate');
  return await cargarSorteoIndividual('melate');
}

async function cargarSorteoIndividual(modo) {
  const urls = {
    melate: 'assets/melate.csv',
    revancha: 'assets/revancha.csv',
    revanchita: 'assets/revanchita.csv'
  };

  const archivo = urls[modo];
  console.log('📁 Archivo a cargar:', archivo);
  
  let todosLosDatos = [];
  let todosLosNumeros = [];

  try {
    console.log(`📥 Cargando ${archivo}...`);
    const response = await fetch(archivo);
    if (!response.ok) {
      throw new Error(`Error al cargar ${archivo}: ${response.status}`);
    }
    const texto = await response.text();
    const lineas = texto.trim().split('\n').slice(1); // sin encabezado
    console.log(`📄 ${archivo}: ${lineas.length} líneas procesadas`);

    const nombreSorteo = modo.charAt(0).toUpperCase() + modo.slice(1);
    
    lineas.forEach((linea, index) => {
      const cols = linea.split(',');
      if (cols.length >= 10) { // Nuevo formato: NPRODUCTO,CONCURSO,R1,R2,R3,R4,R5,R6,R7,BOLSA,FECHA
        const nproducto = cols[0];
        const concurso = parseInt(cols[1], 10); // CONCURSO es el número de sorteo
        const fecha = cols[10]; // FECHA está al final
        const numeros = [
          parseInt(cols[2], 10), // R1
          parseInt(cols[3], 10), // R2  
          parseInt(cols[4], 10), // R3
          parseInt(cols[5], 10), // R4
          parseInt(cols[6], 10), // R5
          parseInt(cols[7], 10)  // R6 (ignoramos R7 ya que solo usamos 6 números)
        ];
        
        // Validar que todos los números sean válidos
        if (numeros.every(num => !isNaN(num) && num >= 1 && num <= 56) && !isNaN(concurso)) {
          todosLosDatos.push({
            fecha: fecha,
            numeroSorteo: concurso,
            sorteo: nombreSorteo,
            numeros: numeros
          });
          todosLosNumeros.push(...numeros);
        } else {
          console.warn(`⚠️ Línea ${index + 2} de ${archivo} tiene números inválidos:`, numeros, 'o número de sorteo inválido:', concurso);
        }
      } else {
        console.warn(`⚠️ Formato incorrecto en línea ${index + 2}:`, linea);
      }
    });
  } catch (error) {
    console.error(`❌ Error cargando ${archivo}:`, error);
    throw error;
  }

  console.log(`✅ Carga completada: ${todosLosDatos.length} sorteos, ${todosLosNumeros.length} números`);
  return { datos: todosLosDatos, numeros: todosLosNumeros, modo };
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
      datosPorSorteo[sorteo] = datos;
      
      // Obtener el último sorteo (el más reciente)
      if (datos.datos.length > 0) {
        const ultimoSorteo = datos.datos[datos.datos.length - 1];
        ultimosSorteos[sorteo] = ultimoSorteo;
      }
      
      console.log(`✅ ${sorteo} cargado exitosamente:`, datos.datos.length, 'sorteos');
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
  console.log('🔍 Generando análisis estadístico para cada sorteo...');
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  const colores = {
    melate: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', title: 'text-blue-600' },
    revancha: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', title: 'text-purple-600' },
    revanchita: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', title: 'text-green-600' }
  };
  
  // Definir 4 bloques (1-14, 15-28, 29-42, 43-56)
  const bloques = [
    { inicio: 1, fin: 14, nombre: '1-14' },
    { inicio: 15, fin: 28, nombre: '15-28' },
    { inicio: 29, fin: 42, nombre: '29-42' },
    { inicio: 43, fin: 56, nombre: '43-56' }
  ];
  
  const estadisticasPorSorteo = {};
  
  // Procesar cada sorteo
  sorteos.forEach(sorteo => {
    const datos = datosPorSorteo[sorteo];
    const sorteosDatos = datos.datos || [];
    
    console.log(`📊 Analizando ${sorteo}:`, { 
      totalSorteos: sorteosDatos.length,
      primerSorteo: sorteosDatos[0],
      ultimoSorteo: sorteosDatos[sorteosDatos.length - 1]
    });
    
    if (sorteosDatos.length > 0) {
      // Calcular frecuencia de números (1-56)
      const frecuencia = Array(56).fill(0);
      let totalNumeros = 0;
      
      sorteosDatos.forEach(sorteoData => {
        const numeros = sorteoData.numeros || [];
        console.log(`📋 ${sorteo} - Números en sorteo:`, numeros);
        numeros.forEach(num => {
          if (num >= 1 && num <= 56) {
            frecuencia[num - 1]++;
            totalNumeros++;
          }
        });
      });
      
      console.log(`📊 ${sorteo} - Frecuencias calculadas:`, { 
        totalNumeros, 
        primerasFrec: frecuencia.slice(0, 10),
        maxFrec: Math.max(...frecuencia),
        minFrec: Math.min(...frecuencia)
      });
      
      // Top 10 más frecuentes
      const top10Mas = frecuencia
        .map((freq, i) => ({ numero: i + 1, frecuencia: freq }))
        .sort((a, b) => b.frecuencia - a.frecuencia)
        .slice(0, 10);
      
      // Top 10 menos frecuentes (filtrar los que tienen frecuencia > 0)
      const top10Menos = frecuencia
        .map((freq, i) => ({ numero: i + 1, frecuencia: freq }))
        .filter(item => item.frecuencia > 0) // Solo números que han salido
        .sort((a, b) => a.frecuencia - b.frecuencia)
        .slice(0, 10);
      
      console.log(`📈 ${sorteo} - Top 10 más:`, top10Mas);
      console.log(`📉 ${sorteo} - Top 10 menos:`, top10Menos);
      
      // Análisis por bloques
      const numerosPorBloque = bloques.map(() => []);
      
      sorteosDatos.forEach(sorteoData => {
        const numeros = sorteoData.numeros || [];
        const contadorBloque = Array(4).fill(0);
        
        numeros.forEach(num => {
          bloques.forEach((bloque, index) => {
            if (num >= bloque.inicio && num <= bloque.fin) {
              contadorBloque[index]++;
            }
          });
        });
        
        contadorBloque.forEach((count, index) => {
          numerosPorBloque[index].push(count);
        });
      });
      
      // Calcular estadísticas por bloque
      const estadisticasBloques = bloques.map((bloque, index) => {
        const counts = numerosPorBloque[index];
        const promedio = counts.length > 0 ? counts.reduce((sum, count) => sum + count, 0) / counts.length : 0;
        
        return {
          bloque: bloque.nombre,
          promedio: promedio,
          porcentaje: 0 // Se calculará después para que sume 100%
        };
      });
      
      // Ajustar porcentajes para que sumen exactamente 100% (6 números)
      const totalPromedio = estadisticasBloques.reduce((sum, bloque) => sum + bloque.promedio, 0);
      if (totalPromedio > 0) {
        estadisticasBloques.forEach(bloque => {
          bloque.porcentaje = Math.round((bloque.promedio / totalPromedio) * 100);
          bloque.numerosProbables = Math.round((bloque.promedio / totalPromedio) * 6);
        });
        
        // Asegurar que la suma sea exactamente 6
        const totalNumeros = estadisticasBloques.reduce((sum, bloque) => sum + bloque.numerosProbables, 0);
        if (totalNumeros !== 6) {
          // Ajustar el bloque con mayor promedio
          const bloqueMaximo = estadisticasBloques.reduce((max, bloque) => 
            bloque.promedio > max.promedio ? bloque : max
          );
          bloqueMaximo.numerosProbables += (6 - totalNumeros);
        }
      } else {
        estadisticasBloques.forEach(bloque => {
          bloque.porcentaje = 25; // 25% cada uno si no hay datos
          bloque.numerosProbables = 1; // 1-2 números por bloque
        });
      }
      
      estadisticasPorSorteo[sorteo] = {
        top10Mas,
        top10Menos,
        bloques: estadisticasBloques,
        totalSorteos: sorteosDatos.length
      };
      
      console.log(`✅ ${sorteo} procesado:`, { top10Mas, top10Menos, bloques: estadisticasBloques });
    } else {
      console.warn(`⚠️ No hay datos para ${sorteo}`);
      estadisticasPorSorteo[sorteo] = {
        top10Mas: [],
        top10Menos: [],
        bloques: bloques.map(bloque => ({
          bloque: bloque.nombre,
          promedio: 0,
          porcentaje: 25,
          numerosProbables: 1
        })),
        totalSorteos: 0
      };
    }
  });
  
  // Generar HTML
  const contenedorCharts = document.getElementById('charts-container');
  if (contenedorCharts) {
    let htmlContent = `
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-white mb-2">📊 Análisis Estadístico Completo</h2>
        <p class="text-gray-300">Números más y menos frecuentes + Análisis por bloques</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    `;
    
    sorteos.forEach(sorteo => {
      const stats = estadisticasPorSorteo[sorteo];
      const color = colores[sorteo];
      const nombre = sorteo.charAt(0).toUpperCase() + sorteo.slice(1);
      
      htmlContent += `
        <div class="analisis-transparente rounded-xl p-6 text-white">
          <div class="text-center mb-4">
            <h3 class="text-xl font-bold text-white mb-2">🎲 ${nombre}</h3>
            <p class="text-gray-300 text-sm">${stats.totalSorteos} sorteos analizados</p>
          </div>
          
          <!-- Top 10 MÁS frecuentes -->
          <div class="mb-4">
            <h4 class="text-lg font-semibold text-white mb-2">🔥 Top 10 MÁS frecuentes</h4>
            <div class="grid grid-cols-5 gap-2">
      `;
      
      stats.top10Mas.forEach(item => {
        htmlContent += `
          <div class="analisis-transparente rounded-lg p-2 text-center border border-white border-opacity-30">
            <div class="text-lg font-bold text-white">${item.numero}</div>
            <div class="text-xs text-gray-300">${item.frecuencia}</div>
          </div>
        `;
      });
      
      htmlContent += `
            </div>
          </div>
          
          <!-- Top 10 MENOS frecuentes -->
          <div class="mb-4">
            <h4 class="text-lg font-semibold text-white mb-2">❄️ Top 10 MENOS frecuentes</h4>
            <div class="grid grid-cols-5 gap-2">
      `;
      
      stats.top10Menos.forEach(item => {
        htmlContent += `
          <div class="analisis-transparente rounded-lg p-2 text-center border border-white border-opacity-30">
            <div class="text-lg font-bold text-white">${item.numero}</div>
            <div class="text-xs text-gray-300">${item.frecuencia}</div>
          </div>
        `;
      });
      
      htmlContent += `
            </div>
          </div>
          
          <!-- Análisis por bloques -->
          <div class="mb-4">
            <h4 class="text-lg font-semibold text-white mb-2">🎯 Predicción por Rangos Numéricos</h4>
            <p class="text-xs text-gray-300 mb-3">¿Cuántos números saldrán de cada rango? (Total: 6 números)</p>
            <div class="space-y-2">
      `;
      
      stats.bloques.forEach(bloque => {
        const numeroTexto = bloque.numerosProbables === 1 ? '1 número' : `${bloque.numerosProbables} números`;
        htmlContent += `
          <div class="analisis-transparente rounded-lg p-3 border border-white border-opacity-30">
            <div class="flex justify-between items-center">
              <span class="font-semibold text-white">Rango ${bloque.bloque}</span>
              <div class="text-right">
                <div class="text-lg font-bold text-green-300">${numeroTexto}</div>
                <div class="text-sm text-gray-300">${bloque.porcentaje}% probabilidad</div>
              </div>
            </div>
            <div class="mt-2">
              <div class="w-full bg-gray-600 rounded-full h-2">
                <div class="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300" 
                     style="width: ${bloque.porcentaje}%">
                </div>
              </div>
            </div>
            <div class="mt-1 text-xs text-gray-400">
              🎲 Rango: ${bloque.bloque} • Tendencia: ${bloque.numerosProbables > 1 ? 'Alta' : 'Moderada'}
            </div>
          </div>
        `;
      });
      
      htmlContent += `
            </div>
            <div class="mt-3 p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-center">
              <p class="text-sm font-semibold text-white">
                💡 Esta predicción sugiere de qué rangos saldrán los 6 números ganadores
              </p>
            </div>
          </div>
        </div>
      `;
    });
    
    htmlContent += `
      </div>
    `;
    
    contenedorCharts.innerHTML = htmlContent;
  }
  
  console.log('✅ Análisis estadístico completo mostrado exitosamente');
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
    contenedorCharts.innerHTML = `
      <!-- Encabezado del sorteo -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white mb-2">🎲 Análisis de ${nombreSorteo}</h2>
        <p class="text-gray-300">Datos históricos de ${totalSorteos} sorteos</p>
      </div>

      <!-- Top 10 Más y Menos Frecuentes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Los 10 que más salen -->
        <div class="bg-white text-gray-800 rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-bold mb-4 text-green-600 flex items-center">
            🔥 Los 10 que Más Salen
          </h3>
          <div class="grid grid-cols-2 gap-2">
            ${top10Mas.map((item, index) => `
              <div class="flex items-center justify-between p-2 bg-green-50 rounded border-l-3 border-green-500">
                <span class="text-green-800 font-bold">${item.numero}</span>
                <span class="text-green-600 text-sm">${item.frecuencia}x</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Los 10 que menos salen -->
        <div class="bg-white text-gray-800 rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-bold mb-4 text-red-600 flex items-center">
            ❄️ Los 10 que Menos Salen
          </h3>
          <div class="grid grid-cols-2 gap-2">
            ${top10Menos.map((item, index) => `
              <div class="flex items-center justify-between p-2 bg-red-50 rounded border-l-3 border-red-500">
                <span class="text-red-800 font-bold">${item.numero}</span>
                <span class="text-red-600 text-sm">${item.frecuencia}x</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Resumen del sorteo -->
      <div class="bg-white text-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-bold mb-3 text-blue-600">� Resumen de ${nombreSorteo}</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">${totalSorteos}</div>
            <div class="text-sm text-gray-600">Sorteos Analizados</div>
          </div>
          <div class="p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">${totalNumeros}</div>
            <div class="text-sm text-gray-600">Números Extraídos</div>
          </div>
          <div class="p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">${Math.round(totalNumeros / totalSorteos)}</div>
            <div class="text-sm text-gray-600">Números por Sorteo</div>
          </div>
        </div>
        <div class="mt-4 p-3 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-600">
            <strong>Número más frecuente:</strong> ${top10Mas[0].numero} (${top10Mas[0].frecuencia} veces)
          </div>
          <div class="text-sm text-gray-600">
            <strong>Número menos frecuente:</strong> ${top10Menos[0].numero} (${top10Menos[0].frecuencia} veces)
          </div>
        </div>
      </div>
    `;
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
