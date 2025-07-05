
document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  analyzeBtn.addEventListener("click", () => {
    const game = document.getElementById("gameSelect").value;
    analyzeGame(game);
  });
});

async function analyzeGame(game) {
  try {
    const data = await fetchGameData(game);
    const analysis = analyzeData(data);
    displayAnalysis(analysis);
    showUserInputSection();
    suggestCombination(data);
  } catch (error) {
    console.error("❌ Error al analizar el juego:", error);
    alert("Hubo un problema al analizar los sorteos. Intenta nuevamente.");
  }
}

function displayAnalysis(analysis) {
  const section = document.getElementById("analysisResults");
  section.innerHTML = \`
    <h2 class="subtitle">📊 Análisis de los últimos 50 sorteos:</h2>
    <ul>
      <li><strong>Números más frecuentes:</strong> \${analysis.frequent.join(", ")}</li>
      <li><strong>Números más atrasados:</strong> \${analysis.delayed.join(", ")}</li>
      <li><strong>Distribución por secciones:</strong></li>
    </ul>
    <ul>
      \${analysis.distribution.map((count, i) => \`<li>Sección \${i + 1}: \${count} números</li>\`).join("")}
    </ul>
  \`;
  section.classList.remove("is-hidden");
}

function showUserInputSection() {
  const inputContainer = document.getElementById("numberInputs");
  inputContainer.innerHTML = "";
  for (let i = 1; i <= 6; i++) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = 1;
    input.max = 56;
    input.className = "input is-small";
    input.style.width = "60px";
    input.required = true;
    inputContainer.appendChild(input);
  }
  document.getElementById("userInputSection").classList.remove("is-hidden");
  document.getElementById("checkCombinationBtn").addEventListener("click", checkCombination);
}

function checkCombination() {
  const inputs = document.querySelectorAll("#numberInputs input");
  const combination = Array.from(inputs).map(input => parseInt(input.value, 10)).filter(n => !isNaN(n));
  if (combination.length !== 6) {
    alert("Por favor ingresa 6 números válidos entre 1 y 56.");
    return;
  }
  const probability = calculateProbability(combination);
  document.getElementById("combinationResult").innerHTML = \`
    <p>🔎 Probabilidad estimada de esta combinación: <strong>\${(probability * 100).toFixed(6)}%</strong></p>
  \`;
}

function suggestCombination(data) {
  const suggestion = generateSmartCombination(data);
  document.getElementById("suggestedCombo").textContent = suggestion.join(" - ");
  document.getElementById("suggestedComboSection").classList.remove("is-hidden");
}
