// /js/mlPredictor.js

/**
 * Prepara los datos como entrada para el modelo.
 * Cada número tiene como características:
 * - frecuencia
 * - delay (cuánto hace que no sale)
 */
function prepareTrainingData(frequencies, delays, maxNumber) {
  const inputs = [];
  const labels = [];

  for (let i = 1; i <= maxNumber; i++) {
    inputs.push([frequencies[i], delays[i]]);
    labels.push(frequencies[i]); // Se entrena para predecir probabilidad según frecuencia
  }

  return { inputs: tf.tensor2d(inputs), labels: tf.tensor1d(labels) };
}

/**
 * Crea y entrena un modelo de regresión simple para asignar puntuación por número.
 */
async function trainModel(frequencies, delays, maxNumber) {
  const { inputs, labels } = prepareTrainingData(frequencies, delays, maxNumber);

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [2], units: 8, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'linear' }));

  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  await model.fit(inputs, labels, {
    epochs: 100,
    verbose: 0
  });

  return model;
}

/**
 * Usa el modelo entrenado para predecir un "score" para cada número.
 */
async function predictScores(frequencies, delays, maxNumber) {
  const model = await trainModel(frequencies, delays, maxNumber);

  const scores = [];
  for (let i = 1; i <= maxNumber; i++) {
    const input = tf.tensor2d([[frequencies[i], delays[i]]]);
    const prediction = model.predict(input);
    const score = await prediction.data();
    scores.push({ number: i, score: score[0] });
  }

  // Ordenar por mejor puntuación
  scores.sort((a, b) => b.score - a.score);

  return scores;
}

/**
 * Sugerencia de combinación: top 6 números con distribución balanceada.
 */
async function getSuggestedCombination(frequencies, delays, maxNumber) {
  const scores = await predictScores(frequencies, delays, maxNumber);

  const selected = [];
  const usedSections = new Set();

  for (const { number } of scores) {
    const sectionIndex = NUMBER_SECTIONS.findIndex(s => number >= s.min && number <= s.max);
    if (!usedSections.has(sectionIndex)) {
      selected.push(number);
      usedSections.add(sectionIndex);
    }
    if (selected.length === 6) break;
  }

  // Si no se logró 1 por sección, completa con los mejores restantes
  for (const { number } of scores) {
    if (selected.length === 6) break;
    if (!selected.includes(number)) selected.push(number);
  }

  return selected.sort((a, b) => a - b);
}
