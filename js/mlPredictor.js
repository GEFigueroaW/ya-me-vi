import * as tf from 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.14.0/dist/tf.min.js';

// Utilidad: genera una semilla numérica desde una cadena (userId)
function hashCode(str) {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

// === Generar predicción personalizada ===
export async function generarPrediccionPersonalizada(userId, numeros) {
  if (!numeros || numeros.length === 0) return Array(6).fill('--');

  const seed = hashCode(userId);
  const frecuencia = Array(56).fill(0);

  numeros.forEach(n => frecuencia[n - 1]++);

  // Crear entradas normalizadas
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

  return top6;
}
