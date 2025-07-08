
// main.js

// Referencias a elementos
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcome = document.getElementById('welcome');
const menu = document.getElementById('menu');
const analisisSection = document.getElementById('analisis');
const evaluarSection = document.getElementById('evaluar');
const tabAnalisis = document.getElementById('tab-analisis');
const tabEvaluar = document.getElementById('tab-evaluar');
const background = document.getElementById('background');

// Rotación de fondo
const images = ['vg1.jpg', 'vg2.jpg', 'vg3.jpg', 'vg4.jpg'];
let current = 0;
setInterval(() => {
  background.style.backgroundImage = `url('assets/${images[current]}')`;
  current = (current + 1) % images.length;
}, 3000);

// Navegación
tabAnalisis.addEventListener('click', () => {
  tabAnalisis.classList.add('is-active');
  tabEvaluar.classList.remove('is-active');
  analisisSection.classList.remove('is-hidden');
  evaluarSection.classList.add('is-hidden');
});

tabEvaluar.addEventListener('click', () => {
  tabEvaluar.classList.add('is-active');
  tabAnalisis.classList.remove('is-active');
  evaluarSection.classList.remove('is-hidden');
  analisisSection.classList.add('is-hidden');
});

// Login simulado (conexión real en firebase-init.js)
loginBtn.addEventListener('click', () => {
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
});

logoutBtn.addEventListener('click', () => {
  firebase.auth().signOut();
});

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    welcome.textContent = `Bienvenido, ${user.displayName}`;
    loginBtn.classList.add('is-hidden');
    menu.classList.remove('is-hidden');
    analisisSection.classList.remove('is-hidden');
  } else {
    welcome.textContent = 'Bienvenido';
    loginBtn.classList.remove('is-hidden');
    menu.classList.add('is-hidden');
    analisisSection.classList.add('is-hidden');
    evaluarSection.classList.add('is-hidden');
  }
});

// Placeholder: conectar con análisis real
document.getElementById('analyzeBtn').addEventListener('click', () => {
  const melate = document.getElementById('check-melate').checked;
  const revancha = document.getElementById('check-revancha').checked;
  const revanchita = document.getElementById('check-revanchita').checked;

  if (!melate && !revancha && !revanchita) {
    alert('Selecciona al menos un sorteo para analizar.');
    return;
  }

  document.getElementById('results').innerHTML = '<p class="has-text-white">Procesando análisis...</p>';
  // Aquí se llamará a la función del archivo dataParser.js
  // y se mostrará el análisis y predicción
});

// Evaluación de combinación
document.getElementById('evaluateBtn').addEventListener('click', () => {
  const nums = [];
  for (let i = 1; i <= 6; i++) {
    const val = parseInt(document.getElementById(`n${i}`).value);
    if (isNaN(val) || val < 1 || val > 56) {
      alert('Ingresa 6 números válidos entre 1 y 56.');
      return;
    }
    nums.push(val);
  }

  document.getElementById('evaluationResults').innerHTML =
    '<p class="has-text-white">Calculando probabilidades...</p>';
  // Aquí se llamará al archivo mlPredictor.js con la combinación ingresada
});
