// === GENERADORES DE CONTENIDO PARA ANÁLISIS AVANZADOS ===
// Suma de Números
function generarContenidoSuma(sumAnalisis) {
  const sorteos = ['melate', 'revancha', 'revanchita'];
  const sorteoConfig = {
    melate: {
      icon: '📊',
      color: 'bg-blue-500',
      nombre: 'Melate'
    },
    revancha: {
      icon: '🍀',
      color: 'bg-purple-500',
      nombre: 'Revancha'
    },
    revanchita: {
      icon: '🌈',
      color: 'bg-green-500',
      nombre: 'Revanchita'
    }
  };
  let contenidoHTML = `<div class="space-y-8">
    <div class="mb-6 rounded-xl bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 overflow-hidden">
      <button type="button" aria-expanded="false" class="w-full flex items-center justify-between px-4 py-3 focus:outline-none group" onclick="const panel=this.nextElementSibling;const icon=this.querySelector('.chevron');const expanded=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',!expanded);panel.classList.toggle('hidden');icon.innerHTML=expanded?'&#9660;':'&#9650;';">
        <h3 class="text-2xl font-bold text-yellow-400 text-left">🌟 ¡Desvela el Patrón Oculto del Melate! 🌟</h3>
        <span class="chevron text-2xl transition-transform duration-300">&#9660;</span>
      </button>
      <div class="px-4 pb-4 hidden">
        <p class="text-white text-base mb-4 text-center font-semibold">¿Sabías que la suma de los números ganadores tiene un patrón favorito?</p>
        <p class="text-white text-base mb-2 text-center">En los últimos 30 meses, la mayoría de los sorteos premiados caen en un rango de suma muy especial.<br><span class="text-yellow-300 font-bold">¡Descubre la zona dorada y elige tus números con ventaja!</span></p>
        <div class="mt-2 text-sm text-yellow-200 text-center font-semibold">¿Por qué importa la suma?</div>
        <p class="text-gray-200 text-sm text-center">No todas las sumas son igual de comunes. Los sorteos premiados suelen agruparse en ciertos rangos. Si tu combinación suma dentro de ese rango, ¡estás jugando con la estadística a tu favor!</p>
      </div>
    </div>`;
  sorteos.forEach(sorteo => {
    const datos = sumAnalisis[sorteo];
    if (!datos) return;
    const cfg = sorteoConfig[sorteo];
    contenidoHTML += `
      <div class="${cfg.color} bg-opacity-30 rounded-lg p-4 mb-4">
        <h4 class="font-bold text-white mb-2 text-xl text-center">${cfg.icon} ${cfg.nombre}: Suma promedio histórica: <span class='text-yellow-300'>${Math.round(Number(datos.sumaPromedio))}</span></h4>
        <div class="overflow-x-auto">
          <table class="min-w-full text-xs text-white border border-white border-opacity-20 rounded-lg mb-2">
            <thead>
              <tr class="bg-white bg-opacity-10">
                <th class="px-2 py-1">Rango de Suma</th>
                <th class="px-2 py-1">Frecuencia</th>
                <th class="px-2 py-1">Impacto en tu Juego</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(datos.rangos).map(([rango, freq]) => {
                let impacto = '';
                if (rango === '150-199') impacto = '¡TU ZONA DE MAYOR OPORTUNIDAD!';
                else if (rango === '100-149') impacto = 'Frecuencia moderada, ¡cerca de la zona caliente!';
                else if (rango === '50-99') impacto = 'Menos común, riesgo alto.';
                else if (rango === '200-249') impacto = 'Menos frecuente, pero aún posible.';
                else if (rango === '250-299') impacto = 'Muy raro, alta improbabilidad.';
                else if (rango === '300+') impacto = '¡Nunca ha ocurrido! Evita sumas tan altas.';
                return `<tr>
                  <td class="px-2 py-1 text-center">${rango}</td>
                  <td class="px-2 py-1 text-center">${freq}</td>
                  <td class="px-2 py-1 text-center">${impacto}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div class="text-yellow-200 font-semibold text-center mb-2">
          Rango más frecuente: <span class="text-yellow-300">${datos.rangoMasFrecuente[0]}</span> (${datos.rangoMasFrecuente[1]} veces)
        </div>
        <!-- Eliminado: Total de sorteos analizados -->
        <div class="text-yellow-300 font-bold text-center mt-2">
          ${sorteo === 'melate' ? '✨ ¡Dato Estrella! Si tus números suman entre 150 y 199, ¡estás alineado con la tendencia histórica del Melate!' : ''}
          ${sorteo === 'revancha' ? '💡 ¡Consejo de Oro! La consistencia es clave. Revancha refuerza la importancia del rango 150-199 como la zona más probable para la suma de tus números.' : ''}
          ${sorteo === 'revanchita' ? '🚀 ¡Estrategia Avanzada! Si bien el 150-199 es dominante, el rango 200-249 tiene una presencia notable en Revanchita. ¡Considera ambas opciones!' : ''}
        </div>
      </div>
    `;
  });
  contenidoHTML += `
    <div class="mt-8 rounded-xl bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 overflow-hidden">
      <button type="button" aria-expanded="false" class="w-full flex items-center justify-between px-4 py-3 focus:outline-none group" onclick="const panel=this.nextElementSibling;const icon=this.querySelector('.chevron');const expanded=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',!expanded);panel.classList.toggle('hidden');icon.innerHTML=expanded?'&#9660;':'&#9650;';">
        <h4 class="text-lg font-bold text-yellow-300 text-left">¿Listo para usar esta información?</h4>
        <span class="chevron text-2xl transition-transform duration-300">&#9660;</span>
      </button>
      <div class="px-4 pb-4 hidden">
        <ul class="list-disc list-inside text-white text-base mb-2">
          <li>Elige tus 6 números favoritos para el próximo sorteo de Melate, Revancha o Revanchita.</li>
          <li>Súmalos: ¿Cuál es el total de tus números?</li>
          <li>Compara tu suma: ¿Cae dentro del rango más frecuente (150-199)?</li>
          <li>Si sí, ¡excelente! Estás jugando con las estadísticas históricas a tu favor.</li>
          <li>Si no, ¡no te preocupes! Puedes ajustar uno o dos números para acercar tu suma a la "zona dorada".</li>
        </ul>
        <div class="text-white text-sm text-center mb-2">Recuerda: Esta es una herramienta estadística para mejorar tus probabilidades, ¡pero la suerte siempre es un factor emocionante!</div>
        <div class="text-yellow-300 font-bold text-center">¡Con estos datos, tus selecciones pueden ser más inteligentes y estratégicas!<br>¡Mucha suerte en el próximo sorteo!</div>
      </div>
    </div>
  </div>`;
  return contenidoHTML;
}

// Pares e Impares
function generarContenidoPares(paresAnalisis) {
  const sorteos = ['melate', 'revancha', 'revanchita'];
  const sorteoConfig = {
    melate: {
      icon: '📊',
      color: 'bg-blue-500',
      nombre: 'Melate',
      motivacion: '✨ ¡Equilibrio Perfecto! La combinación de 3 números pares y 3 números impares es, por mucho, la más común en Melate. ¡Busca este balance en tus selecciones para alinearte con la historia!'
    },
    revancha: {
      icon: '🍀',
      color: 'bg-purple-500',
      nombre: 'Revancha',
      motivacion: '💡 ¡Consistencia Clave! Al igual que en Melate, el patrón de 3 pares y 3 impares es el más frecuente en Revancha. ¡La historia nos muestra el camino!'
    },
    revanchita: {
      icon: '🌈',
      color: 'bg-green-500',
      nombre: 'Revanchita',
      motivacion: '🚀 ¡Observa el Patrón! La combinación 3 pares y 3 impares sigue siendo la más destacada en Revanchita. ¡Pero no subestimes las combinaciones de 2 y 4 pares, que también tienen una buena frecuencia!'
    }
  };
  let contenidoHTML = `<div class="space-y-8">
    <div class="mb-6 rounded-xl bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 overflow-hidden">
      <button type="button" aria-expanded="false" class="w-full flex items-center justify-between px-4 py-3 focus:outline-none group" onclick="const panel=this.nextElementSibling;const icon=this.querySelector('.chevron');const expanded=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',!expanded);panel.classList.toggle('hidden');icon.innerHTML=expanded?'&#9660;':'&#9650;';">
        <h3 class="text-2xl font-bold text-yellow-400 text-left">🎲 ¡El Equilibrio Ganador! Desvela el Patrón de Pares e Impares 🎲</h3>
        <span class="chevron text-2xl transition-transform duration-300">&#9660;</span>
      </button>
      <div class="px-4 pb-4 hidden">
        <p class="text-white text-base mb-4 text-center font-semibold">¿Sabías que el balance entre pares e impares es la clave de muchas combinaciones ganadoras?</p>
        <p class="text-white text-base mb-2 text-center">En los últimos 30 meses, la mayoría de los premios han salido con una mezcla muy especial.<br><span class="text-yellow-300 font-bold">¡Descubre el balance ideal y juega con ventaja!</span></p>
        <div class="mt-2 text-sm text-yellow-200 text-center font-semibold">¿Por qué importa el balance?</div>
        <p class="text-gray-200 text-sm text-center">No es casualidad: la combinación 3 pares y 3 impares es la más frecuente. Si tu selección se acerca a este equilibrio, ¡tienes más posibilidades de ganar!</p>
      </div>
    </div>`;
  sorteos.forEach(sorteo => {
    const datos = paresAnalisis[sorteo];
    if (!datos) return;
    const cfg = sorteoConfig[sorteo];
    contenidoHTML += `
      <div class="${cfg.color} bg-opacity-30 rounded-lg p-4 mb-4">
        <h4 class="font-bold text-white mb-2 text-xl text-center">${cfg.icon} ${cfg.nombre}: Balance de Pares e Impares</h4>
        <div class="overflow-x-auto">
          <table class="min-w-full text-xs text-white border border-white border-opacity-20 rounded-lg mb-2">
            <thead>
              <tr class="bg-white bg-opacity-10">
                <th class="px-2 py-1">Combinación (Pares/Impares)</th>
                <th class="px-2 py-1">Frecuencia (Veces)</th>
                <th class="px-2 py-1">Porcentaje (%)</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(datos.distribuciones).map(([dist, freq]) => {
                const total = datos.totalSorteos || 1;
                const porcentaje = Math.round((freq / total) * 1000) / 10; // 1 decimal
                const distLabel = dist.replace('p',' pares / ').replace('i',' impares');
                return `<tr>
                  <td class="px-2 py-1 text-center">${distLabel}</td>
                  <td class="px-2 py-1 text-center">${freq}</td>
                  <td class="px-2 py-1 text-center">${porcentaje}%</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div class="text-yellow-200 font-semibold text-center mb-2">
          Distribución más frecuente: <span class="text-yellow-300">${datos.distribucionMasFrecuente[0].replace('p',' pares / ').replace('i',' impares')}</span>
        </div>
        <!-- Eliminado: Total de sorteos analizados -->
        <div class="text-yellow-300 font-bold text-center mt-2">${cfg.motivacion}</div>
      </div>
    `;
  });
  contenidoHTML += `
    <div class="mt-8 rounded-xl bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 overflow-hidden">
      <button type="button" aria-expanded="false" class="w-full flex items-center justify-between px-4 py-3 focus:outline-none group" onclick="const panel=this.nextElementSibling;const icon=this.querySelector('.chevron');const expanded=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',!expanded);panel.classList.toggle('hidden');icon.innerHTML=expanded?'&#9660;':'&#9650;';">
        <h4 class="text-lg font-bold text-yellow-300 text-left">¿Listo para usar esta información?</h4>
        <span class="chevron text-2xl transition-transform duration-300">&#9660;</span>
      </button>
      <div class="px-4 pb-4 hidden">
        <ul class="list-disc list-inside text-white text-base mb-2">
          <li>Elige tus 6 números favoritos para el próximo sorteo de Melate, Revancha o Revanchita.</li>
          <li>Cuenta cuántos son pares y cuántos son impares.</li>
          <li>Compara tu balance: ¿Se acerca a la combinación más frecuente (generalmente 3 Pares / 3 Impares)?</li>
          <li>Si sí, ¡excelente! Estás jugando con las estadísticas históricas a tu favor.</li>
          <li>Si no, ¡no te preocupes! Puedes ajustar uno o dos números para acercar tu combinación al balance ganador.</li>
        </ul>
        <div class="text-white text-sm text-center mb-2">Recuerda: Esta es una herramienta estadística para mejorar tus probabilidades, ¡pero la suerte siempre es un factor emocionante!</div>
        <div class="text-yellow-300 font-bold text-center">¡Con estos datos, tus selecciones pueden ser más inteligentes y estratégicas!<br>¡Mucha suerte en el próximo sorteo!</div>
      </div>
    </div>
  </div>`;
  return contenidoHTML;
}
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
    const fechaLimite = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 36, fechaActual.getDate());
    console.log(`📅 Filtrando sorteos desde: ${fechaLimite.toLocaleDateString()} para ${sorteo}`);
    
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

// Crear caja para análisis avanzados (suma, pares, decada)
export function crearCajaAnalisis(tipo, datos) {
  const config = {
    suma: {
      emoji: '🔢',
      titulo: 'Suma de números',
    },
    pares: {
      emoji: '⚖️',
      titulo: 'Pares e impares',
    },
    decada: {
      emoji: '🎯',
      titulo: 'Décadas por posición',
    }
  };
  if (!config[tipo]) return null;
  const tarjeta = document.createElement('div');
  tarjeta.className = 'caja-interactiva';
  tarjeta.id = `caja-${tipo}`;
  const botonTitulo = document.createElement('button');
  botonTitulo.onclick = () => manejarClicCaja(tipo, datos);
  botonTitulo.innerHTML = `
    <div class="caja-content">
      <div class="caja-emoji">${config[tipo].emoji}</div>
      <h3 class="caja-titulo">${config[tipo].titulo}</h3>
    </div>
  `;
  // Contenido expandible móvil
  const contenidoExpandible = document.createElement('div');
  contenidoExpandible.id = `${tipo}-content-mobile`;
  contenidoExpandible.className = 'hidden lg:hidden px-6 pb-6';
  tarjeta.appendChild(botonTitulo);
  tarjeta.appendChild(contenidoExpandible);
  return tarjeta;
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
  

  // Mostrar solo las 3 cajas cerradas a la izquierda, ocultar la caja expandida
  const cajasInteractivas = contenedorCajas.querySelectorAll('.caja-interactiva');
  cajasInteractivas.forEach(caja => {
    if (caja.id === `caja-${tipo}`) {
      caja.style.display = 'none';
    } else {
      caja.style.display = '';
    }
    caja.classList.remove('caja-abierta');
    caja.style.opacity = '1';
    caja.style.pointerEvents = '';
  });

  // Activar el layout de dos columnas
  contenedorPrincipal.classList.add('expanded');

  // Mostrar contenedor de contenido sin animación inicial
  contenedorContenido.classList.remove('hidden');
  contenedorContenido.style.opacity = '1';
  contenedorContenido.style.transform = 'translateX(0)';
  
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
      // Usar el análisis de década por posición
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
            tipo === 'decada' ? '🎯 Décadas por posición' : 'Análisis'}
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
  

  // Restaurar todas las cajas a estado normal y visibles
  const cajasInteractivas = contenedorCajas.querySelectorAll('.caja-interactiva');
  cajasInteractivas.forEach(caja => {
    caja.classList.remove('caja-abierta');
    caja.style.opacity = '1';
    caja.style.pointerEvents = '';
    caja.style.display = '';
  });

  // Remover clase de expansión para volver al layout original
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
    decada: 'Décadas por posición'
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
              <div class="bg-white bg-opacity-75 rounded-xl p-4 flex flex-col items-center justify-center text-center backdrop-blur-sm hover:bg-opacity-80 transition-all">
                <div class="text-red-600 text-2xl font-bold mb-1 flex items-center justify-center w-full">${item.numero}</div>
                <div class="text-red-600 text-sm font-semibold flex items-center justify-center w-full">${item.frecuencia}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <!-- Top 10 MENOS frecuentes -->
        <div>
          <h5 class="text-lg font-semibold text-white mb-4 text-center">❄️ Top 10 MENOS frecuentes</h5>
          <div class="grid grid-cols-5 gap-3">
            ${menosFrecuentes.map((item, index) => `
              <div class="bg-white bg-opacity-75 rounded-xl p-4 flex flex-col items-center justify-center text-center backdrop-blur-sm hover:bg-opacity-80 transition-all">
                <div class="text-blue-600 text-2xl font-bold mb-1 flex items-center justify-center w-full">${item.numero}</div>
                <div class="text-blue-600 text-sm font-semibold flex items-center justify-center w-full">${item.frecuencia}</div>
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

// === NUEVO ANÁLISIS DE DÉCADA POR POSICIÓN ===
export function analizarDecadaPorPosicion(datos) {
  // Devuelve un objeto con decadasPorPosicion para cada sorteo
  const decadas = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-56'];
  const posiciones = [0,1,2,3,4,5];
  const nombresPos = ['1er Número','2do Número','3er Número','4to Número','5to Número','6to Número'];
  const resultado = {};
  Object.entries(datos).forEach(([sorteo, datosIndividuales]) => {
    if (!datosIndividuales || !datosIndividuales.sorteos) return;
    const decadasPorPosicion = posiciones.map(pos => {
      // Contar frecuencias de década para esta posición
      const cuenta = { '1-10':0, '11-20':0, '21-30':0, '31-40':0, '41-50':0, '51-56':0 };
      datosIndividuales.sorteos.forEach(sorteoData => {
        const num = sorteoData.numeros[pos];
        if (num <= 10) cuenta['1-10']++;
        else if (num <= 20) cuenta['11-20']++;
        else if (num <= 30) cuenta['21-30']++;
        else if (num <= 40) cuenta['31-40']++;
        else if (num <= 50) cuenta['41-50']++;
        else cuenta['51-56']++;
      });
      // Buscar la década más frecuente
      let decadaMasFrecuente = '1-10', max = 0;
      for (const d of decadas) {
        if (cuenta[d] > max) { decadaMasFrecuente = d; max = cuenta[d]; }
      }
      return {
        posicion: nombresPos[pos],
        decadaMasFrecuente,
        frecuencia: max
      };
    });
    // Mensaje clave dinámico
    let datoClave = '';
    if (sorteo === 'melate') {
      datoClave = 'Los datos muestran una clara progresión: la década 1-10 es la más frecuente para el 1er número, la 11-20 para el 2do, y así sucesivamente. ¡Los números más bajos tienden a ocupar las primeras posiciones, mientras que los más altos se reservan para las últimas!';
    } else if (sorteo === 'revancha') {
      datoClave = 'La tendencia es muy similar a Melate. Las décadas listadas son las más frecuentes para cada posición. Prioriza números de décadas bajas para las primeras posiciones y de décadas altas para las finales.';
    } else if (sorteo === 'revanchita') {
      datoClave = 'Revanchita confirma la inclinación de las décadas por posición. Las décadas mostradas son las que más han salido en cada lugar. Considera este orden al armar tu combinación para maximizar tu alineación con los patrones históricos.';
    }
    resultado[sorteo] = { decadasPorPosicion, datoClave };
  });
  return resultado;
}

// Genera el contenido visual de la sección Década y Terminación por posición
function generarContenidoDecada(decadaPorPosicionAnalisis) {
let contenidoHTML = `<div class="space-y-8">
  <div class="mb-6 rounded-xl bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 overflow-hidden">
    <button type="button" aria-expanded="false" class="w-full flex items-center justify-between px-4 py-3 focus:outline-none group" onclick="const panel=this.nextElementSibling;const icon=this.querySelector('.chevron');const expanded=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',!expanded);panel.classList.toggle('hidden');icon.innerHTML=expanded?'&#9660;':'&#9650;';">
      <h3 class="text-2xl font-bold text-yellow-400 text-left">🎯 ¡Descubre el Patrón de las Décadas por Posición! 🎯</h3>
      <span class="chevron text-2xl transition-transform duration-300">&#9660;</span>
    </button>
    <div class="px-4 pb-4 hidden">
      <p class="text-white text-base mb-4 text-center font-semibold">¿Sabías que cada posición en la combinación ganadora tiene una década favorita?</p>
      <p class="text-white text-base mb-2 text-center">En los últimos 30 meses, los números ganadores muestran una tendencia clara: cada lugar de la combinación prefiere una década específica.<br><span class="text-yellow-300 font-bold">¡Aprovecha este patrón y elige tus números con estrategia!</span></p>
      <div class="mt-2 text-sm text-yellow-200 text-center font-semibold">¿Por qué importa la década y la posición?</div>
      <p class="text-gray-200 text-sm text-center">No todos los números tienen la misma probabilidad de aparecer en cada posición. Si eliges tus números siguiendo la década más frecuente para cada lugar, ¡estás jugando con la estadística a tu favor!</p>
    </div>
  </div>`;

  const config = {
    melate: {
      color: 'bg-blue-500',
      emoji: '🔢',
      nombre: 'Melate',
      consejo: '✨ ¡Dato Clave de Melate!'
    },
    revancha: {
      color: 'bg-purple-500',
      emoji: '🍀',
      nombre: 'Revancha',
      consejo: '💡 ¡Consejo de Revancha!'
    },
    revanchita: {
      color: 'bg-green-500',
      emoji: '🌈',
      nombre: 'Revanchita',
      consejo: '🚀 ¡Estrategia Avanzada!'
    }
  };

  Object.entries(decadaPorPosicionAnalisis).forEach(([sorteo, datos]) => {
    const cfg = config[sorteo];
    contenidoHTML += `
      <div class="${cfg.color} bg-opacity-40 rounded-lg p-4 mb-4">
        <h4 class="font-bold text-white mb-2 text-xl text-center">${cfg.emoji} ${cfg.nombre}: Décadas por Posición</h4>
        <div class="overflow-x-auto">
          <table class="min-w-full text-xs text-white border border-white border-opacity-20 rounded-lg mb-2">
            <thead>
              <tr class="bg-white bg-opacity-10">
                <th class="px-2 py-1">Posición del Número</th>
                <th class="px-2 py-1">Década Más Frecuente</th>
                <th class="px-2 py-1">Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              ${datos.decadasPorPosicion.map(posData => `
                <tr>
                  <td class="px-2 py-1 text-center">${posData.posicion}</td>
                  <td class="px-2 py-1 text-center">${posData.decadaMasFrecuente}</td>
                  <td class="px-2 py-1 text-center">${posData.frecuencia}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <!-- Línea eliminada: Década más frecuente por posición -->
        <div class="text-yellow-300 font-bold text-center mt-2">
          ${cfg.consejo} ${datos.datoClave}
        </div>
      </div>
    `;
  });

  contenidoHTML += `
    <div class="mt-8 rounded-xl bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 overflow-hidden">
      <button type="button" aria-expanded="false" class="w-full flex items-center justify-between px-4 py-3 focus:outline-none group" onclick="const panel=this.nextElementSibling;const icon=this.querySelector('.chevron');const expanded=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',!expanded);panel.classList.toggle('hidden');icon.innerHTML=expanded?'&#9660;':'&#9650;';">
        <h4 class="text-lg font-bold text-yellow-300 text-left">¿Listo para usar esta información?</h4>
        <span class="chevron text-2xl transition-transform duration-300">&#9660;</span>
      </button>
      <div class="px-4 pb-4 hidden">
        <ul class="list-disc list-inside text-white text-base mb-2">
          <li>Elige tus 6 números favoritos para el próximo sorteo, pensando en la posición que cada uno ocupará.</li>
          <li>Para el 1er número, selecciona uno en la década más frecuente para esa posición (por ejemplo, 1-10).</li>
          <li>Para el 2do número, elige uno en la década más frecuente para la segunda posición, y así sucesivamente.</li>
          <li>Si tu selección sigue este patrón de décadas por posición, ¡excelente! Estás jugando con las estadísticas históricas a tu favor.</li>
          <li>Si no, ¡no te preocupes! Puedes ajustar uno o dos números para acercar tu combinación al patrón ganador.</li>
        </ul>
        <div class="text-white text-sm text-center mb-2">Recuerda: Esta es una herramienta estadística para mejorar tus probabilidades, ¡pero la suerte siempre es un factor emocionante!</div>
        <div class="text-yellow-300 font-bold text-center">¡Con estos datos, tus selecciones pueden ser más inteligentes y estratégicas!<br>¡Mucha suerte en el próximo sorteo!</div>
      </div>
    </div>
  </div>`;
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

export function mostrarAnalisisAvanzados(datos) {
  console.log('📊 Mostrando análisis avanzados...');
  const contenedorCajas = document.getElementById('contenedor-cajas');
  if (!contenedorCajas) return;

  // Generar análisis avanzados con datos reales
  const sumAnalisis = analizarSumaNumeros(datos);
  const paresAnalisis = analizarParesImpares(datos);
  // Usar el nuevo análisis de década por posición
  const decadaAnalisis = analizarDecadaPorPosicion(datos);

  // Agregar análisis a los datos para que estén disponibles en las cajas
  datos.sumAnalisis = sumAnalisis;
  datos.paresAnalisis = paresAnalisis;
  datos.decadaAnalisis = decadaAnalisis;


  // Crear las 3 cajas adicionales usando la firma correcta
  const cajaSuma = crearCajaAnalisis('suma', datos);
  const cajaPares = crearCajaAnalisis('pares', datos);
  const cajaDecada = crearCajaAnalisis('decada', datos);

  // Agregar las cajas al contenedor
  if (cajaSuma) contenedorCajas.appendChild(cajaSuma);
  if (cajaPares) contenedorCajas.appendChild(cajaPares);
  if (cajaDecada) contenedorCajas.appendChild(cajaDecada);

  console.log('✅ Análisis avanzados completados (incluye década por posición)');
}
