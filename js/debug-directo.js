// === DEBUG DIRECTO EN CONSOLA ===
console.log('🔧 ARCHIVO DEBUG CARGÁNDOSE...');

// Función de debug global
function debugCombinacion() {
  console.log('🔍 INICIANDO DEBUG COMPLETO...');
  
  // 1. Verificar que el DOM esté listo
  console.log('📋 Estado del documento:', document.readyState);
  console.log('📋 Body existe:', !!document.body);
  
  // 2. Verificar elementos críticos
  const elementos = {
    'numero-individual': document.getElementById('numero-individual'),
    'resultado-numero': document.getElementById('resultado-numero'),
    'evaluar-numero-btn': document.getElementById('evaluar-numero-btn'),
    'resultado-combinacion': document.getElementById('resultado-combinacion'),
    'evaluar-combinacion-btn': document.getElementById('evaluar-combinacion-btn')
  };
  
  console.log('🔍 ELEMENTOS DOM:');
  for (const [id, elemento] of Object.entries(elementos)) {
    console.log(`  - ${id}:`, elemento ? '✅ ENCONTRADO' : '❌ NO ENCONTRADO');
  }
  
  // 3. Verificar inputs de combinación
  const combInputs = document.querySelectorAll('.combo-input');
  console.log(`🔢 Inputs de combinación encontrados: ${combInputs.length}`);
  
  // 4. Agregar evento de prueba DIRECTO
  const btnEvaluarNumero = document.getElementById('evaluar-numero-btn');
  const btnEvaluarCombo = document.getElementById('evaluar-combinacion-btn');
  
  if (btnEvaluarNumero) {
    btnEvaluarNumero.onclick = function(e) {
      console.log('🎯 CLICK DIRECTO EN BOTÓN NÚMERO!');
      e.preventDefault();
      pruebaNumero();
    };
    console.log('✅ Event handler DIRECTO agregado al botón número');
  } else {
    console.error('❌ No se pudo encontrar btnEvaluarNumero');
  }
  
  if (btnEvaluarCombo) {
    btnEvaluarCombo.onclick = function(e) {
      console.log('🎯 CLICK DIRECTO EN BOTÓN COMBINACIÓN!');
      e.preventDefault();
      pruebaCombinacion();
    };
    console.log('✅ Event handler DIRECTO agregado al botón combinación');
  } else {
    console.error('❌ No se pudo encontrar btnEvaluarCombo');
  }
}

// Función de prueba para número individual
function pruebaNumero() {
  console.log('🔍 Ejecutando prueba número...');
  
  const input = document.getElementById('numero-individual');
  const resultado = document.getElementById('resultado-numero');
  
  if (!input || !resultado) {
    console.error('❌ Elementos no encontrados');
    return;
  }
  
  const numero = parseInt(input.value);
  console.log(`📊 Número: ${numero}`);
  
  if (isNaN(numero) || numero < 1 || numero > 56) {
    resultado.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #f87171; border-radius: 8px; padding: 16px; margin-top: 10px;">
        <p style="color: #dc2626; font-weight: bold;">⚠️ Número inválido. Ingresa entre 1-56</p>
      </div>
    `;
    return;
  }
  
  resultado.innerHTML = `
    <div style="background: rgba(34, 197, 94, 0.2); border: 1px solid #4ade80; border-radius: 8px; padding: 16px; margin-top: 10px;">
      <h3 style="color: #16a34a; font-weight: bold; margin-bottom: 10px;">✅ ¡FUNCIONÓ!</h3>
      <p style="color: #166534;">Número analizado: <strong>${numero}</strong></p>
      <p style="color: #166534; font-size: 12px; margin-top: 5px;">* Datos de prueba - El botón SÍ funciona</p>
    </div>
  `;
  
  console.log('✅ Prueba número completada');
}

// Función de prueba para combinación
function pruebaCombinacion() {
  console.log('🎯 Ejecutando prueba combinación...');
  
  const inputs = document.querySelectorAll('.combo-input');
  const resultado = document.getElementById('resultado-combinacion');
  
  if (!resultado) {
    console.error('❌ Resultado container no encontrado');
    return;
  }
  
  const numeros = Array.from(inputs)
    .map(input => parseInt(input.value))
    .filter(num => !isNaN(num));
  
  console.log(`🔢 Números: ${numeros.join(', ')} (${numeros.length} de 6)`);
  
  if (numeros.length !== 6) {
    resultado.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #f87171; border-radius: 8px; padding: 16px; margin-top: 10px;">
        <p style="color: #dc2626; font-weight: bold;">⚠️ Faltan números. Tienes ${numeros.length} de 6</p>
      </div>
    `;
    return;
  }
  
  const sinDuplicados = new Set(numeros);
  if (sinDuplicados.size !== 6) {
    resultado.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #f87171; border-radius: 8px; padding: 16px; margin-top: 10px;">
        <p style="color: #dc2626; font-weight: bold;">⚠️ Números duplicados no permitidos</p>
      </div>
    `;
    return;
  }
  
  if (numeros.some(n => n < 1 || n > 56)) {
    resultado.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #f87171; border-radius: 8px; padding: 16px; margin-top: 10px;">
        <p style="color: #dc2626; font-weight: bold;">⚠️ Números deben estar entre 1-56</p>
      </div>
    `;
    return;
  }
  
  resultado.innerHTML = `
    <div style="background: rgba(34, 197, 94, 0.2); border: 1px solid #4ade80; border-radius: 8px; padding: 16px; margin-top: 10px;">
      <h3 style="color: #16a34a; font-weight: bold; margin-bottom: 10px;">✅ ¡FUNCIONÓ!</h3>
      <div style="text-align: center; margin-bottom: 10px;">
        <p style="color: #166534;">Combinación:</p>
        <div style="color: #16a34a; font-weight: bold; font-size: 18px;">${numeros.join(' - ')}</div>
      </div>
      <p style="color: #166534; font-size: 12px; text-align: center;">* Datos de prueba - El botón SÍ funciona</p>
    </div>
  `;
  
  console.log('✅ Prueba combinación completada');
}

// EJECUTAR DEBUG INMEDIATAMENTE
console.log('🚀 Ejecutando debug inmediato...');
debugCombinacion();

// EJECUTAR DEBUG DESPUÉS DE QUE EL DOM ESTÉ LISTO
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔄 DOM listo, ejecutando debug nuevamente...');
  setTimeout(debugCombinacion, 100);
});

// EJECUTAR DEBUG COMO FALLBACK
setTimeout(function() {
  console.log('🔄 Fallback timeout, ejecutando debug...');
  debugCombinacion();
}, 1000);

// HACER FUNCIONES DISPONIBLES GLOBALMENTE
window.debugCombinacion = debugCombinacion;
window.pruebaNumero = pruebaNumero;
window.pruebaCombinacion = pruebaCombinacion;

console.log('✅ Debug script cargado completamente');
console.log('💡 Puedes ejecutar manualmente: debugCombinacion(), pruebaNumero(), pruebaCombinacion()');
