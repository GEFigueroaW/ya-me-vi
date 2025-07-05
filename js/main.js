document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");

  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async () => {
      const selectedGame = document.getElementById("gameSelect").value;
      const resultsContainer = document.getElementById("analysisResults");
      const inputSection = document.getElementById("userInputSection");
      const suggestionSection = document.getElementById("suggestedComboSection");

      resultsContainer.classList.remove("is-hidden");
      resultsContainer.innerHTML = "⏳ Analizando sorteos...";

      inputSection.classList.add("is-hidden");
      suggestionSection.classList.add("is-hidden");

      try {
        const gameData = await fetchGameData(selectedGame);
        const analysis = analyzeGame(gameData);

        resultsContainer.innerHTML = `
          <p><strong>Total sorteos analizados:</strong> ${analysis.total}</p>
          <p><strong>Números más frecuentes:</strong> ${analysis.frequent.join(", ")}</p>
          <p><strong>Números más atrasados:</strong> ${analysis.delayed.join(", ")}</p>
          <p><strong>Distribución por secciones:</strong></p>
          <ul>${Object.entries(analysis.sections).map(([section, count]) => `<li>${section}: ${count}</li>`).join("")}</ul>
        `;

        renderNumberInputs();
        inputSection.classList.remove("is-hidden");

        const suggestion = generateAISuggestion(gameData);
        document.getElementById("suggestedCombo").textContent = suggestion.join(" - ");
        suggestionSection.classList.remove("is-hidden");

      } catch (error) {
        resultsContainer.innerHTML = `<p class="has-text-danger">❌ Error al analizar los sorteos: ${error.message}</p>`;
      }
    });
  }

  // Evento para ver la probabilidad de una combinación
  const checkBtn = document.getElementById("checkCombinationBtn");
  if (checkBtn) {
    checkBtn.addEventListener("click", () => {
      const numbers = [...document.querySelectorAll(".numberInput")]
        .map(input => parseInt(input.value))
        .filter(n => !isNaN(n));

      const selectedGame = document.getElementById("gameSelect").value;
      const resultDiv = document.getElementById("combinationResult");

      if (numbers.length !== 6) {
        resultDiv.innerHTML = `<p class="has-text-warning">Debes ingresar exactamente 6 números.</p>`;
        return;
      }

      calculateProbability(selectedGame, numbers)
        .then(prob => {
          resultDiv.innerHTML = `<p>Probabilidad estimada: <strong>${(prob * 100).toFixed(4)}%</strong></p>`;
        })
        .catch(err => {
          resultDiv.innerHTML = `<p class="has-text-danger">❌ Error al calcular: ${err.message}</p>`;
        });
    });
  }
});
