document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const menu = document.getElementById('menu');
  const welcome = document.getElementById('welcome');
  
  const tabAnalisis = document.getElementById('tab-analisis');
  const tabEvaluar = document.getElementById('tab-evaluar');
  const seccionAnalisis = document.getElementById('analisis');
  const seccionEvaluar = document.getElementById('evaluar');
  
  const analizarBtn = document.getElementById('analizarBtn');
  const checkMelate = document.getElementById('check-melate');
  const checkRevancha = document.getElementById('check-revancha');
  const checkRevanchita = document.getElementById('check-revanchita');
  const results = document.getElementById('results');
  const prediction = document.getElementById('prediction');
  
  const evaluateBtn = document.getElementById('evaluateBtn');

  // Imágenes de fondo dinámicas
  const imagenes = ['vg1.jpg', 'vg2.jpg', 'vg3.jpg', 'vg4.jpg'];
  let indiceImagen = 0;

  function cambiarImagenFondo() {
    document.body.style.backgroundImage = `url('./assets/${imagenes[indiceImagen]}')`;
    indiceImagen = (indiceImagen + 1) % imagenes.length;
  }

  setInterval(cambiarImagenFondo, 3000);

  // Simular login básico (ejemplo simple)
  loginBtn.addEventListener('click', () => {
    loginBtn.classList.add('is-hidden');
    welcome.textContent = '¡Hola, jugador!';
    menu.classList.remove('is-hidden');
    seccionAnalisis.classList.remove('is-hidden');
  });

  logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      location.reload();
    });
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

  // Bloque de análisis profesional real
  analizarBtn.addEventListener('click', async () => {
    const juegosSeleccionados = [];
    if (checkMelate.checked) juegosSeleccionados.push('data/melate.csv');
    if (checkRevancha.checked) juegosSeleccionados.push('data/revancha.csv');
    if (checkRevanchita.checked) juegosSeleccionados.push('data/revanchita.csv');

    if (juegosSeleccionados.length === 0) {
      results.innerHTML = '<p class="has-text-danger">Selecciona al menos un sorteo.</p>';
      return;
    }

    results.innerHTML = `<p class="has-text-success">Sorteos seleccionados: ${juegosSeleccionados.join(', ')}</p>`;
    prediction.innerHTML = '<p class="has-text-info">Analizando resultados y generando predicciones...</p>';

    try {
      await mlPredictor.analizarSorteos(juegosSeleccionados);
    } catch (error) {
      console.error("Error al analizar sorteos:", error);
      prediction.innerHTML = '<p class="has-text-danger">Error en el análisis. Verifica la consola.</p>';
    }
  });

  // Bloque evaluar combinación (ejemplo básico)
  evaluateBtn.addEventListener('click', () => {
    const nums = [];
    for (let i = 1; i <= 6; i++) {
      const val = parseInt(document.getElementById('n' + i).value);
      if (!isNaN(val) && val >= 1 && val <= 56) nums.push(val);
    }
    if (nums.length !== 6) {
      alert('Por favor ingresa 6 números válidos entre 1 y 56.');
      return;
    }

    mlPredictor.mostrarEvaluacion(nums);
  });

  // Verificar autenticación al cargar
  firebase.auth().onAuthStateChanged(user => {
    if (!user) location.href = './index.html';
  });
});
