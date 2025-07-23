/**
 * YA ME VI - Test Simple para botones
 * Versión ultra-simplificada para probar que los botones funcionen
 */

class TestManager {
  constructor() {
    console.log('🚀 TestManager inicializado');
    this.configurarEventos();
  }

  configurarEventos() {
    console.log('🔧 Configurando eventos de prueba...');
    
    // UN SOLO EVENT LISTENER PARA TODA LA PÁGINA
    document.addEventListener('click', (e) => {
      const id = e.target.id;
      const tag = e.target.tagName;
      const className = e.target.className;
      
      console.log(`🖱️ CLICK DETECTADO: ID="${id}" TAG="${tag}"`);
      
      // Botón evaluar número
      if (id === 'evaluar-numero-btn') {
        console.log('🎯 EJECUTANDO: Test número individual');
        e.preventDefault();
        e.stopPropagation();
        this.testNumeroIndividual();
        return;
      }
      
      // Botón evaluar combinación
      if (id === 'evaluar-combinacion-btn') {
        console.log('🎯 EJECUTANDO: Test combinación');
        e.preventDefault();
        e.stopPropagation();
        this.testCombinacion();
        return;
      }
      
      // Triggers del acordeón
      if (id && id.startsWith('trigger-')) {
        console.log(`🎯 ACORDEÓN: ${id}`);
        e.preventDefault();
        e.stopPropagation();
        this.toggleAcordeon(e.target);
        return;
      }
    });
    
    console.log('✅ Eventos configurados correctamente');
  }

  testNumeroIndividual() {
    console.log('🔍 Test número individual ejecutándose...');
    
    const input = document.getElementById('numero-individual');
    const resultado = document.getElementById('resultado-numero');
    
    if (!input) {
      console.error('❌ Input numero-individual no encontrado');
      alert('❌ ERROR: Input no encontrado');
      return;
    }
    
    if (!resultado) {
      console.error('❌ Container resultado-numero no encontrado');
      alert('❌ ERROR: Container resultado no encontrado');
      return;
    }
    
    const numero = parseInt(input.value);
    console.log(`📊 Número ingresado: "${input.value}" → ${numero}`);
    
    if (isNaN(numero) || numero < 1 || numero > 56) {
      console.log('❌ Número inválido');
      resultado.innerHTML = `
        <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
          <p class="text-red-700 font-semibold">⚠️ Ingresa un número válido entre 1 y 56</p>
        </div>
      `;
      return;
    }
    
    // Mostrar resultado de prueba
    resultado.innerHTML = `
      <div class="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-6">
        <h3 class="text-lg font-bold text-green-800 mb-4">✅ ¡BOTÓN FUNCIONANDO!</h3>
        <p class="text-green-700">Número analizado: <strong>${numero}</strong></p>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="bg-blue-100 p-3 rounded">
            <h4 class="font-bold text-blue-800">🔍 MELATE</h4>
            <p class="text-blue-700">Test: ${(Math.random() * 20 + 5).toFixed(1)}%</p>
          </div>
          <div class="bg-purple-100 p-3 rounded">
            <h4 class="font-bold text-purple-800">🔍 REVANCHA</h4>
            <p class="text-purple-700">Test: ${(Math.random() * 20 + 5).toFixed(1)}%</p>
          </div>
          <div class="bg-green-100 p-3 rounded">
            <h4 class="font-bold text-green-800">🔍 REVANCHITA</h4>
            <p class="text-green-700">Test: ${(Math.random() * 20 + 5).toFixed(1)}%</p>
          </div>
        </div>
        <p class="text-xs text-green-600 mt-2">* Datos de prueba - El botón funciona correctamente</p>
      </div>
    `;
    
    console.log('✅ Test número individual completado');
  }

  testCombinacion() {
    console.log('🎯 Test combinación ejecutándose...');
    
    const inputs = document.querySelectorAll('.combo-input');
    const resultado = document.getElementById('resultado-combinacion');
    
    if (!resultado) {
      console.error('❌ Container resultado-combinacion no encontrado');
      alert('❌ ERROR: Container resultado no encontrado');
      return;
    }
    
    console.log(`📋 Inputs encontrados: ${inputs.length}`);
    
    const numeros = Array.from(inputs)
      .map(input => parseInt(input.value))
      .filter(num => !isNaN(num));
    
    console.log(`🔢 Números extraídos: ${numeros.join(', ')} (Total: ${numeros.length})`);
    
    // Validaciones
    if (numeros.length !== 6) {
      console.log('❌ No hay 6 números completos');
      resultado.innerHTML = `
        <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
          <p class="text-red-700 font-semibold">⚠️ Completa los 6 números (tienes ${numeros.length})</p>
        </div>
      `;
      return;
    }
    
    const sinDuplicados = new Set(numeros);
    if (sinDuplicados.size !== 6) {
      console.log('❌ Números duplicados encontrados');
      resultado.innerHTML = `
        <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
          <p class="text-red-700 font-semibold">⚠️ No se permiten números duplicados</p>
        </div>
      `;
      return;
    }
    
    if (numeros.some(n => n < 1 || n > 56)) {
      console.log('❌ Números fuera de rango');
      resultado.innerHTML = `
        <div class="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
          <p class="text-red-700 font-semibold">⚠️ Los números deben estar entre 1 y 56</p>
        </div>
      `;
      return;
    }
    
    // Mostrar resultado de prueba
    resultado.innerHTML = `
      <div class="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-6">
        <h3 class="text-lg font-bold text-green-800 mb-4">✅ ¡BOTÓN FUNCIONANDO!</h3>
        <div class="text-center mb-4">
          <p class="text-green-700">Combinación analizada:</p>
          <div class="text-2xl font-bold text-green-800">${numeros.join(' - ')}</div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-100 p-4 rounded">
            <h4 class="font-bold text-blue-800">🔍 MELATE</h4>
            <p class="text-lg font-bold text-blue-900">${(Math.random() * 15 + 8).toFixed(1)}%</p>
          </div>
          <div class="bg-purple-100 p-4 rounded">
            <h4 class="font-bold text-purple-800">🔍 REVANCHA</h4>
            <p class="text-lg font-bold text-purple-900">${(Math.random() * 15 + 8).toFixed(1)}%</p>
          </div>
          <div class="bg-green-100 p-4 rounded">
            <h4 class="font-bold text-green-800">🔍 REVANCHITA</h4>
            <p class="text-lg font-bold text-green-900">${(Math.random() * 15 + 8).toFixed(1)}%</p>
          </div>
        </div>
        <p class="text-xs text-green-600 mt-4 text-center">* Datos de prueba - El botón funciona correctamente</p>
      </div>
    `;
    
    console.log('✅ Test combinación completado');
  }

  toggleAcordeon(trigger) {
    console.log(`🔄 Toggle acordeón: ${trigger.id}`);
    
    const contentId = trigger.id.replace('trigger-', 'content-');
    const content = document.getElementById(contentId);
    const icon = trigger.querySelector('svg');
    
    if (!content) {
      console.error(`❌ Content no encontrado: ${contentId}`);
      return;
    }
    
    const isHidden = content.classList.contains('hidden');
    
    // Cerrar todas las secciones
    document.querySelectorAll('[id^="content-"]').forEach(c => {
      c.classList.add('hidden');
    });
    
    // Resetear iconos
    document.querySelectorAll('[id^="trigger-"] svg').forEach(i => {
      if (i) i.style.transform = 'rotate(0deg)';
    });
    
    // Abrir la sección clickeada si estaba cerrada
    if (isHidden) {
      content.classList.remove('hidden');
      if (icon) icon.style.transform = 'rotate(180deg)';
      console.log(`✅ Sección ${contentId} abierta`);
    } else {
      console.log(`✅ Sección ${contentId} cerrada`);
    }
  }
}

// INICIALIZACIÓN ROBUSTA
console.log('🔧 Cargando TestManager...');

const initTest = () => {
  try {
    console.log('🚀 Inicializando TestManager');
    const manager = new TestManager();
    window.testManager = manager;
    console.log('✅ TestManager inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar TestManager:', error);
  }
};

// Múltiples puntos de inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTest);
} else {
  initTest();
}

// Fallback adicional
setTimeout(() => {
  if (!window.testManager) {
    console.log('🔄 Fallback: Reintentando inicialización...');
    initTest();
  }
}, 500);
