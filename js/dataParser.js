// js/dataParser.js

const DataParser = {
  async parseCSV(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("No se pudo obtener el archivo CSV");

      const text = await response.text();
      const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
      const headers = lines[0].split(',');

      const fechaIndex = headers.indexOf('FECHA');
      const today = new Date();
      const fechaLimite = new Date(today.setFullYear(today.getFullYear() - 3));

      const sorteos = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');

        // Fecha válida
        const rawFecha = cols[fechaIndex];
        const [day, month, year] = rawFecha.split('/').map(Number);
        const fechaSorteo = new Date(year, month - 1, day);
        if (fechaSorteo < fechaLimite) continue;

        // Extraer R1 a R6 (columnas 2 a 7 empezando desde C = índice 2)
        const numeros = cols.slice(2, 8).map(Number);
        if (numeros.length === 6 && numeros.every(n => !isNaN(n))) {
          sorteos.push(numeros);
        }
      }

      return sorteos;
    } catch (error) {
      console.error("Error al parsear CSV:", error);
      return [];
    }
  }
};
