import { 
  prepararDatosHistoricos,
  calcularFrecuenciaPorSorteo,
  calcularIndicePorSorteo,
  calcularFrecuenciaTotal,
  calcularPorcentajeTotal,
  clasificarProbabilidad,
  generarHtmlAnalisisSorteo,
  generarMensajeSuerte
} from './combinacion.js';

/**
 * YA ME VI - Combinación UI Module
 * Módulo para manejar la interfaz de usuario y validaciones
 */

/**
 * Clase para validar inputs
 */
export class ValidadorInputs {
  validarNumero(numero) {
    return !isNaN(numero) && numero >= 1 && numero <= 56;
  }
  
  validarCombinacion(numeros) {
    if (numeros.length !== 6) return false;
    const sinDuplicados = new Set(numeros);
    if (sinDuplicados.size !== 6) return false;
    return numeros.every(n => this.validarNumero(n));
  }
}

/**
 * Clase para manejar la interfaz de usuario y validaciones
 */
export class UIManager {
  constructor() {
    // Elementos de la UI
    this.validador = new ValidadorInputs();
    
    // Botones principales
    this.btnVolver = document.getElementById('btn-back');
    this.btnEvaluarNumero = document.getElementById('trigger-numero-individual');
    this.btnEvaluarCombinacion = document.getElementById('trigger-combinacion');
    
    // Inputs y resultados
    this.inputNumero = document.getElementById('numero-individual');
    this.resultadoNumero = document.getElementById('resultado-numero');
    this.resultadoCombinacion = document.getElementById('resultado-combinacion');
    
    // LOGGING: Verificar elementos críticos
    console.log('🔍 Verificando elementos DOM:');
    console.log('- inputNumero:', this.inputNumero ? '✅ Encontrado' : '❌ NO encontrado');
    console.log('- resultadoNumero:', this.resultadoNumero ? '✅ Encontrado' : '❌ NO encontrado');
    console.log('- resultadoCombinacion:', this.resultadoCombinacion ? '✅ Encontrado' : '❌ NO encontrado');
    
    if (!this.resultadoCombinacion) {
      console.error('❌ CRÍTICO: No se encontró el elemento resultado-combinacion');
      console.log('📋 Elementos con ID disponibles:');
      document.querySelectorAll('[id]').forEach(el => {
        console.log(`  - ${el.id}: ${el.tagName}`);
      });
    }
    
    // Botones de explicación
    this.btnMostrarExplicacion = document.getElementById('mostrar-explicacion-btn');
    this.btnMostrarExplicacionCombo = document.getElementById('mostrar-explicacion-btn-combo');
    
    // Secciones de explicación
    this.explicacionNumero = document.getElementById('explicacion-numero');
    this.explicacionCombinacion = document.getElementById('explicacion-combinacion');
    
    // Contenedores principales
    this.contenedorNumero = document.getElementById('content-numero-individual');
    this.contenedorCombinacion = document.getElementById('content-combinacion');
    
    // Botones de ejemplo práctico
    this.btnToggleHelp = document.getElementById('toggle-help');
    this.btnToggleHelpExpandible = document.getElementById('toggle-help-expandible');
    this.btnToggleHelpNumero = document.getElementById('toggle-help-numero');
    this.btnToggleHelpCombinacion = document.getElementById('toggle-help-combinacion');
    
    this.helpContent = document.getElementById('help-content');
    this.helpContentExpandible = document.getElementById('help-content-expandible');
    this.helpContentNumero = document.getElementById('help-content-numero');
    this.helpContentCombinacion = document.getElementById('help-content-combinacion');
    
    this.helpText = document.getElementById('help-text');
    this.helpTextExpandible = document.getElementById('help-text-expandible');
    this.helpTextNumero = document.getElementById('help-text-numero');
    this.helpTextCombinacion = document.getElementById('help-text-combinacion');
    
    this.helpIcon = document.getElementById('help-icon');
    this.helpIconExpandible = document.getElementById('help-icon-expandible');
    this.helpIconNumero = document.getElementById('help-icon-numero');
    this.helpIconCombinacion = document.getElementById('help-icon-combinacion');
    
    // Todos los disparadores del acordeón
    this.triggers = document.querySelectorAll('[id^="trigger-"]');
  }

  /**
   * Inicializar todos los event listeners
   */
  inicializar() {
    console.log('🚀 Inicializando UIManager para combinación...');
    
    // AGREGAR BOTÓN DE PRUEBA TEMPORAL
    this.agregarBotonPrueba();
    
    // Prevenir la propagación del evento click en los botones internos (no en los triggers)
    document.querySelectorAll('button:not([id^="trigger-"]), input').forEach(element => {
      element.addEventListener('click', (e) => e.stopPropagation());
    });
    
    // Inicializar el acordeón SOLO en los triggers
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleAcordeon(trigger);
      });
    });
    
    // Botón de volver
    if (this.btnVolver) {
      this.btnVolver.addEventListener('click', (e) => {
        e.stopPropagation();
        window.history.back();
      });
    }

    // Evaluación del número individual - usando delegación de eventos
    document.addEventListener('click', (e) => {
      console.log('🖱️ Click detectado en:', e.target.id, e.target.tagName, e.target.className);
      
      if (e.target && e.target.id === 'evaluar-numero-btn') {
        console.log('🎯 ¡CLICK EN BOTÓN EVALUAR NÚMERO DETECTADO!');
        e.stopPropagation();
        this.evaluarNumeroIndividual();
      }
    });

    // Input de número individual - delegación de eventos para Enter
    document.addEventListener('keydown', (e) => {
      if (e.target && e.target.id === 'numero-individual' && e.key === 'Enter') {
        console.log('⌨️ Enter detectado en input número individual');
        e.stopPropagation();
        this.evaluarNumeroIndividual();
      }
    });

    // Evaluación de la combinación - usando delegación de eventos
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'evaluar-combinacion-btn') {
        console.log('🎯 ¡CLICK EN BOTÓN EVALUAR COMBINACIÓN DETECTADO!');
        e.stopPropagation();
        this.evaluarCombinacion();
      }
    });

    // Validación en tiempo real para inputs de combinación - delegación de eventos
    document.addEventListener('input', (e) => {
      if (e.target && e.target.classList.contains('combo-input')) {
        e.stopPropagation();
        const inputs = Array.from(document.querySelectorAll('.combo-input'));
        const index = inputs.indexOf(e.target);
        this.validarInputEnTiempoReal(e.target, index);
      }
    });
    
    document.addEventListener('blur', (e) => {
      if (e.target && e.target.classList.contains('combo-input')) {
        e.stopPropagation();
        const inputs = Array.from(document.querySelectorAll('.combo-input'));
        const index = inputs.indexOf(e.target);
        this.validarInputEnTiempoReal(e.target, index);
      }
    });
    
    // Botones de explicación - delegación de eventos
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'mostrar-explicacion-btn') {
        e.stopPropagation();
        this.toggleExplicacion(this.explicacionNumero);
      }
      
      if (e.target && e.target.id === 'mostrar-explicacion-btn-combo') {
        e.stopPropagation();
        this.toggleExplicacion(this.explicacionCombinacion);
      }
    });

    // Botones de ejemplo práctico - delegación de eventos
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'toggle-help') {
        e.stopPropagation();
        this.toggleHelpContent(this.helpContent, this.helpText, this.helpIcon);
      }
      
      if (e.target && e.target.id === 'toggle-help-expandible') {
        e.stopPropagation();
        this.toggleHelpContent(this.helpContentExpandible, this.helpTextExpandible, this.helpIconExpandible);
      }
      
      if (e.target && e.target.id === 'toggle-help-numero') {
        e.stopPropagation();
        this.toggleHelpContent(this.helpContentNumero, this.helpTextNumero, this.helpIconNumero);
      }
      
      if (e.target && e.target.id === 'toggle-help-combinacion') {
        e.stopPropagation();
        this.toggleHelpContent(this.helpContentCombinacion, this.helpTextCombinacion, this.helpIconCombinacion);
      }
    });

    console.log('✅ Event listeners configurados con delegación de eventos');

    // Preparar datos históricos
    prepararDatosHistoricos().then(() => {
      console.log('✅ Datos históricos listos para usar en la UI.');
    }).catch(error => {
      console.error('❌ Error al preparar datos para la UI:', error);
    });
  }

  /**
   * Manejar la lógica del acordeón
   */
  toggleAcordeon(clickedTrigger) {
    console.log('🔄 Accordion clicked:', clickedTrigger.id);
    
    const contentId = clickedTrigger.id.replace('trigger-', 'content-');
    const contentToShow = document.getElementById(contentId);
    const icon = clickedTrigger.querySelector('svg');
    
    if (!contentToShow) {
      console.error('❌ No se encontró el contenido para:', contentId);
      return;
    }

    // Verificar si el contenido clickeado está actualmente visible
    const isCurrentlyOpen = !contentToShow.classList.contains('hidden');
    
    // Cerrar todas las secciones y limpiar inputs
    this.triggers.forEach(trigger => {
      const otherContentId = trigger.id.replace('trigger-', 'content-');
      const otherContent = document.getElementById(otherContentId);
      const otherIcon = trigger.querySelector('svg');
      
      if (otherContent) {
        // Si esta sección se está cerrando, limpiar sus inputs
        if (otherContentId === contentId && isCurrentlyOpen) {
          // Limpiar input de número individual
          if (otherContentId === 'content-numero-individual' && this.inputNumero) {
            this.inputNumero.value = '';
          }
          
          // Limpiar inputs de combinación
          if (otherContentId === 'content-combinacion') {
            const inputsCombinacion = document.querySelectorAll('.combo-input');
            inputsCombinacion.forEach(input => {
              input.value = '';
              input.classList.remove('border-red-500', 'bg-red-100', 'border-green-500', 'bg-green-50');
              input.classList.add('border-gray-300');
            });
            
            // Limpiar mensajes de error
            this.limpiarMensajesError();
          }
        }
        
        otherContent.classList.add('hidden');
        if (otherIcon) {
          otherIcon.classList.remove('rotate-180');
        }
      }
    });

    // Si NO estaba abierto, abrirlo
    if (!isCurrentlyOpen) {
      contentToShow.classList.remove('hidden');
      if (icon) {
        icon.classList.add('rotate-180');
      }
      console.log('✅ Sección abierta:', contentId);
    } else {
      console.log('✅ Sección cerrada:', contentId);
      
      // Limpiar resultados al cerrar
      if (contentId === 'content-numero-individual') {
        this.resultadoNumero.innerHTML = '';
      } else if (contentId === 'content-combinacion') {
        this.resultadoCombinacion.innerHTML = '';
      }
    }
  }

  /**
   * Alternar visibilidad de la sección de explicación
   */
  toggleExplicacion(elementoExplicacion) {
    if (!elementoExplicacion) return;
    const esVisible = !elementoExplicacion.classList.contains('hidden');
    if (esVisible) {
      elementoExplicacion.classList.add('hidden');
    } else {
      elementoExplicacion.classList.remove('hidden');
      elementoExplicacion.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Alternar visibilidad del contenido de ayuda expandible
   */
  toggleHelpContent(helpContent, helpText, helpIcon) {
    if (!helpContent || !helpText || !helpIcon) return;
    
    const esVisible = !helpContent.classList.contains('hidden');
    
    if (esVisible) {
      // Ocultar contenido
      helpContent.classList.add('hidden');
      helpText.textContent = 'Ver ejemplo práctico';
      helpIcon.textContent = '👁️';
    } else {
      // Mostrar contenido
      helpContent.classList.remove('hidden');
      helpText.textContent = 'Ocultar ejemplo';
      helpIcon.textContent = '🙈';
      
      // Solo llenar el contenido si está vacío (para contenido expandible vacío)
      if (helpContent.innerHTML.trim() === '') {
        helpContent.innerHTML = this.generarEjemploPractico();
      }
      
      // Scroll suave hacia el contenido
      helpContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Generar el HTML del ejemplo práctico
   */
  generarEjemploPractico() {
    return `
      <h4 class="font-semibold mb-3 text-yellow-300">🧮 Ejemplo con el número 15:</h4>
      <div class="bg-white bg-opacity-20 rounded-lg p-3 text-sm">
        <ul class="text-gray-200 space-y-1">
          <li>📊 <strong>Frecuencia:</strong> 12 apariciones en 1,668 números históricos</li>
          <li>📈 <strong>Porcentaje base:</strong> (12 ÷ 1,668) × 100 = 0.72%</li>
          <li>⚡ <strong>Factor 12.5x:</strong> 0.72% × 12.5 = 9.0%</li>
          <li>🎯 <strong>Resultado final:</strong> Máximo entre 9.0% y 8% = 9.0%</li>
        </ul>
        <p class="text-white mt-2 font-medium text-center">
          <span class="text-yellow-300">🎯 Índice de éxito = 9.0%</span> | 
          <span class="text-green-300">⭐ Potencial = 9.0%</span>
          <span class="text-purple-200"> (¡Máxima confianza!)</span>
        </p>
      </div>
    `;
  }

  /**
   * Validar input de combinación en tiempo real
   */
  validarInputEnTiempoReal(input, index) {
    const valor = parseInt(input.value);
    const inputsCombinacion = document.querySelectorAll('.combo-input');
    
    // Limpiar estilos previos
    input.classList.remove('border-red-500', 'bg-red-100');
    input.classList.add('border-gray-300');
    
    // Limpiar mensajes de error previos
    this.limpiarMensajesError();
    
    // Validar si el input está vacío
    if (input.value.trim() === '') {
      return;
    }
    
    // Validar rango (1-56)
    if (isNaN(valor) || valor < 1 || valor > 56) {
      this.mostrarErrorEnInput(input, 'Número debe estar entre 1 y 56');
      input.value = '';
      return;
    }
    
    // Validar duplicados
    const valores = Array.from(inputsCombinacion)
      .map(inp => parseInt(inp.value))
      .filter(val => !isNaN(val));
    
    const duplicados = valores.filter((val, idx) => 
      valores.indexOf(val) !== idx || (val === valor && valores.indexOf(val) !== index)
    );
    
    if (duplicados.length > 0) {
      this.mostrarErrorEnInput(input, 'Número duplicado no permitido');
      input.value = '';
      return;
    }
    
    // Si llegamos aquí, el valor es válido
    input.classList.remove('border-gray-300');
    input.classList.add('border-green-500', 'bg-green-50');
  }

  /**
   * Mostrar error en input específico
   */
  mostrarErrorEnInput(input, mensaje) {
    input.classList.remove('border-gray-300', 'border-green-500', 'bg-green-50');
    input.classList.add('border-red-500', 'bg-red-100');
    
    // Crear o actualizar mensaje de error
    let errorDiv = document.getElementById('error-combinacion-tiempo-real');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'error-combinacion-tiempo-real';
      errorDiv.className = 'mt-2 text-center';
      
      const comboBtnContainer = document.querySelector('#evaluar-combinacion-btn').parentNode;
      comboBtnContainer.insertBefore(errorDiv, comboBtnContainer.firstChild);
    }
    
    errorDiv.innerHTML = `
      <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-3 animate-pulse">
        <p class="text-red-700 font-semibold text-sm">⚠️ ${mensaje}</p>
      </div>
    `;
    
    // Hacer scroll suave hacia el error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      if (errorDiv) {
        errorDiv.remove();
      }
    }, 3000);
  }

  /**
   * Limpiar mensajes de error de tiempo real
   */
  limpiarMensajesError() {
    const errorDiv = document.getElementById('error-combinacion-tiempo-real');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  /**
   * Evaluar un número individual
   */
  evaluarNumeroIndividual() {
    console.log('🔍 Evaluando número individual...');
    
    const inputNumero = document.getElementById('numero-individual');
    const resultadoContainer = document.getElementById('resultado-numero');
    
    if (!inputNumero) {
      console.error('❌ No se encontró el input numero-individual');
      return;
    }
    
    if (!resultadoContainer) {
      console.error('❌ No se encontró el container resultado-numero');
      return;
    }
    
    const numero = parseInt(inputNumero.value);
    
    if (isNaN(numero) || numero < 1 || numero > 56) {
      this.mostrarError(resultadoContainer, 'Por favor, ingresa un número válido entre 1 y 56.');
      return;
    }
    
    console.log(`🎯 Analizando número: ${numero}`);
    
    try {
      const frecuenciaPorSorteo = calcularFrecuenciaPorSorteo(numero);
      const indicePorSorteo = calcularIndicePorSorteo(numero);
      
      // Clasificaciones por sorteo individual
      const clasificacionMelate = clasificarProbabilidad(frecuenciaPorSorteo.melate.porcentaje);
      const clasificacionRevancha = clasificarProbabilidad(frecuenciaPorSorteo.revancha.porcentaje);
      const clasificacionRevanchita = clasificarProbabilidad(frecuenciaPorSorteo.revanchita.porcentaje);

      const html = this.generarHtmlNumeroIndividual(numero, frecuenciaPorSorteo, indicePorSorteo, {
        melate: clasificacionMelate,
        revancha: clasificacionRevancha,
        revanchita: clasificacionRevanchita
      });

      resultadoContainer.innerHTML = html;
      console.log('✅ Resultado generado exitosamente');
      
      console.log(`✅ Número ${numero} evaluado correctamente`);
      
    } catch (error) {
      console.error('❌ Error al analizar número individual:', error);
      this.mostrarError(resultadoContainer, `Error al procesar el análisis. Error: ${error.message}`);
    }
  }

  /**
   * Evaluar combinación completa
   */
  evaluarCombinacion() {
    console.log('🎯 INICIANDO evaluarCombinacion()...');
    
    // Limpiar mensajes de error en tiempo real
    this.limpiarMensajesError();
    
    // Verificar que el elemento resultado existe
    if (!this.resultadoCombinacion) {
      console.error('❌ ERROR: No se encontró el elemento resultado-combinacion');
      alert('Error: No se encontró el contenedor de resultados. Verifica que el HTML esté completo.');
      return;
    }
    
    const inputsCombinacion = document.querySelectorAll('.combo-input');
    console.log(`📋 Inputs encontrados: ${inputsCombinacion.length}`);
    
    const numeros = Array.from(inputsCombinacion)
      .map(input => parseInt(input.value))
      .filter(num => !isNaN(num));

    console.log(`🔢 Números extraídos: ${numeros.join(', ')} (Total: ${numeros.length})`);

    // Validaciones
    if (numeros.length !== 6) {
      console.log('❌ VALIDACIÓN: No hay 6 números completos');
      this.mostrarError(this.resultadoCombinacion, 'Por favor, completa todos los 6 números.');
      return;
    }

    // Verificar duplicados
    const sinDuplicados = new Set(numeros);
    if (sinDuplicados.size !== 6) {
      console.log('❌ VALIDACIÓN: Números duplicados encontrados');
      this.mostrarError(this.resultadoCombinacion, 'No se permiten números duplicados. Por favor, ingresa números únicos.');
      return;
    }

    // Verificar rango
    if (numeros.some(n => n < 1 || n > 56)) {
      console.log('❌ VALIDACIÓN: Números fuera de rango');
      this.mostrarError(this.resultadoCombinacion, 'Los números deben estar entre 1 y 56. Por favor, verifica tu combinación.');
      return;
    }

    console.log(`🎯 VALIDACIONES PASADAS - Analizando combinación: ${numeros.join(', ')}`);

    try {
      console.log('📊 Preparando análisis individual...');
      const analisisIndividual = this.prepararAnalisisIndividual(numeros);
      console.log('✅ Análisis individual preparado:', analisisIndividual);
      
      console.log('🎨 Generando HTML de resultados...');
      const html = this.generarHtmlCombinacion(numeros, analisisIndividual);
      console.log('✅ HTML generado, longitud:', html.length);
      
      this.resultadoCombinacion.innerHTML = html;
      console.log('✅ HTML insertado en el DOM');
      
      console.log('✅ Análisis de combinación completado exitosamente');
      
      console.log(`✅ Combinación ${numeros.join(', ')} evaluada correctamente`);
      
      // Agregar event listener para el botón de explicación en resultados
      const btnExplicacionResultados = document.getElementById('mostrar-explicacion-btn-resultados');
      if (btnExplicacionResultados) {
        btnExplicacionResultados.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleExplicacion(this.explicacionCombinacion);
        });
      }
      
    } catch (error) {
      console.error('❌ ERROR CRÍTICO al analizar combinación:', error);
      console.error('❌ Stack trace:', error.stack);
      this.mostrarError(this.resultadoCombinacion, `Error al procesar el análisis. Error: ${error.message}`);
    }
  }

  /**
   * Preparar análisis individual para cada número
   */
  prepararAnalisisIndividual(numeros) {
    return numeros.map(num => {
      const frecuenciaPorSorteo = calcularFrecuenciaPorSorteo(num);
      const frecuenciaTotal = calcularFrecuenciaTotal(num);
      const porcentajeTotal = calcularPorcentajeTotal(num);
      const clasificacionTotal = clasificarProbabilidad(porcentajeTotal);
      
      return {
        numero: num,
        frecuenciaTotal,
        porcentajeTotal,
        clasificacionTotal,
        porSorteo: frecuenciaPorSorteo
      };
    });
  }

  /**
   * Generar HTML para número individual
   */
  generarHtmlNumeroIndividual(numero, frecuenciaPorSorteo, indicePorSorteo, clasificaciones) {
    return `
      <div class="bg-white bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-50 shadow-xl">
        <h3 class="text-2xl font-bold mb-6 text-center text-gray-800">🎯 Tus Posibilidades con el Número ${numero}</h3>
        
        <!-- Análisis por sorteo individual -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${this.generarTarjetaSorteo('Melate', '🔍', clasificaciones.melate, indicePorSorteo.melate, frecuenciaPorSorteo.melate, 'blue')}
          ${this.generarTarjetaSorteo('Revancha', '🔍', clasificaciones.revancha, indicePorSorteo.revancha, frecuenciaPorSorteo.revancha, 'purple')}
          ${this.generarTarjetaSorteo('Revanchita', '🔍', clasificaciones.revanchita, indicePorSorteo.revanchita, frecuenciaPorSorteo.revanchita, 'green')}
        </div>
      </div>
    `;
  }

  /**
   * Generar tarjeta de sorteo individual
   */
  generarTarjetaSorteo(nombre, emoji, clasificacion, indice, frecuencia, color) {
    const colorClasses = {
      blue: 'bg-blue-500 bg-opacity-20 border-blue-400 text-blue-800',
      purple: 'bg-purple-500 bg-opacity-20 border-purple-400 text-purple-800',
      green: 'bg-green-500 bg-opacity-20 border-green-400 text-green-800'
    };
    
    return `
      <div class="${colorClasses[color]} rounded-lg p-4 text-center border">
        <h4 class="font-bold mb-2">${emoji} ${nombre}</h4>
        <div class="text-4xl font-bold ${clasificacion.color} mb-2">
          ${clasificacion.emoji}
        </div>
        <div class="text-lg font-bold text-gray-800 mb-1">
          <span class="text-yellow-600">🎯 Índice de éxito:</span> ${indice.porcentaje.toFixed(1)}%
        </div>
        <div class="text-lg font-bold text-gray-800 mb-1">
          <span class="text-green-600">⭐ Potencial:</span> ${frecuencia.porcentaje.toFixed(1)}%
        </div>
        <div class="inline-block px-3 py-1 rounded-full ${clasificacion.bgColor} ${clasificacion.color} mb-1">
          ${clasificacion.categoria}
        </div>
        <div class="text-sm text-gray-600">
          ${frecuencia.frecuencia} apariciones históricas
        </div>
      </div>
    `;
  }

  /**
   * Generar HTML para combinación
   */
  generarHtmlCombinacion(numeros, analisisIndividual) {
    // Calcular promedios por sorteo
    const promedios = this.calcularPromediosPorSorteo(analisisIndividual);
    
    // Clasificaciones por sorteo
    const clasificaciones = {
      melate: clasificarProbabilidad(promedios.melate),
      revancha: clasificarProbabilidad(promedios.revancha),
      revanchita: clasificarProbabilidad(promedios.revanchita)
    };
    
    // Calcular potencial de éxito por sorteo
    const potenciales = this.calcularPotencialesPorSorteo(promedios);
    
    // Generar HTML por sorteo
    const htmlSorteos = {
      melate: generarHtmlAnalisisSorteo(analisisIndividual, 'melate', 'bg-blue-500', 'border-blue-400'),
      revancha: generarHtmlAnalisisSorteo(analisisIndividual, 'revancha', 'bg-purple-500', 'border-purple-400'),
      revanchita: generarHtmlAnalisisSorteo(analisisIndividual, 'revanchita', 'bg-green-500', 'border-green-400')
    };

    return `
      <div class="bg-white bg-opacity-50 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white border-opacity-50 shadow-xl">
        <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">🎯 Tus Posibilidades con la Combinación</h2>
        <div class="text-center mb-6">
          <div class="text-4xl font-bold text-gray-800 mb-2">${numeros.join(' - ')}</div>
          <p class="text-gray-700">Tu combinación seleccionada</p>
        </div>
        
        <div class="mb-6">
          <h3 class="text-xl font-bold mb-4 text-gray-800 text-center">📊 Posibilidades Detalladas por Sorteo</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${this.generarTarjetaCombinacion('Melate', '🔍', clasificaciones.melate, promedios.melate, potenciales.melate, 'blue')}
            ${this.generarTarjetaCombinacion('Revancha', '🔍', clasificaciones.revancha, promedios.revancha, potenciales.revancha, 'purple')}
            ${this.generarTarjetaCombinacion('Revanchita', '🔍', clasificaciones.revanchita, promedios.revanchita, potenciales.revanchita, 'green')}
          </div>
        </div>
          
        <!-- Análisis detallado por sorteo -->
        <div>
          <h4 class="text-lg font-bold mb-3 text-blue-600">🎲 Melate</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            ${htmlSorteos.melate}
          </div>
          
          <h4 class="text-lg font-bold mb-3 text-purple-600">🎲 Revancha</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            ${htmlSorteos.revancha}
          </div>
          
          <h4 class="text-lg font-bold mb-3 text-green-600">🎲 Revanchita</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            ${htmlSorteos.revanchita}
          </div>
        </div>
        
        <!-- Botón para mostrar explicación en resultados -->
        <div class="mt-6 mb-6 text-center">
          <button id="mostrar-explicacion-btn-resultados" class="bg-white bg-opacity-50 hover:bg-opacity-60 rounded-lg px-6 py-3 text-sm text-gray-800 transition-all duration-300 border border-white border-opacity-50 shadow-lg">
            <span>💡 ¿Cómo interpretar resultados?</span>
            <span>👁️</span>
          </button>
        </div>
        
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-20 rounded-lg p-4 text-center border border-purple-400">
          <h3 class="text-xl font-bold mb-2 text-gray-800">💡 Mensaje de Suerte</h3>
          <p class="text-gray-700">
            ${generarMensajeSuerte([clasificaciones.melate, clasificaciones.revancha, clasificaciones.revanchita])}
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Calcular promedios por sorteo
   */
  calcularPromediosPorSorteo(analisisIndividual) {
    const promedioMelate = analisisIndividual.reduce((sum, a) => sum + a.porSorteo.melate.porcentaje, 0) / 6;
    const promedioRevancha = analisisIndividual.reduce((sum, a) => sum + a.porSorteo.revancha.porcentaje, 0) / 6;
    const promedioRevanchita = analisisIndividual.reduce((sum, a) => sum + a.porSorteo.revanchita.porcentaje, 0) / 6;
    
    return {
      melate: promedioMelate,
      revancha: promedioRevancha,
      revanchita: promedioRevanchita
    };
  }

  /**
   * Calcular potenciales por sorteo
   */
  calcularPotencialesPorSorteo(promedios) {
    const factorCombinacion = 0.85;
    
    return {
      melate: Math.max(promedios.melate * factorCombinacion, 6.0),
      revancha: Math.max(promedios.revancha * factorCombinacion, 6.0),
      revanchita: Math.max(promedios.revanchita * factorCombinacion, 6.0)
    };
  }

  /**
   * Generar tarjeta de combinación
   */
  generarTarjetaCombinacion(nombre, emoji, clasificacion, promedio, potencial, color) {
    const colorClasses = {
      blue: 'bg-blue-500 bg-opacity-20 border-blue-400 text-blue-800 text-blue-600',
      purple: 'bg-purple-500 bg-opacity-20 border-purple-400 text-purple-800 text-purple-600',
      green: 'bg-green-500 bg-opacity-20 border-green-400 text-green-800 text-green-600'
    };
    
    const [bgClass, borderClass, textClass, potentialClass] = colorClasses[color].split(' ');
    
    return `
      <div class="${bgClass} rounded-lg p-4 text-center border ${borderClass}">
        <h4 class="font-bold ${textClass} mb-2">${emoji} ${nombre}</h4>
        <div class="text-3xl font-bold ${clasificacion.color} mb-2">
          ${clasificacion.emoji} 
          <span class="inline-block px-2 py-1 rounded-full ${clasificacion.bgColor} text-sm">
            ${clasificacion.categoria}
          </span>
        </div>
        <div class="text-lg text-gray-800 mb-1">
          <span class="text-yellow-600">🎯 Índice de éxito:</span> <span class="font-bold">${promedio.toFixed(1)}%</span>
        </div>
        <div class="text-xs text-gray-600 mb-2">
          Apariciones reales en sorteos históricos
        </div>
        <div class="text-lg font-bold ${potentialClass}">
          <span class="text-green-600">⭐ Potencial:</span> ${potencial.toFixed(1)}%
        </div>
        <div class="text-xs text-gray-600">
          Tu probabilidad real de éxito
        </div>
      </div>
    `;
  }

  /**
   * Mostrar mensaje de error
   */
  mostrarError(container, mensaje) {
    container.innerHTML = `
      <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
        <p class="text-red-300 font-semibold">⚠️ ${mensaje}</p>
      </div>
    `;
  }
  
  /**
   * MÉTODO TEMPORAL DE PRUEBA - Agregar botón de diagnóstico
   */
  agregarBotonPrueba() {
    const container = document.querySelector('.relative.z-10.min-h-screen');
    if (container) {
      const botonPrueba = document.createElement('div');
      botonPrueba.innerHTML = `
        <div style="position: fixed; top: 10px; right: 10px; z-index: 1000; background: #ff6b6b; padding: 10px; border-radius: 5px;">
          <button id="btn-test-combinacion" style="color: white; background: none; border: none; cursor: pointer;">
            🔧 TEST COMBINACIÓN
          </button>
        </div>
      `;
      container.appendChild(botonPrueba);
      
      document.getElementById('btn-test-combinacion').addEventListener('click', () => {
        console.log('🔧 EJECUTANDO TEST MANUAL...');
        
        // Llenar inputs con valores de prueba
        const inputs = document.querySelectorAll('.combo-input');
        const valoresPrueba = [5, 12, 23, 34, 45, 56];
        inputs.forEach((input, index) => {
          input.value = valoresPrueba[index];
        });
        
        console.log('📋 Valores de prueba llenados');
        
        // Ejecutar evaluación directamente
        this.evaluarCombinacion();
      });
    }
  }
}

/**
 * Inicializar la aplicación
 */
const init = () => {
  const uiManager = new UIManager();
  uiManager.inicializar();
};

// Asegurarnos de que el DOM esté cargado antes de inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
