// main.js con mejoras visuales (Font Awesome + Animate.css)

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

      const card = document.createElement('div');
      card.classList.add('box', 'mb-5', 'animate__animated', 'animate__fadeIn');
      card.innerHTML = `
        <h3 class="title is-5"><i class="fas fa-chart-bar"></i> ${archivo.replace('data/', '').replace('.csv', '').toUpperCase()}</h3>
        <p>Números más frecuentes:</p>
        <ul>
          ${topFrecuencia.map(([num, freq]) => `<li><strong>${num}</strong>: ${freq} veces</li>`).join('')}
        </ul>
        <canvas id="${canvasId}" height="250"></canvas>
      `;
      results.appendChild(card);

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
          plugins: {
            legend: { display: false }
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
