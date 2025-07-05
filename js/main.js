// main.js

document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const checkCombinationBtn = document.getElementById("checkCombinationBtn");
  const clearBtn = document.getElementById("clearBtn");
  const gameSelect = document.getElementById("gameSelect");

  analyzeBtn?.addEventListener("click", async () => {
    const gameType = gameSelect.value;
    const data = await fetchGameData(gameType);
    const { frequency, delay, sectionCount } = analyzeGameData(data);
    showAnalysisResults(frequency, delay, sectionCount);
    const prediction = predictNextNumbers(data);
    showSuggestedCombo(prediction);
  });

  checkCombinationBtn?.addEventListener("click", () => {
    const input = document.getElementById("numberInputs");
    const numbers = [...input.querySelectorAll("input")].map(el => parseInt(el.value.trim(), 10));
    if (numbers.length !== 6 || numbers.some(isNaN)) {
      alert("Por favor, ingresa 6 números válidos.");
      return;
    }
    checkCombinationProbability(numbers);
  });

  clearBtn?.addEventListener("click", () => {
    const input = document.getElementById("numberInputs");
    input.querySelectorAll("input").forEach(el => el.value = "");
    document.getElementById("combinationResult").innerHTML = "";
  });

  generateNumberInputs(); // genera inputs numéricos
});

function showAnalysisResults(frequency, delay, sectionCount) {
  const container = document.getElementById("analysisResults");
  container.classList.remove("is-hidden");
  container.innerHTML = `
    <h2 class="subtitle">📊 Análisis estadístico:</h2>
    <p><strong>Frecuencias más altas:</strong> ${getTopNumbers(frequency, 6).join(", ")}</p>
    <p><strong>Números más retrasados:</strong> ${getTopNumbers(delay, 6, true).join(", ")}</p>
    <p><strong>Distribución por secciones:</strong></p>
    <ul>
      ${Object.entries(sectionCount).map(([sec, count]) => `<li>${sec}: ${count}</li>`).join("")}
    </ul>
  `;
}

function showSuggestedCombo(prediction) {
  document.getElementById("suggestedComboSection").classList.remove("is-hidden");
  document.getElementById("suggestedCombo").textContent = prediction.join(", ");
}

function checkCombinationProbability(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b).join("-");
  const message = `🔢 Tu combinación: ${numbers.join(", ")}\nProbabilidad (estimada): 1 en ${Math.pow(56, 6).toLocaleString()}`;
  document.getElementById("combinationResult").innerText = message;
}

function generateNumberInputs() {
  const container = document.getElementById("numberInputs");
  for (let i = 0; i < 6; i++) {
    const div = document.createElement("div");
    div.className = "control";
    div.innerHTML = `<input type="number" min="1" max="56" class="input" placeholder="${i + 1}">`;
    container.appendChild(div);
  }
}

function getTopNumbers(obj, count = 6, descending = false) {
  return Object.entries(obj)
    .sort((a, b) => descending ? b[1] - a[1] : a[1] - b[1])
    .slice(0, count)
    .map(([num]) => num);
}
