// js/dataParser.js

// Obtiene y analiza los datos CSV según el tipo de sorteo
async function fetchGameData(gameType) {
  const csvURLs = {
    melate: "https://raw.githubusercontent.com/GEFigueroaW/ya-me-vi/main/data/melate.csv",
    revancha: "https://raw.githubusercontent.com/GEFigueroaW/ya-me-vi/main/data/revancha.csv",
    revanchita: "https://raw.githubusercontent.com/GEFigueroaW/ya-me-vi/main/data/revanchita.csv"
  };

  const url = csvURLs[gameType];
  const response = await fetch(url);
  if (!response.ok) throw new Error("No se pudo obtener el archivo CSV");
  const csvText = await response.text();
  return parseCSV(csvText);
}

// Parsea texto CSV a un array de arrays de números
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  return lines.map(line => {
    const numbers = line.split(",").map(num => parseInt(num, 10));
    return numbers.filter(n => !isNaN(n)); // elimina NaNs
  });
}

// Calcula estadísticas de los últimos 50 sorteos
function analyzeGameData(data) {
  const frequency = {};
  const lastAppearance = {};
  const totalDraws = data.length;

  // Inicializar estadísticas
  for (let i = 1; i <= 56; i++) {
    frequency[i] = 0;
    lastAppearance[i] = -1;
  }

  data.forEach((draw, index) => {
    draw.forEach(num => {
      frequency[num]++;
      if (lastAppearance[num] === -1) {
        lastAppearance[num] = totalDraws - index;
      }
    });
  });

  const delay = {};
  for (let i = 1; i <= 56; i++) {
    delay[i] = lastAppearance[i] === -1 ? totalDraws : lastAppearance[i];
  }

  const sectionCount = {
    "1-9": 0, "10-18": 0, "19-27": 0, "28-36": 0, "37-45": 0, "46-56": 0
  };

  Object.keys(frequency).forEach(n => {
    const num = parseInt(n);
    if (num <= 9) sectionCount["1-9"] += frequency[n];
    else if (num <= 18) sectionCount["10-18"] += frequency[n];
    else if (num <= 27) sectionCount["19-27"] += frequency[n];
    else if (num <= 36) sectionCount["28-36"] += frequency[n];
    else if (num <= 45) sectionCount["37-45"] += frequency[n];
    else sectionCount["46-56"] += frequency[n];
  });

  return { frequency, delay, sectionCount };
}
