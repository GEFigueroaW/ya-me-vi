
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const menu = document.getElementById('menu');
  const welcome = document.getElementById('welcome');

  const tabAnalisis = document.getElementById('tab-analisis');
  const tabEvaluar = document.getElementById('tab-evaluar');
  const seccionAnalisis = document.getElementById('analisis');
  const seccionEvaluar = document.getElementById('evaluar');

  const analyzeBtn = document.getElementById('analyzeBtn');
  const checkMelate = document.getElementById('check-melate');
  const checkRevancha = document.getElementById('check-revancha');
  const checkRevanchita = document.getElementById('check-revanchita');
  const results = document.getElementById('results');
  const prediction = document.getElementById('prediction');

  const evaluateBtn = document.getElementById('evaluateBtn');

  // Simular login
  loginBtn.addEventListener('click', () => {
    loginBtn.classList.add('is-hidden');
    welcome.textContent = '¡Hola, jugador!';
    menu.classList.remove('is-hidden');
    seccionAnalisis.classList.remove('is-hidden');
  });

  logoutBtn.addEventListener('click', () => {
    location.reload();
  });

  tabAnalisis.addEventListener('click', () => {
    tabAnalisis.classList.add('is-active');
    tabEvaluar.classList.remove('is-active');
    seccionAnalisis.classList.remove('is-hidden');
    seccionEvaluar.classList.add('is-hidden');
  });

  tabEvaluar.addEventListener('click', () => {
    tabEvaluar.classList.add('is-active');
    tabAnalisis.classList.remove('is-active');
    seccionEvaluar.classList.remove('is-hidden');
    seccionAnalisis.classList.add('is-hidden');
  });

  analyzeBtn.addEventListener('click', async () => {
    results.innerHTML = '<p class="has-text-info">Procesando análisis...</p>';
    const juegosSeleccionados = [];
    if (checkMelate.checked) juegosSeleccionados.push('melate.csv');
    if (checkRevancha.checked) juegosSeleccionados.push('revancha.csv');
    if (checkRevanchita.checked) juegosSeleccionados.push('revanchita.csv');

    if (juegosSeleccionados.length === 0) {
      results.innerHTML = '<p class="has-text-danger">Selecciona al menos un sorteo.</p>';
      return;
    }

    results.innerHTML = '<p class="has-text-success">Sorteos seleccionados: ' + juegosSeleccionados.join(', ') + '</p>';
    prediction.innerHTML = '<p class="has-text-grey">Aquí irán las predicciones pronto...</p>';
  });

  evaluateBtn.addEventListener('click', () => {
    const nums = [];
    for (let i = 1; i <= 6; i++) {
      const val = parseInt(document.getElementById('n' + i).value);
      if (!isNaN(val) && val >= 1 && val <= 56) {
        nums.push(val);
      }
    }
    if (nums.length !== 6) {
      alert('Por favor ingresa 6 números válidos entre 1 y 56.');
      return;
    }

    const evaluacion = nums.map(n => ({
      numero: n,
      melate: (Math.random() * 100).toFixed(2) + '%',
      revancha: (Math.random() * 100).toFixed(2) + '%',
      revanchita: (Math.random() * 100).toFixed(2) + '%'
    }));

    let html = '<table class="table is-fullwidth"><thead><tr><th>Número</th><th>Melate</th><th>Revancha</th><th>Revanchita</th></tr></thead><tbody>';
    evaluacion.forEach(e => {
      html += `<tr><td>${e.numero}</td><td>${e.melate}</td><td>${e.revancha}</td><td>${e.revanchita}</td></tr>`;
    });
    html += '</tbody></table>';

    document.getElementById('evaluationResults').innerHTML = html;
  });
});
