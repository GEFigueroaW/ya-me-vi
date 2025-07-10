// js/mlPredictor.js

const mlPredictor = {
  async mostrarEvaluacion(nums) {
    const juegos = [
      { nombre: 'Melate', archivo: 'data/melate.csv', color: '#3273dc' },
      { nombre: 'Revancha', archivo: 'data/revancha.csv', color: '#23d160' },
      { nombre: 'Revanchita', archivo: 'data/revanchita.csv', color: '#ff3860' }
    ];

    const contenedor = document.getElementById('evaluationResults');
    contenedor.innerHTML = '';

    for (const juego of juegos) {
      const draws = await DataParser.parseCSV(juego.archivo);

      let matchCount = 0;
      draws.forEach(draw => {
        const intersection = draw.filter(n => nums.includes(n));
        if (intersection.length >= 3) matchCount++;
      });

      const probabilidad = (matchCount / draws.length) * 100;
      const redondeada = probabilidad.toFixed(2);

      const card = document.createElement('div');
      card.classList.add('box', 'has-background-dark', 'mb-4');

      card.innerHTML = `
        <h3 class="title is-5 has-text-white">
          <span class="icon"><i class="fas fa-bullseye"></i></span>
          ${juego.nombre}
        </h3>
        <p class="mb-2 has-text-white">Probabilidad estimada de aciertos significativos (3 o más):</p>
        <progress class="progress is-small" value="${redondeada}" max="100" style="background-color: white;">
          ${redondeada}%
        </progress>
        <p class="has-text-white mt-1">≈ ${redondeada}% de coincidencia basada en datos históricos.</p>
      `;

      contenedor.appendChild(card);
    }
  }
};
