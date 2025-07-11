export async function cargarDatosHistoricos(modo) {
  const urls = {
    melate: 'assets/melate.csv',
    'melate-revancha': ['assets/melate.csv', 'assets/revancha.csv'],
    todos: ['assets/melate.csv', 'assets/revancha.csv', 'assets/revanchita.csv']
  };

  const archivos = Array.isArray(urls[modo]) ? urls[modo] : [urls[modo]];
  let todosLosNumeros = [];

  for (const archivo of archivos) {
    const texto = await fetch(archivo).then(res => res.text());
    const lineas = texto.trim().split('\n').slice(1); // sin encabezado

    lineas.forEach(linea => {
      const cols = linea.split(',');
      const nums = cols.slice(2, 8).map(n => parseInt(n, 10));
      todosLosNumeros.push(...nums);
    });
  }

  return todosLosNumeros.filter(n => !isNaN(n));
}

export function graficarEstadisticas(numeros) {
  const frecuencia = Array(56).fill(0);
  const delay = Array(56).fill(0);
  const rangos = [0, 0, 0, 0, 0, 0];

  // Cálculo de frecuencia
  numeros.forEach(n => frecuencia[n - 1]++);

  // Cálculo de delay (simple: el número que más tiempo ha pasado sin salir)
  const vistos = new Set();
  for (let i = numeros.length - 1; i >= 0; i--) {
    const n = numeros[i];
    if (!vistos.has(n)) {
      delay[n - 1] = numeros.length - i;
      vistos.add(n);
    }
  }

  // Distribución por rangos
  numeros.forEach(n => {
    const i = Math.floor((n - 1) / 9);
    rangos[i]++;
  });

  mostrarGrafico('frecuenciaChart', 'Frecuencia de Números', frecuencia);
  mostrarGrafico('delayChart', 'Números más Atrasados (Delay)', delay);
  mostrarGrafico('rangosChart', 'Distribución por Rangos (1-56)', rangos);
}

function mostrarGrafico(id, titulo, datos) {
  const ctx = document.getElementById(id).getContext('2d');
  if (window[id]) {
    window[id].destroy(); // Evita duplicación
  }

  window[id] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: datos.length === 6 ? ['1–9','10–18','19–27','28–36','37–45','46–56'] : datos.map((_, i) => i + 1),
      datasets: [{
        label: titulo,
        data: datos,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: '#4F46E5',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1F2937',
          titleColor: '#fff',
          bodyColor: '#fff'
        }
      }
    }
  });
}
