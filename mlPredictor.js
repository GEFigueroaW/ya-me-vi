// mlPredictor.js

const mlPredictor = {
  async mostrarEvaluacion(nums) {
    const juegos = [
      { nombre: 'Melate', archivo: 'data/melate.csv' },
      { nombre: 'Revancha', archivo: 'data/revancha.csv' },
      { nombre: 'Revanchita', archivo: 'data/revanchita.csv' }
    ];

    const contenedor = document.getElementById('evaluationResults');
    contenedor.innerHTML = '';

    for (const juego of juegos) {
      const draws = await DataParser.parseCSV(juego.archivo);

      if (draws.length === 0) {
        const errorCard = document.createElement('div');
        errorCard.classList.add('box', 'has-background-danger-light', 'mb-4', 'animate__animated', 'animate__shakeX');
        errorCard.innerHTML = `
          <h3 class="title is-5">${juego.nombre}</h3>
          <p>No se pudo analizar el archivo. Verifica que <code>${juego.archivo}</code> exista y tenga datos válidos.</p>
        `;
        contenedor.appendChild(errorCard);
        continue;
      }

      let matchCount = 0;
      draws.forEach(draw => {
        const intersection = draw.filter(n => nums.includes(n));
        if (intersection.length >= 3) matchCount++;
      });

      const probabilidad = (matchCount / draws.length) * 100;

      const card = document.createElement('div');
      card.classList.add('box', 'has-background-info-light', 'mb-4', 'animate__animated', 'animate__fadeInUp');
      card.innerHTML = `
        <h3 class="title is-5">${juego.nombre}</h3>
        <p>Tu combinación tiene una probabilidad estimada de aciertos significativos (3 o más):</p>
        <p class="is-size-4 has-text-weight-bold">${probabilidad.toFixed(2)}%</p>
        <p class="mt-2">Basado en ${draws.length} sorteos analizados.</p>
      `;
      contenedor.appendChild(card);
    }
  }
};
