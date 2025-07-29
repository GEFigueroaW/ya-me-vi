/**
 * YA ME VI - Evaluadores directos sin módulos ES
 * Para resolver problemas con las funciones de evaluación en combinacion.html
 */

// Función para evaluar un número individual
function evaluarNumeroDirecto(numero) {
  console.log(`🔍 Evaluación directa del número: ${numero}`);
  
  const resultadoDiv = document.getElementById('resultado-numero');
  if (!resultadoDiv) return;
  
  // Mostrar indicador de carga
  resultadoDiv.innerHTML = '<div class="text-center py-4"><div class="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div><div class="mt-2 text-gray-700">Analizando número...</div></div>';
  
  // Intentar usar la función global si está disponible
  setTimeout(() => {
    try {
      if (window.combinacionLoaded && typeof window.evaluarNumeroIndividual === 'function') {
        window.evaluarNumeroIndividual(numero);
      } else {
        console.error('Función evaluarNumeroIndividual no disponible. Usando fallback local.');
        resultadoDiv.innerHTML = `
          <div class="bg-white bg-opacity-80 rounded-xl p-6 shadow-lg">
            <h3 class="text-xl font-bold text-center mb-4 text-gray-800">
              🎲 Análisis del Número ${numero}
            </h3>
            <p class="text-center text-gray-700">
              Resultados provisionales mientras se carga el módulo completo.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center p-4 bg-blue-100 rounded-lg border">
                <div class="text-2xl mb-2">🎲</div>
                <div class="font-bold text-gray-800 capitalize">Melate</div>
                <div class="text-2xl font-bold text-blue-700 my-2">Cargando...</div>
              </div>
              <div class="text-center p-4 bg-purple-100 rounded-lg border">
                <div class="text-2xl mb-2">🍀</div>
                <div class="font-bold text-gray-800 capitalize">Revancha</div>
                <div class="text-2xl font-bold text-purple-700 my-2">Cargando...</div>
              </div>
              <div class="text-center p-4 bg-green-100 rounded-lg border">
                <div class="text-2xl mb-2">🌈</div>
                <div class="font-bold text-gray-800 capitalize">Revanchita</div>
                <div class="text-2xl font-bold text-green-700 my-2">Cargando...</div>
              </div>
            </div>
            <div class="text-center mt-4">
              <button onclick="window.location.reload()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Recargar para ver resultados completos
              </button>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error al evaluar número:', error);
      resultadoDiv.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <div class="font-bold mb-2">⚠️ Error</div>
          <p>Ocurrió un error al procesar tu número. Por favor intenta de nuevo.</p>
          <div class="text-xs text-red-700 mt-2">${error.message}</div>
        </div>
      `;
    }
  }, 300);
}

// Función para evaluar una combinación
function evaluarCombinacionDirecta(numeros) {
  console.log(`🔍 Evaluación directa de combinación: ${numeros.join(', ')}`);
  
  const resultadoDiv = document.getElementById('resultado-combinacion');
  if (!resultadoDiv) return;
  
  // Mostrar indicador de carga
  resultadoDiv.innerHTML = '<div class="text-center py-4"><div class="animate-spin inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div><div class="mt-2 text-gray-700">Analizando combinación...</div></div>';
  
  // Intentar usar la función global si está disponible
  setTimeout(() => {
    try {
      if (window.combinacionLoaded && typeof window.evaluarCombinacion === 'function') {
        window.evaluarCombinacion(numeros);
      } else {
        console.error('Función evaluarCombinacion no disponible. Usando fallback local.');
        resultadoDiv.innerHTML = `
          <div class="bg-white bg-opacity-90 rounded-xl p-6 shadow-lg">
            <h3 class="text-xl font-bold text-center mb-6 text-gray-800">
              🎯 Análisis de tu Combinación
            </h3>
            <p class="text-center text-gray-700 mb-4">
              Resultados provisionales mientras se carga el módulo completo.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="text-center font-bold text-blue-800 mb-4">🎲 Melate</h4>
                <div class="grid grid-cols-2 gap-2">
                  ${generarPlaceholders(numeros)}
                </div>
              </div>
              <div class="bg-purple-50 rounded-lg p-4">
                <h4 class="text-center font-bold text-purple-800 mb-4">🍀 Revancha</h4>
                <div class="grid grid-cols-2 gap-2">
                  ${generarPlaceholders(numeros)}
                </div>
              </div>
              <div class="bg-green-50 rounded-lg p-4">
                <h4 class="text-center font-bold text-green-800 mb-4">🌈 Revanchita</h4>
                <div class="grid grid-cols-2 gap-2">
                  ${generarPlaceholders(numeros)}
                </div>
              </div>
            </div>
            <div class="text-center mt-4">
              <button onclick="window.location.reload()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                Recargar para ver resultados completos
              </button>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error al evaluar combinación:', error);
      resultadoDiv.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <div class="font-bold mb-2">⚠️ Error</div>
          <p>Ocurrió un error al procesar tu combinación. Por favor intenta de nuevo.</p>
          <div class="text-xs text-red-700 mt-2">${error.message}</div>
        </div>
      `;
    }
  }, 300);
}

// Función auxiliar para generar placeholders
function generarPlaceholders(numeros) {
  let html = '';
  for (let i = 0; i < numeros.length; i++) {
    html += `
      <div class="bg-white bg-opacity-20 rounded-lg p-3 border">
        <div class="flex items-center justify-between">
          <div class="text-xl font-bold text-gray-800">${numeros[i]}</div>
          <div class="text-sm">⏳</div>
        </div>
        <div class="text-center mt-2">
          <div class="text-xs text-yellow-800 font-semibold">🎯 Índice de éxito</div>
          <div class="text-lg font-bold text-gray-900">Cargando...</div>
        </div>
      </div>
    `;
  }
  return html;
}

// Función para limpiar campos cuando se cierra un acordeón
function configurarLimpiezaCampos() {
  const triggers = [
    document.getElementById('trigger-numero-individual'),
    document.getElementById('trigger-combinacion')
  ];
  
  const contents = [
    document.getElementById('content-numero-individual'),
    document.getElementById('content-combinacion')
  ];
  
  const inputs = [
    [document.getElementById('numero-individual')],
    [...document.querySelectorAll('.combo-input')]
  ];
  
  const resultados = [
    document.getElementById('resultado-numero'),
    document.getElementById('resultado-combinacion')
  ];
  
  // Configurar limpieza para cada acordeón
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i] && contents[i]) {
      triggers[i].addEventListener('click', function() {
        const isHidden = contents[i].classList.contains('hidden');
        if (!isHidden) { // Si se está cerrando
          setTimeout(() => {
            // Limpiar solo si está cerrado
            if (contents[i].classList.contains('hidden')) {
              inputs[i].forEach(input => {
                if (input) input.value = '';
              });
              if (resultados[i]) resultados[i].innerHTML = '';
            }
          }, 300);
        }
      });
    }
  }
  
  console.log('✅ Limpieza de campos configurada');
}

// Ejecutar cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando evaluadores directos...');
  
  // Configurar limpieza de campos
  configurarLimpiezaCampos();
  
  // Configurar botones de evaluación
  const btnEvaluarNumero = document.getElementById('evaluar-numero-btn');
  const inputNumero = document.getElementById('numero-individual');
  
  if (btnEvaluarNumero && inputNumero) {
    btnEvaluarNumero.addEventListener('click', function() {
      const numero = parseInt(inputNumero.value);
      if (numero >= 1 && numero <= 56) {
        evaluarNumeroDirecto(numero);
      } else {
        alert('⚠️ Por favor ingresa un número entre 1 y 56');
      }
    });
  }
  
  const btnEvaluarCombinacion = document.getElementById('evaluar-combinacion-btn');
  const inputsCombinacion = document.querySelectorAll('.combo-input');
  
  if (btnEvaluarCombinacion && inputsCombinacion.length > 0) {
    btnEvaluarCombinacion.addEventListener('click', function() {
      const numeros = [];
      let valido = true;
      
      inputsCombinacion.forEach(input => {
        const num = parseInt(input.value);
        if (isNaN(num) || num < 1 || num > 56) {
          valido = false;
        } else {
          numeros.push(num);
        }
      });
      
      if (valido && numeros.length === 6) {
        // Verificar duplicados
        const numerosUnicos = [...new Set(numeros)];
        if (numerosUnicos.length !== 6) {
          alert('⚠️ No puedes repetir números en tu combinación');
          return;
        }
        
        evaluarCombinacionDirecta(numeros);
      } else {
        alert('⚠️ Por favor ingresa 6 números válidos entre 1 y 56');
      }
    });
  }
  
  console.log('✅ Evaluadores directos inicializados');
});
