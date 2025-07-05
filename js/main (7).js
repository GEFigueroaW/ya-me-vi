// Ejemplo de función que genera gráficas (simplificada)
function renderCharts(freqData, delayData) {
  const ctx1 = document.getElementById("frequencyChart").getContext("2d");
  const ctx2 = document.getElementById("delayChart").getContext("2d");

  new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: Object.keys(freqData),
      datasets: [{
        label: 'Frecuencia',
        data: Object.values(freqData),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: { responsive: true }
  });

  new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: Object.keys(delayData),
      datasets: [{
        label: 'Retraso',
        data: Object.values(delayData),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: { responsive: true }
  });
}
