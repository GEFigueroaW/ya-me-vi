// ===== PARSER DE DATOS YA ME VI =====
// Carga y procesa datos históricos de lotería

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
    melate: 'assets/Melate.csv',
    revancha: 'assets/Revancha.csv',
    revanchita: 'assets/Revanchita.csv'
  };

  const archivo = urls[modo];
  console.log('📁 Archivo a cargar:', archivo);
  
  let todosLosDatos = [];
  let todosLosNumeros = [];

  try {
    console.log(`📥 Cargando ${archivo}...`);
    const response = await fetch(archivo);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const contenido = await response.text();
    const lineas = contenido.split('\n').filter(linea => linea.trim());
    
    console.log(`📄 Archivo cargado: ${lineas.length} líneas`);
    
    const nombreSorteo = modo.charAt(0).toUpperCase() + modo.slice(1);
    let ultimoSorteo = 0;
    
    // Procesar cada línea según el formato específico del archivo
    lineas.slice(1).forEach((linea, index) => {
      if (!linea.trim()) return; // Saltar líneas vacías
      
      try {
        const cols = linea.split(',');
        let numeros = [];
        let concurso = 0;
        let fecha = '';
        
        // Validar que tengamos suficientes columnas
        if (cols.length < 8) {
          console.warn(`⚠️ Línea ${index + 1} tiene pocas columnas:`, cols.length);
          return;
        }
        
        if (modo === 'melate') {
          // Melate: NPRODUCTO,CONCURSO,R1,R2,R3,R4,R5,R6,R7,BOLSA,FECHA
          concurso = parseInt(cols[1], 10);
          fecha = cols[10] ? cols[10].trim() : 'Sin fecha';
          
          numeros = [
            parseInt(cols[2], 10), // R1
            parseInt(cols[3], 10), // R2  
            parseInt(cols[4], 10), // R3
            parseInt(cols[5], 10), // R4
            parseInt(cols[6], 10), // R5
            parseInt(cols[7], 10)  // R6
          ];
          
          if (index === 0) ultimoSorteo = concurso;
          
        } else if (modo === 'revancha') {
          // Revancha: NPRODUCTO,CONCURSO,R1,R2,R3,R4,R5,R6,BOLSA,FECHA
          concurso = parseInt(cols[1], 10);
          fecha = cols[9] ? cols[9].trim() : 'Sin fecha';
          
          numeros = [
            parseInt(cols[2], 10), // R1
            parseInt(cols[3], 10), // R2  
            parseInt(cols[4], 10), // R3
            parseInt(cols[5], 10), // R4
            parseInt(cols[6], 10), // R5
            parseInt(cols[7], 10)  // R6
          ];
          
        } else if (modo === 'revanchita') {
          // Revanchita: NPRODUCTO,CONCURSO,F1,F2,F3,F4,F5,F6,BOLSA,FECHA
          concurso = parseInt(cols[1], 10);
          fecha = cols[9] ? cols[9].trim() : 'Sin fecha';
          
          numeros = [
            parseInt(cols[2], 10), // F1
            parseInt(cols[3], 10), // F2  
            parseInt(cols[4], 10), // F3
            parseInt(cols[5], 10), // F4
            parseInt(cols[6], 10), // F5
            parseInt(cols[7], 10)  // F6
          ];
        }
        
        // Validar que tengamos exactamente 6 números válidos
        const numerosValidos = numeros.filter(num => !isNaN(num) && num >= 1 && num <= 56);
        
        if (numerosValidos.length === 6 && !isNaN(concurso) && concurso > 0) {
          todosLosDatos.push({
            fecha: fecha,
            numeroSorteo: concurso,
            sorteo: nombreSorteo,
            numeros: numerosValidos
          });
          todosLosNumeros.push(...numerosValidos);
        }
        
      } catch (error) {
        console.error(`❌ Error procesando línea ${index + 1}:`, error.message);
      }
    });
    
    console.log(`📊 ${modo}: ${todosLosDatos.length} sorteos procesados exitosamente`);
    
  } catch (error) {
    console.error(`❌ Error cargando ${archivo}:`, error);
  }

  if (todosLosDatos.length === 0) {
    console.error(`❌ No se cargaron datos para ${modo} - verificar archivo CSV`);
    return { datos: [], numeros: [], modo };
  }

  console.log(`📊 ${modo}: ${todosLosDatos.length} sorteos cargados, ${todosLosNumeros.length} números totales`);
  
  return {
    datos: todosLosDatos,
    numeros: todosLosNumeros,
    totalSorteos: todosLosDatos.length,
    ultimoSorteo: ultimoSorteo
  };
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
      console.log(`📊 Datos cargados para ${sorteo}:`, datos);
      
      if (datos && datos.datos && datos.datos.length > 0) {
        datosPorSorteo[sorteo] = datos;
        
        // Obtener el último sorteo (el más reciente está en la primera posición)
        const ultimoSorteo = datos.datos[0];
        ultimosSorteos[sorteo] = ultimoSorteo;
        console.log(`✅ ${sorteo} cargado exitosamente: ${datos.datos.length} sorteos, último: ${ultimoSorteo.numeroSorteo}`);
      } else {
        console.log(`⚠️ ${sorteo} no tiene datos válidos`);
        datosPorSorteo[sorteo] = { 
          datos: [], 
          numeros: [], 
          modo: sorteo,
          ultimoSorteo: 0
        };
        ultimosSorteos[sorteo] = null;
      }
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
  const numerosSorteo = Object.values(ultimosSorteos)
    .filter(sorteo => sorteo && sorteo.numeroSorteo)
    .map(sorteo => sorteo.numeroSorteo);
  
  if (numerosSorteo.length > 0) {
    const ultimoNumero = Math.max(...numerosSorteo);
    container.textContent = `ULTIMO SORTEO ${ultimoNumero}`;
  } else {
    container.textContent = 'CARGANDO ULTIMO SORTEO...';
  }
}

export function graficarEstadisticas(datos) {
  console.log('🔍 Datos recibidos en graficarEstadisticas:', datos);
  
  const contenedorCharts = document.getElementById('charts-container');
  if (!contenedorCharts) {
    console.error('No se encontró el contenedor charts-container');
    return;
  }
  
  // Verificar si es modo comparativo
  if (datos.esComparativo && datos.datosPorSorteo) {
    console.log('📊 Modo comparativo detectado');
    mostrarEstadisticasComparativas(datos.datosPorSorteo);
  } else {
    console.log('📊 Modo individual detectado');
    mostrarEstadisticasIndividuales(datos);
  }
}

function mostrarEstadisticasComparativas(datosPorSorteo) {
  console.log('🔍 Generando análisis estadístico para cada sorteo...');
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  const colores = {
    melate: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', title: 'text-blue-600' },
    revancha: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', title: 'text-purple-600' },
    revanchita: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', title: 'text-green-600' }
  };
  
  const contenedorCharts = document.getElementById('charts-container');
  let htmlContent = '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">';
  
  sorteos.forEach(sorteo => {
    const datos = datosPorSorteo[sorteo];
    const color = colores[sorteo];
    
    if (!datos || !datos.numeros || datos.numeros.length === 0) {
      htmlContent += `
        <div class="analisis-transparente rounded-xl p-6 border border-white border-opacity-30">
          <h3 class="text-xl font-bold text-white mb-4">🎲 ${sorteo.toUpperCase()}</h3>
          <p class="text-red-300">❌ No hay datos disponibles</p>
        </div>
      `;
      return;
    }
    
    // Calcular frecuencias
    const frecuencias = {};
    datos.numeros.forEach(num => {
      frecuencias[num] = (frecuencias[num] || 0) + 1;
    });
    
    // Obtener top 10 más y menos frecuentes
    const numerosOrdenados = Object.entries(frecuencias)
      .map(([num, freq]) => ({ numero: parseInt(num), frecuencia: freq }))
      .sort((a, b) => b.frecuencia - a.frecuencia);
    
    const top10Mas = numerosOrdenados.slice(0, 10);
    const top10Menos = numerosOrdenados.slice(-10).reverse();
    
    htmlContent += `
      <div class="analisis-transparente rounded-xl p-6 border border-white border-opacity-30">
        <h3 class="text-xl font-bold text-white mb-4">🎲 ${sorteo.toUpperCase()}</h3>
        
        <div class="mb-4">
          <p class="text-gray-300 text-sm">${datos.datos.length} sorteos analizados</p>
        </div>
        
        <!-- Top 10 MÁS frecuentes -->
        <div class="mb-4">
          <h4 class="text-lg font-semibold text-white mb-2">🔥 Top 10 MÁS frecuentes</h4>
          <div class="grid grid-cols-5 gap-2">
    `;
    
    top10Mas.forEach(item => {
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
    
    top10Menos.forEach(item => {
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
      </div>
    `;
  });
  
  htmlContent += '</div>';
  
  contenedorCharts.innerHTML = htmlContent;
  console.log('✅ Análisis estadístico completo mostrado exitosamente');
}

function mostrarEstadisticasIndividuales(datos) {
  console.log('📊 Mostrando estadísticas individuales...');
  
  const contenedorCharts = document.getElementById('charts-container');
  if (!contenedorCharts) return;
  
  // Implementar análisis individual si es necesario
  contenedorCharts.innerHTML = `
    <div class="analisis-transparente rounded-xl p-6 border border-white border-opacity-30">
      <h3 class="text-xl font-bold text-white mb-4">📊 Análisis Individual</h3>
      <p class="text-gray-300">Función en desarrollo...</p>
    </div>
  `;
}

// Función auxiliar para hash
function hashCode(str) {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}
