// analyzeGame.js

function analyzeGame(rows) {
  const allNumbers = [];
  const delayMap = new Map();
  const sectionCounts = Array(6).fill(0);
  const numberFrequency = {};

  // Procesar cada fila (una fila = un sorteo)
  rows.forEach((row, index) => {
    const numbers = row.map(num => parseInt(num, 10));

    numbers.forEach(num => {
      allNumbers.push(num);

      // Frecuencia
      numberFrequency[num] = (numberFrequency[num] || 0) + 1;

      // Última aparición
      if (!delayMap.has(num)) {
        delayMap.set(num, index);
      }

      // Sección
      const sectionIndex = Math.floor((num - 1) / 9);
      sectionCounts[sectionIndex]++;
    });
  });

  // Calcular retraso (delay) = hace cuántos sorteos no aparece
  const delayList = {};
  for (let num = 1; num <= 56; num++) {
    delayList[num] = delayMap.has(num) ? delayMap.get(num) : rows.length;
  }

  return {
    totalDraws: rows.length,
    frequency: numberFrequency,
    delay: delayList,
    sectionDistribution: sectionCounts,
  };
}
