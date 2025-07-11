// === FONDO DINÁMICO ROTATIVO ===

const fondoImagenes = [
  'assets/vg1.jpg',
  'assets/vg2.jpg',
  'assets/vg3.jpg',
  'assets/vg4.jpg',
  'assets/vg5.jpg'
];

let fondoActual = 0;

// Precargar todas las imágenes para evitar parpadeos
function precargarImagenes() {
  return Promise.all(
    fondoImagenes.map(imagen => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imagen;
      });
    })
  );
}

function cambiarFondo() {
  const fondo = document.getElementById('background');
  if (fondo) {
    const siguienteImagen = fondoImagenes[fondoActual];
    
    // Crear una nueva imagen en segundo plano
    const tempImg = new Image();
    tempImg.onload = () => {
      // Cambiar instantáneamente sin transición de opacity
      fondo.style.backgroundImage = `url('${siguienteImagen}')`;
      fondoActual = (fondoActual + 1) % fondoImagenes.length;
    };
    tempImg.src = siguienteImagen;
  }
}

// Inicializar el sistema de fondo
document.addEventListener("DOMContentLoaded", () => {
  // Precargar todas las imágenes primero
  precargarImagenes().then(() => {
    // Comenzar la rotación después de que todas las imágenes estén cargadas
    cambiarFondo(); // Cambiar inmediatamente a la primera imagen
    setInterval(cambiarFondo, 3000); // Cambiar cada 3 segundos
  }).catch(err => {
    console.error('Error precargando imágenes:', err);
    // Continuar con la rotación aunque haya errores
    setInterval(cambiarFondo, 3000);
  });
});

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
