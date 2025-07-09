// js/main.js

// Fondo rotatorio
const background = document.getElementById('background');
const images = ['assets/vg1.jpg', 'assets/vg2.jpg', 'assets/vg3.jpg', 'assets/vg4.jpg', 'assets/vg5.jpg'];
let bgIndex = 0;

function rotateBackground() {
  bgIndex = (bgIndex + 1) % images.length;
  const tempImg = new Image();
  tempImg.src = images[bgIndex];
  tempImg.onload = () => {
    background.style.transition = 'opacity 1s ease-in-out';
    background.style.opacity = 0;
    setTimeout(() => {
      background.style.backgroundImage = `url(${tempImg.src})`;
      background.style.opacity = 1;
    }, 300);
  };
}

// Configuración inicial del fondo
background.style.backgroundImage = `url(${images[bgIndex]})`;
background.style.backgroundSize = 'cover';
background.style.backgroundPosition = 'center';
background.style.transition = 'opacity 1s ease-in-out';
setInterval(rotateBackground, 3000);

// Login
document.getElementById('loginBtn').addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  firebase.auth().signOut();
});

// Análisis por archivo
document.getElementById('analyzeMelate').addEventListener('click', () => fetchData('melate.csv'));
document.getElementById('analyzeRevancha').addEventListener('click', () => fetchData('revancha.csv'));
document.getElementById('analyzeRevanchita').addEventListener('click', () => fetchData('revanchita.csv'));

// Procesar CSV y generar análisis
async function fetchData(fileName) {
  const response = await fetch(fileName);
  const text = await response.text();
  const lines = text.trim().split('\n');
  const numbers = lines.map(line => line.split(',').map(Number));

  const flatNumbers = numbers.flat();

  const frequency = Array(56).fill(0);
  const lastSeen = Array(56).fill(-1);

  flatNumbers.forEach((num, index) => {
    frequency[num - 1]++;
    lastSeen[num - 1] = index;
  });

  const delay = lastSeen.map((val, i) => flatNumbers.length - val);
  const distribution = [0, 0, 0, 0, 0, 0];
  flatNumbers.forEach(num => {
    const section = Math.floor((num - 1) / 9);
    distribution[section]++;
  });

  renderCharts(frequency, delay, distribution);
  showPrediction(frequency);
}

// Gráficos
let freqChart, delayChart, distChart;

function renderCharts(frequency, delay, distribution) {
  if (freqChart) freqChart.destroy();
  if (delayChart) delayChart.destroy();
  if (distChart) distChart.destroy();

  const ctx1 = document.getElementById('frequencyChart').getContext('2d');
  freqChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: Array.from({ length: 56 }, (_, i) => i + 1),
      datasets: [{
        label: 'Frecuencia',
        data: frequency,
      }]
    }
  });

  const ctx2 = document.getElementById('delayChart').getContext('2d');
  delayChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: Array.from({ length: 56 }, (_, i) => i + 1),
      datasets: [{
        label: 'Retraso',
        data: delay,
      }]
    }
  });

  const ctx3 = document.getElementById('distributionChart').getContext('2d');
  distChart = new Chart(ctx3, {
    type: 'pie',
    data: {
      labels: ['1–9', '10–18', '19–27', '28–36', '37–45', '46–56'],
      datasets: [{
        label: 'Distribución',
        data: distribution,
      }]
    }
  });
}

// Predicción
function showPrediction(frequency) {
  const topNumbers = frequency
    .map((count, num) => ({ num: num + 1, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map(obj => obj.num);

  const container = document.getElementById('predictionCardContainer');
  container.innerHTML = `
    <div class="prediction-card">
      <p><strong>Predicción sugerida:</strong></p>
      <p>${topNumbers.join(' - ')}</p>
    </div>
  `;
}

// Mostrar contenido al iniciar sesión
firebase.auth().onAuthStateChanged(user => {
  const main = document.getElementById('mainContent');
  const login = document.getElementById('background');
  if (user) {
    main.classList.remove('is-hidden');
    login.classList.add('is-hidden');
  } else {
    main.classList.add('is-hidden');
    login.classList.remove('is-hidden');
  }
});
