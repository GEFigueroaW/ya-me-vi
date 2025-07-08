
// mlPredictor.js

// Función simulada para calcular probabilidad individual
function calcularProbabilidadIndividual(numero, draws) {
  const total = draws.length;
  let apariciones = 0;
  draws.forEach(draw => {
    if (draw.includes(numero)) apariciones++;
  });
  return (apariciones / total) * 100;
}

// Función para evaluar combinación completa
async function evaluarCombinacion(numeros) {
  const archivos = [
    { nombre: 'Melate', archivo: 'melate.csv' },
    { nombre: 'Revancha', archivo: 'revancha.csv' },
    { nombre: 'Revanchita', archivo: 'revanchita.csv' }
  ];

  const resultados = [];

  for (const { nombre, archivo } of archivos) {
    const draws = await DataParser.parseCSV(archivo);

    const individuales = numeros.map(num => ({
      numero: num,
      probabilidad: calcularProbabilidadIndividual(num, draws).toFixed(2)
    }));

    // Probabilidad conjunta simple: promedio de las individuales
    const conjunta = (
      individuales.reduce((sum, n) => sum + parseFloat(n.probabilidad), 0) / numeros.length
    ).toFixed(2);

    resultados.push({ nombre, individuales, conjunta });
  }

  return resultados;
}

// Mostrar resultados en pantalla
async function mostrarEvaluacion(numeros) {
  const contenedor = document.getElementById('evaluationResults');
  contenedor.innerHTML = '<p class="has-text-white">Procesando evaluación...</p>';

  const resultados = await evaluarCombinacion(numeros);

  contenedor.innerHTML = '';

  resultados.forEach(sorteo => {
    const card = document.createElement('div');
    card.classList.add('box');

    const individualesHTML = sorteo.individuales.map(n =>
      `<li>Número ${n.numero}: ${n.probabilidad}%</li>`).join('');

    card.innerHTML = `
      <h3 class="title is-5">${sorteo.nombre}</h3>
      <ul>${individualesHTML}</ul>
      <p><strong>Probabilidad conjunta estimada:</strong> ${sorteo.conjunta}%</p>
    `;

    contenedor.appendChild(card);
  });
}

// Exportar
window.mlPredictor = {
  mostrarEvaluacion
};
