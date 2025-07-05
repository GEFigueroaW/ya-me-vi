
// mlPredictor.js - Simulación de predicción IA básica

function predictNextNumbers(data) {
  const frequency = {};
  for (let i = 1; i <= 56; i++) frequency[i] = 0;

  data.forEach(draw => {
    draw.forEach(num => {
      if (frequency[num] !== undefined) {
        frequency[num]++;
      }
    });
  });

  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(entry => parseInt(entry[0]));

  return sorted;
}
