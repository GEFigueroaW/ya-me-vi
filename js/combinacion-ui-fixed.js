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

import { DatabaseSetup } from './databaseSetup.js';

/**
 * YA ME VI - Combinación UI Module SIMPLIFICADO
 * Módulo para manejar la interfaz de usuario sin conflictos
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

export class UIManagerFixed {
  constructor() {
    this.validador = new ValidadorInputs();
    this.inicializarElementos();
  }

  inicializarElementos() {
    // Elementos críticos
    this.resultadoNumero = document.getElementById('resultado-numero');
    this.resultadoCombinacion = document.getElementById('resultado-combinacion');
    this.inputNumero = document.getElementById('numero-individual');
    
    // Verificar elementos
    console.log('🔍 Elementos encontrados:');
    console.log('- resultadoNumero:', this.resultadoNumero ? '✅' : '❌');
    console.log('- resultadoCombinacion:', this.resultadoCombinacion ? '✅' : '❌');
    console.log('- inputNumero:', this.inputNumero ? '✅' : '❌');
  }

  inicializar() {
    console.log('🚀 Inicializando UIManagerFixed...');
    
    // CONFIGURAR EVENT LISTENERS SIN CONFLICTOS
    this.configurarEventos();
    
    // Cargar datos
    prepararDatosHistoricos().then(() => {
      console.log('✅ Datos históricos listos');
    }).catch(error => {
      console.error('❌ Error datos:', error);
    });
  }

  configurarEventos() {
    console.log('🔧 Configurando eventos...');
    
    // REMOVER TODOS LOS EVENT LISTENERS EXISTENTES
    document.removeEventListener('click', this.handleClick);
    
    // AGREGAR UN SOLO HANDLER GLOBAL
    document.addEventListener('click', (e) => {
      this.handleClick(e);
    });
    
    // Handler para Enter en input
    document.addEventListener('keydown', (e) => {
      if (e.target.id === 'numero-individual' && e.key === 'Enter') {
        console.log('⌨️ Enter en input');
        e.preventDefault();
        this.evaluarNumeroIndividual();
      }
    });
    
    console.log('✅ Eventos configurados');
  }

  handleClick(e) {
    const id = e.target.id;
    const className = e.target.className;
    
    console.log(`🖱️ CLICK: "${id}" (${e.target.tagName})`);
    
    // Evaluar número individual
    if (id === 'evaluar-numero-btn') {
      console.log('🎯 EJECUTANDO evaluarNumeroIndividual');
      e.preventDefault();
      e.stopPropagation();
      this.evaluarNumeroIndividual();
      return;
    }
    
    // Evaluar combinación
    if (id === 'evaluar-combinacion-btn') {
      console.log('🎯 EJECUTANDO evaluarCombinacion');
      e.preventDefault();
      e.stopPropagation();
      this.evaluarCombinacion();
      return;
    }
    
    // Acordeón
    if (id && id.startsWith('trigger-')) {
      console.log(`🎯 EJECUTANDO acordeón: ${id}`);
      e.preventDefault();
      e.stopPropagation();
      this.toggleAcordeon(e.target);
      return;
    }
  }

  evaluarNumeroIndividual() {
    console.log('🔍 INICIANDO evaluarNumeroIndividual');
    
    if (!this.inputNumero) {
      console.error('❌ Input no encontrado');
      alert('Error: Input no encontrado');
      return;
    }
    
    if (!this.resultadoNumero) {
      console.error('❌ Container resultado no encontrado');
      alert('Error: Container resultado no encontrado');
      return;
    }
    
    const numero = parseInt(this.inputNumero.value);
    console.log(`📊 Número ingresado: ${numero}`);
    
    if (isNaN(numero) || numero < 1 || numero > 56) {
      console.log('❌ Número inválido');
      this.mostrarError(this.resultadoNumero, 'Número debe estar entre 1 y 56');
      return;
    }
    
    try {
      console.log('📈 Calculando análisis...');
      const frecuenciaPorSorteo = calcularFrecuenciaPorSorteo(numero);
      const indicePorSorteo = calcularIndicePorSorteo(numero);
      
      console.log('✅ Análisis calculado:', frecuenciaPorSorteo);
      
      const html = this.generarHtmlNumero(numero, frecuenciaPorSorteo, indicePorSorteo);
      this.resultadoNumero.innerHTML = html;
      
      console.log('✅ Análisis número individual completado');
      
    } catch (error) {
      console.error('❌ Error en análisis:', error);
      this.mostrarError(this.resultadoNumero, `Error: ${error.message}`);
    }
  }

  evaluarCombinacion() {
    console.log('🎯 INICIANDO evaluarCombinacion');
    
    if (!this.resultadoCombinacion) {
      console.error('❌ Container combinación no encontrado');
      alert('Error: Container combinación no encontrado');
      return;
    }
    
    const inputs = document.querySelectorAll('.combo-input');
    console.log(`📋 Inputs encontrados: ${inputs.length}`);
    
    const numeros = Array.from(inputs)
      .map(input => parseInt(input.value))
      .filter(num => !isNaN(num));
    
    console.log(`🔢 Números: ${numeros.join(', ')}`);
    
    // Validaciones
    if (numeros.length !== 6) {
      console.log('❌ No hay 6 números');
      this.mostrarError(this.resultadoCombinacion, 'Completa los 6 números');
      return;
    }
    
    const sinDuplicados = new Set(numeros);
    if (sinDuplicados.size !== 6) {
      console.log('❌ Números duplicados');
      this.mostrarError(this.resultadoCombinacion, 'No se permiten duplicados');
      return;
    }
    
    if (numeros.some(n => n < 1 || n > 56)) {
      console.log('❌ Números fuera de rango');
      this.mostrarError(this.resultadoCombinacion, 'Números deben estar entre 1-56');
      return;
    }
    
    try {
      console.log('📈 Analizando combinación...');
      const analisis = this.prepararAnalisis(numeros);
      const html = this.generarHtmlCombinacion(numeros, analisis);
      this.resultadoCombinacion.innerHTML = html;
      
      console.log('✅ Análisis combinación completado');
      
    } catch (error) {
      console.error('❌ Error en combinación:', error);
      this.mostrarError(this.resultadoCombinacion, `Error: ${error.message}`);
    }
  }

  prepararAnalisis(numeros) {
    return numeros.map(num => {
      const frecuenciaPorSorteo = calcularFrecuenciaPorSorteo(num);
      const frecuenciaTotal = calcularFrecuenciaTotal(num);
      const porcentajeTotal = calcularPorcentajeTotal(num);
      
      return {
        numero: num,
        frecuenciaTotal,
        porcentajeTotal,
        porSorteo: frecuenciaPorSorteo
      };
    });
  }

  generarHtmlNumero(numero, frecuencia, indice) {
    // Calcular promedio de todos los sorteos
    const promedioFrecuencia = Math.round((frecuencia.melate.porcentaje + frecuencia.revancha.porcentaje + frecuencia.revanchita.porcentaje) / 3);
    const promedioIndice = Math.round((indice.melate.porcentaje + indice.revancha.porcentaje + indice.revanchita.porcentaje) / 3);
    
    // Clasificar el resultado
    let clasificacion = '';
    let colorClass = '';
    if (promedioFrecuencia >= 15) {
      clasificacion = '🔥 Excepcional';
      colorClass = 'text-red-600';
    } else if (promedioFrecuencia >= 12) {
      clasificacion = '⭐ Muy Alto';
      colorClass = 'text-orange-600';
    } else if (promedioFrecuencia >= 10) {
      clasificacion = '✨ Alto';
      colorClass = 'text-yellow-600';
    } else {
      clasificacion = '💫 Bueno';
      colorClass = 'text-green-600';
    }

    return `
      <div class="bg-white bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-50 shadow-xl">
        <h3 class="text-2xl font-bold mb-4 text-center text-gray-800">🎯 Análisis del Número ${numero}</h3>
        
        <!-- Resultado Principal -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 bg-opacity-20 rounded-lg p-4 mb-4 text-center">
          <div class="text-lg font-semibold text-gray-800 mb-2">Resultado General</div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-yellow-600 font-medium">🎯 Índice de Éxito</div>
              <div class="text-2xl font-bold text-gray-800">${promedioIndice.toFixed(1)}%</div>
            </div>
            <div>
              <div class="text-sm text-green-600 font-medium">⭐ Potencial</div>
              <div class="text-2xl font-bold text-gray-800">${promedioFrecuencia.toFixed(1)}%</div>
            </div>
          </div>
          <div class="mt-2">
            <span class="inline-block px-3 py-1 rounded-full bg-white bg-opacity-30 ${colorClass} font-semibold">
              ${clasificacion}
            </span>
          </div>
        </div>

        <!-- Desglose por Sorteo -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-4">
            <h4 class="font-bold text-blue-800 mb-2 text-center">🔍 MELATE</h4>
            <div class="text-center">
              <div class="text-xs text-yellow-600">🎯 Índice</div>
              <div class="text-lg font-bold text-gray-700">${indice.melate.porcentaje.toFixed(1)}%</div>
              <div class="text-xs text-green-600 mt-1">⭐ Potencial</div>
              <div class="text-xl font-bold text-gray-800">${frecuencia.melate.porcentaje.toFixed(1)}%</div>
              <div class="text-xs text-gray-600 mt-1">${frecuencia.melate.frecuencia} apariciones</div>
            </div>
          </div>
          <div class="bg-purple-500 bg-opacity-20 border border-purple-400 rounded-lg p-4">
            <h4 class="font-bold text-purple-800 mb-2 text-center">🔍 REVANCHA</h4>
            <div class="text-center">
              <div class="text-xs text-yellow-600">🎯 Índice</div>
              <div class="text-lg font-bold text-gray-700">${indice.revancha.porcentaje.toFixed(1)}%</div>
              <div class="text-xs text-green-600 mt-1">⭐ Potencial</div>
              <div class="text-xl font-bold text-gray-800">${frecuencia.revancha.porcentaje.toFixed(1)}%</div>
              <div class="text-xs text-gray-600 mt-1">${frecuencia.revancha.frecuencia} apariciones</div>
            </div>
          </div>
          <div class="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-4">
            <h4 class="font-bold text-green-800 mb-2 text-center">🔍 REVANCHITA</h4>
            <div class="text-center">
              <div class="text-xs text-yellow-600">🎯 Índice</div>
              <div class="text-lg font-bold text-gray-700">${indice.revanchita.porcentaje.toFixed(1)}%</div>
              <div class="text-xs text-green-600 mt-1">⭐ Potencial</div>
              <div class="text-xl font-bold text-gray-800">${frecuencia.revanchita.porcentaje.toFixed(1)}%</div>
              <div class="text-xs text-gray-600 mt-1">${frecuencia.revanchita.frecuencia} apariciones</div>
            </div>
          </div>
        </div>

        <!-- Mensaje de Recomendación -->
        <div class="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-opacity-20 rounded-lg p-3 text-center">
          <p class="text-sm text-gray-700 font-medium">
            ${this.generarMensajeNumero(promedioFrecuencia, promedioIndice)}
          </p>
        </div>
      </div>
    `;
  }

  generarMensajeNumero(potencial, indice) {
    if (potencial >= 15) {
      return '🔥 ¡Número excepcional! Este número tiene un historial muy prometedor en todos los sorteos.';
    } else if (potencial >= 12) {
      return '⭐ ¡Excelente elección! Este número muestra un potencial muy alto basado en datos históricos.';
    } else if (potencial >= 10) {
      return '✨ ¡Buena opción! Este número tiene un buen desempeño histórico.';
    } else {
      return '💫 Número con potencial. Todos los números tienen oportunidades según las estadísticas.';
    }
  }

  generarHtmlCombinacion(numeros, analisis) {
        </div>
      </div>
    `;
  }

  generarHtmlCombinacion(numeros, analisis) {
    const promedios = this.calcularPromedios(analisis);
    
    return `
      <div class="bg-white bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-50 shadow-xl">
        <h3 class="text-2xl font-bold mb-4 text-center text-gray-800">🎯 Combinación</h3>
        <div class="text-center mb-4">
          <div class="text-3xl font-bold text-gray-800">${numeros.join(' - ')}</div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-4">
            <h4 class="font-bold text-blue-800 mb-2">🔍 MELATE</h4>
            <p class="text-lg font-bold text-blue-900">${promedios.melate.toFixed(1)}%</p>
          </div>
          <div class="bg-purple-500 bg-opacity-20 border border-purple-400 rounded-lg p-4">
            <h4 class="font-bold text-purple-800 mb-2">🔍 REVANCHA</h4>
            <p class="text-lg font-bold text-purple-900">${promedios.revancha.toFixed(1)}%</p>
          </div>
          <div class="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-4">
            <h4 class="font-bold text-green-800 mb-2">🔍 REVANCHITA</h4>
            <p class="text-lg font-bold text-green-900">${promedios.revanchita.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    `;
  }

  calcularPromedios(analisis) {
    const melate = analisis.reduce((sum, item) => sum + item.porSorteo.melate.porcentaje, 0) / analisis.length;
    const revancha = analisis.reduce((sum, item) => sum + item.porSorteo.revancha.porcentaje, 0) / analisis.length;
    const revanchita = analisis.reduce((sum, item) => sum + item.porSorteo.revanchita.porcentaje, 0) / analisis.length;
    
    return { melate, revancha, revanchita };
  }

  toggleAcordeon(trigger) {
    console.log('🔄 Toggle acordeón:', trigger.id);
    
    const contentId = trigger.id.replace('trigger-', 'content-');
    const content = document.getElementById(contentId);
    const icon = trigger.querySelector('svg');
    
    if (!content) {
      console.error('❌ Content no encontrado:', contentId);
      return;
    }
    
    const isHidden = content.classList.contains('hidden');
    
    // Cerrar todas las secciones
    document.querySelectorAll('[id^="content-"]').forEach(c => {
      c.classList.add('hidden');
    });
    
    // Resetear iconos
    document.querySelectorAll('[id^="trigger-"] svg').forEach(i => {
      i.style.transform = 'rotate(0deg)';
    });
    
    // Abrir la sección clickeada si estaba cerrada
    if (isHidden) {
      content.classList.remove('hidden');
      if (icon) icon.style.transform = 'rotate(180deg)';
    }
  }

  mostrarError(container, mensaje) {
    container.innerHTML = `
      <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
        <p class="text-red-700 font-semibold">⚠️ ${mensaje}</p>
      </div>
    `;
  }
}

// INICIALIZACIÓN FORZADA AL FINAL DEL ARCHIVO
console.log('🔧 Cargando UIManagerFixed...');

const initFixed = () => {
  console.log('🚀 Inicializando UIManagerFixed');
  const manager = new UIManagerFixed();
  manager.inicializar();
  
  // Hacer disponible globalmente para debug
  window.uiManager = manager;
};

// Múltiples formas de asegurar inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFixed);
} else {
  setTimeout(initFixed, 100);
}

// Fallback adicional
setTimeout(() => {
  if (!window.uiManager) {
    console.log('🔄 Fallback: Inicializando UIManagerFixed');
    initFixed();
  }
}, 1000);
