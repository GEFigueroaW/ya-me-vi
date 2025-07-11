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

    const seed = hashCode(userId);
    const frecuencia = Array(56).fill(0);

    numeros.forEach(n => {
      if (n >= 1 && n <= 56) {
        frecuencia[n - 1]++;
      }
    });

    // Crear entradas normalizadas para TensorFlow
    const input = tf.tensor2d([frecuencia.map(f => f / Math.max(...frecuencia))]);

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

    console.log('✅ Predicción generada:', top6);
    return top6;
    
  } catch (error) {
    console.error('❌ Error en predicción ML:', error);
    // Fallback a predicción simple basada en frecuencia
    const numeros = datos.numeros || [];
    const frecuencia = Array(56).fill(0);
    
    numeros.forEach(n => {
      if (n >= 1 && n <= 56) {
        frecuencia[n - 1]++;
      }
    });
    
    const masFrec = frecuencia
      .map((freq, i) => ({ numero: i + 1, freq }))
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 6)
      .map(n => n.numero)
      .sort((a, b) => a - b);
      
    console.log('✅ Predicción fallback:', masFrec);
    return masFrec.length === 6 ? masFrec : [1, 7, 14, 21, 35, 49];
  }
}
