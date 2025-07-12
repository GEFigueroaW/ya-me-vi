const fs = require('fs');
const path = require('path');

// Función para actualizar CSV con números de sorteo
function actualizarCSV(archivo, numeroInicial) {
  const rutaArchivo = path.join('./assets', archivo);
  const contenido = fs.readFileSync(rutaArchivo, 'utf8');
  const lineas = contenido.split('\n');
  
  // Actualizar header si no tiene NumeroSorteo
  const header = lineas[0].split(',');
  if (!header.includes('NumeroSorteo')) {
    header.splice(2, 0, 'NumeroSorteo');
    lineas[0] = header.join(',');
  }
  
  // Actualizar filas de datos
  for (let i = 1; i < lineas.length; i++) {
    if (lineas[i].trim()) {
      const campos = lineas[i].split(',');
      // Si no tiene número de sorteo, insertarlo en la posición 2
      if (campos.length === 11) { // Sin NumeroSorteo
        campos.splice(2, 0, (numeroInicial + i - 1).toString());
      } else { // Ya tiene NumeroSorteo, actualizarlo
        campos[2] = (numeroInicial + i - 1).toString();
      }
      lineas[i] = campos.join(',');
    }
  }
  
  fs.writeFileSync(rutaArchivo, lineas.join('\n'));
  console.log(`Actualizado ${archivo} con números de sorteo desde ${numeroInicial}`);
}

// Actualizar cada archivo con números de sorteo diferentes
actualizarCSV('melate.csv', 5600);
actualizarCSV('revancha.csv', 5700);  
actualizarCSV('revanchita.csv', 5800);

console.log('Actualización completada');
