// === actualizarTituloSorteo.js ===
// Función simple para actualizar el título con el número de sorteo correcto
// Sin depender de data loaders o cálculos complejos

/**
 * Actualiza el título de la página con el próximo número de sorteo.
 * Calcula dinámicamente el próximo sorteo basado en los datos del CSV Melate.
 */
window.actualizarTituloSorteo = async function() {
  try {
    console.log('🎯 Actualizando título con el número del próximo sorteo...');
    
    // Calcular el próximo sorteo basado en los datos históricos
    let proximoSorteo = await calcularProximoSorteo();
    
    // Obtener solo el primer nombre del usuario (sin apellidos)
    let nombreUsuario = obtenerPrimerNombre();
    
    // Actualizar el elemento del título
    const tituloElement = document.getElementById('titulo-sorteo');
    if (tituloElement) {
      const nuevoTitulo = `🎯 Combinaciones sugeridas por IA para TI ${nombreUsuario} para el sorteo ${proximoSorteo}`;
      tituloElement.textContent = nuevoTitulo;
      console.log(`✅ Título actualizado: Sorteo ${proximoSorteo} para usuario ${nombreUsuario}`);
      console.log(`📝 Título completo: "${nuevoTitulo}"`);
    } else {
      console.error('❌ Elemento titulo-sorteo no encontrado');
    }
    
    // Exponer el valor para que otras partes del código puedan usarlo
    window.proximoSorteoMelate = proximoSorteo;
    
    return proximoSorteo;
  } catch (error) {
    console.error('❌ Error al actualizar el título:', error);
    
    // En caso de error, usar un mensaje genérico pero con datos válidos
    const tituloElement = document.getElementById('titulo-sorteo');
    if (tituloElement) {
      const nombreFallback = obtenerPrimerNombre();
      const sorteoFallback = 4091; // Próximo después del último conocido (4090)
      const tituloFallback = `🎯 Combinaciones sugeridas por IA para TI ${nombreFallback} para el sorteo ${sorteoFallback}`;
      tituloElement.textContent = tituloFallback;
      console.log(`⚠️ Usando título de fallback: "${tituloFallback}"`);
    }
    
    return null;
  }
};

/**
 * Extrae solo el primer nombre del usuario (sin apellidos)
 */
function obtenerPrimerNombre() {
  let nombreUsuario = 'TI';  // Valor por defecto
  
  try {
    // Prioridad 1: Nombre completo del usuario autenticado
    if (window.usuarioActualNombre && window.usuarioActualNombre.trim()) {
      const nombreCompleto = window.usuarioActualNombre.trim();
      // Extraer solo el primer nombre (antes del primer espacio)
      nombreUsuario = nombreCompleto.split(' ')[0];
      console.log(`👤 Usando primer nombre del displayName: "${nombreUsuario}"`);
    }
    // Prioridad 2: Email del usuario (parte antes del @)
    else if (window.usuarioActualEmail && window.usuarioActualEmail.trim()) {
      const email = window.usuarioActualEmail.trim();
      nombreUsuario = email.split('@')[0];
      // Si el nombre de usuario del email contiene puntos o números, limpiar
      nombreUsuario = nombreUsuario.replace(/[._\d]/g, '');
      // Capitalizar primera letra
      nombreUsuario = nombreUsuario.charAt(0).toUpperCase() + nombreUsuario.slice(1).toLowerCase();
      console.log(`📧 Usando nombre del email: "${nombreUsuario}"`);
    }
    // Prioridad 3: UID del usuario (primeros 8 caracteres)
    else if (window.usuarioActualID && window.usuarioActualID.trim()) {
      nombreUsuario = `Usuario${window.usuarioActualID.substring(0, 4)}`;
      console.log(`🆔 Usando ID de usuario: "${nombreUsuario}"`);
    }
    
    // Limitar longitud máxima del nombre para el título
    if (nombreUsuario.length > 15) {
      nombreUsuario = nombreUsuario.substring(0, 15);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo primer nombre:', error);
    nombreUsuario = 'TI';
  }
  
  return nombreUsuario;
}

/**
 * Calcula el próximo número de sorteo basado en el último sorteo del archivo Melate.csv
 */
async function calcularProximoSorteo() {
  try {
    console.log('🔢 Calculando próximo sorteo desde datos históricos...');
    
    // Primero intentar leer directamente el CSV
    try {
      const response = await fetch('assets/Melate.csv');
      if (response.ok) {
        const csvText = await response.text();
        const lineas = csvText.trim().split('\n');
        
        if (lineas.length >= 2) {
          // La primera línea después del header tiene el último sorteo
          const primeraLinea = lineas[1].trim();
          const columnas = primeraLinea.split(',');
          const ultimoSorteoNum = parseInt(columnas[1]) || 0;
          
          if (ultimoSorteoNum > 0) {
            const proximoSorteo = ultimoSorteoNum + 1;
            console.log(`✅ Próximo sorteo calculado desde CSV directo: ${proximoSorteo} (último: ${ultimoSorteoNum})`);
            return proximoSorteo;
          }
        }
      }
    } catch (csvError) {
      console.warn('⚠️ No se pudo leer CSV directamente:', csvError.message);
    }
    
    // Verificar si tenemos datos históricos cargados como fallback
    if (window.datosHistoricos && window.datosHistoricos.melate && window.datosHistoricos.melate.sorteos) {
      const sorteosMelate = window.datosHistoricos.melate.sorteos;
      
      if (sorteosMelate.length > 0) {
        // Encontrar el número de concurso más alto
        let ultimoSorteoNum = 0;
        
        for (const sorteo of sorteosMelate) {
          const numConcurso = parseInt(sorteo.concurso);
          if (!isNaN(numConcurso) && numConcurso > ultimoSorteoNum) {
            ultimoSorteoNum = numConcurso;
          }
        }
        
        if (ultimoSorteoNum > 0) {
          const proximoSorteo = ultimoSorteoNum + 1;
          console.log(`✅ Próximo sorteo calculado desde datosHistoricos: ${proximoSorteo} (último: ${ultimoSorteoNum})`);
          return proximoSorteo;
        }
      }
    }
    
    // Fallback: usar cálculo estimado basado en la fecha
    console.log('⚠️ Datos históricos no disponibles, usando cálculo estimado...');
    
    const fecha = new Date();
    const fechaReferencia = new Date(2025, 7, 1); // 1 de agosto de 2025 (mes 7 = agosto)
    const sorteoReferencia = 4090; // Último sorteo conocido
    
    // Calcular diferencia en días
    const diferenciaMilisegundos = fecha - fechaReferencia;
    const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
    
    // Estimar sorteos adicionales (Melate se realiza miércoles y domingo = ~2 por semana)
    const sorteosAdicionales = Math.floor(diferenciaDias / 3.5);
    
    // Calcular próximo sorteo estimado
    const proximoSorteoEstimado = sorteoReferencia + Math.max(1, sorteosAdicionales);
    
    console.log(`📊 Próximo sorteo estimado: ${proximoSorteoEstimado} (${sorteosAdicionales} sorteos desde referencia)`);
    
    // Asegurar un valor mínimo razonable
    return Math.max(proximoSorteoEstimado, 4091);
    
  } catch (error) {
    console.error('❌ Error calculando próximo sorteo:', error);
    // Fallback final
    return 4091;
  }
}

// Confirmar que la función está disponible globalmente
console.log('✅ Función actualizarTituloSorteo disponible globalmente');
console.log('🔧 actualizarTituloSorteo.js cargado correctamente');
