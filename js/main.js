let gameData = [];

// Analizar los últimos 50 sorteos
document.getElementById("analyzeBtn").addEventListener("click", async () => {
  try {
    const gameType = document.getElementById("gameSelector").value;
    const response = await fetch(`./data/${gameType}.csv`);
    const csvText = await response.text();
    gameData = parseCSV(csvText);
    const result = analyzeGame(gameData);
    document.getElementById("resultsContainer").innerHTML = `
      <h2 class="title is-5">Resultados del análisis (${gameType})</h2>
      <p><strong>Total de sorteos analizados:</strong> ${gameData.length}</p>
      <p><strong>Número más frecuente:</strong> ${result.mostFrequent}</p>
      <p><strong>Número con mayor retraso:</strong> ${result.mostDelayed}</p>
      <p><strong>Distribución por secciones:</strong></p>
      <pre>${JSON.stringify(result.sectionDistribution, null, 2)}</pre>
    `;
  } catch (error) {
    document.getElementById("resultsContainer").innerHTML =
      `<div class="notification is-danger">❌ Error al analizar los sorteos: ${error.message}</div>`;
  }
});

// Verificar combinación ingresada por el usuario
document.getElementById("checkCombinationBtn").addEventListener("click", () => {
  try {
    const userInput = document.getElementById("userCombination").value.trim();
    const userNumbers = userInput.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));

    if (userNumbers.length !== 6) {
      throw new Error("Debes ingresar exactamente 6 números válidos separados por comas.");
    }

    if (gameData.length === 0) {
      throw new Error("Primero debes analizar los últimos sorteos.");
    }

    const countMatches = gameData.filter(draw => {
      return userNumbers.every(n => draw.includes(n));
    }).length;

    const probability = ((countMatches / gameData.length) * 100).toFixed(4);

    document.getElementById("combinationResult").innerHTML = `
      <div class="notification is-success">
        ✅ Tu combinación <strong>[${userNumbers.join(", ")}]</strong> apareció 
        <strong>${countMatches}</strong> veces en los últimos ${gameData.length} sorteos.<br>
        <strong>Probabilidad histórica:</strong> ${probability}%
      </div>
    `;
  } catch (error) {
    document.getElementById("combinationResult").innerHTML =
      `<div class="notification is-danger">❌ ${error.message}</div>`;
  }
});
