// Variables globales
let datosPorSorteo = {};
let ultimoNumeroSorteo = null;

// Función para cargar archivo CSV
async function cargarArchivoCSV(archivo, modo) {
  try {
    console.log('Cargando archivo:', archivo);
    const response = await fetch(archivo);
    
    if (!response.ok) {
      throw new Error('Error al cargar: ' + response.status);
    }
    
    const texto = await response.text();
    if (!texto.trim()) {
      throw new Error('Archivo vacío');
    }
    
    const lineas = texto.split('\n').filter(l => l.trim());
    const headers = lineas[0].split(',').map(h => h.trim());
    
    // Fecha límite (30 meses)
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 30);
    
    const datos = [];
    const numeros = [];
    
    for (let i = 1; i < lineas.length; i++) {
      const valores = lineas[i].split(',').map(v => v.trim());
      
      if (valores.length < headers.length) continue;
      
      const concursoIdx = headers.findIndex(h => h.toLowerCase().includes('concurso'));
      const fechaIdx = headers.findIndex(h => h.toLowerCase().includes('fecha'));
      
      if (concursoIdx === -1 || fechaIdx === -1) continue;
      
      const concurso = valores[concursoIdx];
      const fechaStr = valores[fechaIdx];
      
      let fecha;
      if (fechaStr.includes('/')) {
        const partes = fechaStr.split('/');
        if (partes.length === 3) {
          fecha = new Date(partes[2], partes[1] - 1, partes[0]);
        }
      } else {
        fecha = new Date(fechaStr);
      }
      
      if (!fecha || isNaN(fecha.getTime()) || fecha < fechaLimite) continue;
      
      const numerosValidos = [];
      for (let j = 0; j < valores.length; j++) {
        const num = parseInt(valores[j]);
        if (!isNaN(num) && num >= 1 && num <= 56) {
          numerosValidos.push(num);
        }
      }
      
      if (numerosValidos.length >= 6) {
        const numerosSorteo = numerosValidos.slice(0, 6);
        datos.push({
          concurso,
          fecha: fecha.toISOString().split('T')[0],
          numeros: numerosSorteo
        });
        numeros.push(...numerosSorteo);
      }
    }
    
    return { datos, numeros };
    
  } catch (error) {
    console.error('Error:', error);
    return { datos: [], numeros: [] };
  }
}

// Función para cargar todos los datos
async function cargarDatosSorteos() {
  try {
    const [melateData, revanchaData, revanchitaData] = await Promise.all([
      cargarArchivoCSV('csv/Melate.csv', 'melate'),
      cargarArchivoCSV('csv/Revancha.csv', 'revancha'),
      cargarArchivoCSV('csv/Revanchita.csv', 'revanchita')
    ]);
    
    datosPorSorteo = {
      melate: melateData,
      revancha: revanchaData,
      revanchita: revanchitaData
    };
    
    if (melateData.datos.length > 0) {
      ultimoNumeroSorteo = melateData.datos[0].concurso;
    }
    
    return datosPorSorteo;
    
  } catch (error) {
    console.error('Error cargando datos:', error);
    return null;
  }
}

// Función para mostrar estadísticas
function mostrarEstadisticasComparativas(datos) {
  if (!datos) {
    console.error('No hay datos');
    return;
  }
  
  const contenedor = document.getElementById('charts-container');
  if (!contenedor) return;
  
  let html = '<div class="mb-6 text-center">';
  html += '<h2 class="text-2xl font-bold text-white mb-2">Análisis Estadístico</h2>';
  html += '<p class="text-gray-300">Últimos 30 meses</p>';
  html += '</div>';
  html += '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">';
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  
  sorteos.forEach(sorteo => {
    const info = datos[sorteo];
    const nombre = sorteo.charAt(0).toUpperCase() + sorteo.slice(1);
    
    html += '<div class="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 text-white">';
    html += '<div class="text-center mb-4">';
    html += '<h3 class="text-xl font-bold mb-2">' + nombre + '</h3>';
    
    if (!info || !info.datos || info.datos.length === 0) {
      html += '<p class="text-gray-300">No hay datos</p>';
      html += '</div></div>';
      return;
    }
    
    html += '<p class="text-gray-300 text-sm">' + info.datos.length + ' sorteos</p>';
    html += '</div>';
    
    // Calcular frecuencias
    const frecuencia = Array(56).fill(0);
    let totalNumeros = 0;
    
    info.datos.forEach(sorteoData => {
      const nums = sorteoData.numeros || [];
      nums.forEach(num => {
        if (num >= 1 && num <= 56) {
          frecuencia[num - 1]++;
          totalNumeros++;
        }
      });
    });
    
    // Top 10 más frecuentes
    const top10Mas = frecuencia
      .map((freq, i) => ({ numero: i + 1, frecuencia: freq }))
      .sort((a, b) => b.frecuencia - a.frecuencia)
      .slice(0, 10);
    
    // Top 10 menos frecuentes
    const top10Menos = frecuencia
      .map((freq, i) => ({ numero: i + 1, frecuencia: freq }))
      .filter(item => item.frecuencia > 0)
      .sort((a, b) => a.frecuencia - b.frecuencia)
      .slice(0, 10);
    
    // Mostrar más frecuentes
    html += '<div class="mb-4">';
    html += '<h4 class="text-lg font-semibold mb-2">Más Frecuentes</h4>';
    html += '<div class="grid grid-cols-5 gap-2">';
    
    top10Mas.forEach(item => {
      html += '<div class="bg-white bg-opacity-20 rounded-lg p-2 text-center">';
      html += '<div class="text-lg font-bold">' + item.numero + '</div>';
      html += '<div class="text-xs text-gray-300">' + item.frecuencia + '</div>';
      html += '</div>';
    });
    
    html += '</div></div>';
    
    // Mostrar menos frecuentes
    html += '<div class="mb-4">';
    html += '<h4 class="text-lg font-semibold mb-2">Menos Frecuentes</h4>';
    html += '<div class="grid grid-cols-5 gap-2">';
    
    top10Menos.forEach(item => {
      html += '<div class="bg-white bg-opacity-20 rounded-lg p-2 text-center">';
      html += '<div class="text-lg font-bold">' + item.numero + '</div>';
      html += '<div class="text-xs text-gray-300">' + item.frecuencia + '</div>';
      html += '</div>';
    });
    
    html += '</div></div>';
    
    // Estadísticas
    html += '<div class="text-center text-sm text-gray-300">';
    html += '<p>Total: ' + totalNumeros + '</p>';
    html += '<p>Promedio: ' + Math.round(totalNumeros / info.datos.length) + '</p>';
    html += '</div>';
    
    html += '</div>';
  });
  
  html += '</div>';
  
  contenedor.innerHTML = html;
  console.log('Análisis mostrado');
}

// Función para obtener último sorteo
function obtenerUltimoNumeroSorteo() {
  return ultimoNumeroSorteo || 'N/A';
}

// Función para predicción por frecuencia
function generarPrediccionPorFrecuencia(userId, datos) {
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

// Función hash
function hashCode(str) {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cargarDatosSorteos,
    mostrarEstadisticasComparativas,
    obtenerUltimoNumeroSorteo,
    generarPrediccionPorFrecuencia,
    datosPorSorteo
  };
}
