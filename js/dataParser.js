// /js/dataParser.js

/**
 * Descarga y parsea el CSV según el juego seleccionado.
 * Devuelve un array de arrays con los 6 números de cada sorteo.
 */
async function fetchGameData(gameKey) {
  const game = GAME_CONFIG[gameKey];
  const response = await fetch(game.csvUrl);
  const text = await response.text();

  // Dividir por líneas y omitir encabezado
  const lines = text.trim().split("\n").slice(1);

  // Tomar solo los últimos MAX_SORTEOS
  const draws = lines.slice(-MAX_SORTEOS).map(line => {
    const columns = line.split(",");
    // Extraer solo los 6 primeros números principales
    return columns.slice(1, 7).map(n => parseInt(n.trim(), 10));
  });

  return draws;
}

/**
 * Calcula frecuencia absoluta de aparición de cada número.
 */
function calculateFrequencies(draws, maxNumber) {
  const freq = Array(maxNumber + 1).fill(0); // índice 0 no se usa

  draws.forEach(numbers => {
    numbers.forEach(n => {
      if (!isNaN(n)) freq[n]++;
    });
  });

  return freq;
}

/**
 * Calcula delay: cuántos sorteos han pasado desde la última aparición.
 */
function calculateDelays(draws, maxNumber) {
  const delays = Array(maxNumber + 1).fill(null); // índice 0 no se usa

  for (let i = draws.length - 1; i >= 0; i--) {
    draws[i].forEach(n => {
      if (delays[n] === null) {
        delays[n] = draws.length - 1 - i;
      }
    });
  }

  // Reemplazar los que nunca han salido
  for (let i = 1; i <= maxNumber; i++) {
    if (delays[i] === null) delays[i] = draws.length;
  }

  return delays;
}

/**
 * Calcula distribución por sección.
 */
function calculateSectionDistribution(draws) {
  const sectionCounts = NUMBER_SECTIONS.map(() => 0);
  const totalNumbers = draws.length * 6;

  draws.flat().forEach(n => {
    NUMBER_SECTIONS.forEach((range, i) => {
      if (n >= range.min && n <= range.max) {
        sectionCounts[i]++;
      }
    });
  });

  const distribution = sectionCounts.map(count => ({
    total: count,
    percentage: ((count / totalNumbers) * 100).toFixed(2)
  }));

  return distribution;
}

/**
 * Junta todos los análisis para un juego.
 */
async function analyzeGame(gameKey) {
  const draws = await fetchGameData(gameKey);
  const game = GAME_CONFIG[gameKey];

  const frequencies = calculateFrequencies(draws, game.maxNumber);
  const delays = calculateDelays(draws, game.maxNumber);
  const sectionDist = calculateSectionDistribution(draws);

  return { draws, frequencies, delays, sectionDist };
}
