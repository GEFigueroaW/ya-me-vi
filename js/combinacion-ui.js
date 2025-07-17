/**
 * YA ME VI - Combinación UI Module
 * Módulo para manejar la interfaz de usuario y validaciones
 */

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
 * Clase para manejar el comportamiento de acordeón en la página
 */
class Acordeon {
  constructor() {
    this.triggers = document.querySelectorAll('[id^="trigger-"]');
    this.init();
  }

  init() {
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', () => this.toggle(trigger));
    });
  }

  toggle(clickedTrigger) {
    const contentId = clickedTrigger.id.replace('trigger-', 'content-');
    const contentToShow = document.getElementById(contentId);
    const icon = clickedTrigger.querySelector('svg');

    const isOpening = contentToShow.classList.contains('hidden');

    // Cerrar todos los demás acordeones antes de abrir el nuevo
    this.triggers.forEach(trigger => {
      if (trigger !== clickedTrigger) {
        const otherContentId = trigger.id.replace('trigger-', 'content-');
        const otherContent = document.getElementById(otherContentId);
        if (!otherContent.classList.contains('hidden')) {
          otherContent.classList.add('hidden');
          trigger.querySelector('svg').classList.remove('rotate-180');
        }
      }
    });

    // Alternar el estado del acordeón clickeado
    if (isOpening) {
      contentToShow.classList.remove('hidden');
      icon.classList.add('rotate-180');
    } else {
      contentToShow.classList.add('hidden');
      icon.classList.remove('rotate-180');
    }
  }
}


/**
 * Clase para manejar la validación de inputs
 */
class ValidadorInputs {
  constructor() {
    this.inputsCombinacion = document.querySelectorAll('.combo-input');
    this.btnCombinacion = document.getElementById('evaluar-combinacion-btn');
    this.inicializarEventListeners();
  }

  /**
   * Inicializar event listeners para validación
   */
  inicializarEventListeners() {
    // Validación para input individual
    const inputNumero = document.getElementById('numero-individual');
    if (inputNumero) {
      this.aplicarValidacionTiempoReal(inputNumero);
    }

    // Validación para inputs de combinación
    this.inputsCombinacion.forEach(input => {
      this.aplicarValidacionTiempoReal(input);
      
      // Eventos adicionales para validación más rápida
      input.addEventListener('keyup', () => {
        setTimeout(() => this.validarCombinacionCompleta(), 0);
      });
      
      input.addEventListener('blur', () => {
        setTimeout(() => this.validarCombinacionCompleta(), 0);
      });
      
      input.addEventListener('paste', () => {
        setTimeout(() => this.validarCombinacionCompleta(), 100);
      });
    });

    // Validar combinación al inicio
    this.validarCombinacionCompleta();
  }

  /**
   * Aplicar validación en tiempo real a un input
   */
  aplicarValidacionTiempoReal(input) {
    this.prevenirEntradaInvalida(input);
    
    input.addEventListener('input', () => {
      this.validarInputEnTiempoReal(input);
    });
  }

  /**
   * Prevenir entrada inválida
   */
  prevenirEntradaInvalida(input) {
    input.addEventListener('input', (e) => {
      let valor = e.target.value;
      
      // Remover caracteres no numéricos
      valor = valor.replace(/[^0-9]/g, '');
      
      // Limitar a 2 dígitos máximo
      if (valor.length > 2) {
        valor = valor.slice(0, 2);
      }
      
      // Si es mayor a 56, limitarlo a 56
      if (parseInt(valor) > 56) {
        valor = '56';
        this.mostrarErrorTemporal(input, 'Máximo número permitido: 56');
      }
      
      // Si es 0, no permitir
      if (valor === '0') {
        valor = '';
      }
      
      e.target.value = valor;
      
      // Validar inmediatamente después de cambiar el valor
      setTimeout(() => {
        this.validarInputEnTiempoReal(input);
      }, 0);
    });
  }

  /**
   * Validar input en tiempo real
   */
  validarInputEnTiempoReal(input) {
    const valor = parseInt(input.value);
    
    // Limpiar estilos previos
    input.classList.remove('border-red-500', 'border-green-500');
    
    // Si está vacío, no mostrar error
    if (input.value === '') {
      return true;
    }
    
    // Validar rango
    if (isNaN(valor) || valor < 1 || valor > 56) {
      input.classList.add('border-red-500');
      this.mostrarErrorTemporal(input, 'Número debe estar entre 1 y 56');
      return false;
    }
    
    // Para inputs de combinación, verificar duplicados
    if (input.classList.contains('combo-input')) {
      const valores = Array.from(this.inputsCombinacion)
        .map(inp => parseInt(inp.value))
        .filter(num => !isNaN(num));
      
      const duplicados = valores.filter(num => num === valor).length > 1;
      
      if (duplicados) {
        input.classList.add('border-red-500');
        this.mostrarErrorTemporal(input, 'Número duplicado no permitido');
        this.validarCombinacionCompleta();
        return false;
      }
    }
    
    input.classList.add('border-green-500');
    this.validarCombinacionCompleta();
    return true;
  }

  /**
   * Validar combinación completa y controlar el botón
   */
  validarCombinacionCompleta() {
    const valores = Array.from(this.inputsCombinacion)
      .map(inp => parseInt(inp.value))
      .filter(num => !isNaN(num));
    
    // Verificar duplicados
    const duplicados = valores.some((num, index) => 
      valores.indexOf(num) !== index
    );
    
    // Verificar números fuera de rango
    const fueraDeRango = valores.some(num => num < 1 || num > 56);
    
    // Deshabilitar botón si hay errores
    if (duplicados || fueraDeRango) {
      this.btnCombinacion.disabled = true;
      this.btnCombinacion.classList.add('opacity-50', 'cursor-not-allowed');
      this.btnCombinacion.classList.remove('hover:from-purple-600', 'hover:to-purple-700', 'transform', 'hover:scale-105');
    } else {
      this.btnCombinacion.disabled = false;
      this.btnCombinacion.classList.remove('opacity-50', 'cursor-not-allowed');
      this.btnCombinacion.classList.add('hover:from-purple-600', 'hover:to-purple-700', 'transform', 'hover:scale-105');
    }
  }

  /**
   * Mostrar error temporal
   */
  mostrarErrorTemporal(input, mensaje) {
    // Remover error anterior si existe
    const errorAnterior = input.parentNode.querySelector('.error-mensaje');
    if (errorAnterior) {
      errorAnterior.remove();
    }
    
    // Crear mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-mensaje text-red-400 text-xs mt-1 absolute z-10 bg-red-900 bg-opacity-80 px-2 py-1 rounded';
    errorDiv.textContent = mensaje;
    
    // Posicionar el error
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(errorDiv);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 3000);
  }
}

/**
 * Clase para manejar la evaluación de números y combinaciones
 */
class EvaluadorNumeros {
  constructor() {
    this.resultadoNumero = document.getElementById('resultado-numero');
    this.resultadoCombinacion = document.getElementById('resultado-combinacion');
    this.inicializarEventListeners();
  }

  /**
   * Inicializar event listeners
   */
  inicializarEventListeners() {
    const btnNumero = document.getElementById('evaluar-numero-btn');
    const btnCombinacion = document.getElementById('evaluar-combinacion-btn');

    if (btnNumero) {
      btnNumero.addEventListener('click', () => this.evaluarNumeroIndividual());
    }

    if (btnCombinacion) {
      btnCombinacion.addEventListener('click', () => this.evaluarCombinacion());
    }
  }

  /**
   * Evaluar número individual
   */
  evaluarNumeroIndividual() {
    const inputNumero = document.getElementById('numero-individual');
    const numero = parseInt(inputNumero.value);
    
    if (isNaN(numero) || numero < 1 || numero > 56) {
      this.mostrarError(this.resultadoNumero, 'Por favor, ingresa un número válido entre 1 y 56.');
      return;
    }
    
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

      this.resultadoNumero.innerHTML = html;
      
    } catch (error) {
      console.error('❌ Error al analizar número individual:', error);
      this.mostrarError(this.resultadoNumero, `Error al procesar el análisis. Error: ${error.message}`);
    }
  }

  /**
   * Evaluar combinación completa
   */
  evaluarCombinacion() {
    const inputsCombinacion = document.querySelectorAll('.combo-input');
    const numeros = Array.from(inputsCombinacion)
      .map(input => parseInt(input.value))
      .filter(num => !isNaN(num));

    // Validaciones
    if (numeros.length !== 6) {
      this.mostrarError(this.resultadoCombinacion, 'Por favor, completa todos los 6 números.');
      return;
    }

    // Verificar duplicados
    const sinDuplicados = new Set(numeros);
    if (sinDuplicados.size !== 6) {
      this.mostrarError(this.resultadoCombinacion, 'No se permiten números duplicados. Por favor, ingresa números únicos.');
      return;
    }

    // Verificar rango
    if (numeros.some(n => n < 1 || n > 56)) {
      this.mostrarError(this.resultadoCombinacion, 'Los números deben estar entre 1 y 56. Por favor, verifica tu combinación.');
      return;
    }

    try {
      const analisisIndividual = this.prepararAnalisisIndividual(numeros);
      const html = this.generarHtmlCombinacion(numeros, analisisIndividual);
      this.resultadoCombinacion.innerHTML = html;
      
    } catch (error) {
      console.error('❌ Error al analizar combinación:', error);
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
          ${this.generarTarjetaSorteo('Melate', '🎲', clasificaciones.melate, indicePorSorteo.melate, frecuenciaPorSorteo.melate, 'blue')}
          ${this.generarTarjetaSorteo('Revancha', '🎲', clasificaciones.revancha, indicePorSorteo.revancha, frecuenciaPorSorteo.revancha, 'purple')}
          ${this.generarTarjetaSorteo('Revanchita', '🎲', clasificaciones.revanchita, indicePorSorteo.revanchita, frecuenciaPorSorteo.revanchita, 'green')}
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
            ${this.generarTarjetaCombinacion('Melate', '🎲', clasificaciones.melate, promedios.melate, potenciales.melate, 'blue')}
            ${this.generarTarjetaCombinacion('Revancha', '🎲', clasificaciones.revancha, promedios.revancha, potenciales.revancha, 'purple')}
            ${this.generarTarjetaCombinacion('Revanchita', '🎲', clasificaciones.revanchita, promedios.revanchita, potenciales.revanchita, 'green')}
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
}

/**
 * Clase para manejar la interfaz expandible
 */
class InterfazExpandible {
  constructor() {
    this.inicializarEventListeners();
  }

  /**
   * Inicializar event listeners
   */
  inicializarEventListeners() {
    // Botones para números individuales y combinaciones
    const botones = [
      'mostrar-explicacion-btn',
      'mostrar-explicacion-btn-combo'
    ];

    botones.forEach(id => {
      const boton = document.getElementById(id);
      if (boton) {
        boton.addEventListener('click', () => this.toggleExplicacion());
      }
    });

    // Botón de ayuda expandible
    const toggleHelpBtn = document.getElementById('toggle-help-expandible');
    if (toggleHelpBtn) {
      toggleHelpBtn.addEventListener('click', () => this.toggleHelp());
    }

    // Botón de análisis expandible
    const toggleAnalisisBtn = document.getElementById('toggle-analisis-expandible');
    if (toggleAnalisisBtn) {
      toggleAnalisisBtn.addEventListener('click', () => this.toggleAnalisis());
    }
  }

  /**
   * Alternar explicación
   */
  toggleExplicacion() {
    const explicacion = document.getElementById('explicacion-expandible');
    const textElements = [
      document.getElementById('explicacion-text'),
      document.getElementById('explicacion-combo-text')
    ];
    const iconElements = [
      document.getElementById('explicacion-icon'),
      document.getElementById('explicacion-combo-icon')
    ];

    if (explicacion.classList.contains('hidden')) {
      explicacion.classList.remove('hidden');
      explicacion.classList.add('animate__animated', 'animate__fadeInDown');
      
      // Actualizar todos los botones
      textElements.forEach(el => {
        if (el) el.textContent = '🔼 Ocultar explicación';
      });
      iconElements.forEach(el => {
        if (el) el.textContent = '👁️‍🗨️';
      });
      
      // Scroll suave hacia la explicación
      explicacion.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      explicacion.classList.add('hidden');
      
      // Restaurar todos los botones
      textElements.forEach(el => {
        if (el) el.textContent = '💡 ¿Cómo interpretar resultados?';
      });
      iconElements.forEach(el => {
        if (el) el.textContent = '👁️';
      });
    }
  }

  /**
   * Alternar ayuda
   */
  toggleHelp() {
    const helpContent = document.getElementById('help-content-expandible');
    const helpText = document.getElementById('help-text-expandible');
    const helpIcon = document.getElementById('help-icon-expandible');

    if (helpContent.classList.contains('hidden')) {
      helpContent.classList.remove('hidden');
      helpContent.classList.add('animate__animated', 'animate__fadeInDown');
      helpText.textContent = 'Ocultar ejemplo';
      helpIcon.textContent = '👁️‍🗨️';
    } else {
      helpContent.classList.add('hidden');
      helpText.textContent = 'Ver ejemplo práctico';
      helpIcon.textContent = '👁️';
    }
  }

  /**
   * Alternar análisis
   */
  toggleAnalisis() {
    const analisisContent = document.getElementById('analisis-content-expandible');
    const analisisText = document.getElementById('analisis-text-expandible');
    const analisisIcon = document.getElementById('analisis-icon-expandible');

    if (analisisContent.classList.contains('hidden')) {
      analisisContent.classList.remove('hidden');
      analisisContent.classList.add('animate__animated', 'animate__fadeInDown');
      analisisText.textContent = '🔼 Ocultar análisis';
      analisisIcon.textContent = '🔍‍🗨️';
    } else {
      analisisContent.classList.add('hidden');
      analisisText.textContent = '⚙️ ¿Cómo funciona el análisis?';
      analisisIcon.textContent = '🔍';
    }
  }
}

/**
 * Inicializar la aplicación cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
  new Acordeon();
  const uiManager = new UIManager();
  uiManager.inicializar();

  // Botón de regreso
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      window.location.href = 'home.html';
    });
  }

  // Inicializar datos históricos
  prepararDatosHistoricos();
});
