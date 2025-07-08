
document.addEventListener('DOMContentLoaded', () => {
  const analizarBtn = document.getElementById('analizarBtn');
  const resultadoContainer = document.getElementById('resultado');
  const canvasFrecuencia = document.getElementById('chartFrecuencia');
  const canvasRetraso = document.getElementById('chartRetraso');
  const canvasSecciones = document.getElementById('chartSecciones');
  const analizarJuegoSelect = document.getElementById('analizarJuego');

  analizarBtn.addEventListener('click', async () => {
    const juegoSeleccionado = analizarJuegoSelect.value;
    if (!juegoSeleccionado) return;

    resultadoContainer.style.display = 'block';

    const juegos = {
      melate: 'data/melate.csv',
      revancha: 'data/revancha.csv',
      revanchita: 'data/revanchita.csv'
    };

    const archivo = juegos[juegoSeleccionado];
    const draws = await DataParser.parseCSV(archivo);

    const frecuencias = DataParser.getFrequencies(draws);
    const retrasos = DataParser.getDelays(draws);
    const secciones = DataParser.getSectionDistribution(draws);

    new Chart(canvasFrecuencia, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 56 }, (_, i) => i + 1),
        datasets: [{
          label: 'Frecuencia de Números',
          data: frecuencias
        }]
      }
    });

    new Chart(canvasRetraso, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 56 }, (_, i) => i + 1),
        datasets: [{
          label: 'Retraso de Números',
          data: retrasos
        }]
      }
    });

    new Chart(canvasSecciones, {
      type: 'pie',
      data: {
        labels: ['1-9', '10-18', '19-27', '28-36', '37-45', '46-56'],
        datasets: [{
          label: 'Distribución por Sección',
          data: secciones
        }]
      }
    });
  });

  const evaluarBtn = document.getElementById('evaluarBtn');
  evaluarBtn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('#numerosInput input');
    const nums = Array.from(inputs).map(el => parseInt(el.value)).filter(n => !isNaN(n));
    if (nums.length === 6) {
      mlPredictor.mostrarEvaluacion(nums);
    } else {
      alert('Por favor ingresa 6 números válidos.');
    }
  });
});
