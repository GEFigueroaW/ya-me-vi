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
    
    // Obtener el nombre del usuario
    let nombreUsuario = 'TI';  // Valor por defecto
    if (window.usuarioActualNombre && window.usuarioActualNombre.trim()) {
      nombreUsuario = window.usuarioActualNombre.trim();
    } else if (window.usuarioActualEmail && window.usuarioActualEmail.trim()) {
      // Si no hay displayName, usar la primera parte del email
      nombreUsuario = window.usuarioActualEmail.split('@')[0];
    }
    
    // Actualizar el elemento del título
    const tituloElement = document.getElementById('titulo-sorteo');
    if (tituloElement) {
      tituloElement.textContent = `🎯 Combinaciones sugeridas por IA para TI ${nombreUsuario} para el sorteo ${proximoSorteo}`;
      console.log(`✅ Título actualizado: Sorteo ${proximoSorteo} para usuario ${nombreUsuario}`);
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
      tituloElement.textContent = `🎯 Combinaciones sugeridas por IA para TI`;
    }
    
    return null;
  }
};

/**
 * Versión optimizada que incluye el nombre del usuario
 */
window.actualizarTituloSorteoOptimizado = function() {
  try {
    console.log('🎯 Actualizando título optimizado con nombre de usuario...');
    
    const proximoSorteo = 4083;
    
    // Obtener el nombre del usuario de múltiples fuentes
    let nombreUsuario = 'TI';
    
    if (window.usuarioActualNombre && window.usuarioActualNombre.trim()) {
      nombreUsuario = window.usuarioActualNombre.trim();
    } else if (globalThis.usuarioActualNombre && globalThis.usuarioActualNombre.trim()) {
      nombreUsuario = globalThis.usuarioActualNombre.trim(); 
    } else if (window.usuarioActualEmail && window.usuarioActualEmail.trim()) {
      nombreUsuario = window.usuarioActualEmail.split('@')[0];
    } else if (globalThis.usuarioActualEmail && globalThis.usuarioActualEmail.trim()) {
      nombreUsuario = globalThis.usuarioActualEmail.split('@')[0];
    }
    
    // Actualizar el elemento del título
    const tituloElement = document.getElementById('titulo-sorteo');
    if (tituloElement) {
      tituloElement.textContent = `🎯 Combinaciones sugeridas por IA para TI ${nombreUsuario} para el sorteo ${proximoSorteo}`;
      console.log(`✅ Título optimizado actualizado: Sorteo ${proximoSorteo} para usuario ${nombreUsuario}`);
    }
    
    return proximoSorteo;
  } catch (error) {
    console.error('❌ Error en título optimizado:', error);
    return window.actualizarTituloSorteo(); // Fallback
  }
};

// Confirmar que la función está disponible globalmente
console.log('✅ Función actualizarTituloSorteo disponible globalmente');
