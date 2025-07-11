import * as tf from 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.14.0/dist/tf.min.js';

// Utilidad: genera una semilla numérica desde una cadena (userId)
function hashCode(str) {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

// === Generar predicción personalizada ===
export async function generarPrediccionPersonalizada(userId, datos) {
  console.log('🤖 Generando predicción para usuario:', userId);
  
  try {
    const numeros = datos.numeros || [];
    if (numeros.length === 0) {
      console.warn('⚠️ No hay números históricos, usando predicción por defecto');
      return [3, 7, 15, 23, 31, 42];
    }

    // Verificar si TensorFlow.js está disponible
    if (typeof tf === 'undefined') {
      console.warn('⚠️ TensorFlow.js no disponible, usando predicción basada en frecuencia');
      return generarPrediccionPorFrecuencia(userId, datos);
    }

    const seed = hashCode(userId);
    const frecuencia = Array(56).fill(0);

    numeros.forEach(n => {
      if (n >= 1 && n <= 56) {
        frecuencia[n - 1]++;
      }
    });

    // Crear entradas normalizadas para TensorFlow
    const maxFreq = Math.max(...frecuencia);
    const input = tf.tensor2d([frecuencia.map(f => f / maxFreq)]);

    // Crear un modelo simple de red neuronal
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [56], units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 56, activation: 'sigmoid' }));

    model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });

    // Entrenamiento mínimo (mock, solo para inicializar pesos)
    await model.fit(input, input, {
      epochs: 5,
      shuffle: true,
      verbose: 0
    });

    // Generar predicción
    const salida = model.predict(input);
    const predArray = await salida.array();
    const probabilidades = predArray[0];

    // Aplicar semilla personalizada
    const ponderadas = probabilidades.map((prob, i) => ({
      numero: i + 1,
      score: prob + ((seed % (i + 7)) / 1000)
    }));

    // Seleccionar top 6 sin duplicados
    const top6 = ponderadas
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(n => n.numero)
      .sort((a, b) => a - b);

    // Limpiar tensores
    input.dispose();
    salida.dispose();
    model.dispose();

    console.log('✅ Predicción ML generada:', top6);
    return top6;
    
  } catch (error) {
    console.error('❌ Error en predicción ML:', error);
    // Fallback a predicción simple basada en frecuencia
    return generarPrediccionPorFrecuencia(userId, datos);
  }
}

// Función fallback para predicción por frecuencia
function generarPrediccionPorFrecuencia(userId, datos) {
  console.log('📊 Generando predicción por frecuencia para usuario:', userId);
  
  const numeros = datos.numeros || [];
  const seed = hashCode(userId);
  
  if (numeros.length === 0) {
    // Números aleatorios pero determinísticos basados en userId
    const base = [1, 7, 14, 21, 28, 35, 42, 49];
    return base
      .map(n => ((n + seed) % 56) + 1)
      .filter((n, i, arr) => arr.indexOf(n) === i)
      .slice(0, 6)
      .sort((a, b) => a - b);
  }
  
  // Análisis de frecuencia
  const frecuencia = Array(56).fill(0);
  numeros.forEach(n => {
    if (n >= 1 && n <= 56) {
      frecuencia[n - 1]++;
    }
  });
  
  // Combinar frecuencia con personalización
  const ponderados = frecuencia.map((freq, i) => ({
    numero: i + 1,
    score: freq + ((seed % (i + 7)) / 100)
  }));
  
  const top6 = ponderados
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(n => n.numero)
    .sort((a, b) => a - b);
  
  console.log('✅ Predicción por frecuencia generada:', top6);
  return top6;
}
