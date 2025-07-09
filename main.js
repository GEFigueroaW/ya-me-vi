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

// Guardar sueño
document.getElementById('saveDreamBtn')?.addEventListener('click', async () => {
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
  document.getElementById('mainContent').classList.remove('is-hidden');
  document.getElementById('background').classList.add('is-hidden');

  if (dream) {
    alert(`¡Bienvenido! Vas tras tu sueño: ${dream}.`);
  }
}

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

// ✅ Checkbox exclusividad
['optMelate', 'optMelateRevancha', 'optTodo'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('change', () => {
    if (el.checked) {
      ['optMelate', 'optMelateRevancha', 'optTodo'].forEach(otherId => {
        if (otherId !== id) document.getElementById(otherId).checked = false;
      });
    }
  });
});

// 🔍 Análisis por checkbox
document.getElementById('btnAnalizar').addEventListener('click', async () => {
  const juegos = [];

  if (document.getElementById('optMelate').checked) juegos.push('melate.csv');
  else if (document.getElementById('optMelateRevancha').checked) juegos.push('melate.csv', 'revancha.csv');
  else if (document.getElementById('optTodo').checked) juegos.push('melate.csv', 'revancha.csv', 'revanchita.csv');
  else return alert('Selecciona una opción de análisis.');

  let allNumbers = [];

  for (const file of juegos) {
    const res = await fetch(`data/${file}`);
    const txt = await res.text();
    const lines = txt.trim().split('\n').map(l => l.split(',').map(Number));
    allNumbers.push(...lines.flat());
  }

  const frequency = Array(56).fill(0);
  const lastSeen = Array(56).fill(-1);
  allNumbers.forEach((num, idx) => {
    frequency[num - 1]++;
    lastSeen[num - 1] = idx;
  });

  const delay = lastSeen.map((val) => allNumbers.length - val);
  const distribution = [0, 0, 0, 0, 0, 0];
  allNumbers.forEach(num => {
    const sec = Math.floor((num - 1) / 9);
    distribution[sec]++;
  });

  renderCharts(frequency, delay, distribution);
  showPrediction(frequency);
});

// ✍️ Evaluar combinación personalizada
document.getElementById('btnEvaluar').addEventListener('click', async () => {
  const input = document.getElementById('customCombination').value.trim();
  const nums = input.split(',').map(n => parseInt(n)).filter(n => !isNaN(n) && n >= 1 && n <= 56);

  if (nums.length !== 6) {
    return alert('Por favor ingresa 6 números válidos separados por coma.');
  }

  const juegos = ['melate.csv', 'revancha.csv', 'revanchita.csv'];
  const results = [];

  for (const archivo of juegos) {
    const res = await fetch(`data/${archivo}`);
    const txt = await res.text();
    const lines = txt.trim().split('\n').map(l => l.split(',').map(Number));
    let aciertos = 0;

    lines.forEach(draw => {
      const match = draw.filter(n => nums.includes(n));
      if (match.length >= 3) aciertos++;
    });

    const porcentaje = (aciertos / lines.length) * 100;
    results.push({ juego: archivo.replace('.csv', ''), porcentaje });
  }

  const container = document.getElementById('predictionCardContainer');
  container.innerHTML = `
    <div class="box has-background-info-light">
      <h3 class="title is-5">Evaluación personalizada</h3>
      <p><strong>Tu combinación:</strong> ${nums.join(' - ')}</p>
      <ul class="mt-2">
        ${results.map(r => `<li>${r.juego}: ${r.porcentaje.toFixed(2)}% de acierto significativo</li>`).join('')}
      </ul>
    </div>
  `;
});

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
  const top = frequency
    .map((count, idx) => ({ num: idx + 1, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map(n => n.num);

  document.getElementById('predictionCardContainer').innerHTML = `
    <div class="prediction-card">
      <p><strong>Predicción sugerida:</strong></p>
      <p>${top.join(' - ')}</p>
    </div>
  `;
}
