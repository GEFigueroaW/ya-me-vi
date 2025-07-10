// main.js con diseño responsivo optimizado para móviles

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const menu = document.getElementById('menu');
  const welcome = document.getElementById('welcome');

  const tabAnalisis = document.getElementById('tab-analisis');
  const tabEvaluar = document.getElementById('tab-evaluar');
  const seccionAnalisis = document.getElementById('analisis');
  const seccionEvaluar = document.getElementById('evaluar');
  const evaluateBtn = document.getElementById('evaluateBtn');

  const analyzeBtn = document.getElementById('analyzeBtn');
  const results = document.getElementById('results');
  const prediction = document.getElementById('prediction');

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      welcome.innerHTML = `<strong>¡Hola ${user.displayName.split(' ')[0]}!</strong>`;
      menu.classList.remove('is-hidden');
      verificarSueño(user.uid);
    } else {
      window.location.href = 'index.html';
    }
  });

  logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut();
  });

  analyzeBtn.addEventListener('click', async () => {
    results.innerHTML = '';

    let seleccion = document.querySelector('input[name="analisis"]:checked');
    if (!seleccion) return;

    const archivos = [];
    if (seleccion.value === 'melate') archivos.push('data/melate.csv');
    if (seleccion.value === 'melate_revancha') archivos.push('data/melate.csv', 'data/revancha.csv');
    if (seleccion.value === 'todos') archivos.push('data/melate.csv', 'data/revancha.csv', 'data/revanchita.csv');

    for (const archivo of archivos) {
      const draws = await DataParser.parseCSV(archivo);
      const frecuencia = {}, retraso = {}, secciones = [0, 0, 0, 0, 0, 0];
      let ultimo = draws[draws.length - 1] || [];

      draws.forEach((draw, index) => {
        draw.forEach(num => {
          frecuencia[num] = (frecuencia[num] || 0) + 1;
          retraso[num] = draws.length - index;
          const idx = Math.floor((num - 1) / 9);
          secciones[idx]++;
        });
      });

      const topFrecuencia = Object.entries(frecuencia).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const canvasId = `chart-${archivo}`;
      const pieCanvasId = `pie-${archivo}`;

      const card = document.createElement('div');
      card.classList.add('box', 'mb-5', 'animate__animated', 'animate__fadeIn');
      card.innerHTML = `
        <h3 class="title is-5"><i class="fas fa-chart-bar"></i> ${archivo.replace('data/', '').replace('.csv', '').toUpperCase()}</h3>
        <p class="is-size-6">Números más frecuentes:</p>
        <ul class="is-size-7">
          ${topFrecuencia.map(([num, freq]) => `<li><strong>${num}</strong>: ${freq} veces</li>`).join('')}
        </ul>
        <div class="is-flex is-flex-direction-column-touch">
          <canvas id="${canvasId}" class="mb-4" style="max-width: 100%; height: auto;"></canvas>
          <canvas id="${pieCanvasId}" style="max-width: 100%; height: auto;"></canvas>
        </div>
      `;
      results.appendChild(card);

      // Gráfico de barras
      const ctx = document.getElementById(canvasId).getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: topFrecuencia.map(([num]) => num),
          datasets: [{
            label: 'Frecuencia',
            data: topFrecuencia.map(([_, freq]) => freq),
            backgroundColor: '#00d1b2'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { ticks: { font: { size: 10 } } },
            y: { ticks: { font: { size: 10 } } }
          }
        }
      });

      // Gráfico de pastel por secciones
      const pieCtx = document.getElementById(pieCanvasId).getContext('2d');
      new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['1-9', '10-18', '19-27', '28-36', '37-45', '46-56'],
          datasets: [{
            data: secciones,
            backgroundColor: [
              '#00d1b2', '#209cee', '#ffdd57', '#ff3860', '#b86bff', '#48c774'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { size: 10 } }
            }
          }
        }
      });
    }
  });

  tabAnalisis.addEventListener('click', () => {
    seccionAnalisis.classList.remove('is-hidden');
    seccionEvaluar.classList.add('is-hidden');
  });

  tabEvaluar.addEventListener('click', () => {
    seccionAnalisis.classList.add('is-hidden');
    seccionEvaluar.classList.remove('is-hidden');
  });

  async function verificarSueño(uid) {
    const docRef = firebase.firestore().collection('users').doc(uid);
    const doc = await docRef.get();
    if (!doc.exists || !doc.data().dream) {
      mostrarModalSueno(uid);
    } else {
      welcome.insertAdjacentHTML('beforeend', `<br><span class="has-text-grey-dark is-size-6">Vas tras tu sueño: <strong>${doc.data().dream}</strong></span>`);
    }
  }
});
