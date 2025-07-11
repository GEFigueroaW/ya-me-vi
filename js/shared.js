// === SISTEMA DE FONDO DINÁMICO CON CROSSFADE SUAVE ===

const fondoImagenes = [
  'assets/vg1.jpg',
  'assets/vg2.jpg',
  'assets/vg3.jpg',
  'assets/vg4.jpg',
  'assets/vg5.jpg'
];

let fondoActual = 0;
let capaActiva = 'before'; // 'before' o 'after'

// Precargar todas las imágenes para evitar demoras
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

// Función para cambiar de imagen con transición suave
function cambiarFondoSuave() {
  const fondo = document.getElementById('background');
  if (!fondo) return;
  
  const siguienteImagen = fondoImagenes[fondoActual];
  
  // Crear imagen temporal para asegurar que esté cargada
  const tempImg = new Image();
  tempImg.onload = () => {
    // Determinar qué capa usar para la nueva imagen
    if (capaActiva === 'before') {
      // Cambiar la capa after y hacerla visible
      fondo.style.setProperty('--after-bg', `url('${siguienteImagen}')`);
      fondo.classList.add('show-after');
      capaActiva = 'after';
    } else {
      // Cambiar la capa before y hacerla visible
      fondo.style.setProperty('--before-bg', `url('${siguienteImagen}')`);
      fondo.classList.remove('show-after');
      capaActiva = 'before';
    }
    
    fondoActual = (fondoActual + 1) % fondoImagenes.length;
  };
  tempImg.src = siguienteImagen;
}

// Inicializar el sistema
function inicializarFondo() {
  const fondo = document.getElementById('background');
  if (!fondo) return;
  
  // Establecer propiedades CSS personalizadas
  fondo.style.setProperty('--before-bg', `url('${fondoImagenes[0]}')`);
  fondo.style.setProperty('--after-bg', `url('${fondoImagenes[1]}')`);
  
  // Comenzar con la primera imagen
  fondoActual = 1; // La siguiente será la segunda imagen
  
  // Comenzar la rotación
  setTimeout(() => {
    cambiarFondoSuave();
    setInterval(cambiarFondoSuave, 4000); // Cambiar cada 4 segundos
  }, 2000); // Esperar 2 segundos antes del primer cambio
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  precargarImagenes().then(() => {
    inicializarFondo();
  }).catch(err => {
    console.error('Error precargando imágenes:', err);
    inicializarFondo(); // Continuar aunque haya errores
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
