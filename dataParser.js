
// dataParser.js

// Función principal para procesar CSV
async function parseCSV(fileName) {
  const response = await fetch(fileName);
  const text = await response.text();
  const rows = text.trim().split('\n').slice(1); // Quita encabezado

  const draws = rows.map(row => {
    const cols = row.split(',');
    const numbers = cols.slice(1, 7).map(n => parseInt(n));
    return numbers;
  });

  return draws;
}

// Calcular frecuencia
function getFrequencies(draws) {
  const freq = Array(56).fill(0); // Números del 1 al 56
  draws.forEach(numbers => {
    numbers.forEach(num => {
      freq[num - 1]++;
    });
  });
  return freq;
}

// Calcular retraso (delay)
function getDelays(draws) {
  const lastSeen = Array(56).fill(-1);
  for (let i = draws.length - 1; i >= 0; i--) {
    draws[i].forEach(n => {
      lastSeen[n - 1] = draws.length - i - 1;
    });
  }
  return lastSeen.map(d => d === -1 ? draws.length : d);
}

// Distribución por secciones (1–9, 10–18, ..., 46–56)
function getSectionDistribution(draws) {
  const sections = Array(6).fill(0);
  draws.forEach(numbers => {
    numbers.forEach(num => {
      const sectionIndex = Math.min(Math.floor((num - 1) / 9), 5);
      sections[sectionIndex]++;
    });
  });
  return sections;
}

// Exportar funciones para uso en main.js
window.DataParser = {
  parseCSV,
  getFrequencies,
  getDelays,
  getSectionDistribution
};
