// inicializacion-unificada.js
// Sistema unificado de inicialización para sugeridas.html

import { generarPrediccionPersonalizada } from './mlPredictor.js';
import { cargarDatosHistoricos, analizarSu          // Generar descripción del análisis
          if (elementoDetalle) {
            const descripcion = `Frecuencias: análisis histórico | Suma: rangos optimizados | Balance: pares/impares | Décadas: por posición`;
            elementoDetalle.textContent = descripcion;
          }eros, analizarParesImpares, analizarDecadaPorPosicion } from './dataParser.js';

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
    
    // Inicializar todos los elementos para mostrar estado de "preparando"
    sorteos.forEach(sorteo => {
      const elementoCombo = document.getElementById(`combinacion-${sorteo}`);
      if (elementoCombo) {
        elementoCombo.innerHTML = `
          <div class="text-gray-400 text-sm">
            🔄 Preparando análisis...
          </div>
        `;
      }
    });
    
    // Procesar todos los sorteos EN PARALELO
    const promesasSorteos = sorteos.map(async (sorteo) => {
      try {
        console.log(`🎯 Generando predicción para ${sorteo}...`);
        
        const elementoCombo = document.getElementById(`combinacion-${sorteo}`);
        const datosSorteo = window.datosHistoricos[sorteo];
        
        if (!datosSorteo) {
          console.warn(`⚠️ No hay datos para ${sorteo}`);
          if (elementoCombo) {
            elementoCombo.textContent = 'Sin datos disponibles';
          }
          return;
        }
        
        // Mostrar efecto de análisis de números (2 segundos) - TODOS AL MISMO TIEMPO
        if (elementoCombo) {
          await mostrarEfectoAnalisisNumeros(elementoCombo, sorteo);
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
    });
    
    // Esperar a que TODOS los sorteos terminen su análisis
    await Promise.all(promesasSorteos);
    
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
    
    // Inicializar todos los elementos para mostrar estado de "preparando análisis"
    sorteos.forEach(sorteo => {
      const elementoProyeccion = document.getElementById(`proyeccion-${sorteo}`);
      const elementoDetalle = document.getElementById(`detalle-${sorteo}`);
      if (elementoProyeccion) {
        elementoProyeccion.innerHTML = `
          <div class="text-gray-400 text-sm">
            📊 Preparando análisis estadístico...
          </div>
        `;
      }
      if (elementoDetalle) {
        elementoDetalle.textContent = 'Inicializando sistema de análisis...';
      }
    });
    
    // Procesar todos los sorteos EN PARALELO
    const promesasAnalisis = sorteos.map(async (sorteo) => {
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
          return;
        }
        
        // Mostrar efecto de análisis estadístico (2 segundos) - TODOS AL MISMO TIEMPO
        if (elementoProyeccion) {
          await mostrarEfectoAnalisisEstadistico(elementoProyeccion, elementoDetalle, sorteo);
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
    });
    
    // Esperar a que TODOS los análisis terminen al mismo tiempo
    await Promise.all(promesasAnalisis);
    
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

// Función para mostrar efecto de análisis estadístico (proyecciones)
async function mostrarEfectoAnalisisEstadistico(elementoProyeccion, elementoDetalle, sorteo) {
  console.log(`📊 Iniciando efecto de análisis estadístico para ${sorteo}...`);
  
  const duracionTotal = 2000; // 2 segundos
  const intervalos = 120; // Cambio cada 120ms 
  const totalCambios = duracionTotal / intervalos;
  
  // Generar combinaciones temporales para el análisis
  const combinacionesAnalisis = [];
  for (let i = 0; i < totalCambios; i++) {
    const nums = new Set();
    while (nums.size < 6) {
      nums.add(Math.floor(Math.random() * 56) + 1);
    }
    combinacionesAnalisis.push(Array.from(nums).sort((a, b) => a - b));
  }
  
  // Mostrar interfaz inicial de análisis estadístico
  elementoProyeccion.innerHTML = `
    <div class="flex flex-col items-center space-y-2">
      <div class="text-blue-300 animate-pulse text-sm">
        📊 Análisis Estadístico ${sorteo.charAt(0).toUpperCase() + sorteo.slice(1)}
      </div>
      <div id="stats-${sorteo}" class="font-mono text-base text-white bg-blue-900 bg-opacity-30 px-3 py-2 rounded border border-blue-400 border-opacity-50">
        -- - -- - -- - -- - -- - --
      </div>
      <div class="text-xs text-gray-300">
        <span id="progress-${sorteo}" class="text-yellow-400">●</span> Procesando datos históricos...
      </div>
    </div>
  `;
  
  // Actualizar detalle con información del proceso
  if (elementoDetalle) {
    elementoDetalle.innerHTML = `
      <div class="text-sm text-gray-200">
        <span class="animate-pulse">🔄</span> Ejecutando análisis multimétodo...
      </div>
    `;
  }
  
  const statsElement = document.getElementById(`stats-${sorteo}`);
  const progressElement = document.getElementById(`progress-${sorteo}`);
  
  let cambioActual = 0;
  
  return new Promise((resolve) => {
    const intervalo = setInterval(() => {
      if (cambioActual >= totalCambios) {
        clearInterval(intervalo);
        
        // Efecto final de análisis completado
        elementoProyeccion.innerHTML = `
          <div class="flex flex-col items-center space-y-2">
            <div class="text-green-400 text-sm">
              ✅ Análisis Estadístico Completado
            </div>
            <div id="resultado-stats-${sorteo}" class="font-mono text-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-30 px-3 py-2 rounded-lg border border-green-400 border-opacity-50">
              Compilando resultado final...
            </div>
          </div>
        `;
        
        if (elementoDetalle) {
          elementoDetalle.innerHTML = `
            <div class="text-sm text-green-300">
              <span class="animate-bounce">⚡</span> Generando proyección optimizada...
            </div>
          `;
        }
        
        setTimeout(() => {
          resolve();
        }, 400);
        
        return;
      }
      
      // Mensajes de análisis estadístico específicos
      const mensajesEstadisticos = [
        '📈 Analizando tendencias históricas...',
        '🔢 Calculando frecuencias de aparición...',
        '📊 Evaluando distribución de números...',
        '🎯 Identificando patrones recurrentes...',
        '📉 Midiendo variabilidad estadística...',
        '🔄 Analizando secuencias temporales...',
        '⚖️ Balanceando pesos estadísticos...',
        '🎪 Optimizando proyección final...'
      ];
      
      const progreso = cambioActual / totalCambios;
      const mensajeIndex = Math.floor(progreso * mensajesEstadisticos.length);
      const mensajeActual = mensajesEstadisticos[Math.min(mensajeIndex, mensajesEstadisticos.length - 1)];
      
      // Actualizar indicador de progreso
      if (progressElement) {
        const barras = Math.floor(progreso * 10);
        const progressBar = '●'.repeat(barras) + '○'.repeat(10 - barras);
        progressElement.textContent = progressBar;
      }
      
      // Actualizar detalle del análisis
      if (elementoDetalle) {
        elementoDetalle.innerHTML = `
          <div class="text-sm text-blue-200">
            <span class="animate-pulse">🔄</span> ${mensajeActual}
          </div>
        `;
      }
      
      // Mostrar números del análisis con efecto de construcción
      if (statsElement && combinacionesAnalisis[cambioActual]) {
        const nums = combinacionesAnalisis[cambioActual];
        const numerosCompletos = Math.floor(progreso * 6);
        
        let displayNums = [];
        for (let i = 0; i < 6; i++) {
          if (i < numerosCompletos) {
            displayNums.push(nums[i].toString().padStart(2, '0'));
          } else if (i === numerosCompletos) {
            // Efecto de "calculando" en el número actual
            displayNums.push(cambioActual % 2 === 0 ? '⚡' : nums[i].toString().padStart(2, '0'));
          } else {
            displayNums.push('--');
          }
        }
        
        statsElement.textContent = displayNums.join(' - ');
        
        // Efecto visual de análisis activo
        if (cambioActual % 3 === 0) {
          statsElement.style.borderColor = 'rgba(34, 197, 94, 0.8)';
          statsElement.style.boxShadow = '0 0 8px rgba(34, 197, 94, 0.3)';
        } else {
          statsElement.style.borderColor = 'rgba(96, 165, 250, 0.5)';
          statsElement.style.boxShadow = 'none';
        }
      }
      
      cambioActual++;
    }, intervalos);
  });
}

// Función para mostrar efecto de análisis de números
async function mostrarEfectoAnalisisNumeros(elemento, sorteo) {
  console.log(`🎬 Iniciando efecto de análisis para ${sorteo}...`);
  
  // Configuración del efecto
  const duracionTotal = 2000; // 2 segundos
  const intervalos = 100; // Cambio cada 100ms (20 cambios en total)
  const totalCambios = duracionTotal / intervalos;
  
  // Generar diferentes combinaciones para mostrar durante el análisis
  const combinacionesTemporales = [];
  for (let i = 0; i < totalCambios; i++) {
    const nums = new Set();
    while (nums.size < 6) {
      nums.add(Math.floor(Math.random() * 56) + 1);
    }
    combinacionesTemporales.push(Array.from(nums).sort((a, b) => a - b));
  }
  
  // Mostrar mensaje inicial de análisis con mejor visibilidad
  elemento.innerHTML = `
    <div class="flex flex-col items-center space-y-3">
      <div class="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-semibold rounded-lg shadow-lg">
        🤖 Analizando ${sorteo.charAt(0).toUpperCase() + sorteo.slice(1)}...
      </div>
      <div id="numeros-${sorteo}" class="font-mono text-xl text-white bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-lg border border-gray-600 shadow-xl">
        -- - -- - -- - -- - -- - --
      </div>
      <div id="mensaje-analisis-${sorteo}" class="px-3 py-2 bg-white bg-opacity-90 text-gray-800 font-medium rounded-lg shadow-md min-h-[2rem] flex items-center">
        <span class="animate-pulse">🔄 Iniciando análisis completo...</span>
      </div>
    </div>
  `;
  
  const numerosElement = document.getElementById(`numeros-${sorteo}`);
  const mensajeElement = document.getElementById(`mensaje-analisis-${sorteo}`);
  
  // Efecto de análisis paso a paso
  let cambioActual = 0;
  
  return new Promise((resolve) => {
    const intervalo = setInterval(() => {
      if (cambioActual >= totalCambios) {
        clearInterval(intervalo);
        
        // Efecto final de "análisis completado" con mejor diseño
        elemento.innerHTML = `
          <div class="flex flex-col items-center space-y-3">
            <div class="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-lg shadow-lg animate-bounce">
              ✅ Análisis ${sorteo.charAt(0).toUpperCase() + sorteo.slice(1)} completado
            </div>
            <div id="resultado-final-${sorteo}" class="font-mono text-xl text-white bg-gradient-to-r from-green-600 to-blue-600 px-6 py-3 rounded-lg shadow-xl border border-green-400">
              Generando resultado final...
            </div>
            <div class="px-3 py-2 bg-green-50 text-green-800 font-medium rounded-lg shadow-md">
              <span>🎯 Predicción personalizada lista</span>
            </div>
          </div>
        `;
        
        // Pequeña pausa antes de mostrar el resultado final
        setTimeout(() => {
          resolve();
        }, 300);
        
        return;
      }
      
      // Mostrar diferentes mensajes de análisis con mejor contraste
      const mensajesAnalisis = [
        { texto: '📊 Analizando frecuencias históricas...', color: 'from-blue-500 to-blue-600' },
        { texto: '🔢 Calculando probabilidades...', color: 'from-purple-500 to-purple-600' },
        { texto: '📈 Detectando patrones recientes...', color: 'from-green-500 to-green-600' },
        { texto: '📉 Evaluando desviación estándar...', color: 'from-red-500 to-red-600' },
        { texto: '🔄 Analizando números delta...', color: 'from-orange-500 to-orange-600' },
        { texto: '🤖 Aplicando inteligencia artificial...', color: 'from-indigo-500 to-indigo-600' },
        { texto: '⚡ Optimizando combinación...', color: 'from-yellow-500 to-yellow-600' },
        { texto: '🎯 Refinando predicción final...', color: 'from-pink-500 to-pink-600' }
      ];
      
      const mensajeIndex = Math.floor((cambioActual / totalCambios) * mensajesAnalisis.length);
      const mensajeActual = mensajesAnalisis[Math.min(mensajeIndex, mensajesAnalisis.length - 1)];
      
      // Actualizar mensaje de análisis con colores y efectos mejorados
      if (mensajeElement) {
        mensajeElement.innerHTML = `
          <div class="bg-gradient-to-r ${mensajeActual.color} text-white px-4 py-2 rounded-lg font-semibold shadow-lg animate-pulse w-full text-center">
            ${mensajeActual.texto}
          </div>
        `;
      }
      
      // Mostrar combinación temporal con efecto de "escaneo"
      if (numerosElement && combinacionesTemporales[cambioActual]) {
        const nums = combinacionesTemporales[cambioActual];
        
        // Efecto de revelado progresivo
        const progreso = (cambioActual / totalCambios) * 6;
        const numerosRevelados = Math.floor(progreso);
        
        let displayNums = [];
        for (let i = 0; i < 6; i++) {
          if (i < numerosRevelados) {
            displayNums.push(nums[i].toString().padStart(2, '0'));
          } else if (i === numerosRevelados && cambioActual % 3 === 0) {
            // Efecto de parpadeo en el número que se está "analizando"
            displayNums.push('??');
          } else {
            displayNums.push('--');
          }
        }
        
        numerosElement.textContent = displayNums.join(' - ');
        
        // Efecto visual adicional con colores dinámicos
        if (cambioActual % 4 === 0) {
          numerosElement.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.6)';
          numerosElement.style.borderColor = '#22c55e';
        } else if (cambioActual % 4 === 2) {
          numerosElement.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.6)';
          numerosElement.style.borderColor = '#3b82f6';
        } else {
          numerosElement.style.boxShadow = 'none';
          numerosElement.style.borderColor = '#6b7280';
        }
      }
      
      cambioActual++;
    }, intervalos);
  });
}

console.log('✅ Sistema unificado inicializado correctamente');
