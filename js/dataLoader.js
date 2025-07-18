function cargarDatosHistoricos(tipo) {
  return new Promise((resolve, reject) => {
    console.log(`📊 Cargando datos históricos: ${tipo}`);
    
    // Array con los tipos de sorteos y sus rutas
    const sorteos = {
      'melate': 'assets/Melate.csv',
      'revancha': 'assets/Revancha.csv',
      'revanchita': 'assets/Revanchita.csv'
    };
    
    // Si pide todos los datos, cargar los tres tipos
    if (tipo === 'todos') {
      // Crear un objeto para almacenar todos los datos
      const todosDatos = {};
      
      // Crear un array de promesas para cada tipo
      const promesas = Object.keys(sorteos).map(nombreSorteo => {
        return fetch(sorteos[nombreSorteo])
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error cargando datos de ${nombreSorteo}: ${response.status}`);
            }
            return response.text();
          })
          .then(data => {
            // Procesar los datos del CSV
            const resultado = procesarCSV(data, nombreSorteo);
            todosDatos[nombreSorteo] = resultado;
            console.log(`✅ Datos de ${nombreSorteo} cargados (${resultado.sorteos.length} sorteos)`);
          });
      });
      
      // Esperar a que todas las promesas se resuelvan
      Promise.all(promesas)
        .then(() => {
          console.log('✅ Todos los datos históricos cargados correctamente');
          resolve(todosDatos);
        })
        .catch(error => {
          console.error('❌ Error cargando datos históricos:', error);
          reject(error);
        });
    } else {
      // Si solo pide un tipo específico
      if (!sorteos[tipo]) {
        reject(new Error(`Tipo de sorteo no válido: ${tipo}`));
        return;
      }
      
      fetch(sorteos[tipo])
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error cargando datos: ${response.status}`);
          }
          return response.text();
        })
        .then(data => {
          const resultado = procesarCSV(data, tipo);
          console.log(`✅ Datos de ${tipo} cargados (${resultado.sorteos.length} sorteos)`);
          
          // Crear un objeto con la estructura esperada
          const datosProcesados = {};
          datosProcesados[tipo] = resultado;
          
          resolve(datosProcesados);
        })
        .catch(error => {
          console.error(`❌ Error cargando datos de ${tipo}:`, error);
          reject(error);
        });
    }
  });
}

// Función auxiliar para procesar CSV
function procesarCSV(texto, tipoSorteo) {
  const lineas = texto.split('\n');
  // Eliminar la primera línea si es un encabezado
  if (lineas[0].includes('Concurso') || lineas[0].includes('Sorteo')) {
    lineas.shift();
  }
  
  const sorteos = [];
  
  lineas.forEach(linea => {
    if (!linea.trim()) return; // Ignorar líneas vacías
    
    const partes = linea.split(',');
    if (partes.length < 7) return; // Asegurar que tengamos al menos los números
    
    try {
      // Para Melate/Revancha: [Concurso, Fecha, N1, N2, N3, N4, N5, N6, Adicional]
      // Para Revanchita: [Concurso, Fecha, N1, N2, N3, N4, N5, N6]
      const sorteo = {
        concurso: partes[0].trim(),
        fecha: partes[1].trim(),
        numeros: partes.slice(2, 8).map(n => parseInt(n.trim(), 10))
      };
      
      // Para Melate y Revancha, guardar también el adicional si existe
      if (partes[8] && (tipoSorteo === 'melate' || tipoSorteo === 'revancha')) {
        sorteo.adicional = parseInt(partes[8].trim(), 10);
      }
      
      // Solo agregar sorteos con datos válidos (evitar líneas corruptas)
      if (sorteo.numeros.every(n => !isNaN(n))) {
        sorteos.push(sorteo);
      }
    } catch (error) {
      console.warn(`Error procesando línea: ${linea}`, error);
    }
  });
  
  return {
    tipo: tipoSorteo,
    ultimaActualizacion: new Date().toISOString(),
    sorteos: sorteos
  };
}

// Hacer disponible la función globalmente
window.cargarDatosHistoricos = cargarDatosHistoricos;
