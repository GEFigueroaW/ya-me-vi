export async function cargarDatosHistoricos(modo) {
  console.log('🚀 Iniciando carga de datos históricos para modo:', modo);
  
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

export function graficarEstadisticas(datos) {
  const numeros = datos.numeros || [];
  const sorteos = datos.datos || [];
  const modo = datos.modo || 'melate';
  
  console.log('🔍 Datos recibidos:', { 
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
