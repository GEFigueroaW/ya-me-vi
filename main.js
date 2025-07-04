// /js/main.js

let currentAnalysis = null;

// Al cargar, genera inputs numéricos
document.addEventListener("DOMContentLoaded", () => {
  const inputContainer = document.getElementById("numberInputs");
  for (let i = 0; i < 6; i++) {
    const div = document.createElement("div");
    div.classList.add("control");
    div.innerHTML = `<input type="number" min="1" max="56" class="input" required>`;
    inputContainer.appendChild(div);
  }

  document.getElementById("analyzeBtn").addEventListener("click", handleAnalysis);
  document.getElementById("checkCombinationBtn").addEventListener("click", checkUserCombination);
});

async function handleAnalysis() {
  const gameKey = document.getElementById("gameSelect").value;

  showLoading("analysisResults");

  currentAnalysis = await analyzeGame(gameKey);

  showResults(currentAnalysis, GAME_CONFIG[gameKey].maxNumber);
  showUserInputSection();
  showSuggestedCombo(currentAnalysis);
}

function showLoading(containerId) {
  const container = document.getElementById(containerId);
  container.classList.remove("is-hidden");
  container.innerHTML = `<p class="has-text-centered">⏳ Analizando sorteos...</p>`;
}

function showResults({ frequencies, delays, sectionDist }, maxNumber) {
  const container = document.getElementById("analysisResults");
  container.innerHTML = `<h2 class="subtitle">📊 Frecuencia y retraso:</h2>`;

  const table = document.createElement("table");
  table.classList.add("table", "is-fullwidth", "is-bordered", "is-hoverable");

  let html = `<thead><tr><th>Número</th><th>Frecuencia</th><th>Delay</th></tr></thead><tbody>`;

  for (let i = 1; i <= maxNumber; i++) {
    html += `<tr>
      <td>${i}</td>
      <td>${frequencies[i]}</td>
      <td>${delays[i]}</td>
    </tr>`;
  }

  html += `</tbody>`;
  table.innerHTML = html;
  container.appendChild(table);

  // Secciones
  container.innerHTML += `<h2 class="subtitle mt-5">📌 Distribución por sección:</h2><ul>`;
  sectionDist.forEach((sec, i) => {
    container.innerHTML += `<li><strong>${NUMBER_SECTIONS[i].name}:</strong> ${sec.percentage}%</li>`;
  });
  container.innerHTML += `</ul>`;
}

function showUserInputSection() {
  document.getElementById("userInputSection").classList.remove("is-hidden");
}

function checkUserCombination() {
  const inputs = [...document.querySelectorAll("#numberInputs input")];
  const combo = inputs.map(input => parseInt(input.value)).filter(n => !isNaN(n));

  if (combo.length !== 6 || new Set(combo).size !== 6) {
    alert("Por favor, ingresa 6 números únicos entre 1 y 56.");
    return;
  }

  const { frequencies, delays } = currentAnalysis;
  const totalDraws = currentAnalysis.draws.length;

  const resultDiv = document.getElementById("combinationResult");
  resultDiv.innerHTML = `<h3 class="subtitle">🔍 Análisis de tu combinación:</h3><ul>`;

  let totalProb = 0;
  combo.forEach(n => {
    const freq = frequencies[n];
    const delay = delays[n];
    const prob = ((freq / totalDraws) * 100).toFixed(2);
    totalProb += parseFloat(prob);

    resultDiv.innerHTML += `<li>
      <strong>${n}:</strong> 
      frecuencia ${freq}, 
      delay ${delay}, 
      probabilidad ~ <span class="high-prob">${prob}%</span>
    </li>`;
  });

  resultDiv.innerHTML += `</ul><p class="mt-3"><strong>Probabilidad total estimada (no exacta):</strong> 
    <span class="low-prob">${(totalProb / 6).toFixed(2)}%</span></p>`;
}

async function showSuggestedCombo(analysis) {
  const combo = await getSuggestedCombination(
    analysis.frequencies,
    analysis.delays,
    analysis.frequencies.length - 1
  );

  const display = document.getElementById("suggestedCombo");
  display.innerText = combo.join(" – ");
  document.getElementById("suggestedComboSection").classList.remove("is-hidden");
}
