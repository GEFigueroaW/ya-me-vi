// Variables globales para almacenar datos
let datosPorSorteo = {};
let ultimoNumeroSorteo = null;

// Función para cargar y procesar archivos CSV
async function cargarArchivoCSV(archivo, modo) {
  try {
    console.log('Cargando archivo:', archivo);
    
    const response = await fetch(archivo);
    if (!response.ok) {
      throw new Error('Error al cargar archivo: ' + response.status);
    }
    
    const texto = await response.text();
    console.log('Archivo cargado, procesando datos...');
    
    if (!texto || texto.trim() === '') {
      throw new Error('El archivo está vacío');
    }
    
    const lineas = texto.split('\n').filter(linea => linea.trim() !== '');
    const headers = lineas[0].split(',').map(h => h.trim());
    
    console.log('Headers encontrados:', headers);
    console.log('Total de líneas:', lineas.length - 1);
    
    // Obtener fecha límite (30 meses atrás)
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 30);
    
    console.log('Filtrando datos desde:', fechaLimite.toLocaleDateString());
    
    const todosLosDatos = [];
    const todosLosNumeros = [];
    
    // Procesar cada línea
    for (let index = 1; index < lineas.length; index++) {
      const linea = lineas[index];
      const valores = linea.split(',').map(v => v.trim());
      
      if (valores.length < headers.length) {
        console.warn('Línea incompleta:', index + 1);
        continue;
      }
      
      // Encontrar columnas importantes
      const concursoIndex = headers.findIndex(h => h.toLowerCase().includes('concurso'));
      const fechaIndex = headers.findIndex(h => h.toLowerCase().includes('fecha'));
      
      if (concursoIndex === -1 || fechaIndex === -1) {
        console.error('No se encontraron columnas de concurso o fecha');
        continue;
      }
      
      const concurso = valores[concursoIndex];
      const fechaStr = valores[fechaIndex];
      
      // Convertir fecha
      let fecha;
      if (fechaStr.includes('/')) {
        const partes = fechaStr.split('/');
        if (partes.length === 3) {
          fecha = new Date(partes[2], partes[1] - 1, partes[0]);
        }
      } else if (fechaStr.includes('-')) {
        fecha = new Date(fechaStr);
      }
      
      if (!fecha || isNaN(fecha.getTime())) {
        console.warn('Fecha inválida en línea:', index + 1, fechaStr);
        continue;
      }
      
      // Filtrar por fecha (últimos 30 meses)
      if (fecha < fechaLimite) {
        continue;
      }
      
      // Extraer números (columnas que contienen números del 1 al 56)
      const numerosValidos = [];
      for (let i = 0; i < valores.length; i++) {
        const valor = parseInt(valores[i]);
        if (!isNaN(valor) && valor >= 1 && valor <= 56) {
          numerosValidos.push(valor);
        }
      }
      
      if (numerosValidos.length >= 6) {
        // Tomar los primeros 6 números válidos
        const numerosSorteo = numerosValidos.slice(0, 6);
        
        todosLosDatos.push({
          concurso: concurso,
          fecha: fecha.toISOString().split('T')[0],
          numeros: numerosSorteo
        });
        
        todosLosNumeros.push(...numerosSorteo);
        
        console.log('Sorteo agregado:', concurso, fecha.toISOString().split('T')[0], numerosSorteo);
      } else {
        console.warn('Línea con números insuficientes:', index + 1);
      }
    }
    
  } catch (error) {
    console.error('Error cargando archivo:', error);
    return { datos: [], numeros: [] };
  }
  
  if (todosLosDatos.length === 0) {
    console.error('No se cargaron datos válidos');
    return { datos: [], numeros: [] };
  }
  
  console.log('Datos cargados:', todosLosDatos.length, 'sorteos,', todosLosNumeros.length, 'números');
  
  return {
    datos: todosLosDatos,
    numeros: todosLosNumeros
  };
}

// Función para cargar datos de todos los sorteos
async function cargarDatosSorteos() {
  console.log('Iniciando carga de datos...');
  
  try {
    // Cargar los tres tipos de sorteos
    const [melateData, revanchaData, revanchitaData] = await Promise.all([
      cargarArchivoCSV('csv/Melate.csv', 'melate'),
      cargarArchivoCSV('csv/Revancha.csv', 'revancha'),
      cargarArchivoCSV('csv/Revanchita.csv', 'revanchita')
    ]);
    
    // Guardar datos en variable global
    datosPorSorteo = {
      melate: melateData,
      revancha: revanchaData,
      revanchita: revanchitaData
    };
    
    // Obtener último número de sorteo desde Melate
    if (melateData.datos && melateData.datos.length > 0) {
      ultimoNumeroSorteo = melateData.datos[0].concurso;
    }
    
    console.log('Todos los datos cargados exitosamente');
    console.log('Último sorteo:', ultimoNumeroSorteo);
    
    return datosPorSorteo;
    
  } catch (error) {
    console.error('Error cargando datos:', error);
    return null;
  }
}

// Función para mostrar estadísticas por sorteo
function mostrarEstadisticasComparativas(datosPorSorteo) {
  console.log('Generando análisis estadístico...');
  
  if (!datosPorSorteo) {
    console.error('No hay datos para el análisis');
    const contenedor = document.getElementById('charts-container');
    if (contenedor) {
      contenedor.innerHTML = '<div class="text-center text-white py-8"><h2>Error: No hay datos disponibles</h2></div>';
    }
    return;
  }
  
  const contenedor = document.getElementById('charts-container');
  if (!contenedor) {
    console.error('No se encontró el contenedor');
    return;
  }
  
  let htmlContent = '<div class="mb-6 text-center"><h2 class="text-2xl font-bold text-white mb-2">Análisis Estadístico</h2><p class="text-gray-300">Últimos 30 meses</p></div>';
  htmlContent += '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">';
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  
  sorteos.forEach(sorteo => {
    const datos = datosPorSorteo[sorteo];
    const nombre = sorteo.charAt(0).toUpperCase() + sorteo.slice(1);
    
    htmlContent += '<div class="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 text-white">';
    htmlContent += '<div class="text-center mb-4">';
    htmlContent += '<h3 class="text-xl font-bold mb-2">' + nombre + '</h3>';
    
    if (!datos || !datos.datos || datos.datos.length === 0) {
      htmlContent += '<p class="text-gray-300">No hay datos disponibles</p>';
      htmlContent += '</div></div>';
      return;
    }
    
    htmlContent += '<p class="text-gray-300 text-sm">' + datos.datos.length + ' sorteos</p>';
    htmlContent += '</div>';
    
    // Calcular frecuencias
    const frecuencia = Array(56).fill(0);
    let totalNumeros = 0;
    
    datos.datos.forEach(sorteoData => {
      const numeros = sorteoData.numeros || [];
      numeros.forEach(num => {
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
    htmlContent += '<div class="mb-4">';
    htmlContent += '<h4 class="text-lg font-semibold mb-2">Más Frecuentes</h4>';
    htmlContent += '<div class="grid grid-cols-5 gap-2">';
    
    top10Mas.forEach(item => {
      htmlContent += '<div class="bg-white bg-opacity-20 rounded-lg p-2 text-center">';
      htmlContent += '<div class="text-lg font-bold">' + item.numero + '</div>';
      htmlContent += '<div class="text-xs text-gray-300">' + item.frecuencia + '</div>';
      htmlContent += '</div>';
    });
    
    htmlContent += '</div></div>';
    
    // Mostrar menos frecuentes
    htmlContent += '<div class="mb-4">';
    htmlContent += '<h4 class="text-lg font-semibold mb-2">Menos Frecuentes</h4>';
    htmlContent += '<div class="grid grid-cols-5 gap-2">';
    
    top10Menos.forEach(item => {
      htmlContent += '<div class="bg-white bg-opacity-20 rounded-lg p-2 text-center">';
      htmlContent += '<div class="text-lg font-bold">' + item.numero + '</div>';
      htmlContent += '<div class="text-xs text-gray-300">' + item.frecuencia + '</div>';
      htmlContent += '</div>';
    });
    
    htmlContent += '</div></div>';
    
    // Estadísticas generales
    htmlContent += '<div class="text-center text-sm text-gray-300">';
    htmlContent += '<p>Total números: ' + totalNumeros + '</p>';
    htmlContent += '<p>Promedio por sorteo: ' + Math.round(totalNumeros / datos.datos.length) + '</p>';
    htmlContent += '</div>';
    
    htmlContent += '</div>';
  });
  
  htmlContent += '</div>';
  
  contenedor.innerHTML = htmlContent;
  console.log('Análisis mostrado exitosamente');
}

// Función para obtener el último número de sorteo
function obtenerUltimoNumeroSorteo() {
  return ultimoNumeroSorteo || 'N/A';
}

// Función para generar predicción por frecuencia (para mlPredictor.js)
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

// Función auxiliar para hash
function hashCode(str) {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

// Exportar funciones para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cargarDatosSorteos,
    mostrarEstadisticasComparativas,
    obtenerUltimoNumeroSorteo,
    generarPrediccionPorFrecuencia,
    datosPorSorteo
  };
}
