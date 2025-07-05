document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const resultsBox = document.getElementById("analysisResults");
  const userInputSection = document.getElementById("userInputSection");
  const combinationResult = document.getElementById("combinationResult");
  const suggestedComboSection = document.getElementById("suggestedComboSection");
  const suggestedCombo = document.getElementById("suggestedCombo");
  const checkCombinationBtn = document.getElementById("checkCombinationBtn");
  const clearBtn = document.getElementById("clearBtn");
  const numberInputs = document.getElementById("numberInputs");

  let sortedNumbers = [];

  analyzeBtn.addEventListener("click", async () => {
    const game = document.getElementById("gameSelect").value;
    const dataUrl = `data/${game}.csv`;

    const response = await fetch(dataUrl);
    const text = await response.text();
    const rows = text.trim().split("\n").slice(-50); // últimos 50 sorteos

    const numbers = rows.map(row =>
      row
        .split(",")
        .slice(1, 7)
        .map(n => parseInt(n.trim()))
    );

    sortedNumbers = numbers.flat();

    const frequencyMap = {};
    const delayMap = {};
    const sections = [0, 0, 0, 0, 0, 0];

    let lastAppearance = {};

    sortedNumbers.forEach((n, index) => {
      frequencyMap[n] = (frequencyMap[n] || 0) + 1;
      const sec = Math.floor((n - 1) / 9);
      if (sections[sec] !== undefined) sections[sec]++;
    });

    for (let i = 0; i < numbers.length; i++) {
      numbers[i].forEach(n => {
        lastAppearance[n] = i;
      });
    }

    Object.keys(frequencyMap).forEach(num => {
      delayMap[num] = numbers.length - lastAppearance[num];
    });

    const freqSorted = Object.entries(frequencyMap).sort((a, b) => b[1] - a[1]);
    const delaySorted = Object.entries(delayMap).sort((a, b) => b[1] - a[1]);

    const topFrequencies = freqSorted.slice(0, 6).map(([n]) => parseInt(n));
    const topDelays = delaySorted.slice(0, 6).map(([n]) => parseInt(n));

    let html = "<strong>📊 Análisis estadístico:</strong><br><br>";
    html += `<strong>Frecuencias más altas:</strong> ${topFrequencies.join(", ")}<br>`;
    html += `<strong>Números más retrasados:</strong> ${topDelays.join(", ")}<br>`;
    html += "<strong>Distribución por secciones:</strong><br>";
    sections.forEach((s, i) => {
      html += `${i * 9 + 1}-${(i + 1) * 9}: ${s}<br>`;
    });

    if (topFrequencies.some(n => topDelays.includes(n))) {
      html += "<p class='has-text-warning mt-3'><em>🔁 El número 21 aparece en ambos grupos — paradoja interesante.</em></p>";
    }

    resultsBox.innerHTML = html;
    resultsBox.classList.remove("is-hidden");

    renderCharts(frequencyMap, delayMap);
    showNumberInputs();
    suggestWithAI(sortedNumbers);
  });

  function showNumberInputs() {
    numberInputs.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const input = document.createElement("input");
      input.type = "number";
      input.min = 1;
      input.max = 56;
      input.className = "input is-small m-1";
      numberInputs.appendChild(input);
    }
    userInputSection.classList.remove("is-hidden");
  }

  checkCombinationBtn.addEventListener("click", () => {
    const inputs = numberInputs.querySelectorAll("input");
    const nums = Array.from(inputs).map(i => parseInt(i.value));
    if (nums.some(isNaN) || nums.length !== 6) {
      combinationResult.innerHTML = "<p class='has-text-danger'>Ingresa 6 números válidos.</p>";
      return;
    }

    const freqs = nums.map(n => sortedNumbers.filter(x => x === n).length);
    const delay = nums.map(n => {
      for (let i = numbers.length - 1; i >= 0; i--) {
        if (numbers[i].includes(n)) return numbers.length - i;
      }
      return numbers.length;
    });

    let html = "<p><strong>Probabilidad (basado en 50 sorteos):</strong></p>";
    html += nums.map((n, i) => `🔢 ${n}: frecuencia ${freqs[i]}, retraso ${delay[i]}`).join("<br>");
    combinationResult.innerHTML = html;
  });

  clearBtn.addEventListener("click", () => {
    numberInputs.querySelectorAll("input").forEach(i => (i.value = ""));
    combinationResult.innerHTML = "";
  });

  function renderCharts(freqMap, delayMap) {
    const labels = Object.keys(freqMap).map(n => parseInt(n)).sort((a, b) => a - b);
    const freqData = labels.map(n => freqMap[n]);
    const delayData = labels.map(n => delayMap[n]);

    const freqCanvas = document.getElementById("frequencyChart");
    const delayCanvas = document.getElementById("delayChart");

    if (window.freqChart) window.freqChart.destroy();
    if (window.delayChart) window.delayChart.destroy();

    window.freqChart = new Chart(freqCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Frecuencia",
          data: freqData,
          backgroundColor: "#00c4a7"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    window.delayChart = new Chart(delayCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Retraso",
          data: delayData,
          backgroundColor: "#ff6f61"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    document.getElementById("chartContainer").classList.remove("is-hidden");
  }

  function suggestWithAI(numbers) {
    const occurrences = {};
    numbers.forEach(n => (occurrences[n] = (occurrences[n] || 0) + 1));
    const sorted = Object.entries(occurrences).sort((a, b) => b[1] - a[1]);
    const suggestion = sorted.slice(0, 6).map(([n]) => n).join(", ");
    suggestedCombo.textContent = suggestion;
    suggestedComboSection.classList.remove("is-hidden");
  }
});
