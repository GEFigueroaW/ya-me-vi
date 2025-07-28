// inicializacion-unificada.js
// Sistema unificado de inicialización para sugeridas.html

import { generarPrediccionPersonalizada } from './mlPredictor.js';
import { cargarDatosHistoricos, analizarSumaNumeros, analizarParesImpares, analizarDecadaPorPosicion } from './dataParser.js';

console.log('🚀 Inicializando sistema unificado...');

// Hacer funciones disponibles globalmente
window.generarPrediccionPersonalizada = generarPrediccionPersonalizada;
window.cargarDatosHistoricos = cargarDatosHistoricos;
window.analizarSumaNumeros = analizarSumaNumeros;
window.analizarParesImpares = analizarParesImpares;
window.analizarDecadaPorPosicion = analizarDecadaPorPosicion;

// Función para generar predicciones por sorteo usando el sistema de IA de 5 métodos
window.generarPrediccionesPorSorteo = async function() {
  console.log('🤖 Iniciando generación de predicciones con IA...');
  
  try {
    // Obtener el ID del usuario actual
    const userId = window.usuarioActualID || window.currentUserId || 'usuario-demo';
    console.log('👤 Usuario ID:', userId);
    
    // Cargar datos históricos si no están disponibles
    if (!window.datosHistoricos) {
      console.log('📊 Cargando datos históricos...');
      window.datosHistoricos = await cargarDatosHistoricos('todos');
    }
    
    if (!window.datosHistoricos) {
      throw new Error('No se pudieron cargar los datos históricos');
    }
    
    console.log('✅ Datos históricos disponibles:', Object.keys(window.datosHistoricos));
    
    // Actualizar mensaje de estado
    const mensajeEstado = document.getElementById('mensaje-estado');
    if (mensajeEstado) {
      mensajeEstado.textContent = 'Generando predicciones con IA...';
    }
    
    // Generar predicciones para cada sorteo
    const sorteos = ['melate', 'revancha', 'revanchita'];
    
    for (const sorteo of sorteos) {
      try {
        console.log(`🎯 Generando predicción para ${sorteo}...`);
        
        const elementoCombo = document.getElementById(`combinacion-${sorteo}`);
        const datosSorteo = window.datosHistoricos[sorteo];
        
        if (!datosSorteo) {
          console.warn(`⚠️ No hay datos para ${sorteo}`);
          if (elementoCombo) {
            elementoCombo.textContent = 'Sin datos disponibles';
          }
          continue;
        }
        
        // Mostrar spinner mientras se procesa
        if (elementoCombo) {
          elementoCombo.innerHTML = '<span class="animate-pulse">Analizando datos...</span>';
        }
        
        // Generar predicción personalizada usando los 5 métodos de análisis
        const prediccion = await generarPrediccionPersonalizada(userId, datosSorteo);
        
        if (elementoCombo && prediccion && prediccion.length === 6) {
          elementoCombo.textContent = prediccion.join(' - ');
          console.log(`✅ Predicción IA para ${sorteo} generada:`, prediccion);
          
          // Almacenar la predicción para uso futuro
          if (!window.prediccionesAlmacenadas) {
            window.prediccionesAlmacenadas = {};
          }
          
          window.prediccionesAlmacenadas[sorteo] = {
            userId: userId,
            prediccion: prediccion,
            ultimoSorteo: datosSorteo.ultimoSorteo || 'desconocido',
            timestamp: new Date().getTime()
          };
          
          // Guardar en localStorage si la función está disponible
          if (typeof guardarPrediccionesAlmacenadas === 'function') {
            guardarPrediccionesAlmacenadas();
          }
        }
      } catch (error) {
        console.error(`❌ Error generando predicción para ${sorteo}:`, error);
        const elementoCombo = document.getElementById(`combinacion-${sorteo}`);
        if (elementoCombo) {
          elementoCombo.textContent = 'Error al generar';
        }
      }
    }
    
    if (mensajeEstado) {
      mensajeEstado.textContent = 'Predicciones generadas con análisis completo de 5 métodos';
    }
    
    console.log('✅ Predicciones generadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error en el sistema de predicción:', error);
    const mensajeEstado = document.getElementById('mensaje-estado');
    if (mensajeEstado) {
      mensajeEstado.textContent = 'Error al generar predicciones';
    }
  }
};

// Función para generar proyecciones de análisis
window.generarProyeccionesAnalisis = async function() {
  console.log('📊 Iniciando generación de proyecciones de análisis...');
  
  try {
    // Obtener el ID del usuario actual
    const userId = window.usuarioActualID || window.currentUserId || 'usuario-demo';
    console.log('👤 Usuario ID para análisis:', userId);
    
    // Cargar datos históricos si no están disponibles
    if (!window.datosHistoricos) {
      console.log('📊 Cargando datos históricos para análisis...');
      window.datosHistoricos = await cargarDatosHistoricos('todos');
    }
    
    if (!window.datosHistoricos) {
      throw new Error('No se pudieron cargar los datos históricos para análisis');
    }
    
    console.log('✅ Datos históricos disponibles para análisis:', Object.keys(window.datosHistoricos));
    
    // Generar proyecciones para cada sorteo usando un ID único para análisis
    const sorteos = ['melate', 'revancha', 'revanchita'];
    
    for (const sorteo of sorteos) {
      try {
        console.log(`📈 Generando proyección de análisis para ${sorteo}...`);
        
        const elementoProyeccion = document.getElementById(`proyeccion-${sorteo}`);
        const elementoDetalle = document.getElementById(`detalle-${sorteo}`);
        const datosSorteo = window.datosHistoricos[sorteo];
        
        if (!datosSorteo) {
          console.warn(`⚠️ No hay datos para análisis de ${sorteo}`);
          if (elementoProyeccion) {
            elementoProyeccion.textContent = 'Sin datos disponibles';
          }
          if (elementoDetalle) {
            elementoDetalle.textContent = 'Error al cargar los datos';
          }
          continue;
        }
        
        // Mostrar spinner mientras se procesa
        if (elementoProyeccion) {
          elementoProyeccion.innerHTML = '<span class="animate-pulse">Analizando...</span>';
        }
        if (elementoDetalle) {
          elementoDetalle.textContent = 'Procesando análisis estadístico...';
        }
        
        // Usar un ID diferente para proyecciones (análisis) vs predicciones
        const userIdAnalisis = `${userId}-analisis`;
        
        // Generar proyección usando el sistema de IA
        const proyeccion = await generarPrediccionPersonalizada(userIdAnalisis, datosSorteo);
        
        if (elementoProyeccion && proyeccion && proyeccion.length === 6) {
          elementoProyeccion.textContent = proyeccion.join(' - ');
          console.log(`✅ Proyección de análisis para ${sorteo} generada:`, proyeccion);
          
          // Generar descripción del análisis
          if (elementoDetalle) {
            const descripcion = `Basado en estadísticas, patrones, probabilidad, desviación estándar y delta`;
            elementoDetalle.textContent = descripcion;
          }
          
          // Almacenar la proyección para uso futuro
          if (!window.proyeccionesAlmacenadas) {
            window.proyeccionesAlmacenadas = {};
          }
          
          window.proyeccionesAlmacenadas[sorteo] = {
            userId: userIdAnalisis,
            proyeccion: proyeccion,
            ultimoSorteo: datosSorteo.ultimoSorteo || 'desconocido',
            timestamp: new Date().getTime()
          };
        }
      } catch (error) {
        console.error(`❌ Error generando proyección de análisis para ${sorteo}:`, error);
        const elementoProyeccion = document.getElementById(`proyeccion-${sorteo}`);
        const elementoDetalle = document.getElementById(`detalle-${sorteo}`);
        if (elementoProyeccion) {
          elementoProyeccion.textContent = 'Error al generar';
        }
        if (elementoDetalle) {
          elementoDetalle.textContent = 'Intente nuevamente';
        }
      }
    }
    
    console.log('✅ Proyecciones de análisis generadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error en el sistema de análisis:', error);
    ['melate', 'revancha', 'revanchita'].forEach(sorteo => {
      const elementoProyeccion = document.getElementById(`proyeccion-${sorteo}`);
      const elementoDetalle = document.getElementById(`detalle-${sorteo}`);
      if (elementoProyeccion) {
        elementoProyeccion.textContent = 'Error inesperado';
      }
      if (elementoDetalle) {
        elementoDetalle.textContent = 'Intente nuevamente más tarde';
      }
    });
  }
};

console.log('✅ Sistema unificado inicializado correctamente');
