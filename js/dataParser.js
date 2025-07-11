export async function cargarDatosHistoricos(modo) {
  console.log('🚀 Iniciando carga de datos históricos para modo:', modo);
  
  const urls = {
    melate: 'assets/melate.csv',
    'melate-revancha': ['assets/melate.csv', 'assets/revancha.csv'],
    todos: ['assets/melate.csv', 'assets/revancha.csv', 'assets/revanchita.csv']
  };

  const archivos = Array.isArray(urls[modo]) ? urls[modo] : [urls[modo]];
  console.log('📁 Archivos a cargar:', archivos);
  
  let todosLosDatos = [];
  let todosLosNumeros = [];

  for (const archivo of archivos) {
    try {
      console.log(`📥 Cargando ${archivo}...`);
      const response = await fetch(archivo);
      if (!response.ok) {
        throw new Error(`Error al cargar ${archivo}: ${response.status}`);
      }
      const texto = await response.text();
      const lineas = texto.trim().split('\n').slice(1); // sin encabezado
      console.log(`📄 ${archivo}: ${lineas.length} líneas procesadas`);

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
              sorteo: archivo.includes('melate') ? 'Melate' : 
                      archivo.includes('revancha') ? 'Revancha' : 'Revanchita'
            });
            todosLosNumeros.push(...nums);
          } else {
            console.warn(`⚠️ Línea ${index + 1} de ${archivo} tiene números inválidos:`, nums);
          }
        }
      });
    } catch (error) {
      console.error(`❌ Error cargando ${archivo}:`, error);
    }
  }

  console.log(`✅ Carga completada: ${todosLosDatos.length} sorteos, ${todosLosNumeros.length} números`);
  return { datos: todosLosDatos, numeros: todosLosNumeros };
}

export function graficarEstadisticas(datos) {
  const numeros = datos.numeros || [];
  const sorteos = datos.datos || [];
  
  console.log('🔍 Datos recibidos:', { 
    totalNumeros: numeros.length, 
    totalSorteos: sorteos.length,
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
          <strong>Error:</strong> No se pudieron cargar los datos históricos. Verifica que los archivos CSV estén disponibles.
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

  // Distribución por bloques (6 bloques de ~9-10 números cada uno)
  const bloques = [
    { rango: '1-9', numeros: [], total: 0 },
    { rango: '10-18', numeros: [], total: 0 },
    { rango: '19-27', numeros: [], total: 0 },
    { rango: '28-36', numeros: [], total: 0 },
    { rango: '37-45', numeros: [], total: 0 },
    { rango: '46-56', numeros: [], total: 0 }
  ];

  // Clasificar números por bloques
  for (let i = 1; i <= 56; i++) {
    const freq = frecuencia[i - 1];
    let bloqueIndex;
    
    if (i <= 9) bloqueIndex = 0;
    else if (i <= 18) bloqueIndex = 1;
    else if (i <= 27) bloqueIndex = 2;
    else if (i <= 36) bloqueIndex = 3;
    else if (i <= 45) bloqueIndex = 4;
    else bloqueIndex = 5;
    
    bloques[bloqueIndex].numeros.push({ numero: i, frecuencia: freq });
    bloques[bloqueIndex].total += freq;
  }

  // Mostrar las estadísticas en la UI
  mostrarEstadisticasCompletas(frecuencia, bloques, numeros.length, sorteos.length);
}

function mostrarEstadisticasCompletas(frecuencia, bloques, totalNumeros, totalSorteos) {
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

  // Reemplazar el contenedor de gráficos con estadísticas
  const contenedorCharts = document.getElementById('charts-container');
  if (contenedorCharts) {
    contenedorCharts.innerHTML = `
      <!-- Top 10 Más y Menos Frecuentes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white text-gray-800 rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-green-600 flex items-center">
            🔥 Los 10 Números que Más Salen
          </h3>
          <div class="space-y-3">
            ${top10Mas.map((item, index) => `
              <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div class="flex items-center">
                  <span class="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                    ${index + 1}
                  </span>
                  <span class="font-bold text-green-800 text-lg">Número ${item.numero}</span>
                </div>
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                  ${item.frecuencia} veces
                </span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="bg-white text-gray-800 rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-red-600 flex items-center">
            ❄️ Los 10 Números que Menos Salen
          </h3>
          <div class="space-y-3">
            ${top10Menos.map((item, index) => `
              <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div class="flex items-center">
                  <span class="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                    ${index + 1}
                  </span>
                  <span class="font-bold text-red-800 text-lg">Número ${item.numero}</span>
                </div>
                <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold">
                  ${item.frecuencia} veces
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Distribución por Bloques -->
      <div class="bg-white text-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h3 class="text-xl font-bold mb-4 text-blue-600 flex items-center">
          📊 Distribución por Bloques de Números
        </h3>
        <p class="text-gray-600 mb-6">
          Análisis de frecuencia por rangos de números basado en ${totalSorteos} sorteos históricos
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${bloques.map((bloque, index) => {
            const porcentaje = ((bloque.total / totalNumeros) * 100).toFixed(1);
            const colores = [
              'bg-purple-100 border-purple-500 text-purple-800',
              'bg-blue-100 border-blue-500 text-blue-800',
              'bg-green-100 border-green-500 text-green-800',
              'bg-yellow-100 border-yellow-500 text-yellow-800',
              'bg-orange-100 border-orange-500 text-orange-800',
              'bg-red-100 border-red-500 text-red-800'
            ];
            
            return `
              <div class="border-2 rounded-lg p-4 ${colores[index]}">
                <div class="text-center">
                  <h4 class="font-bold text-lg mb-2">Números ${bloque.rango}</h4>
                  <div class="text-3xl font-bold mb-1">${bloque.total}</div>
                  <div class="text-sm opacity-75 mb-3">${porcentaje}% del total</div>
                  <div class="text-xs">
                    Promedio: ${(bloque.total / bloque.numeros.length).toFixed(1)} por número
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-opacity-30">
                  <div class="text-xs">
                    Más frecuente: <strong>${bloque.numeros.sort((a, b) => b.frecuencia - a.frecuencia)[0].numero}</strong>
                    (${bloque.numeros.sort((a, b) => b.frecuencia - a.frecuencia)[0].frecuencia} veces)
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Resumen General -->
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-bold mb-2 text-blue-800">📈 Resumen Estadístico</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">${totalSorteos}</div>
            <div class="text-gray-600">Sorteos Analizados</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">${totalNumeros}</div>
            <div class="text-gray-600">Números Extraídos</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">${Math.round(totalNumeros / totalSorteos)}</div>
            <div class="text-gray-600">Números por Sorteo</div>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-4 text-center">
          * Estadísticas basadas en datos históricos de los últimos 30 meses
        </p>
      </div>
    `;
  }
  
  console.log('✅ Estadísticas mostradas exitosamente');
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
