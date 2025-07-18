// === actualizarTituloSorteo.js ===
// Función simple para actualizar el título con el número de sorteo correcto
// Sin depender de data loaders o cálculos complejos

/**
 * Actualiza el título de la página con el próximo número de sorteo.
 * Usa un valor fijo que se actualizará con cada release de la aplicación.
 */
window.actualizarTituloSorteo = function() {
  try {
    console.log('🎯 Actualizando título con el número del próximo sorteo...');
    
    // SOLUCIÓN DIRECTA: Usar el valor conocido del próximo sorteo
    // Cada vez que se actualiza el CSV, este valor debe ser actualizado también
    const proximoSorteo = 4083;
    
    // Actualizar el elemento del título
    const tituloElement = document.getElementById('titulo-sorteo');
    if (tituloElement) {
      tituloElement.textContent = `Combinaciones sugeridas por IA para TI para el sorteo ${proximoSorteo}`;
      console.log(`✅ Título actualizado: Sorteo ${proximoSorteo}`);
    } else {
      console.error('❌ Elemento titulo-sorteo no encontrado');
    }
    
    // Exponer el valor para que otras partes del código puedan usarlo
    window.proximoSorteoMelate = proximoSorteo;
    
    return proximoSorteo;
  } catch (error) {
    console.error('❌ Error al actualizar el título:', error);
    
    // En caso de error, usar un mensaje genérico
    const tituloElement = document.getElementById('titulo-sorteo');
    if (tituloElement) {
      tituloElement.textContent = `Combinaciones sugeridas por IA para TI`;
    }
    
    return null;
  }
};

// Confirmar que la función está disponible globalmente
console.log('✅ Función actualizarTituloSorteo disponible globalmente');
