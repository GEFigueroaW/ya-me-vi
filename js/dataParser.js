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
      if (cols.length >= 9) { // Ahora incluye NumeroSorteo
        const fecha = cols[0];
        const numeroSorteo = parseInt(cols[2], 10); // Nueva columna NumeroSorteo
        // Números ganadores ahora están en las columnas 3 a 8 (índices 3 a 8)
        const nums = cols.slice(3, 9).map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n >= 1 && n <= 56);
        
        if (nums.length === 6 && !isNaN(numeroSorteo)) {
          todosLosDatos.push({
            fecha,
            numeros: nums,
            sorteo: nombreSorteo,
            numeroSorteo: numeroSorteo
          });
          todosLosNumeros.push(...nums);
        } else {
          console.warn(`⚠️ Línea ${index + 1} de ${archivo} tiene números inválidos:`, nums, 'o número de sorteo inválido:', numeroSorteo);
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
  
  sorteos.forEach(sorteo => {
    const ultimo = ultimosSorteos[sorteo];
    if (ultimo && ultimo.numeroSorteo) {
      ultimoNumeroSorteo = Math.max(ultimoNumeroSorteo, ultimo.numeroSorteo);
    }
  });
  
  if (ultimoNumeroSorteo > 0) {
    container.innerHTML = `ULTIMO SORTEO ${ultimoNumeroSorteo}`;
    
    // Actualizar también el título de predicción con el siguiente número
    const prediccionTitle = document.querySelector('#prediccion-container h2');
    if (prediccionTitle) {
      prediccionTitle.textContent = `🎯 Combinaciones Sugeridas por IA para el sorteo ${ultimoNumeroSorteo + 1}`;
    }
  } else {
    container.innerHTML = 'ULTIMO SORTEO 0000';
  }
}

export function graficarEstadisticas(datos) {
  console.log('🔍 Datos recibidos:', datos);
  
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
  mostrarEstadisticasCompletas(frecuencia, numeros.length, sorteos.length, modo);
}

function mostrarEstadisticasComparativas(datosPorSorteo) {
  console.log('🔍 Generando análisis por bloques para cada sorteo...');
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  const colores = {
    melate: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', title: 'text-blue-600' },
    revancha: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', title: 'text-purple-600' },
    revanchita: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', title: 'text-green-600' }
  };
  
  // Definir bloques (1-9, 10-18, 19-27, 28-36, 37-45, 46-56)
  const bloques = [
    { inicio: 1, fin: 9, nombre: '1-9' },
    { inicio: 10, fin: 18, nombre: '10-18' },
    { inicio: 19, fin: 27, nombre: '19-27' },
    { inicio: 28, fin: 36, nombre: '28-36' },
    { inicio: 37, fin: 45, nombre: '37-45' },
    { inicio: 46, fin: 56, nombre: '46-56' }
  ];
  
  const estadisticasPorSorteo = {};
  
  // Procesar cada sorteo
  sorteos.forEach(sorteo => {
    const datos = datosPorSorteo[sorteo];
    const sorteosDatos = datos.datos || [];
    
    console.log(`📊 Analizando bloques para ${sorteo}:`, { totalSorteos: sorteosDatos.length });
    
    if (sorteosDatos.length > 0) {
      // Analizar cada sorteo para contar números por bloque
      const numerosPorBloque = bloques.map(() => []);
      
      sorteosDatos.forEach(sorteoData => {
        const numeros = sorteoData.numeros || [];
        
        // Contar números por bloque en este sorteo
        const contadorBloque = Array(6).fill(0);
        numeros.forEach(num => {
          bloques.forEach((bloque, index) => {
            if (num >= bloque.inicio && num <= bloque.fin) {
              contadorBloque[index]++;
            }
          });
        });
        
        // Guardar contadores de este sorteo
        contadorBloque.forEach((count, index) => {
          numerosPorBloque[index].push(count);
        });
      });
      
      // Calcular estadísticas por bloque
      const estadisticasBloques = bloques.map((bloque, index) => {
        const counts = numerosPorBloque[index];
        const promedio = counts.reduce((sum, count) => sum + count, 0) / counts.length;
        const porcentaje = (promedio / 6) * 100; // De 6 números posibles
        
        return {
          bloque: bloque.nombre,
          promedio: Math.round(promedio),
          porcentaje: Math.round(porcentaje)
        };
      });
      
      estadisticasPorSorteo[sorteo] = {
        bloques: estadisticasBloques,
        totalSorteos: sorteosDatos.length
      };
      
      console.log(`✅ ${sorteo} procesado:`, estadisticasBloques);
    } else {
      estadisticasPorSorteo[sorteo] = {
        bloques: bloques.map(bloque => ({
          bloque: bloque.nombre,
          promedio: 0,
          porcentaje: 0
        })),
        totalSorteos: 0
      };
    }
  });
  
  // Generar HTML con análisis por bloques
  const contenedorCharts = document.getElementById('charts-container');
  if (contenedorCharts) {
    contenedorCharts.innerHTML = `
      <!-- Encabezado de análisis por bloques -->
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-white mb-2">📊 Análisis por Bloques Numéricos</h2>
        <p class="text-gray-300">Probabilidad de números por rangos (1-56 dividido en 6 bloques)</p>
      </div>

      <!-- Tarjetas por sorteo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${sorteos.map(sorteo => {
          const stats = estadisticasPorSorteo[sorteo];
          const color = colores[sorteo];
          const nombre = sorteo.charAt(0).toUpperCase() + sorteo.slice(1);
          
          return `
            <div class="analisis-transparente rounded-xl p-6 text-white">
              <div class="text-center mb-4">
                <h3 class="text-xl font-bold ${color.title.replace('text-', 'text-white')} mb-2">
                  🎲 ${nombre}
                </h3>
                <p class="text-gray-300 text-sm">${stats.totalSorteos} sorteos analizados</p>
              </div>
              
              <div class="space-y-3">
                ${stats.bloques.map(bloque => `                        <div class="bg-white bg-opacity-20 rounded-lg p-3 border border-white border-opacity-30">
                          <div class="flex justify-between items-center">
                            <span class="font-semibold text-white">Bloque ${bloque.bloque}</span>
                            <div class="text-right">
                              <div class="text-lg font-bold text-white">${bloque.promedio}</div>
                              <div class="text-sm text-gray-300">${bloque.porcentaje}%</div>
                            </div>
                          </div>
                          <div class="mt-2">
                            <div class="w-full bg-gray-600 rounded-full h-2">
                              <div class="bg-white h-2 rounded-full transition-all duration-300" 
                                   style="width: ${Math.min(bloque.porcentaje, 100)}%">
                              </div>
                            </div>
                          </div>
                        </div>
                `).join('')}
              </div>
              
              <div class="mt-4 text-center">
                <p class="text-xs text-gray-300">
                  Promedio: números por bloque | Porcentaje: probabilidad relativa
                </p>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}
  console.log('✅ Análisis por bloques mostrado exitosamente');
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
