
async function predictNextNumbers(frequencies) {
  const sorted = Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([num, freq]) => [parseInt(num), freq]);

  const xs = tf.tensor2d(sorted.map(([num, _]) => [num]));
  const ys = tf.tensor2d(sorted.map(([_, freq]) => [freq]));

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 10, inputShape: [1], activation: 'relu' }));
  model.add(tf.layers.dense({ units: 10, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });

  await model.fit(xs, ys, { epochs: 80, verbose: 0 });

  const predictions = [];
  for (let i = 1; i <= 56; i++) {
    const pred = model.predict(tf.tensor2d([[i]])).dataSync()[0];
    predictions.push({ num: i, value: pred });
  }

  return predictions
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .map(p => p.num);
}
