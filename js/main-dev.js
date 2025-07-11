// === Navegación simplificada para desarrollo ===

// === Inicialización cuando el DOM está listo ===
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado en main.js');
  
  // === Referencias DOM ===
  const btnAnalizar = document.getElementById('btn-analizar');
  const btnCombinacion = document.getElementById('btn-combinacion');
  const welcomeMsg = document.getElementById('welcome-msg');

  // Mostrar mensaje de bienvenida temporal
  if (welcomeMsg) {
    welcomeMsg.textContent = '¡Bienvenido! (Modo desarrollo)';
  }

  // === Botones: alternar visibilidad y redirigir ===
  if (btnAnalizar && btnCombinacion) {
    console.log('Botones encontrados, agregando event listeners');
    
    btnAnalizar.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Botón Analizar clickeado');
      btnAnalizar.classList.add('hidden');
      btnCombinacion.classList.remove('hidden');
      // Pequeño retraso para ver el efecto visual
      setTimeout(() => {
        window.location.href = "analisis-dev.html";
      }, 200);
    });

    btnCombinacion.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Botón Combinación clickeado');
      btnCombinacion.classList.add('hidden');
      btnAnalizar.classList.remove('hidden');
      // Pequeño retraso para ver el efecto visual
      setTimeout(() => {
        window.location.href = "combinacion-dev.html";
      }, 200);
    });
  } else {
    console.warn('No se encontraron los botones principales');
    console.log('btnAnalizar:', btnAnalizar);
    console.log('btnCombinacion:', btnCombinacion);
  }
});

// === Cargar footer automáticamente ===
window.addEventListener('load', () => {
  const footerContainer = document.getElementById("footer-container");
  if (footerContainer) {
    fetch("footer.html")
      .then(res => res.text())
      .then(data => {
        footerContainer.innerHTML = data;
      })
      .catch(err => {
        console.error('Error cargando footer:', err);
      });
  }
});
