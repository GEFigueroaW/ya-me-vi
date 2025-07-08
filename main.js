// Aquí se llamará a la función del archivo dataParser.js
document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const melate = document.getElementById('check-melate').checked;
  const revancha = document.getElementById('check-revancha').checked;
  const revanchita = document.getElementById('check-revanchita').checked;

  if (!melate && !revancha && !revanchita) {
    alert('Selecciona al menos un sorteo para analizar.');
    return;
  }

  const resultsDiv = document.getElementById('results');
  const predictionDiv = document.getElementById('prediction');
  resultsDiv.innerHTML = '';
  predictionDiv.innerHTML = '';

  const sorteos = [];
  if (melate) sorteos.push({ nombre: 'Melate', archivo: 'melate.csv' });
  if (revancha) sorteos.push({ nombre: 'Revancha', archivo: 'revancha.csv' });
  if (revanchita) sorteos.push({ nombre: 'Revanchita', archivo: 'revanchita.csv' });

  for (const sorteo of sorteos) {
    const draws = await DataParser.parseCSV(sorteo.archivo);
    const freq = DataParser.getFrequencies(draws);
    const delay = DataParser.getDelays(draws);
    const sections = DataParser.getSectionDistribution(draws);

    // Crear contenedor para este sorteo
    const section = document.createElement('div');
    section.classList.add('box');
    section.innerHTML = `
      <h3 class="title is-5">${sorteo.nombre}</h3>
      <canvas id="freq-${sorteo.nombre}"></canvas>
      <canvas id="delay-${sorteo.nombre}"></canvas>
      <canvas id="sections-${sorteo.nombre}"></canvas>`;
    resultsDiv.appendChild(section);

    // Gráfico de frecuencia
    new Chart(document.getElementById(`freq-${sorteo.nombre}`), {
      type: 'bar',
      data: {
        labels: Array.from({ length: 56 }, (_, i) => i + 1),
        datasets: [{
          label: 'Frecuencia',
          data: freq,
          backgroundColor: 'rgba(33, 150, 243, 0.5)'
        }]
      }
    });

    // Gráfico de retraso
    new Chart(document.getElementById(`delay-${sorteo.nombre}`), {
      type: 'bar',
      data: {
        labels: Array.from({ length: 56 }, (_, i) => i + 1),
        datasets: [{
          label: 'Retraso (número de sorteos)',
          data: delay,
          backgroundColor: 'rgba(255, 193, 7, 0.5)'
        }]
      }
    });

    // Gráfico de distribución por secciones
    new Chart(document.getElementById(`sections-${sorteo.nombre}`), {
      type: 'bar',
      data: {
        labels: ['1–9', '10–18', '19–27', '28–36', '37–45', '46–56'],
        datasets: [{
          label: 'Distribución por secciones',
          data: sections,
          backgroundColor: 'rgba(76, 175, 80, 0.5)'
        }]
      }
    });
  }
});
