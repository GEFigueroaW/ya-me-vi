// js/main.js

const auth = firebase.auth();

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const resultsDiv = document.getElementById('results');

const backgrounds = [
  'assets/bg1.jpg',
  'assets/bg2.jpg',
  'assets/bg3.jpg',
  'assets/bg4.jpg',
  'assets/bg5.jpg'  
];
let current = 0;
function rotateBackground() {
  document.body.style.backgroundImage = `url('${backgrounds[current]}')`;
  current = (current + 1) % backgrounds.length;
}
setInterval(rotateBackground, 3000);
rotateBackground();

loginBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
});
logoutBtn.addEventListener('click', () => {
  auth.signOut();
});
auth.onAuthStateChanged(user => {
  if (user) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    userName.textContent = `Hola, ${user.displayName}`;
  } else {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    userName.textContent = 'Bienvenido';
  }
});

document.getElementById('btnMelate').addEventListener('click', () => {
  analizarArchivo('data/melate.csv', 'Melate');
});
document.getElementById('btnRevancha').addEventListener('click', () => {
  analizarArchivo('data/revancha.csv', 'Revancha');
});
document.getElementById('btnRevanchita').addEventListener('click', () => {
  analizarArchivo('data/revanchita.csv', 'Revanchita');
});

async function analizarArchivo(archivo, titulo) {
  const response = await fetch(archivo);
  const text = await response.text();
  const lines = text.trim().split('\n').slice(1); // quitar encabezado
  const allNumbers = lines.flatMap(line => line.split(',').map(n => parseInt(n, 10)));
  const frecuencia = {}, delay = {};
  const ultimoSorteo = {};

  allNumbers.forEach((n, i) => {
    frecuencia[n] = (frecuencia[n] || 0) + 1;
    ultimoSorteo[n] = Math.floor(i / 6);
  });

  const totalSorteos = lines.length;
  for (let n in frecuencia) {
    delay[n] = totalSorteos - ultimoSorteo[n];
  }

  const labels = Object.keys(frecuencia).sort((a, b) => frecuencia[b] - frecuencia[a]);
  const data = labels.map(n => frecuencia[n]);

  resultsDiv.innerHTML = `
    <h2 class="title is-4">${titulo} – Análisis</h2>
    <canvas id="chart"></canvas>
    <div id="prediccion" class="box mt-5 has-background-success-light has-text-centered animate__animated animate__fadeIn">
      <h3 class="title is-5">Predicción sugerida:</h3>
      <p id="prediccion-numeros" class="is-size-4 has-text-weight-bold"></p>
    </div>
  `;

  new Chart(document.getElementById('chart').getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Frecuencia',
        data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  generarPrediccion(frecuencia, delay);
}

function generarPrediccion(frecuencia, delay) {
  const combinadas = Object.keys(frecuencia).map(n => {
    const f = frecuencia[n];
    const d = delay[n] || 0;
    return { n: parseInt(n), score: f * 1.5 + d * 1.2 };
  });

  combinadas.sort((a, b) => b.score - a.score);
  const sugeridos = combinadas.slice(0, 6).map(n => n.n).sort((a, b) => a - b);

  document.getElementById('prediccion-numeros').textContent = sugeridos.join(' - ');
}
