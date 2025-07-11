export async function cargarDatosHistoricos(modo) {
  console.log('🚀 Iniciando carga de datos históricos para modo:', modo);
  
  // Si el modo es específico, cargar solo ese sorteo
  if (modo === 'melate' || modo === 'revancha' || modo === 'revanchita') {
    return await cargarSorteoIndividual(modo);
  }
  
  // Si el modo es 'todos', cargar los 3 sorteos para comparación
  if (modo === 'todos') {
    return await cargarTodosSorteos();
  }
  
  // Modo por defecto
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
      if (cols.length >= 8) {
        // Columnas C a H son índices 2 a 7 (números ganadores)
        const fecha = cols[0];
        const nums = cols.slice(2, 8).map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n >= 1 && n <= 56);
        
        if (nums.length === 6) {
          todosLosDatos.push({
            fecha,
            numeros: nums,
            sorteo: nombreSorteo
          });
          todosLosNumeros.push(...nums);
        } else {
          console.warn(`⚠️ Línea ${index + 1} de ${archivo} tiene números inválidos:`, nums);
        }
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
  const sorteos = ['melate', 'revancha', 'revanchita'];
  const datosPorSorteo = {};
  
  for (const sorteo of sorteos) {
    try {
      const datos = await cargarSorteoIndividual(sorteo);
      datosPorSorteo[sorteo] = datos;
    } catch (error) {
      console.error(`Error cargando ${sorteo}:`, error);
      datosPorSorteo[sorteo] = { datos: [], numeros: [], modo: sorteo };
    }
  }
  
  return { 
    datosPorSorteo, 
    modo: 'todos',
    esComparativo: true 
  };
}

export function graficarEstadisticas(datos) {
  console.log('🔍 Datos recibidos:', datos);
  
  // Si es modo comparativo (todos los sorteos)
  if (datos.esComparativo) {
    mostrarEstadisticasComparativas(datos.datosPorSorteo);
    return;
  }
  
  // Modo individual
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
  mostrarEstadisticasCompletas(frecuencia, numeros.length, sorteos.length, modo);
}

function mostrarEstadisticasComparativas(datosPorSorteo) {
  console.log('🔍 Generando estadísticas comparativas...');
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  const estadisticasPorSorteo = {};
  
  // Procesar cada sorteo
  sorteos.forEach(sorteo => {
    const datos = datosPorSorteo[sorteo];
    const numeros = datos.numeros || [];
    
    if (numeros.length > 0) {
      // Calcular frecuencia
      const frecuencia = Array(56).fill(0);
      numeros.forEach(n => {
        if (n >= 1 && n <= 56) {
          frecuencia[n - 1]++;
        }
      });
      
      // Top 10 más frecuentes
      const top10Mas = frecuencia
        .map((freq, i) => ({ numero: i + 1, frecuencia: freq }))
        .sort((a, b) => b.frecuencia - a.frecuencia)
        .slice(0, 10);
      
      // Top 10 menos frecuentes
      const top10Menos = frecuencia
        .map((freq, i) => ({ numero: i + 1, frecuencia: freq }))
        .sort((a, b) => a.frecuencia - b.frecuencia)
        .slice(0, 10);
      
      estadisticasPorSorteo[sorteo] = {
        top10Mas,
        top10Menos,
        totalSorteos: datos.datos.length,
        totalNumeros: numeros.length
      };
    } else {
      estadisticasPorSorteo[sorteo] = {
        top10Mas: [],
        top10Menos: [],
        totalSorteos: 0,
        totalNumeros: 0
      };
    }
  });
  
  // Generar HTML según tu diseño
  const contenedorCharts = document.getElementById('charts-container');
  if (contenedorCharts) {
    contenedorCharts.innerHTML = `
      <!-- Encabezado comparativo -->
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-white mb-2">🎲 Comparativo de Sorteos</h2>
        <p class="text-gray-300">Melate • Revancha • Revanchita</p>
      </div>

      <!-- Tabla comparativa según tu diseño -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Columna izquierda: Los 10 que MÁS salen -->
          <div>
            <h3 class="text-lg font-bold mb-4 text-green-600 text-center">
              🔥 Los 10 que MÁS salen
            </h3>
            <div class="space-y-2">
              <!-- Encabezados -->
              <div class="grid grid-cols-4 gap-2 pb-2 border-b font-semibold text-sm text-gray-700">
                <div class="text-center">#</div>
                <div class="text-center">Melate</div>
                <div class="text-center">Revancha</div>
                <div class="text-center">Revanchita</div>
              </div>
              
              <!-- Filas de datos -->
              ${Array.from({length: 10}, (_, i) => {
                const pos = i + 1;
                const melate = estadisticasPorSorteo.melate.top10Mas[i];
                const revancha = estadisticasPorSorteo.revancha.top10Mas[i];
                const revanchita = estadisticasPorSorteo.revanchita.top10Mas[i];
                
                return `
                  <div class="grid grid-cols-4 gap-2 py-2 border-b border-gray-100 hover:bg-green-50 transition-colors">
                    <div class="text-center font-bold text-green-600">${pos}</div>
                    <div class="text-center ${melate ? 'text-gray-800 font-semibold' : 'text-gray-400'}">${melate ? melate.numero : '--'}</div>
                    <div class="text-center ${revancha ? 'text-gray-800 font-semibold' : 'text-gray-400'}">${revancha ? revancha.numero : '--'}</div>
                    <div class="text-center ${revanchita ? 'text-gray-800 font-semibold' : 'text-gray-400'}">${revanchita ? revanchita.numero : '--'}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <!-- Columna derecha: Los 10 que MENOS salen -->
          <div>
            <h3 class="text-lg font-bold mb-4 text-red-600 text-center">
              ❄️ Los 10 que MENOS salen
            </h3>
            <div class="space-y-2">
              <!-- Encabezados -->
              <div class="grid grid-cols-4 gap-2 pb-2 border-b font-semibold text-sm text-gray-700">
                <div class="text-center">#</div>
                <div class="text-center">Melate</div>
                <div class="text-center">Revancha</div>
                <div class="text-center">Revanchita</div>
              </div>
              
              <!-- Filas de datos -->
              ${Array.from({length: 10}, (_, i) => {
                const pos = i + 1;
                const melate = estadisticasPorSorteo.melate.top10Menos[i];
                const revancha = estadisticasPorSorteo.revancha.top10Menos[i];
                const revanchita = estadisticasPorSorteo.revanchita.top10Menos[i];
                
                return `
                  <div class="grid grid-cols-4 gap-2 py-2 border-b border-gray-100 hover:bg-red-50 transition-colors">
                    <div class="text-center font-bold text-red-600">${pos}</div>
                    <div class="text-center ${melate ? 'text-gray-800 font-semibold' : 'text-gray-400'}">${melate ? melate.numero : '--'}</div>
                    <div class="text-center ${revancha ? 'text-gray-800 font-semibold' : 'text-gray-400'}">${revancha ? revancha.numero : '--'}</div>
                    <div class="text-center ${revanchita ? 'text-gray-800 font-semibold' : 'text-gray-400'}">${revanchita ? revanchita.numero : '--'}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen comparativo -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-bold mb-4 text-blue-600 text-center">📊 Resumen Comparativo</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${sorteos.map(sorteo => {
            const stats = estadisticasPorSorteo[sorteo];
            const nombre = sorteo.charAt(0).toUpperCase() + sorteo.slice(1);
            const colores = {
              melate: 'bg-blue-50 border-blue-200',
              revancha: 'bg-purple-50 border-purple-200', 
              revanchita: 'bg-green-50 border-green-200'
            };
            
            return `
              <div class="border-2 rounded-lg p-4 ${colores[sorteo]}">
                <h4 class="font-bold text-center mb-3">${nombre}</h4>
                <div class="text-center space-y-2">
                  <div class="text-2xl font-bold">${stats.totalSorteos}</div>
                  <div class="text-sm text-gray-600">Sorteos</div>
                  <div class="text-sm">
                    <div>Más frecuente: <strong>${stats.top10Mas[0]?.numero || 'N/A'}</strong></div>
                    <div>Menos frecuente: <strong>${stats.top10Menos[0]?.numero || 'N/A'}</strong></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  console.log('✅ Estadísticas comparativas mostradas exitosamente');
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
