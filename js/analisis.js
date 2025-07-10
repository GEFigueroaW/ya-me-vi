document.addEventListener('DOMContentLoaded', () => {
  let selectedOption = 'melate';

  // Botones de opción
  document.getElementById('melateBtn').addEventListener('click', () => {
    selectedOption = 'melate';
    highlightSelected('melateBtn');
  });
  document.getElementById('melateRevanchaBtn').addEventListener('click', () => {
    selectedOption = 'melate_revancha';
    highlightSelected('melateRevanchaBtn');
  });
  document.getElementById('todosBtn').addEventListener('click', () => {
    selectedOption = 'todos';
    highlightSelected('todosBtn');
  });

  function highlightSelected(id) {
    ['melateBtn', 'melateRevanchaBtn', 'todosBtn'].forEach(btnId => {
      const btn = document.getElementById(btnId);
      btn.classList.remove('is-dark');
    });
    document.getElementById(id).classList.add('is-dark');
  }

  // Análisis principal
  document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const resultsContainer = document.getElementById('results');
    const predictionContainer = document.getElementById('prediction');
    resultsContainer.innerHTML = '<p>Cargando y procesando sorteos...</p>';
    predictionContainer.innerHTML = '';

    const files = [];
    if (selectedOption === 'melate' || selectedOption === 'melate_revancha' || selectedOption === 'todos') {
      files.push({ nombre: 'Melate', url: 'https://www.loterianacional.gob.mx/Content/historicos/Melate.xlsx' });
    }
    if (selectedOption === 'melate_revancha' || selectedOption === 'todos') {
      files.push({ nombre: 'Revancha', url: 'https://www.loterianacional.gob.mx/Content/historicos/Revancha.xlsx' });
    }
    if (selectedOption === 'todos') {
      files.push({ nombre: 'Revanchita', url: 'https://www.loterianacional.gob.mx/Content/historicos/Revanchita.xlsx' });
    }

    const allDraws = [];
    for (const file of files) {
      const draws = await DataParser.parseExcel(file.url);
      allDraws.push(...draws);
    }

    if (allDraws.length === 0) {
      resultsContainer.innerHTML = '<p>No se pudieron procesar los sorteos.</p>';
      return;
    }

    resultsContainer.innerHTML = '<canvas id="freqChart" height="100"></canvas><canvas id="delayChart" height="100"></canvas><canvas id="zonesChart" height="100"></canvas>';
    DataParser.showFrequencyChart(allDraws, 'freqChart');
    DataParser.showDelayChart(allDraws, 'delayChart');
    DataParser.showZoneChart(allDraws, 'zonesChart');

    const prediccion = await mlPredictor.generarPrediccion(allDraws);
    predictionContainer.innerHTML = `
      <div class="box has-background-info-light mt-5">
        <h2 class="title is-5">🎯 Predicción basada en patrones, estadísticas e IA</h2>
        <p><strong>Combinación sugerida:</strong> ${prediccion.join(', ')}</p>
      </div>
    `;
  });
});
