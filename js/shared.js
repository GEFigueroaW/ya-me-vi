// === SISTEMA DE FONDO DINÁMICO CON CROSSFADE SUAVE ===

const fondoImagenes = [
  'assets/vg1.jpg',
  'assets/vg2.jpg',
  'assets/vg3.jpg',
  'assets/vg4.jpg',
  'assets/vg5.jpg'
];

let fondoActual = 0;
let capas = [];

// Precargar todas las imágenes
function precargarImagenes() {
  console.log('Iniciando precarga de imágenes...');
  return Promise.all(
    fondoImagenes.map((imagen, index) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          console.log(`Imagen ${index + 1} cargada: ${imagen}`);
          resolve(img);
        };
        img.onerror = (error) => {
          console.error(`Error cargando imagen ${imagen}:`, error);
          reject(error);
        };
        img.src = imagen;
      });
    })
  );
}

// Crear las capas de fondo
function crearCapasFondo() {
  const background = document.getElementById('background');
  if (!background) {
    console.error('No se encontró el elemento #background');
    return;
  }

  console.log('Creando capas de fondo...');
  
  // Crear dos capas para el crossfade
  for (let i = 0; i < 2; i++) {
    const capa = document.createElement('div');
    capa.className = 'background-layer';
    capa.style.zIndex = i + 1;
    background.appendChild(capa);
    capas.push(capa);
  }

  // Mostrar la primera imagen en la primera capa
  capas[0].style.backgroundImage = `url('${fondoImagenes[0]}')`;
  capas[0].classList.add('active');
  console.log('Primera imagen configurada:', fondoImagenes[0]);
  
  fondoActual = 1; // La siguiente imagen será la segunda
}

// Función para cambiar de imagen con crossfade
function cambiarFondoSuave() {
  if (capas.length < 2) {
    console.error('No hay suficientes capas creadas');
    return;
  }

  const siguienteImagen = fondoImagenes[fondoActual];
  console.log('Cambiando a imagen:', siguienteImagen);
  
  // Encontrar la capa activa e inactiva
  const capaActiva = capas.find(capa => capa.classList.contains('active'));
  const capaInactiva = capas.find(capa => !capa.classList.contains('active'));
  
  if (!capaActiva || !capaInactiva) {
    console.error('No se pudieron encontrar las capas activa/inactiva');
    return;
  }

  // Configurar la capa inactiva con la nueva imagen
  capaInactiva.style.backgroundImage = `url('${siguienteImagen}')`;
  capaInactiva.style.zIndex = parseInt(capaActiva.style.zIndex) + 1;
  
  // Mostrar la nueva capa
  capaInactiva.classList.add('active');
  
  // Después de la transición, ocultar la capa anterior
  setTimeout(() => {
    capaActiva.classList.remove('active');
    capaActiva.style.zIndex = parseInt(capaInactiva.style.zIndex) - 1;
  }, 2000); // Tiempo de transición
  
  fondoActual = (fondoActual + 1) % fondoImagenes.length;
}

// Inicializar el sistema
function inicializarFondo() {
  console.log('Inicializando sistema de fondo...');
  crearCapasFondo();
  
  // Comenzar la rotación después de 3 segundos
  setTimeout(() => {
    console.log('Iniciando rotación de imágenes...');
    cambiarFondoSuave();
    setInterval(cambiarFondoSuave, 5000); // Cambiar cada 5 segundos
  }, 3000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  console.log('DOM cargado, iniciando sistema...');
  precargarImagenes().then(() => {
    console.log('Todas las imágenes precargadas exitosamente');
    inicializarFondo();
  }).catch(err => {
    console.error('Error precargando imágenes:', err);
    inicializarFondo(); // Continuar aunque haya errores
  });
  
  // === FOOTER AUTOMÁTICO ===
  const footerContainer = document.getElementById("footer-container");
  if (footerContainer) {
    fetch("footer.html")
      .then(res => res.text())
      .then(data => {
        footerContainer.innerHTML = data;
      })
      .catch(err => {
        console.warn('No se pudo cargar el footer:', err);
      });
  }

  // === SISTEMA DE TRACKING DE USUARIOS ===
  // Importar y inicializar el sistema de tracking
  import('./userTracking.js').then(module => {
    console.log('📊 Sistema de tracking de usuarios cargado');
  }).catch(error => {
    console.warn('⚠️ No se pudo cargar el tracking:', error);
  });
});
