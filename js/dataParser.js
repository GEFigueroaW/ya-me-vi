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
    console.error('❌ No hay números para graficar');
    
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

  // Cálculo de frecuencia
  const frecuencia = Array(56).fill(0);
  numeros.forEach(n => {
    if (n >= 1 && n <= 56) {
      frecuencia[n - 1]++;
    }
  });

  // Cálculo de delay (números más atrasados)
  const delay = Array(56).fill(0);
  const ultimaAparicion = Array(56).fill(-1);
  
  // Encontrar la última aparición de cada número
  sorteos.forEach((sorteo, index) => {
    sorteo.numeros.forEach(num => {
      if (num >= 1 && num <= 56) {
        ultimaAparicion[num - 1] = index;
      }
    });
  });
  
  // Calcular delay desde la última aparición
  ultimaAparicion.forEach((ultimoIndex, i) => {
    if (ultimoIndex >= 0) {
      delay[i] = sorteos.length - ultimoIndex;
    } else {
      delay[i] = sorteos.length; // nunca ha aparecido
    }
  });

  // Distribución por rangos
  const rangos = Array(6).fill(0);
  const etiquetasRangos = ['1–9', '10–18', '19–27', '28–36', '37–45', '46–56'];
  
  numeros.forEach(n => {
    if (n >= 1 && n <= 56) {
      const indiceRango = Math.min(Math.floor((n - 1) / 9), 5);
      rangos[indiceRango]++;
    }
  });

  // Generar gráficos
  mostrarGrafico('frecuenciaChart', 'Frecuencia de Números (1-56)', frecuencia, 'bar');
  mostrarGrafico('delayChart', 'Números más Atrasados (Delay)', delay, 'bar');
  mostrarGrafico('rangosChart', 'Distribución por Rangos', rangos, 'pie', etiquetasRangos);
  
  // Mostrar estadísticas adicionales
  mostrarEstadisticasExtra(frecuencia, delay, numeros);
}

function mostrarGrafico(id, titulo, datos, tipo = 'bar', etiquetas = null) {
  console.log(`📊 Creando gráfico ${id}:`, { titulo, tipo, datosLength: datos.length });
  
  const canvas = document.getElementById(id);
  if (!canvas) {
    console.error(`❌ Canvas ${id} no encontrado`);
    return;
  }

  // Verificar que Chart.js esté disponible
  if (typeof Chart === 'undefined') {
    console.error('❌ Chart.js no está cargado');
    canvas.innerHTML = '<p class="text-red-500 text-center p-4">Error: Chart.js no disponible</p>';
    return;
  }
  
  const ctx = canvas.getContext('2d');
  
  // Verificar y destruir gráfico existente de forma segura
  if (window[id] && typeof window[id].destroy === 'function') {
    console.log(`🗑️ Destruyendo gráfico existente ${id}`);
    window[id].destroy();
  }

  const labels = etiquetas || (datos.length === 6 ? 
    ['1–9','10–18','19–27','28–36','37–45','46–56'] : 
    datos.map((_, i) => i + 1));

  const colores = tipo === 'pie' ? 
    ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] :
    datos.map((_, i) => `hsl(${(i * 137.5) % 360}, 70%, 60%)`);

  try {
    window[id] = new Chart(ctx, {
      type: tipo,
      data: {
        labels: labels,
        datasets: [{
          label: titulo,
          data: datos,
          backgroundColor: colores,
          borderColor: tipo === 'pie' ? '#fff' : colores,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: tipo === 'pie' ? {} : {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { 
            display: tipo === 'pie',
            position: 'bottom'
          },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
              label: function(context) {
                if (tipo === 'pie') {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((context.parsed * 100) / total).toFixed(1);
                  return `${context.label}: ${context.parsed} (${percentage}%)`;
                }
                return `${context.label}: ${context.parsed}`;
              }
            }
          }
        }
      }
    });
    console.log(`✅ Gráfico ${id} creado exitosamente`);
  } catch (error) {
    console.error(`❌ Error creando gráfico ${id}:`, error);
    
    // Mostrar mensaje de error en el canvas
    const errorMsg = document.createElement('div');
    errorMsg.className = 'text-red-500 text-center p-4 bg-red-50 rounded';
    errorMsg.textContent = `Error creando gráfico: ${error.message}`;
    canvas.parentNode.replaceChild(errorMsg, canvas);
  }
}

function mostrarEstadisticasExtra(frecuencia, delay, numeros) {
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

  // Actualizar la UI con las estadísticas
  actualizarEstadisticasUI(top10Mas, top10Menos, numeros.length);
}

function actualizarEstadisticasUI(top10Mas, top10Menos, totalNumeros) {
  const contenedorEstadisticas = document.getElementById('estadisticas-extra');
  if (!contenedorEstadisticas) return;

  const html = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div class="bg-white text-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-semibold mb-4 text-green-600">🔥 Los 10 Números que Más Salen</h3>
        <div class="space-y-2">
          ${top10Mas.map((item, index) => `
            <div class="flex justify-between items-center p-2 bg-green-50 rounded">
              <span class="font-bold text-green-800">#${index + 1} - Número ${item.numero}</span>
              <span class="text-sm text-green-600">${item.frecuencia} veces</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="bg-white text-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-semibold mb-4 text-red-600">❄️ Los 10 Números que Menos Salen</h3>
        <div class="space-y-2">
          ${top10Menos.map((item, index) => `
            <div class="flex justify-between items-center p-2 bg-red-50 rounded">
              <span class="font-bold text-red-800">#${index + 1} - Número ${item.numero}</span>
              <span class="text-sm text-red-600">${item.frecuencia} veces</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <div class="bg-blue-50 text-blue-800 rounded-xl shadow-lg p-6 mt-6">
      <h3 class="text-lg font-semibold mb-2">📊 Resumen General</h3>
      <p class="text-sm">
        Se analizaron <strong>${totalNumeros}</strong> números de sorteos históricos. 
        Los números más frecuentes tienen mayor probabilidad estadística de aparecer nuevamente.
      </p>
    </div>
  `;

  contenedorEstadisticas.innerHTML = html;
}
