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
 * Clase para manejar la interfaz de usuario y validaciones
 */
class UIManager {
  constructor() {
    // Elementos del Acordeón
    this.triggers = document.querySelectorAll('[id^="trigger-"]');
    
    // Elementos de la UI
    this.validador = new ValidadorInputs();
    this.btnVolver = document.getElementById('btn-back');
    this.btnEvaluarNumero = document.getElementById('evaluar-numero-btn');
    this.inputNumero = document.getElementById('numero-individual');
    this.resultadoNumero = document.getElementById('resultado-numero');
    this.btnEvaluarCombinacion = document.getElementById('evaluar-combinacion-btn');
    this.resultadoCombinacion = document.getElementById('resultado-combinacion');
    this.btnMostrarExplicacion = document.getElementById('mostrar-explicacion-btn');
    this.btnMostrarExplicacionCombo = document.getElementById('mostrar-explicacion-btn-combo');
    this.explicacionNumero = document.getElementById('explicacion-numero');
    this.explicacionCombinacion = document.getElementById('explicacion-combinacion');
  }

  /**
   * Inicializar todos los event listeners
   */
  inicializar() {
    // Inicializar el acordeón
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', () => this.toggleAcordeon(trigger));
    });

    // Inicializar botones y otros elementos, deteniendo la propagación del evento
    this.btnVolver.addEventListener('click', (e) => {
      e.stopPropagation();
      window.history.back();
    });
    
    this.btnEvaluarNumero.addEventListener('click', (e) => {
      e.stopPropagation();
      this.evaluarNumeroIndividual();
    });

    this.inputNumero.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        this.evaluarNumeroIndividual();
      }
    });

    this.btnEvaluarCombinacion.addEventListener('click', (e) => {
      e.stopPropagation();
      this.evaluarCombinacion();
    });
    
    this.btnMostrarExplicacion.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleExplicacion(this.explicacionNumero);
    });

    this.btnMostrarExplicacionCombo.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleExplicacion(this.explicacionCombinacion);
    });

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
    const contentId = clickedTrigger.id.replace('trigger-', 'content-');
    const contentToShow = document.getElementById(contentId);
    const icon = clickedTrigger.querySelector('svg');

    const isOpening = contentToShow.classList.contains('hidden');

    // Cerrar todos los demás acordeones
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

    // Alternar el acordeón clickeado
    if (isOpening) {
      contentToShow.classList.remove('hidden');
      icon.classList.add('rotate-180');
    } else {
      contentToShow.classList.add('hidden');
      icon.classList.remove('rotate-180');
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
   * Evaluar un número individual
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
 * Inicializar la aplicación
 */
document.addEventListener('DOMContentLoaded', () => {
  const uiManager = new UIManager();
  uiManager.inicializar();
});
