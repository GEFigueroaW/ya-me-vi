const DataParser = {
  async parseCSV(url) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const lines = text.trim().split('\n');
      const draws = [];

      for (let i = 1; i < lines.length; i++) { // Saltar encabezado
        const row = lines[i].split(',');
        if (row.length >= 7) {
          const nums = row.slice(1, 7).map(n => parseInt(n)).filter(n => !isNaN(n));
          if (nums.length === 6) draws.push(nums);
        }
      }

      return draws;
    } catch (error) {
      console.error("Error al leer CSV:", error);
      return [];
    }
  },

  showFrequencyChart(draws, canvasId) {
    const frequency = Array(56).fill(0);
    draws.forEach(combo => combo.forEach(num => frequency[num - 1]++));

    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 56 }, (_, i) => i + 1),
        datasets: [{
          label: 'Frecuencia de aparición',
          data: frequency,
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  },

  showDelayChart(draws, canvasId) {
    const lastSeen = Array(56).fill(null);
    for (let i = draws.length - 1; i >= 0; i--) {
      draws[i].forEach(n => {
        if (lastSeen[n - 1] === null) {
          lastSeen[n - 1] = draws.length - i;
        }
      });
    }

    const delays = lastSeen.map(d => d ?? draws.length);

    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 56 }, (_, i) => i + 1),
        datasets: [{
          label: 'Retraso desde última aparición',
          data: delays,
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  },

  showZoneChart(draws, canvasId) {
    const zones = [0, 0, 0, 0, 0, 0]; // 1–9, 10–18, ..., 46–56

    draws.forEach(combo => {
      combo.forEach(num => {
        const zoneIndex = Math.floor((num - 1) / 9);
        zones[zoneIndex]++;
      });
    });

    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1–9', '10–18', '19–27', '28–36', '37–45', '46–56'],
        datasets: [{
          label: 'Distribución por secciones',
          data: zones,
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }
};
