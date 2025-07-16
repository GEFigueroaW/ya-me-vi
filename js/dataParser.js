// dataParser.js - Módulo principal para cargar y procesar datos de sorteos
// Versión limpia y funcional - Julio 2025

// Variables globales para rastrear el estado
let cajaActualmenteAbierta = null;

export async function cargarDatosHistoricos(modo = 'todos') {
  console.log('🚀 Cargando datos históricos, modo:', modo);
  
  if (modo === 'todos') {
    return await cargarTodosSorteos();
  } else {
    return await cargarSorteoIndividual(modo);
  }
}

async function cargarTodosSorteos() {
  console.log('📊 Cargando todos los sorteos...');
  
  const sorteos = ['melate', 'revancha', 'revanchita'];
  const datos = {};
  
  for (const sorteo of sorteos) {
    try {
      const datosIndividuales = await cargarSorteoIndividual(sorteo);
      datos[sorteo] = datosIndividuales;
    } catch (error) {
      console.error(`❌ Error cargando ${sorteo}:`, error);
      datos[sorteo] = { sorteos: [], numeros: [], ultimoSorteo: 'No disponible' };
    }
  }
  
  return datos;
}

async function cargarSorteoIndividual(sorteo) {
  const archivos = {
    melate: 'assets/Melate.csv',
    revancha: 'assets/Revancha.csv',
    revanchita: 'assets/Revanchita.csv'
  };
  
  const archivo = archivos[sorteo];
  if (!archivo) {
    throw new Error(`Sorteo no válido: ${sorteo}`);
  }
  
  console.log(`📁 Cargando ${archivo}...`);
  
  try {
    const response = await fetch(archivo);
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lineas = csvText.trim().split('\n');
    
    if (lineas.length < 2) {
      throw new Error('Archivo CSV vacío o sin datos');
    }
    
    const sorteos = [];
    const numeros = [];
    let ultimoSorteo = 'No disponible';
    
    // Calcular fecha límite (30 meses atrás desde hoy)
    const fechaActual = new Date();
    const fechaLimite = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 30, fechaActual.getDate());
    console.log(`📅 Filtrando sorteos desde: ${fechaLimite.toLocaleDateString()}`);
    
    // Procesar cada línea (saltar encabezado)
    for (let i = 1; i < lineas.length; i++) {
      const linea = lineas[i].trim();
      if (!linea) continue;
      
      const columnas = linea.split(',');
      
      // Detectar formato automáticamente
      let numerosLinea = [];
      let concurso = '';
      let fechaSorteo = null;
      
      if (columnas.length >= 11 && sorteo === 'melate') {
        // Formato: NPRODUCTO,CONCURSO,R1,R2,R3,R4,R5,R6,R7,BOLSA,FECHA
        concurso = columnas[1];
        
        // Verificar fecha - últimos 30 meses
        const fechaStr = columnas[10].trim();
        if (fechaStr) {
          const partesFecha = fechaStr.split('/');
          if (partesFecha.length === 3) {
            const dia = parseInt(partesFecha[0]);
            const mes = parseInt(partesFecha[1]) - 1; // Mes base 0
            const año = parseInt(partesFecha[2]);
            fechaSorteo = new Date(año, mes, dia);
            
            if (fechaSorteo < fechaLimite) {
              continue; // Saltar sorteos más antiguos de 30 meses
            }
          }
        }
        
        for (let j = 2; j <= 7; j++) {
          const num = parseInt(columnas[j]);
          if (!isNaN(num) && num >= 1 && num <= 56) {
            numerosLinea.push(num);
          }
        }
      } else if (columnas.length >= 10 && (sorteo === 'revancha' || sorteo === 'revanchita')) {
        // Formato: NPRODUCTO,CONCURSO,R1/F1,R2/F2,R3/F3,R4/F4,R5/F5,R6/F6,BOLSA,FECHA
        concurso = columnas[1];
        
        // Verificar fecha - últimos 30 meses
        const fechaStr = columnas[9].trim();
        if (fechaStr) {
          const partesFecha = fechaStr.split('/');
          if (partesFecha.length === 3) {
            const dia = parseInt(partesFecha[0]);
            const mes = parseInt(partesFecha[1]) - 1; // Mes base 0
            const año = parseInt(partesFecha[2]);
            fechaSorteo = new Date(año, mes, dia);
            
            if (fechaSorteo < fechaLimite) {
              continue; // Saltar sorteos más antiguos de 30 meses
            }
          }
        }
        
        for (let j = 2; j <= 7; j++) {
          const num = parseInt(columnas[j]);
          if (!isNaN(num) && num >= 1 && num <= 56) {
            numerosLinea.push(num);
          }
        }
      }
      
      if (numerosLinea.length === 6) {
        sorteos.push({
          concurso: concurso,
          numeros: numerosLinea,
          fecha: columnas[columnas.length - 1] || ''
        });
        numeros.push(...numerosLinea);
        
        if (i === 1) {
          ultimoSorteo = concurso;
        }
      }
    }
    
    console.log(`✅ ${sorteo}: ${sorteos.length} sorteos cargados (últimos 30 meses) - ${numeros.length} números`);
    
    return {
      sorteos: sorteos,
      numeros: numeros,
      ultimoSorteo: ultimoSorteo
    };
    
  } catch (error) {
    console.error(`❌ Error cargando ${sorteo}:`, error);
    throw error;
  }
}

export function graficarEstadisticas(datos) {
  console.log('📊 Generando estadísticas unificadas...');
  
  const container = document.getElementById('charts-container');
  if (!container) {
    console.error('❌ Contenedor charts-container no encontrado');
    return;
  }
  
  container.innerHTML = '';
  
  // Crear contenedor principal con ID específico
  const contenedorPrincipal = document.createElement('div');
  contenedorPrincipal.id = 'contenedor-principal';
  contenedorPrincipal.className = 'contenedor-principal-inicial'; // Clase inicial
  
  // Crear contenedor de cajas con ID específico
  const contenedorCajas = document.createElement('div');
  contenedorCajas.id = 'contenedor-cajas';
  contenedorCajas.className = 'contenedor-cajas-inicial'; // Clase inicial
  
  // Crear contenedor de contenido expandido
  const contenedorContenido = document.createElement('div');
  contenedorContenido.id = 'contenedor-contenido';
  contenedorContenido.className = 'hidden'; // Oculto inicialmente
  // NO establecer opacity y transform aquí - se hace en CSS
  
  // Función para calcular el ancho dinámico basado en el título más largo
  function calcularAnchoDinamico() {
    const titulos = ['Frecuencias', 'Suma de números', 'Pares e impares', 'Década y terminación'];
    
    // Crear elemento temporal para medir el ancho real del texto
    const elementoTemporal = document.createElement('div');
    elementoTemporal.style.position = 'absolute';
    elementoTemporal.style.visibility = 'hidden';
    elementoTemporal.style.whiteSpace = 'nowrap';
    elementoTemporal.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    elementoTemporal.style.fontSize = '1.125rem';
    elementoTemporal.style.fontWeight = '600';
    elementoTemporal.style.letterSpacing = '-0.02em';
    document.body.appendChild(elementoTemporal);
    
    let maxWidth = 0;
    titulos.forEach(titulo => {
      elementoTemporal.textContent = titulo;
      const anchoTexto = elementoTemporal.offsetWidth;
      maxWidth = Math.max(maxWidth, anchoTexto);
    });
    
    document.body.removeChild(elementoTemporal);
    
    // Agregar padding para emoji y espaciado interno
    const paddingEmoji = 50; // Espacio para emoji (2rem)
    const paddingInterno = 64; // Padding interno (2rem en cada lado)
    const margenSeguridad = 20; // Margen de seguridad
    
    const anchoOptimo = maxWidth + paddingEmoji + paddingInterno + margenSeguridad;
    return Math.max(anchoOptimo, 320); // Mínimo 320px
  }
  
  // Aplicar ancho dinámico inmediatamente
  const anchoOptimo = calcularAnchoDinamico();
  contenedorCajas.style.setProperty('--ancho-caja-dinamico', `${anchoOptimo}px`);
  
  console.log(`📐 Ancho dinámico calculado: ${anchoOptimo}px`);
  
  // Caja 1: Frecuencias
  const cajaFrecuencias = crearCajaFrecuencias(datos);
  contenedorCajas.appendChild(cajaFrecuencias);
  
  // Añadir contenedores al DOM
  contenedorPrincipal.appendChild(contenedorCajas);
  contenedorPrincipal.appendChild(contenedorContenido);
  container.appendChild(contenedorPrincipal);
  
  const loadingDiv = document.querySelector('.animate-spin');
  if (loadingDiv && loadingDiv.parentElement) {
    loadingDiv.parentElement.style.display = 'none';
  }
}

function crearCajaFrecuencias(datos) {
  const tarjetaUnificada = document.createElement('div');
  tarjetaUnificada.className = 'caja-interactiva';
  tarjetaUnificada.id = 'caja-frecuencias';
  
  const botonTitulo = document.createElement('button');
  botonTitulo.onclick = () => manejarClicCaja('frecuencias', datos);
  botonTitulo.innerHTML = `
    <div class="caja-content">
      <div class="caja-emoji">📊</div>
      <h3 class="caja-titulo">Frecuencias</h3>
    </div>
  `;
  
  // Contenido expandible móvil
  const contenidoExpandible = document.createElement('div');
  contenidoExpandible.id = 'frecuencias-content-mobile';
  contenidoExpandible.className = 'hidden lg:hidden px-6 pb-6';
  
  tarjetaUnificada.appendChild(botonTitulo);
  tarjetaUnificada.appendChild(contenidoExpandible);
  
  return tarjetaUnificada;
}

// Hacer funciones globales para que estén disponibles desde el HTML
window.expandirCaja = expandirCaja;
window.manejarClicCaja = manejarClicCaja;
window.cerrarTodasLasCajas = cerrarTodasLasCajas;

// Función para manejar el resize de la ventana
function manejarResize() {
  const contenedorPrincipal = document.getElementById('contenedor-principal');
  const contenedorCajas = document.getElementById('contenedor-cajas');
  const contenedorContenido = document.getElementById('contenedor-contenido');
  
  if (!contenedorPrincipal || !contenedorCajas || !contenedorContenido) return;
  
  // Verificar si hay alguna caja abierta
  const cajaAbierta = document.querySelector('.caja-abierta');
  const hayContenidoVisible = !contenedorContenido.classList.contains('hidden');
  
  if (window.innerWidth < 1024) {
    // En móvil: desactivar el layout expandido
    contenedorPrincipal.classList.remove('expanded');
    
    // Si hay contenido visible, ocultarlo en desktop y mostrarlo en móvil
    if (hayContenidoVisible && cajaAbierta) {
      const tipo = cajaAbierta.id.replace('caja-', '');
      const contenidoMobile = document.getElementById(`${tipo}-content-mobile`);
      if (contenidoMobile) {
        contenidoMobile.innerHTML = contenedorContenido.innerHTML;
        contenidoMobile.classList.remove('hidden');
      }
      contenedorContenido.classList.add('hidden');
    }
  } else {
    // En desktop: si hay una caja abierta, activar layout expandido
    if (cajaAbierta) {
      contenedorPrincipal.classList.add('expanded');
      contenedorContenido.classList.remove('hidden');
      
      // Ocultar contenido móvil si existe
      const tipo = cajaAbierta.id.replace('caja-', '');
      const contenidoMobile = document.getElementById(`${tipo}-content-mobile`);
      if (contenidoMobile) {
        if (contenidoMobile.innerHTML.trim() && contenedorContenido.innerHTML.trim() === '') {
          contenedorContenido.innerHTML = contenidoMobile.innerHTML;
        }
        contenidoMobile.classList.add('hidden');
      }
    }
  }
}

// Agregar listener para resize
window.addEventListener('resize', manejarResize);

// Función para expandir una caja con el nuevo sistema de dos columnas
export function expandirCaja(tipo, datos) {
  console.log(`📦 [DEBUG] expandirCaja llamada para: ${tipo}`);
  
  const contenedorCajas = document.getElementById('contenedor-cajas');
  const contenedorContenido = document.getElementById('contenedor-contenido');
  const contenedorPrincipal = document.getElementById('contenedor-principal');
  
  // Verificar si la caja ya está abierta
  const cajaActual = document.getElementById(`caja-${tipo}`);
  
  if (!contenedorCajas || !contenedorContenido || !contenedorPrincipal) {
    console.error('❌ Contenedores no encontrados');
    return;
  }
  
  // Usar manejarClicCaja para manejar toda la lógica
  manejarClicCaja(tipo, datos);
}

// Función separada para abrir una caja (sin lógica de cierre)
function abrirCaja(tipo, datos) {
  console.log(`🔓 [DEBUG] Iniciando abrirCaja para tipo: ${tipo}`);
  
  const contenedorCajas = document.getElementById('contenedor-cajas');
  const contenedorContenido = document.getElementById('contenedor-contenido');
  const contenedorPrincipal = document.getElementById('contenedor-principal');
  const cajaActual = document.getElementById(`caja-${tipo}`);
  
  if (!contenedorCajas || !contenedorContenido || !contenedorPrincipal) {
    console.error('❌ Contenedores no encontrados');
    return;
  }
  
  if (!cajaActual) {
    console.error(`❌ Caja ${tipo} no encontrada`);
    return;
  }
  
  console.log(`🔓 Abriendo caja ${tipo}`);
  
  // **CLAVE**: Activar el layout de dos columnas
  contenedorPrincipal.classList.add('expanded');
  
  // Mostrar contenedor de contenido sin animación inicial
  contenedorContenido.classList.remove('hidden');
  contenedorContenido.style.opacity = '1';
  contenedorContenido.style.transform = 'translateX(0)';
  
  // Marcar la caja como abierta
  cajaActual.classList.add('caja-abierta');
  
  // Generar contenido según el tipo
  let contenidoHTML = '';
  
  switch (tipo) {
    case 'frecuencias':
      contenidoHTML = generarContenidoFrecuencias(datos);
      break;
    case 'suma':
      contenidoHTML = generarContenidoSuma(datos.sumAnalisis || {});
      break;
    case 'pares':
      contenidoHTML = generarContenidoPares(datos.paresAnalisis || {});
      break;
    case 'decada':
      contenidoHTML = generarContenidoDecada(datos.decadaAnalisis || {});
      break;
    default:
      contenidoHTML = '<p class="text-white">Contenido no disponible</p>';
  }
  
  // Insertar contenido SIN botón de cerrar - todo el título es clickeable
  contenedorContenido.innerHTML = `
    <div class="caja-expandida">
      <div class="cursor-pointer hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-all duration-200 mb-4" 
           onclick="window.cerrarTodasLasCajas()" 
           title="Hacer clic para cerrar">
        <h3 class="text-xl font-bold text-white text-center">
          ${tipo === 'frecuencias' ? '📊 Frecuencias' : 
            tipo === 'suma' ? '🔢 Suma de números' : 
            tipo === 'pares' ? '⚖️ Pares e impares' : 
            tipo === 'decada' ? '🎯 Década y terminación' : 'Análisis'}
        </h3>
      </div>
      ${contenidoHTML}
    </div>
  `;
  
  // Actualizar variable global
  cajaActualmenteAbierta = tipo;
  
  // El contenido ya está visible, no necesitamos setTimeout
  console.log(`✅ Caja ${tipo} abierta correctamente`);
  
  // Scroll suave al contenido en móvil
  if (window.innerWidth < 1024) {
    setTimeout(() => {
      contenedorContenido.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 300);
  }
}

// Función para cerrar todas las cajas y volver al layout original
function cerrarTodasLasCajas() {
  const contenedorCajas = document.getElementById('contenedor-cajas');
  const contenedorContenido = document.getElementById('contenedor-contenido');
  const contenedorPrincipal = document.getElementById('contenedor-principal');
  
  if (!contenedorCajas || !contenedorContenido || !contenedorPrincipal) return;
  
  console.log('🔒 Cerrando todas las cajas');
  
  // **CLAVE**: Remover clase de expansión para volver al layout original
  contenedorPrincipal.classList.remove('expanded');
  
  // Animación de salida para el contenido
  contenedorContenido.style.opacity = '0';
  contenedorContenido.style.transform = 'translateX(20px)';
  
  // Esperar a que termine la animación antes de ocultar
  setTimeout(() => {
    contenedorContenido.classList.add('hidden');
    contenedorContenido.innerHTML = '';
    // Resetear estilos para próxima apertura
    contenedorContenido.style.opacity = '1';
    contenedorContenido.style.transform = 'translateX(0)';
  }, 300);
  
  // Remover clase de caja abierta de todas las cajas
  const todasLasCajas = document.querySelectorAll('[id^="caja-"]');
  todasLasCajas.forEach(caja => {
    caja.classList.remove('caja-abierta');
  });
  
  // Limpiar contenido móvil
  const contenidosMoviles = document.querySelectorAll('[id$="-content-mobile"]');
  contenidosMoviles.forEach(contenido => {
    contenido.classList.add('hidden');
    contenido.innerHTML = '';
  });
  
  // Limpiar variable global
  cajaActualmenteAbierta = null;
  
  console.log('✅ Todas las cajas cerradas, volviendo a layout horizontal');
  
  // Forzar recalcular el layout para asegurar que las cajas queden horizontales
  setTimeout(() => {
    const contenedorCajas = document.getElementById('contenedor-cajas');
    if (contenedorCajas) {
      // Trigger reflow para asegurar que el CSS se aplique correctamente
      contenedorCajas.style.display = 'flex';
      contenedorCajas.offsetHeight; // Forzar reflow
    }
  }, 350);
}

// Función para mostrar la caja abierta en el área de contenido
function moverCajaAbiertaAlContenido(tipo, datos) {
  const contenedorContenido = document.getElementById('contenedor-contenido');
  const cajaOriginal = document.getElementById(`caja-${tipo}`);
  
  if (!contenedorContenido || !cajaOriginal) return;
  
  // Crear una copia visual de la caja abierta para el área de contenido
  const cajaEnContenido = document.createElement('div');
  cajaEnContenido.className = 'mb-6 bg-white bg-opacity-50 rounded-xl backdrop-blur-sm border border-white border-opacity-30';
  cajaEnContenido.id = `caja-${tipo}-contenido`;
  
  // Obtener el emoji y título
  const emojis = {
    frecuencias: '📊',
    suma: '🔢',
    pares: '⚖️',
    decada: '🎯'
  };
  
  const titulos = {
    frecuencias: 'Frecuencias',
    suma: 'Suma de números',
    pares: 'Pares e impares',
    decada: 'Década y terminación'
  };
  
  const botonTitulo = document.createElement('button');
  botonTitulo.className = 'w-full p-4 text-left hover:bg-white hover:bg-opacity-10 transition-all duration-300';
  botonTitulo.onclick = () => manejarClicCaja(tipo, datos); // Al hacer clic, se cierra
  botonTitulo.innerHTML = `
    <div class="flex items-center justify-center gap-3">
      <div class="text-2xl">${emojis[tipo]}</div>
      <h3 class="text-lg font-bold text-white whitespace-nowrap">${titulos[tipo]}</h3>
    </div>
  `;
  
  cajaEnContenido.appendChild(botonTitulo);
  
  // Insertar la caja al inicio del contenido
  contenedorContenido.insertBefore(cajaEnContenido, contenedorContenido.firstChild);
}

// Función para generar contenido de frecuencias con últimos 30 meses
function generarContenidoFrecuencias(datos) {
  const sorteos = ['melate', 'revancha', 'revanchita'];
  let contenidoHTML = '<div class="space-y-8">';
  
  sorteos.forEach(sorteo => {
    const datosIndividuales = datos[sorteo];
    if (!datosIndividuales || !datosIndividuales.sorteos || datosIndividuales.sorteos.length === 0) {
      console.warn(`⚠️ No hay datos para ${sorteo}`);
      return;
    }
    
    // Usar todos los sorteos (ya filtrados por 30 meses en cargarSorteoIndividual)
    const sorteosFiltrados = datosIndividuales.sorteos;
    const numerosFiltrados = datosIndividuales.numeros;
    
    console.log(`📊 ${sorteo}: ${sorteosFiltrados.length} sorteos (últimos 30 meses), ${numerosFiltrados.length} números`);
    
    const frecuencias = calcularFrecuencias(numerosFiltrados);
    const frecuenciasArray = Object.entries(frecuencias).map(([num, freq]) => ({
      numero: parseInt(num),
      frecuencia: freq
    }));
    
    frecuenciasArray.sort((a, b) => b.frecuencia - a.frecuencia);
    
    const topFrecuentes = frecuenciasArray.slice(0, 10);
    const menosFrecuentes = frecuenciasArray.slice(-10).reverse();
    
    contenidoHTML += `
      <div class="space-y-6">
        <!-- Título del sorteo -->
        <div class="text-center">
          <h4 class="text-2xl font-bold text-white mb-4">🎲 ${sorteo.toUpperCase()}</h4>
        </div>
        
        <!-- Top 10 MÁS frecuentes -->
        <div>
          <h5 class="text-lg font-semibold text-orange-400 mb-4 text-center">🔥 Top 10 MÁS frecuentes</h5>
          <div class="grid grid-cols-5 gap-3">
            ${topFrecuentes.map((item, index) => `
              <div class="bg-white bg-opacity-75 rounded-xl p-4 text-center backdrop-blur-sm hover:bg-opacity-80 transition-all">
                <div class="text-red-600 text-2xl font-bold mb-1">${item.numero}</div>
                <div class="text-red-600 text-sm font-semibold">${item.frecuencia}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Top 10 MENOS frecuentes -->
        <div>
          <h5 class="text-lg font-semibold text-white mb-4 text-center">❄️ Top 10 MENOS frecuentes</h5>
          <div class="grid grid-cols-5 gap-3">
            ${menosFrecuentes.map((item, index) => `
              <div class="bg-white bg-opacity-75 rounded-xl p-4 text-center backdrop-blur-sm hover:bg-opacity-80 transition-all">
                <div class="text-blue-600 text-2xl font-bold mb-1">${item.numero}</div>
                <div class="text-blue-600 text-sm font-semibold">${item.frecuencia}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        ${sorteo !== 'revanchita' ? '<hr class="border-white border-opacity-20 my-8">' : ''}
      </div>
    `;
  });
  
  contenidoHTML += '</div>';
  return contenidoHTML;
}

function calcularFrecuencias(numeros) {
  const frecuencias = {};
  
  for (let i = 1; i <= 56; i++) {
    frecuencias[i] = 0;
  }
  
  numeros.forEach(num => {
    if (num >= 1 && num <= 56) {
      frecuencias[num]++;
    }
  });
  
  return frecuencias;
}

export function mostrarEstadisticasComparativas(datos) {
  console.log('📊 Mostrando estadísticas comparativas...');
  
  const container = document.getElementById('estadisticas-extra');
  if (!container) return;
  
  let totalSorteos = 0;
  let totalNumeros = 0;
  
  Object.values(datos).forEach(sorteo => {
    if (sorteo && sorteo.sorteos) {
      totalSorteos += sorteo.sorteos.length;
      totalNumeros += sorteo.numeros.length;
    }
  });
  
  container.innerHTML = '';
}

export function generarCombinacionesAleatorias(cantidad = 1) {
  console.log(`🎲 Generando ${cantidad} combinaciones aleatorias...`);
  
  const combinaciones = [];
  
  for (let i = 0; i < cantidad; i++) {
    const combinacion = [];
    const numerosUsados = new Set();
    
    while (combinacion.length < 6) {
      const numero = Math.floor(Math.random() * 56) + 1;
      if (!numerosUsados.has(numero)) {
        numerosUsados.add(numero);
        combinacion.push(numero);
      }
    }
    
    combinacion.sort((a, b) => a - b);
    combinaciones.push(combinacion);
  }
  
  return combinaciones;
}

console.log('✅ dataParser.js cargado correctamente');

// Función para generar predicción por frecuencia (usado por mlPredictor.js)
export function generarPrediccionPorFrecuencia(userId, datos) {
  const numeros = datos.numeros || [];
  const seed = hashCode(userId);
  
  if (numeros.length === 0) {
    return [1, 7, 14, 21, 28, 35];
  }
  
  const frecuencia = Array(56).fill(0);
  numeros.forEach(n => {
    if (n >= 1 && n <= 56) {
      frecuencia[n - 1]++;
    }
  });
  
  const ponderados = frecuencia.map((freq, i) => ({
    numero: i + 1,
    score: freq + ((seed % (i + 7)) / 100)
  }));
  
  return ponderados
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(n => n.numero)
    .sort((a, b) => a - b);
}

// Función auxiliar para hash
function hashCode(str) {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

// === NUEVAS FUNCIONES DE ANÁLISIS AVANZADO ===

// Análisis de Suma de Números
export function analizarSumaNumeros(datos) {
  console.log('🔢 Analizando suma de números...');
  
  const resultados = {};
  
  Object.entries(datos).forEach(([sorteo, datosIndividuales]) => {
    if (!datosIndividuales || !datosIndividuales.sorteos) return;
    
    const sumas = datosIndividuales.sorteos.map(sorteoData => {
      const suma = sorteoData.numeros.reduce((acc, num) => acc + num, 0);
      return suma;
    });
    
    // Agrupar por rangos de suma
    const rangos = {
      '50-99': 0,
      '100-149': 0,
      '150-199': 0,
      '200-249': 0,
      '250-299': 0,
      '300+': 0
    };
    
    sumas.forEach(suma => {
      if (suma < 100) rangos['50-99']++;
      else if (suma < 150) rangos['100-149']++;
      else if (suma < 200) rangos['150-199']++;
      else if (suma < 250) rangos['200-249']++;
      else if (suma < 300) rangos['250-299']++;
      else rangos['300+']++;
    });
    
    const sumaPromedio = sumas.reduce((acc, suma) => acc + suma, 0) / sumas.length;
    const rangoMasFrecuente = Object.entries(rangos).reduce((a, b) => rangos[a[0]] > rangos[b[0]] ? a : b);
    
    resultados[sorteo] = {
      sumaPromedio: sumaPromedio.toFixed(1),
      rangos: rangos,
      rangoMasFrecuente: rangoMasFrecuente,
      totalSorteos: sumas.length
    };
  });
  
  return resultados;
}

// Análisis de Pares e Impares
export function analizarParesImpares(datos) {
  console.log('⚖️ Analizando pares e impares...');
  
  const resultados = {};
  
  Object.entries(datos).forEach(([sorteo, datosIndividuales]) => {
    if (!datosIndividuales || !datosIndividuales.sorteos) return;
    
    const distribuciones = {
      '6p-0i': 0,
      '5p-1i': 0,
      '4p-2i': 0,
      '3p-3i': 0,
      '2p-4i': 0,
      '1p-5i': 0,
      '0p-6i': 0
    };
    
    datosIndividuales.sorteos.forEach(sorteoData => {
      const pares = sorteoData.numeros.filter(num => num % 2 === 0).length;
      const impares = 6 - pares;
      const clave = `${pares}p-${impares}i`;
      distribuciones[clave]++;
    });
    
    const distribucionMasFrecuente = Object.entries(distribuciones).reduce((a, b) => distribuciones[a[0]] > distribuciones[b[0]] ? a : b);
    
    resultados[sorteo] = {
      distribuciones: distribuciones,
      distribucionMasFrecuente: distribucionMasFrecuente,
      totalSorteos: datosIndividuales.sorteos.length
    };
  });
  
  return resultados;
}

// Análisis de Frecuencia por Década y Terminación
export function analizarDecadaTerminacion(datos) {
  console.log('🎯 Analizando década y terminación...');
  
  const resultados = {};
  
  Object.entries(datos).forEach(([sorteo, datosIndividuales]) => {
    if (!datosIndividuales || !datosIndividuales.numeros) return;
    
    // Análisis por década
    const decadas = {
      '1-10': 0,
      '11-20': 0,
      '21-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51-56': 0
    };
    
    // Análisis por terminación
    const terminaciones = {};
    for (let i = 0; i <= 9; i++) {
      terminaciones[i] = 0;
    }
    
    datosIndividuales.numeros.forEach(num => {
      // Década
      if (num <= 10) decadas['1-10']++;
      else if (num <= 20) decadas['11-20']++;
      else if (num <= 30) decadas['21-30']++;
      else if (num <= 40) decadas['31-40']++;
      else if (num <= 50) decadas['41-50']++;
      else decadas['51-56']++;
      
      // Terminación
      const terminacion = num % 10;
      terminaciones[terminacion]++;
    });
    
    const decadaMasFrecuente = Object.entries(decadas).reduce((a, b) => decadas[a[0]] > decadas[b[0]] ? a : b);
    const terminacionMasFrecuente = Object.entries(terminaciones).reduce((a, b) => terminaciones[a[0]] > terminaciones[b[0]] ? a : b);
    
    resultados[sorteo] = {
      decadas: decadas,
      terminaciones: terminaciones,
      decadaMasFrecuente: decadaMasFrecuente,
      terminacionMasFrecuente: terminacionMasFrecuente,
      totalNumeros: datosIndividuales.numeros.length
    };
  });
  
  return resultados;
}

// Función para mostrar todos los análisis avanzados
export function mostrarAnalisisAvanzados(datos) {
  console.log('📊 Mostrando análisis avanzados...');
  
  const contenedorCajas = document.getElementById('contenedor-cajas');
  if (!contenedorCajas) return;
  
  // Generar análisis avanzados con datos reales
  const sumAnalisis = analizarSumaNumeros(datos);
  const paresAnalisis = analizarParesImpares(datos);
  const decadaAnalisis = analizarDecadaTerminacion(datos);
  
  // Agregar análisis a los datos para que estén disponibles en las cajas
  datos.sumAnalisis = sumAnalisis;
  datos.paresAnalisis = paresAnalisis;
  datos.decadaAnalisis = decadaAnalisis;
  
  // Crear las 3 cajas adicionales
  const cajaSuma = crearCajaAnalisis('suma', '🔢', 'Suma de números', datos);
  const cajaPares = crearCajaAnalisis('pares', '⚖️', 'Pares e impares', datos);
  const cajaDecada = crearCajaAnalisis('decada', '🎯', 'Década y terminación', datos);
  
  // Agregar las cajas al contenedor
  contenedorCajas.appendChild(cajaSuma);
  contenedorCajas.appendChild(cajaPares);
  contenedorCajas.appendChild(cajaDecada);
  
  console.log('✅ Análisis avanzados completados');
}

function crearCajaAnalisis(tipo, emoji, titulo, datos) {
  const caja = document.createElement('div');
  caja.className = 'caja-interactiva';
  caja.id = `caja-${tipo}`;
  
  const botonTitulo = document.createElement('button');
  botonTitulo.onclick = () => manejarClicCaja(tipo, datos);
  botonTitulo.innerHTML = `
    <div class="caja-content">
      <div class="caja-emoji">${emoji}</div>
      <h3 class="caja-titulo">${titulo}</h3>
    </div>
  `;
  
  // Contenido expandible móvil
  const contenidoExpandible = document.createElement('div');
  contenidoExpandible.id = `${tipo}-content-mobile`;
  contenidoExpandible.className = 'hidden lg:hidden px-6 pb-6';
  
  caja.appendChild(botonTitulo);
  caja.appendChild(contenidoExpandible);
  
  return caja;
}

// Función para generar contenido de suma
function generarContenidoSuma(sumAnalisis) {
  let contenidoHTML = '<div class="space-y-4">';
  
  Object.entries(sumAnalisis).forEach(([sorteo, datos]) => {
    const colores = {
      melate: 'bg-blue-500',
      revancha: 'bg-purple-500',
      revanchita: 'bg-green-500'
    };
    
    contenidoHTML += `
      <div class="${colores[sorteo]} bg-opacity-50 rounded-lg p-4">
        <h4 class="font-bold text-white mb-2">${sorteo.toUpperCase()}</h4>
        <div class="text-sm text-gray-300">
          <p><strong>Suma promedio:</strong> ${datos.sumaPromedio}</p>
          <p><strong>Rango más frecuente:</strong> ${datos.rangoMasFrecuente[0]} (${datos.rangoMasFrecuente[1]} veces)</p>
          <div class="mt-2 text-xs">
            <div class="grid grid-cols-2 gap-1">
              ${Object.entries(datos.rangos).map(([rango, freq]) => `
                <span>${rango}: ${freq}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  contenidoHTML += '</div>';
  return contenidoHTML;
}

// Función para generar contenido de pares
function generarContenidoPares(paresImparesAnalisis) {
  let contenidoHTML = '<div class="space-y-4">';
  
  Object.entries(paresImparesAnalisis).forEach(([sorteo, datos]) => {
    const colores = {
      melate: 'bg-blue-500',
      revancha: 'bg-purple-500',
      revanchita: 'bg-green-500'
    };
    
    contenidoHTML += `
      <div class="${colores[sorteo]} bg-opacity-50 rounded-lg p-4">
        <h4 class="font-bold text-white mb-2">${sorteo.toUpperCase()}</h4>
        <div class="text-sm text-gray-300">
          <p><strong>Distribución más frecuente:</strong> ${datos.distribucionMasFrecuente[0]} (${datos.distribucionMasFrecuente[1]} veces)</p>
          <div class="mt-2 text-xs">
            <div class="grid grid-cols-2 gap-1">
              ${Object.entries(datos.distribuciones).map(([dist, freq]) => `
                <span>${dist}: ${freq}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  contenidoHTML += '</div>';
  return contenidoHTML;
}

// Función para generar contenido de década
function generarContenidoDecada(decadaTerminacionAnalisis) {
  let contenidoHTML = '<div class="space-y-4">';
  
  Object.entries(decadaTerminacionAnalisis).forEach(([sorteo, datos]) => {
    const colores = {
      melate: 'bg-blue-500',
      revancha: 'bg-purple-500',
      revanchita: 'bg-green-500'
    };
    
    contenidoHTML += `
      <div class="${colores[sorteo]} bg-opacity-50 rounded-lg p-4">
        <h4 class="font-bold text-white mb-2">${sorteo.toUpperCase()}</h4>
        <div class="text-sm text-gray-300">
          <p><strong>Década más frecuente:</strong> ${datos.decadaMasFrecuente[0]} (${datos.decadaMasFrecuente[1]} veces)</p>
          <p><strong>Terminación más frecuente:</strong> ${datos.terminacionMasFrecuente[0]} (${datos.terminacionMasFrecuente[1]} veces)</p>
          <div class="mt-2 text-xs">
            <div class="mb-1"><strong>Por década:</strong></div>
            <div class="grid grid-cols-3 gap-1 mb-2">
              ${Object.entries(datos.decadas).map(([decada, freq]) => `
                <span>${decada}: ${freq}</span>
              `).join('')}
            </div>
            <div class="mb-1"><strong>Por terminación:</strong></div>
            <div class="grid grid-cols-5 gap-1">
              ${Object.entries(datos.terminaciones).map(([term, freq]) => `
                <span>${term}: ${freq}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  contenidoHTML += '</div>';
  return contenidoHTML;
}

// Función principal para manejar clics en cajas
export function manejarClicCaja(tipo, datos) {
  console.log(`📦 [DEBUG] Clic en caja: ${tipo}, actual abierta: ${cajaActualmenteAbierta}`);
  

  // Si la caja ya está abierta, no hacer nada (solo se cierra con el área expandida)
  if (cajaActualmenteAbierta === tipo) {
    console.log(`ℹ️ Caja ${tipo} ya está abierta, no se cierra con clic en la caja original.`);
    return;
  }

  // Si hay otra caja abierta, ciérrala antes de abrir la nueva
  if (cajaActualmenteAbierta !== null) {
    cerrarTodasLasCajas();
    // Esperar a que termine la animación de cierre antes de abrir la nueva
    setTimeout(() => {
      abrirCaja(tipo, datos);
    }, 320);
  } else {
    abrirCaja(tipo, datos);
  }
}
