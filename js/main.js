// 🔁 Función para renderizar los gráficos
function renderCharts(frequency, delay) {
  const freqData = Object.entries(frequency).sort((a, b) => b[1] - a[1]).slice(0, 20);
  const delayData = Object.entries(delay).sort((a, b) => b[1] - a[1]).slice(0, 20);

  const freqLabels = freqData.map(e => e[0]);
  const freqValues = freqData.map(e => e[1]);

  const delayLabels = delayData.map(e => e[0]);
  const delayValues = delayData.map(e => e[1]);

  // Frecuencia Chart
  new Chart(document.getElementById('freqChart'), {
    type: 'bar',
    data: {
      labels: freqLabels,
      datasets: [{
        label: 'Veces que ha salido',
        backgroundColor: '#ff6f61',
        data: freqValues
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });

  // Retraso Chart
  new Chart(document.getElementById('delayChart'), {
    type: 'bar',
    data: {
      labels: delayLabels,
      datasets: [{
        label: 'Sorteos desde última aparición',
        backgroundColor: '#4a90e2',
        data: delayValues
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });

  document.getElementById('frequencyChartContainer').classList.remove('is-hidden');
  document.getElementById('delayChartContainer').classList.remove('is-hidden');
}

// ⚡ Detecta paradojas (números frecuentes y retrasados)
function detectParadojas(frequency, delay) {
  const topFrequent = Object.entries(frequency).sort((a, b) => b[1] - a[1]).slice(0, 20).map(e => parseInt(e[0]));
  const topDelayed = Object.entries(delay).sort((a, b) => b[1] - a[1]).slice(0, 20).map(e => parseInt(e[0]));

  const paradojas = topFrequent.filter(num => topDelayed.includes(num));

  if (paradojas.length > 0) {
    const display = paradojas.map(num => `<strong class="has-text-warning-dark">${num}</strong>`).join(', ');
    const list = document.getElementById('paradojaList');
    list.innerHTML = `Los siguientes números son altamente frecuentes y llevan tiempo sin salir: ⚡ ${display}`;
    document.getElementById('paradojaContainer').classList.remove('is-hidden');
  } else {
    document.getElementById('paradojaContainer').classList.add('is-hidden');
  }
}

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
    renderCharts(frequency, delay);
    detectParadojas(frequency, delay);
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
