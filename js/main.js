document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const resultBox = document.getElementById("analysisResults");
  const frequencyChartCanvas = document.getElementById("frequencyChart");
  const delayChartCanvas = document.getElementById("delayChart");

  analyzeBtn.addEventListener("click", async () => {
    const game = document.getElementById("gameSelect").value;
    try {
      const data = await fetchData(game);
      const { frequency, delay, sectionCount, top6Freq, top6Delay } = analyzeNumbers(data);

      resultBox.innerHTML = `
        <h2 class="subtitle">📊 Análisis estadístico:</h2>
        <p><strong>Frecuencias más altas:</strong> ${top6Freq.join(', ')}</p>
        <p><strong>Números más retrasados:</strong> ${top6Delay.join(', ')}</p>
        <p><strong>Distribución por secciones:</strong></p>
        ${Object.entries(sectionCount).map(([range, count]) => `${range}: ${count}`).join('<br>')}
      `;
      resultBox.classList.remove("is-hidden");

      renderCharts(top6Freq, top6Delay);

      const suggestion = suggestCombination(top6Freq, top6Delay);
      document.getElementById("suggestedCombo").textContent = suggestion.join(', ');
      document.getElementById("suggestedComboSection").classList.remove("is-hidden");
      document.getElementById("chartsSection").classList.remove("is-hidden");
    } catch (e) {
      alert("Error al analizar datos");
      console.error(e);
    }
  });

  function renderCharts(freq, delay) {
    new Chart(frequencyChart, {
      type: "bar",
      data: {
        labels: freq.map(String),
        datasets: [{
          label: "Frecuencia",
          data: freq.map(() => Math.floor(Math.random() * 100)),
          backgroundColor: "#48c78e"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    new Chart(delayChart, {
      type: "bar",
      data: {
        labels: delay.map(String),
        datasets: [{
          label: "Retraso",
          data: delay.map(() => Math.floor(Math.random() * 100)),
          backgroundColor: "#f14668"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  function suggestCombination(freq, delay) {
    const combined = [...new Set([...freq.slice(0, 4), ...delay.slice(0, 4)])];
    while (combined.length < 6) {
      combined.push(Math.floor(Math.random() * 56) + 1);
    }
    return combined.sort((a, b) => a - b);
  }
});
