// Utilidad: genera una semilla numérica desde una cadena (userId)
function hashCode(str) {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

// === Generar predicción personalizada con IA avanzada ===
export async function generarPrediccionPersonalizada(userId, datos) {
  console.log('🤖 Generando predicción personalizada con IA avanzada para usuario:', userId);
  
  const numeros = datos.numeros || [];
  
  if (numeros.length === 0) {
    console.warn('⚠️ No hay números históricos, usando predicción por defecto');
    return [3, 7, 15, 23, 31, 42];
  }

  // Usar el nuevo sistema de 1000 combinaciones aleatorias
  return generarCombinacionPersonalizada(userId, datos);
}

// Sistema de 1000 combinaciones aleatorias consistentes
function generarCombinacionPersonalizada(userId, datos) {
  console.log('🎯 Generando combinación personalizada del pool de 1000 para usuario:', userId);
  
  // Generar hash único basado en los datos para garantizar consistencia
  const hashDatos = generarHashDatos(datos);
  
  // Generar el pool de 1000 combinaciones basadas en datos históricos
  const poolCombinaciones = generarPoolCombinaciones(datos);
  
  // Determinar qué sorteo es basado en el contexto de los datos
  const tipoSorteo = determinarTipoSorteo(datos);
  
  // Seleccionar una combinación específica para este usuario y sorteo
  // La combinación será la misma mientras no cambien los datos históricos
  const hashUsuario = hashCode(userId);
  const hashSorteo = hashCode(tipoSorteo);
  const hashCompleto = hashUsuario + hashSorteo + hashDatos;
  const indiceCombinacion = hashCompleto % poolCombinaciones.length;
  
  const combinacionSeleccionada = poolCombinaciones[indiceCombinacion];
  
  console.log(`✅ Combinación ${indiceCombinacion + 1}/1000 seleccionada para usuario ${userId} en ${tipoSorteo}:`, combinacionSeleccionada);
  console.log(`🔒 Hash datos: ${hashDatos} (garantiza consistencia hasta actualización)`);
  return combinacionSeleccionada;
}

// Generar hash de los datos para garantizar consistencia
function generarHashDatos(datos) {
  let hashString = '';
  
  if (datos.datos && datos.datos.length > 0) {
    // Usar los primeros 10 sorteos como "firma" de los datos
    const sorteosMuestra = datos.datos.slice(0, 10);
    hashString = sorteosMuestra.map(s => `${s.numeroSorteo}-${s.numeros.join('')}`).join('|');
  } else if (datos.numeros && datos.numeros.length > 0) {
    // Usar los primeros 60 números como "firma"
    hashString = datos.numeros.slice(0, 60).join('');
  }
  
  return hashCode(hashString);
}

// Determinar el tipo de sorteo basado en los datos
function determinarTipoSorteo(datos) {
  // Si hay información del sorteo en los datos, usarla
  if (datos.sorteo) {
    return datos.sorteo;
  }
  
  // Si no, intentar determinar por el contexto
  if (datos.datos && datos.datos.length > 0) {
    const primerDato = datos.datos[0];
    if (primerDato.sorteo) {
      return primerDato.sorteo;
    }
  }
  
  // Fallback por defecto
  return 'melate';
}

// Generar pool de 1000 combinaciones inteligentes con los 5 métodos
function generarPoolCombinaciones(datos) {
  console.log('🏭 Generando pool de 1000 combinaciones con 5 métodos de análisis...');
  
  const pool = [];
  const todosLosNumeros = datos.numeros || [];
  
  // Análisis completo una sola vez - LOS 5 MÉTODOS
  const frecuencia = calcularFrecuencia(todosLosNumeros);                    // 1. Estadística
  const probabilidad = calcularProbabilidades(todosLosNumeros);              // 2. Probabilidad
  const patrones = analizarPatrones(datos.datos || []);                      // 3. Patrones
  const deltaAnalisis = analizarNumerosDelta(datos.datos || []);             // 4. Números Delta
  const desviacionAnalisis = analizarDesviacionEstandar(datos.datos || []);  // 5. Desviación Estándar
  
  console.log('📊 Análisis completo: Frecuencia, Probabilidad, Patrones, Delta, Desviación');
  
  // Generar 1000 combinaciones variadas usando los 5 métodos
  for (let i = 0; i < 1000; i++) {
    const semilla = i * 7919; // Número primo para mejor distribución
    const combinacion = generarCombinacionAvanzada(frecuencia, probabilidad, patrones, deltaAnalisis, desviacionAnalisis, semilla);
    pool.push(combinacion);
  }
  
  console.log('✅ Pool de 1000 combinaciones generado con análisis completo');
  return pool;
}

// Generar combinación avanzada con los 5 métodos
function generarCombinacionAvanzada(frecuencia, probabilidad, patrones, deltaAnalisis, desviacionAnalisis, semilla) {
  const rng = crearGeneradorAleatorio(semilla);
  
  // Distribuir estrategias uniformemente
  const estrategia = semilla % 5;
  
  switch (estrategia) {
    case 0: // Basado en estadística/frecuencia
      return seleccionarPorFrecuencia(frecuencia, rng, 0.7);
    case 1: // Basado en probabilidad
      return seleccionarPorProbabilidad(probabilidad, rng);
    case 2: // Basado en patrones
      return seleccionarPorPatrones(patrones, rng);
    case 3: // Basado en análisis delta
      return seleccionarPorDelta(deltaAnalisis, rng);
    case 4: // Basado en desviación estándar
      return seleccionarPorDesviacion(desviacionAnalisis, rng);
    default:
      return seleccionarEstrategiaMixta(frecuencia, patrones, rng);
  }
}

// Nuevo método: Calcular probabilidades
function calcularProbabilidades(numeros) {
  console.log('📈 Calculando probabilidades...');
  const probabilidades = Array(56).fill(0);
  const total = numeros.length;
  
  for (let i = 1; i <= 56; i++) {
    const apariciones = numeros.filter(n => n === i).length;
    probabilidades[i - 1] = apariciones / total;
  }
  
  return probabilidades;
}

// Nuevo método: Seleccionar por probabilidad
function seleccionarPorProbabilidad(probabilidad, rng) {
  const candidatos = [];
  
  for (let i = 0; i < 56; i++) {
    candidatos.push({
      numero: i + 1,
      probabilidad: probabilidad[i],
      peso: probabilidad[i] * 100 + (rng() % 30) // Añadir variabilidad
    });
  }
  
  candidatos.sort((a, b) => b.peso - a.peso);
  return candidatos.slice(0, 6).map(c => c.numero).sort((a, b) => a - b);
}

// Nuevo método: Seleccionar por desviación estándar
function seleccionarPorDesviacion(desviacionAnalisis, rng) {
  const candidatos = desviacionAnalisis.map((item, index) => ({
    numero: index + 1,
    desviacion: item.desviacion,
    peso: item.score * 100 + (rng() % 20)
  }));
  
  candidatos.sort((a, b) => b.peso - a.peso);
  return candidatos.slice(0, 6).map(c => c.numero).sort((a, b) => a - b);
}
  }
}

// Generador de números aleatorios con semilla (LCG)
function crearGeneradorAleatorio(semilla) {
  let seed = semilla;
  return function() {
    seed = (seed * 1664525 + 1013904223) % (2**32);
    return seed;
  };
}

// Selección por frecuencia
function seleccionarPorFrecuencia(frecuencia, rng, factorFrecuencia = 0.6) {
  const numerosConPeso = frecuencia.map((item, index) => ({
    numero: index + 1,
    peso: item.score * factorFrecuencia + (rng() / (2**32)) * (1 - factorFrecuencia)
  }));
  
  numerosConPeso.sort((a, b) => b.peso - a.peso);
  
  const seleccionados = [];
  for (let i = 0; i < Math.min(6, numerosConPeso.length); i++) {
    seleccionados.push(numerosConPeso[i].numero);
  }
  
  return seleccionados.sort((a, b) => a - b);
}

// Selección por patrones
function seleccionarPorPatrones(patrones, rng) {
  const numeros = [];
  const usado = new Set();
  
  // Intentar usar números de patrones detectados
  if (patrones.secuencias && patrones.secuencias.length > 0) {
    const secuenciaAleatoria = patrones.secuencias[rng() % patrones.secuencias.length];
    for (const num of secuenciaAleatoria) {
      if (numeros.length < 6 && !usado.has(num) && num >= 1 && num <= 56) {
        numeros.push(num);
        usado.add(num);
      }
    }
  }
  
  // Completar con números aleatorios
  while (numeros.length < 6) {
    const numero = (rng() % 56) + 1;
    if (!usado.has(numero)) {
      numeros.push(numero);
      usado.add(numero);
    }
  }
  
  return numeros.sort((a, b) => a - b);
}

// Selección por análisis delta
function seleccionarPorDelta(deltaAnalisis, rng) {
  const numeros = [];
  const usado = new Set();
  
  // Usar números con buenos scores delta
  if (deltaAnalisis.scores && deltaAnalisis.scores.length > 0) {
    const deltaOrdenado = deltaAnalisis.scores
      .map((score, index) => ({ numero: index + 1, score }))
      .sort((a, b) => b.score - a.score);
    
    for (let i = 0; i < Math.min(6, deltaOrdenado.length); i++) {
      const numero = deltaOrdenado[i].numero;
      if (!usado.has(numero)) {
        numeros.push(numero);
        usado.add(numero);
      }
    }
  }
  
  // Completar si es necesario
  while (numeros.length < 6) {
    const numero = (rng() % 56) + 1;
    if (!usado.has(numero)) {
      numeros.push(numero);
      usado.add(numero);
    }
  }
  
  return numeros.sort((a, b) => a - b);
}

// Estrategia mixta
function seleccionarEstrategiaMixta(frecuencia, patrones, rng) {
  const numeros = [];
  const usado = new Set();
  
  // 3 números de alta frecuencia
  const frecuenciaOrdenada = frecuencia
    .map((item, index) => ({ numero: index + 1, score: item.score }))
    .sort((a, b) => b.score - a.score);
  
  for (let i = 0; i < Math.min(3, frecuenciaOrdenada.length); i++) {
    const numero = frecuenciaOrdenada[i].numero;
    if (!usado.has(numero)) {
      numeros.push(numero);
      usado.add(numero);
    }
  }
  
  // 3 números aleatorios
  while (numeros.length < 6) {
    const numero = (rng() % 56) + 1;
    if (!usado.has(numero)) {
      numeros.push(numero);
      usado.add(numero);
    }
  }
  
  return numeros.sort((a, b) => a - b);
}

// Función principal para predicción avanzada con IA (LEGACY - mantenida por compatibilidad)
function generarPrediccionAvanzada_Legacy(userId, datos) {
  console.log('🧠 Generando predicción con IA avanzada para usuario:', userId);
  
  const todosLosNumeros = datos.numeros || [];
  const todosLosDatos = datos.datos || [];
  
  if (todosLosNumeros.length === 0) {
    return generarPrediccionPorDefecto(userId);
  }
  
  // 1. Análisis de Frecuencia (25% peso)
  const frecuencia = calcularFrecuencia(todosLosNumeros);
  
  // 2. Análisis de Patrones y Secuencias (20% peso)
  const patrones = analizarPatrones(todosLosDatos);
  
  // 3. Análisis de Números Delta (15% peso)
  const deltaAnalisis = analizarNumerosDelta(todosLosDatos);
  
  // 4. Análisis de Desviación Estándar (15% peso)
  const desviacionAnalisis = analizarDesviacionEstandar(todosLosDatos);
  
  // 5. Análisis de Bloques y Distribución (10% peso)
  const bloquesAnalisis = analizarBloques(todosLosDatos);
  
  // 6. Análisis de Tendencias Temporales (10% peso)
  const tendenciasAnalisis = analizarTendencias(todosLosDatos);
  
  // 7. Factor de Personalización (5% peso)
  const factorPersonal = hashCode(userId) % 100;
  
  // Combinar todos los análisis
  const prediccion = combinarAnalisis({
    frecuencia,
    patrones,
    deltaAnalisis,
    desviacionAnalisis,
    bloquesAnalisis,
    tendenciasAnalisis,
    factorPersonal
  });
  
  console.log('✅ Predicción con IA avanzada generada:', prediccion);
  return prediccion;
}

// 1. Análisis de Frecuencia
function calcularFrecuencia(numeros) {
  const frecuencia = Array(56).fill(0);
  numeros.forEach(n => {
    if (n >= 1 && n <= 56) {
      frecuencia[n - 1]++;
    }
  });
  
  const maxFrecuencia = Math.max(...frecuencia);
  return frecuencia.map((freq, i) => ({
    numero: i + 1,
    score: maxFrecuencia > 0 ? freq / maxFrecuencia : 0
  }));
}

// 2. Análisis de Patrones y Secuencias
function analizarPatrones(datos) {
  const patrones = Array(56).fill(0);
  
  // Analizar números consecutivos
  datos.forEach(sorteo => {
    const numeros = sorteo.numeros || [];
    numeros.sort((a, b) => a - b);
    
    for (let i = 0; i < numeros.length - 1; i++) {
      if (numeros[i + 1] - numeros[i] === 1) {
        // Bonificar números consecutivos
        patrones[numeros[i] - 1] += 0.5;
        patrones[numeros[i + 1] - 1] += 0.5;
      }
    }
  });
  
  // Analizar números que aparecen juntos frecuentemente
  const pares = {};
  datos.forEach(sorteo => {
    const numeros = sorteo.numeros || [];
    for (let i = 0; i < numeros.length; i++) {
      for (let j = i + 1; j < numeros.length; j++) {
        const par = `${numeros[i]}-${numeros[j]}`;
        pares[par] = (pares[par] || 0) + 1;
      }
    }
  });
  
  // Bonificar números que aparecen juntos
  Object.keys(pares).forEach(par => {
    if (pares[par] > 2) {
      const [num1, num2] = par.split('-').map(Number);
      patrones[num1 - 1] += 0.3;
      patrones[num2 - 1] += 0.3;
    }
  });
  
  const maxPatron = Math.max(...patrones);
  return patrones.map((score, i) => ({
    numero: i + 1,
    score: maxPatron > 0 ? score / maxPatron : 0
  }));
}

// 3. Análisis de Números Delta
function analizarNumerosDelta(datos) {
  const deltaFreq = Array(56).fill(0);
  
  for (let i = 1; i < datos.length; i++) {
    const numerosActuales = datos[i].numeros || [];
    const numerosAnteriores = datos[i - 1].numeros || [];
    
    numerosActuales.forEach(num => {
      numerosAnteriores.forEach(numAnterior => {
        const delta = Math.abs(num - numAnterior);
        if (delta > 0 && delta < 56) {
          deltaFreq[delta - 1]++;
        }
      });
    });
  }
  
  // Aplicar deltas más frecuentes a números actuales
  const scores = Array(56).fill(0);
  const ultimoSorteo = datos[datos.length - 1]?.numeros || [];
  
  ultimoSorteo.forEach(num => {
    deltaFreq.forEach((freq, delta) => {
      if (freq > 0) {
        const numeroPredicho = num + delta + 1;
        if (numeroPredicho >= 1 && numeroPredicho <= 56) {
          scores[numeroPredicho - 1] += freq;
        }
        const numeroPredichoNeg = num - delta - 1;
        if (numeroPredichoNeg >= 1 && numeroPredichoNeg <= 56) {
          scores[numeroPredichoNeg - 1] += freq;
        }
      }
    });
  });
  
  const maxScore = Math.max(...scores);
  return scores.map((score, i) => ({
    numero: i + 1,
    score: maxScore > 0 ? score / maxScore : 0
  }));
}

// 4. Análisis de Desviación Estándar
function analizarDesviacionEstandar(datos) {
  const posiciones = Array(56).fill(0).map(() => []);
  
  datos.forEach((sorteo, index) => {
    const numeros = sorteo.numeros || [];
    numeros.forEach(num => {
      posiciones[num - 1].push(index);
    });
  });
  
  const scores = posiciones.map((apariciones, i) => {
    if (apariciones.length < 2) return { numero: i + 1, score: 0 };
    
    // Calcular intervalos entre apariciones
    const intervalos = [];
    for (let j = 1; j < apariciones.length; j++) {
      intervalos.push(apariciones[j] - apariciones[j - 1]);
    }
    
    // Calcular desviación estándar
    const promedio = intervalos.reduce((sum, val) => sum + val, 0) / intervalos.length;
    const varianza = intervalos.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / intervalos.length;
    const desviacion = Math.sqrt(varianza);
    
    // Predecir próxima aparición
    const ultimaAparicion = apariciones[apariciones.length - 1];
    const intervalosDesdeUltima = datos.length - 1 - ultimaAparicion;
    
    // Score basado en probabilidad de aparición
    const probabilidad = Math.max(0, 1 - Math.abs(intervalosDesdeUltima - promedio) / (desviacion + 1));
    
    return { numero: i + 1, score: probabilidad };
  });
  
  return scores;
}

// 5. Análisis de Bloques y Distribución
function analizarBloques(datos) {
  const bloques = [
    { inicio: 1, fin: 14 },
    { inicio: 15, fin: 28 },
    { inicio: 29, fin: 42 },
    { inicio: 43, fin: 56 }
  ];
  
  const distribucionBloques = Array(4).fill(0);
  
  datos.forEach(sorteo => {
    const numeros = sorteo.numeros || [];
    const contadorBloques = Array(4).fill(0);
    
    numeros.forEach(num => {
      bloques.forEach((bloque, index) => {
        if (num >= bloque.inicio && num <= bloque.fin) {
          contadorBloques[index]++;
        }
      });
    });
    
    contadorBloques.forEach((count, index) => {
      distribucionBloques[index] += count;
    });
  });
  
  // Calcular probabilidad por bloque
  const totalNumeros = distribucionBloques.reduce((sum, count) => sum + count, 0);
  const probabilidadBloques = distribucionBloques.map(count => count / totalNumeros);
  
  const scores = Array(56).fill(0);
  bloques.forEach((bloque, index) => {
    const probabilidad = probabilidadBloques[index];
    for (let num = bloque.inicio; num <= bloque.fin; num++) {
      scores[num - 1] = probabilidad;
    }
  });
  
  return scores.map((score, i) => ({
    numero: i + 1,
    score: score
  }));
}

// 6. Análisis de Tendencias Temporales
function analizarTendencias(datos) {
  const scores = Array(56).fill(0);
  const ventanaAnalisis = Math.min(10, datos.length); // Últimos 10 sorteos
  
  for (let i = datos.length - ventanaAnalisis; i < datos.length; i++) {
    if (i >= 0) {
      const sorteo = datos[i];
      const numeros = sorteo.numeros || [];
      const peso = (i - (datos.length - ventanaAnalisis) + 1) / ventanaAnalisis; // Más peso a sorteos recientes
      
      numeros.forEach(num => {
        scores[num - 1] += peso;
      });
    }
  }
  
  const maxScore = Math.max(...scores);
  return scores.map((score, i) => ({
    numero: i + 1,
    score: maxScore > 0 ? score / maxScore : 0
  }));
}

// Combinar todos los análisis
function combinarAnalisis(analisis) {
  const {
    frecuencia,
    patrones,
    deltaAnalisis,
    desviacionAnalisis,
    bloquesAnalisis,
    tendenciasAnalisis,
    factorPersonal
  } = analisis;
  
  const pesos = {
    frecuencia: 0.25,
    patrones: 0.20,
    delta: 0.15,
    desviacion: 0.15,
    bloques: 0.10,
    tendencias: 0.10,
    personal: 0.05
  };
  
  const scoresCombinados = Array(56).fill(0).map((_, i) => {
    const numero = i + 1;
    let scoreTotal = 0;
    
    scoreTotal += frecuencia[i].score * pesos.frecuencia;
    scoreTotal += patrones[i].score * pesos.patrones;
    scoreTotal += deltaAnalisis[i].score * pesos.delta;
    scoreTotal += desviacionAnalisis[i].score * pesos.desviacion;
    scoreTotal += bloquesAnalisis[i].score * pesos.bloques;
    scoreTotal += tendenciasAnalisis[i].score * pesos.tendencias;
    scoreTotal += ((factorPersonal + numero) % 100) / 100 * pesos.personal;
    
    return {
      numero,
      score: scoreTotal
    };
  });
  
  // Seleccionar top 6 con diversidad
  const seleccionados = [];
  const candidatos = [...scoresCombinados].sort((a, b) => b.score - a.score);
  
  // Asegurar diversidad por bloques
  const bloquesUsados = Array(4).fill(0);
  const bloquesPorNumero = (num) => {
    if (num <= 14) return 0;
    if (num <= 28) return 1;
    if (num <= 42) return 2;
    return 3;
  };
  
  for (const candidato of candidatos) {
    if (seleccionados.length >= 6) break;
    
    const bloque = bloquesPorNumero(candidato.numero);
    if (bloquesUsados[bloque] < 2) { // Máximo 2 por bloque
      seleccionados.push(candidato.numero);
      bloquesUsados[bloque]++;
    }
  }
  
  // Completar si faltan números
  while (seleccionados.length < 6) {
    const restantes = candidatos.filter(c => !seleccionados.includes(c.numero));
    if (restantes.length > 0) {
      seleccionados.push(restantes[0].numero);
    } else {
      break;
    }
  }
  
  return seleccionados.sort((a, b) => a - b);
}

// Predicción por defecto personalizada
function generarPrediccionPorDefecto(userId) {
  const seed = hashCode(userId);
  const base = [3, 7, 15, 23, 31, 42];
  
  return base
    .map(n => ((n + seed) % 56) + 1)
    .filter((n, i, arr) => arr.indexOf(n) === i)
    .sort((a, b) => a - b);
}
