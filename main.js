// main.js

import {
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  setDoc
} from './firebase-init.js';

const images = ['assets/vg1.jpg', 'assets/vg2.jpg', 'assets/vg3.jpg', 'assets/vg4.jpg', 'assets/vg5.jpg'];
let currentIndex = 0;
let currentLayer = 1;

function rotateBackground() {
  const nextIndex = (currentIndex + 1) % images.length;
  const current = document.getElementById(`bg-layer-${currentLayer}`);
  const nextLayer = currentLayer === 1 ? 2 : 1;
  const next = document.getElementById(`bg-layer-${nextLayer}`);

  next.style.backgroundImage = `url(${images[nextIndex]})`;
  next.style.opacity = 1;
  current.style.opacity = 0;

  currentIndex = nextIndex;
  currentLayer = nextLayer;
}

document.getElementById('bg-layer-1').style.backgroundImage = `url(${images[0]})`;
document.getElementById('bg-layer-1').style.opacity = 1;
setInterval(rotateBackground, 4000);

// Login
document.getElementById('loginBtn').addEventListener('click', async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (error) {
    alert('Error al iniciar sesión: ' + error.message);
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
});

// Guardar sueño al dar clic en botón
document.getElementById('saveDreamBtn').addEventListener('click', async () => {
  const selected = document.querySelector('input[name="dream"]:checked');
  if (!selected) {
    alert('Por favor selecciona un sueño.');
    return;
  }

  const user = auth.currentUser;
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, { dream: selected.value }, { merge: true });

  document.getElementById('dreamModal').classList.remove('is-active');
  showMainContent(user.uid, selected.value);
});

function showMainContent(uid, dream = null) {
  const main = document.getElementById('mainContent');
  const background = document.getElementById('background');
  main.classList.remove('is-hidden');
  background.classList.add('is-hidden');

  if (dream) {
    alert(`¡Bienvenido! Vas tras tu sueño: ${dream}.`);
  }
}

// Detectar si hay sesión activa
onAuthStateChanged(auth, async user => {
  const main = document.getElementById('mainContent');
  const background = document.getElementById('background');

  if (user) {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists() && docSnap.data().dream) {
      showMainContent(user.uid, docSnap.data().dream);
    } else {
      document.getElementById('dreamModal').classList.add('is-active');
    }
  } else {
    main.classList.add('is-hidden');
    background.classList.remove('is-hidden');
  }
});

// Botones de análisis
document.getElementById('analyzeMelate').addEventListener('click', () => fetchData('melate.csv'));
document.getElementById('analyzeRevancha').addEventListener('click', () => fetchData('revancha.csv'));
document.getElementById('analyzeRevanchita').addEventListener('click', () => fetchData('revanchita.csv'));

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
      datasets: [{ label: 'Frecuencia', data: frequency }]
    }
  });

  const ctx2 = document.getElementById('delayChart').getContext('2d');
  delayChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: Array.from({ length: 56 }, (_, i) => i + 1),
      datasets: [{ label: 'Retraso', data: delay }]
    }
  });

  const ctx3 = document.getElementById('distributionChart').getContext('2d');
  distChart = new Chart(ctx3, {
    type: 'pie',
    data: {
      labels: ['1–9', '10–18', '19–27', '28–36', '37–45', '46–56'],
      datasets: [{ label: 'Distribución', data: distribution }]
    }
  });
}

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
