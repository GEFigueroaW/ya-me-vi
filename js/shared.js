// js/shared.js

// Fondo rotatorio compartido
const backgroundImages = [
  'assets/vg1.jpg',
  'assets/vg2.jpg',
  'assets/vg3.jpg',
  'assets/vg4.jpg',
  'assets/vg5.jpg'
];
let bgIndex = 0;

function rotateBackground() {
  const bg = document.getElementById('background');
  if (!bg) return;
  bg.style.opacity = 0.4;
  setTimeout(() => {
    bgIndex = (bgIndex + 1) % backgroundImages.length;
    bg.style.backgroundImage = `url(${backgroundImages[bgIndex]})`;
    bg.style.opacity = 1;
  }, 400);
}

function setupBackground() {
  const bg = document.getElementById('background');
  if (bg) {
    bg.style.backgroundImage = `url(${backgroundImages[0]})`;
    bg.style.backgroundSize = 'cover';
    bg.style.backgroundPosition = 'center';
    bg.style.transition = 'background-image 1s ease-in-out, opacity 0.5s';
    setInterval(rotateBackground, 3000);
  }
}

// Footer dinámico
function insertFooter() {
  fetch('footer.html')
    .then(res => res.text())
    .then(html => {
      const footer = document.createElement('div');
      footer.innerHTML = html;
      document.body.appendChild(footer);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  setupBackground();
  insertFooter();
});
