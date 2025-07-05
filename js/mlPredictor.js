
// js/mlPredictor.js

async function trainAndPredictModel(inputData, labels, predictInput) {
  const xs = tf.tensor2d(inputData, [inputData.length, inputData[0].length]);
  const ys = tf.tensor2d(labels, [labels.length, 1]);

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [inputData[0].length], units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  await model.fit(xs, ys, {
    epochs: 100,
    shuffle: true,
    verbose: 0
  });

  const prediction = model.predict(tf.tensor2d([predictInput], [1, predictInput.length]));
  return prediction.dataSync()[0]; // Retorna la predicción como valor numérico
}
