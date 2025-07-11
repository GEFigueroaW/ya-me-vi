// === FONDO DINÁMICO ROTATIVO ===

const fondoImagenes = [
  'assets/vg1.jpg',
  'assets/vg2.jpg',
  'assets/vg3.jpg',
  'assets/vg4.jpg',
  'assets/vg5.jpg'
];

let fondoActual = 0;

function cambiarFondo() {
  const fondo = document.getElementById('background');
  if (fondo) {
    fondo.style.opacity = 0;
    setTimeout(() => {
      fondo.style.backgroundImage = `url('${fondoImagenes[fondoActual]}')`;
      fondo.style.opacity = 1;
      fondoActual = (fondoActual + 1) % fondoImagenes.length;
    }, 500);
  }
}

// Cambiar cada 3 segundos
setInterval(cambiarFondo, 3000);

// Cargar fondo inicial (vg1.jpg ya está como valor por defecto en el CSS)

// === FOOTER AUTOMÁTICO (en caso de que se use vía JS en páginas secundarias) ===
document.addEventListener("DOMContentLoaded", () => {
  const footerContainer = document.getElementById("footer-container");
  if (footerContainer) {
    fetch("footer.html")
      .then(res => res.text())
      .then(data => {
        footerContainer.innerHTML = data;
      });
  }
});
