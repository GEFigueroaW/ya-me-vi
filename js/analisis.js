document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const backBtn = document.getElementById('backBtn');

  analyzeBtn.addEventListener('click', async () => {
    const onlyMelate = document.getElementById('check-melate').checked;
    const includeRevancha = document.getElementById('check-revancha').checked;
    const includeRevanchita = document.getElementById('check-revanchita').checked;

    const files = [];

    if (onlyMelate) {
      files.push('https://www.loterianacional.gob.mx/Content/Melate/MelateHistorico.csv');
    } else if (includeRevancha) {
      files.push(
        'https://www.loterianacional.gob.mx/Content/Melate/MelateHistorico.csv',
        'https://www.loterianacional.gob.mx/Content/Melate/RevanchaHistorico.csv'
      );
    } else if (includeRevanchita) {
      files.push(
        'https://www.loterianacional.gob.mx/Content/Melate/MelateHistorico.csv',
        'https://www.loterianacional.gob.mx/Content/Melate/RevanchaHistorico.csv',
        'https://www.loterianacional.gob.mx/Content/Melate/RevanchitaHistorico.csv'
      );
    } else {
      alert('Selecciona una opción de análisis');
      return;
    }

    let allDraws = [];
    for (const file of files) {
      const draws = await DataParser.parseCSV(file);
      allDraws = allDraws.concat(draws);
    }

    DataParser.showFrequencyChart(allDraws, 'chartFrecuencia');
    DataParser.showDelayChart(allDraws, 'chartRetraso');
    DataParser.showZoneChart(allDraws, 'chartZonas');

    const prediction = await mlPredictor.generarPrediccion(allDraws);
    document.getElementById('prediction').innerHTML = `
      <div class="box has-background-success has-text-white">
        <h3 class="title is-5">Predicción IA</h3>
        <p>Posible combinación para próximo sorteo:</p>
        <h2 class="title is-3">${prediction.join(' - ')}</h2>
      </div>
    `;
  });

  backBtn.addEventListener('click', () => {
    window.location.href = 'menu.html';
  });
});
