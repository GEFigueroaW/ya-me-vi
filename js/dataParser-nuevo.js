// YA ME VI - Data Parser - Versión Corregida
export async function cargarDatosHistoricos(modo) {
  console.log('🚀 Iniciando carga de datos históricos para modo:', modo);
  
  if (modo === 'melate' || modo === 'revancha' || modo === 'revanchita') {
    console.log('📁 Cargando sorteo individual:', modo);
    return await cargarSorteoIndividual(modo);
  }
  
  if (modo === 'todos') {
    console.log('📊 Cargando TODOS los sorteos');
    return await cargarTodosSorteos();
  }
  
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
  console.log('📁 Cargando archivo:', archivo);
  
  let todosLosDatos = [];
  let todosLosNumeros = [];

  try {
    const response = await fetch(archivo);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const contenido = await response.text();
    const lineas = contenido.split('\n').filter(l => l.trim());
    
    console.log(`📄 ${archivo}: ${lineas.length} líneas`);
    
    let ultimoSorteo = 0;
    
    lineas.slice(1).forEach((linea, index) => {
      if (!linea.trim()) return;
      
      try {
        const cols = linea.split(',');
        if (cols.length < 8) return;
        
        let numeros = [];
        let concurso = parseInt(cols[1], 10);
        let fecha = cols[10] || cols[9] || 'Sin fecha';
        
        if (modo === 'melate') {
          numeros = [
            parseInt(cols[2], 10),
            parseInt(cols[3], 10),
            parseInt(cols[4], 10),
            parseInt(cols[5], 10),
            parseInt(cols[6], 10),
            parseInt(cols[7], 10)
          ];
          if (index === 0) ultimoSorteo = concurso;
        } else {
          numeros = [
            parseInt(cols[2], 10),
            parseInt(cols[3], 10),
            parseInt(cols[4], 10),
            parseInt(cols[5], 10),
            parseInt(cols[6], 10),
            parseInt(cols[7], 10)
          ];
        }
        
        const numerosValidos = numeros.filter(n => !isNaN(n) && n >= 1 && n <= 56);
        
        if (numerosValidos.length === 6 && !isNaN(concurso)) {
          todosLosDatos.push({
            fecha: fecha,
            numeroSorteo: concurso,
            sorteo: modo,
            numeros: numerosValidos
          });
          todosLosNumeros.push(...numerosValidos);
        }
        
      } catch (error) {
        console.warn(`Error línea ${index + 1}:`, error.message);
      }
    });
    
  } catch (error) {
    console.error(`Error cargando ${archivo}:`, error);
  }

  console.log(`📊 ${modo}: ${todosLosDatos.length} sorteos, ${todosLosNumeros.length} números`);
  
  return {
    datos: todosLosDatos,
    numeros: todosLosNumeros,
    totalSorteos: todosLosDatos.length,
    ultimoSorteo: ultimoSorteo
  };
}

async function cargarTodosSorteos() {
  console.log('🔄 Cargando todos los sorteos...');
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  const datosPorSorteo = {};
  const ultimosSorteos = {};
  
  for (const sorteo of sorteos) {
    try {
      const datos = await cargarSorteoIndividual(sorteo);
      
      if (datos && datos.datos && datos.datos.length > 0) {
        datosPorSorteo[sorteo] = datos;
        ultimosSorteos[sorteo] = datos.datos[0];
        console.log(`✅ ${sorteo}: ${datos.datos.length} sorteos`);
      } else {
        datosPorSorteo[sorteo] = { datos: [], numeros: [], modo: sorteo };
        ultimosSorteos[sorteo] = null;
        console.log(`⚠️ ${sorteo}: sin datos`);
      }
    } catch (error) {
      console.error(`❌ Error ${sorteo}:`, error);
      datosPorSorteo[sorteo] = { datos: [], numeros: [], modo: sorteo };
      ultimosSorteos[sorteo] = null;
    }
  }
  
  mostrarUltimosSorteos(ultimosSorteos);
  
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
  
  const numerosSorteo = Object.values(ultimosSorteos)
    .filter(s => s && s.numeroSorteo)
    .map(s => s.numeroSorteo);
  
  if (numerosSorteo.length > 0) {
    const ultimo = Math.max(...numerosSorteo);
    container.textContent = `ULTIMO SORTEO ${ultimo}`;
  } else {
    container.textContent = 'CARGANDO...';
  }
}

export function graficarEstadisticas(datos) {
  console.log('📊 Graficando estadísticas:', datos);
  
  const container = document.getElementById('charts-container');
  if (!container) {
    console.error('❌ No se encontró charts-container');
    return;
  }
  
  if (datos.esComparativo && datos.datosPorSorteo) {
    mostrarEstadisticasComparativas(datos.datosPorSorteo);
  } else {
    mostrarEstadisticasIndividual(datos);
  }
}

function mostrarEstadisticasComparativas(datosPorSorteo) {
  console.log('📊 Mostrando estadísticas comparativas');
  
  const container = document.getElementById('charts-container');
  const sorteos = ['melate', 'revancha', 'revanchita'];
  
  let html = '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">';
  
  sorteos.forEach(sorteo => {
    const datos = datosPorSorteo[sorteo];
    
    if (!datos || !datos.numeros || datos.numeros.length === 0) {
      html += `
        <div class="analisis-transparente rounded-xl p-6 border border-white border-opacity-30">
          <h3 class="text-xl font-bold text-white mb-4">🎲 ${sorteo.toUpperCase()}</h3>
          <p class="text-red-300">❌ Sin datos</p>
        </div>
      `;
      return;
    }
    
    // Calcular frecuencias
    const frecuencias = {};
    datos.numeros.forEach(num => {
      frecuencias[num] = (frecuencias[num] || 0) + 1;
    });
    
    const numerosOrdenados = Object.entries(frecuencias)
      .map(([num, freq]) => ({ numero: parseInt(num), frecuencia: freq }))
      .sort((a, b) => b.frecuencia - a.frecuencia);
    
    const top10Mas = numerosOrdenados.slice(0, 10);
    const top10Menos = numerosOrdenados.slice(-10).reverse();
    
    html += `
      <div class="analisis-transparente rounded-xl p-6 border border-white border-opacity-30">
        <h3 class="text-xl font-bold text-white mb-4">🎲 ${sorteo.toUpperCase()}</h3>
        <p class="text-gray-300 text-sm mb-4">${datos.datos.length} sorteos</p>
        
        <div class="mb-4">
          <h4 class="text-lg font-semibold text-white mb-2">🔥 Top 10 MÁS frecuentes</h4>
          <div class="grid grid-cols-5 gap-2">
    `;
    
    top10Mas.forEach(item => {
      html += `
        <div class="analisis-transparente rounded-lg p-2 text-center border border-white border-opacity-30">
          <div class="text-lg font-bold text-white">${item.numero}</div>
          <div class="text-xs text-gray-300">${item.frecuencia}</div>
        </div>
      `;
    });
    
    html += `
          </div>
        </div>
        
        <div class="mb-4">
          <h4 class="text-lg font-semibold text-white mb-2">❄️ Top 10 MENOS frecuentes</h4>
          <div class="grid grid-cols-5 gap-2">
    `;
    
    top10Menos.forEach(item => {
      html += `
        <div class="analisis-transparente rounded-lg p-2 text-center border border-white border-opacity-30">
          <div class="text-lg font-bold text-white">${item.numero}</div>
          <div class="text-xs text-gray-300">${item.frecuencia}</div>
        </div>
      `;
    });
    
    html += `
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
  
  console.log('✅ Estadísticas mostradas');
}

function mostrarEstadisticasIndividual(datos) {
  console.log('📊 Mostrando estadísticas individuales');
  
  const container = document.getElementById('charts-container');
  container.innerHTML = `
    <div class="analisis-transparente rounded-xl p-6 border border-white border-opacity-30">
      <h3 class="text-xl font-bold text-white mb-4">📊 Análisis Individual</h3>
      <p class="text-gray-300">Análisis individual en desarrollo...</p>
    </div>
  `;
}
