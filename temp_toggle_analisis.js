    function toggleAnalisis() {
      console.log('📊 Toggle análisis clicked');
      const contenido = document.getElementById('contenido-analisis');
      const arrow = document.getElementById('arrow-icon-analisis');
      
      if (!contenido || !arrow) {
        console.error('❌ Elementos análisis no encontrados');
        return;
      }
      
      if (contenido.classList.contains('hidden')) {
        // Cerrar otras cajas
        cerrarCajaAleatorias();
        cerrarCajaPredicciones();
        
        // Abrir esta caja
        contenido.classList.remove('hidden');
        arrow.style.transform = 'rotate(180deg)';
        isAnalisisOpen = true;
        console.log('✅ Caja análisis abierta');
        
        // Mostrar estado de carga mientras se generan las proyecciones
        const elementosMelate = document.getElementById('proyeccion-melate');
        const elementosRevancha = document.getElementById('proyeccion-revancha');
        const elementosRevanchita = document.getElementById('proyeccion-revanchita');
        
        if (elementosMelate) elementosMelate.textContent = '🔄 Actualizando...';
        if (elementosRevancha) elementosRevancha.textContent = '🔄 Actualizando...';
        if (elementosRevanchita) elementosRevanchita.textContent = '🔄 Actualizando...';
        
        // Generar proyecciones automáticamente con mejor manejo de errores
        console.log('🔍 Verificando funciones de análisis:', {
          suma: typeof window.analizarSumaNumeros === 'function',
          pares: typeof window.analizarParesImpares === 'function',
          decada: typeof window.analizarDecadaPorPosicion === 'function'
        });
        
        // Generar siempre proyecciones frescas al abrir
        try {
          // Primero verificamos si tenemos las funciones de análisis disponibles
          if (window.analizarSumaNumeros && window.analizarParesImpares && window.analizarDecadaPorPosicion) {
            console.log('✅ Usando funciones de análisis del módulo global');
            
            // Refrescar datos históricos cada vez que se abre
            if (typeof window.cargarDatosHistoricos === 'function') {
              console.log('🔄 Recargando datos históricos frescos...');
              window.cargarDatosHistoricos('todos')
                .then(datos => {
                  window.datosHistoricos = datos;
                  console.log('✅ Datos históricos actualizados correctamente');
                  
                  // Una vez que tenemos datos históricos frescos, realizar análisis
                  if (window.datosHistoricos) {
                    // Realizar los análisis usando las funciones del módulo
                    const sumAnalisis = window.analizarSumaNumeros(window.datosHistoricos);
                    const paresAnalisis = window.analizarParesImpares(window.datosHistoricos);
                    const decadaAnalisis = window.analizarDecadaPorPosicion(window.datosHistoricos);
                    
                    // Agregar los análisis a los datos
                    window.datosHistoricos.sumAnalisis = sumAnalisis;
                    window.datosHistoricos.paresAnalisis = paresAnalisis;
                    window.datosHistoricos.decadaAnalisis = decadaAnalisis;
                  }
                  
                  // Generar proyecciones con los datos frescos
                  generarProyeccionesFrescas();
                })
                .catch(error => {
                  console.error('❌ Error recargando datos históricos:', error);
                  generarProyeccionesFrescas(); // Intentar con los datos que ya tenemos
                });
            } else {
              // Si no podemos recargar, usar los datos existentes
              if (window.datosHistoricos) {
                // Realizar los análisis usando las funciones del módulo
                const sumAnalisis = window.analizarSumaNumeros(window.datosHistoricos);
                const paresAnalisis = window.analizarParesImpares(window.datosHistoricos);
                const decadaAnalisis = window.analizarDecadaPorPosicion(window.datosHistoricos);
                
                // Agregar los análisis a los datos
                window.datosHistoricos.sumAnalisis = sumAnalisis;
                window.datosHistoricos.paresAnalisis = paresAnalisis;
                window.datosHistoricos.decadaAnalisis = decadaAnalisis;
              }
              
              generarProyeccionesFrescas();
            }
          } else {
            generarProyeccionesFrescas();
          }
        } catch (error) {
          console.error('❌ Error en análisis:', error);
          generarProyeccionesFrescas(); // Intentar de todos modos
        }
        
        // Función interna para generar proyecciones frescas
        function generarProyeccionesFrescas() {
          // Continuamos con la generación de proyecciones
          const fnProyecciones = window.generarProyeccionesAnalisis || generarProyeccionesAnalisis;
          
          if (fnProyecciones) {
            console.log('🔄 Generando proyecciones de análisis frescas...');
            // Ejecutar inmediatamente para mejor respuesta
            fnProyecciones().catch(error => {
              console.error('❌ Error en proyecciones de análisis:', error);
              // Actualizar interfaz con error
              ['melate', 'revancha', 'revanchita'].forEach(sorteo => {
                const elem = document.getElementById(`proyeccion-${sorteo}`);
                const detalle = document.getElementById(`detalle-${sorteo}`);
                if (elem) elem.textContent = 'Error al generar';
                if (detalle) detalle.textContent = 'Intente nuevamente';
              });
            });
          } else {
            console.error('❌ función generarProyeccionesAnalisis no está disponible');
            // Actualizar interfaz con error
            ['melate', 'revancha', 'revanchita'].forEach(sorteo => {
              const elem = document.getElementById(`proyeccion-${sorteo}`);
              const detalle = document.getElementById(`detalle-${sorteo}`);
              if (elem) elem.textContent = 'Sistema no disponible';
              if (detalle) detalle.textContent = 'Recargue la página';
            });
          }
        }
      } else {
        // Cerrar esta caja
        contenido.classList.add('hidden');
        arrow.style.transform = 'rotate(0deg)';
        isAnalisisOpen = false;
        console.log('✅ Caja análisis cerrada');
      }
    }
