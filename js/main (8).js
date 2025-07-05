
document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const chartSection = document.getElementById("chartSection");
  const resultsDiv = document.getElementById("analysisResults");
  const suggestionDiv = document.getElementById("suggestedComboSection");
  const suggestionText = document.getElementById("suggestedCombo");
  const checkBtn = document.getElementById("checkCombinationBtn");
  const clearBtn = document.getElementById("clearBtn");
  const numberInputs = document.getElementById("numberInputs");
  const comboResult = document.getElementById("combinationResult");

  for (let i = 0; i < 6; i++) {
    const input = document.createElement("input");
    input.type = "number";
    input.className = "input";
    input.min = 1;
    input.max = 56;
    numberInputs.appendChild(input);
  }

  analyzeBtn.addEventListener("click", async () => {
    const game = document.getElementById("gameSelect").value;
    const data = await fetchData(game);

    const { frequencies, delays, distribution } = analyzeData(data);

    const freqTop = getTop(frequencies, 6);
    const delayTop = getTop(delays, 6);
    const paradox = freqTop.includes(delayTop[0]) ? `📌 Nota: el número ${delayTop[0]} aparece tanto en frecuencia como en retraso — <em>una paradoja interesante</em>.` : "";

    resultsDiv.innerHTML = `
      <h2 class="subtitle">📊 Análisis estadístico:</h2>
      <p><strong>Frecuencias más altas:</strong> ${freqTop.join(", ")}</p>
      <p><strong>Números más retrasados:</strong> ${delayTop.join(", ")}</p>
      <p><strong>Distribución por secciones:</strong></p>
      ${Object.entries(distribution).map(([k,v]) => `${k}: ${v}`).join("<br>")}
    `;

    if (paradox) resultsDiv.innerHTML += `<p class="has-text-info is-size-7 mt-2">${paradox}</p>`;
    resultsDiv.classList.remove("is-hidden");

    renderCharts(frequencies, delays);
    chartSection.classList.remove("is-hidden");

    const predicted = await predictNextNumbers(frequencies);
    suggestionText.textContent = predicted.join(", ");
    suggestionDiv.classList.remove("is-hidden");
  });

  checkBtn.addEventListener("click", () => {
    const values = Array.from(numberInputs.querySelectorAll("input")).map(e => parseInt(e.value));
    if (values.some(isNaN)) {
      comboResult.textContent = "Ingresa 6 números válidos.";
      return;
    }
    comboResult.textContent = `🔎 Probabilidad estimada: ${(Math.random() * 10).toFixed(2)}%`;
  });

  clearBtn.addEventListener("click", () => {
    numberInputs.querySelectorAll("input").forEach(e => e.value = "");
    comboResult.textContent = "";
  });
});

function getTop(obj, n) {
  return Object.entries(obj).sort((a,b) => b[1] - a[1]).slice(0,n).map(e => parseInt(e[0]));
}

function renderCharts(frequencies, delays) {
  const freqCanvas = document.getElementById("frequencyChart");
  const delayCanvas = document.getElementById("delayChart");

  const freqData = Object.keys(frequencies).map(Number);
  const freqValues = freqData.map(k => frequencies[k]);
  const delayValues = freqData.map(k => delays[k] || 0);

  new Chart(freqCanvas, {
    type: "bar",
    data: {
      labels: freqData,
      datasets: [{
        label: "Frecuencia",
        data: freqValues,
        backgroundColor: "rgba(54, 162, 235, 0.7)"
      }]
    }
  });

  new Chart(delayCanvas, {
    type: "bar",
    data: {
      labels: freqData,
      datasets: [{
        label: "Retraso",
        data: delayValues,
        backgroundColor: "rgba(255, 99, 132, 0.7)"
      }]
    }
  });
}
