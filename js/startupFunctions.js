// === startupFunctions.js ===
// Este archivo contiene funciones que se ejecutan al inicio de la aplicación

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOM cargado - ejecutando funciones de inicio...');
  
  // Actualizar el título con el número del próximo sorteo (4083)
  if (typeof window.actualizarTituloSorteo === 'function') {
    try {
      console.log('🎯 Actualizando título del sorteo...');
      window.actualizarTituloSorteo();
    } catch (error) {
      console.error('❌ Error actualizando título:', error);
    }
  } else {
    console.error('❌ Función actualizarTituloSorteo no disponible');
    
    // Aplicar el valor directamente como último recurso
    const tituloElement = document.getElementById('titulo-sorteo');
    if (tituloElement) {
      tituloElement.textContent = `Combinaciones sugeridas por IA para TI para el sorteo 4083`;
    }
  }
});

// También ejecutar cuando la ventana termine de cargar (por si el DOM ya estaba listo)
window.addEventListener('load', function() {
  console.log('🌟 Página completamente cargada - verificando título...');
  
  // Verificar que el título se haya actualizado
  const tituloElement = document.getElementById('titulo-sorteo');
  if (tituloElement && !tituloElement.textContent.includes('4083')) {
    console.log('⚠️ El título no se actualizó durante DOMContentLoaded, actualizando ahora...');
    
    if (typeof window.actualizarTituloSorteo === 'function') {
      window.actualizarTituloSorteo();
    } else {
      tituloElement.textContent = `Combinaciones sugeridas por IA para TI para el sorteo 4083`;
    }
  }
});
