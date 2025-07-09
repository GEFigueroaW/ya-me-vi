// mlPredictor.js con Font Awesome y barra de progreso profesional

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
          <h3 class="title is-5"><i class="fas fa-exclamation-triangle"></i> ${juego.nombre}</h3>
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

      // Color y ícono según nivel
      let nivel = 'is-danger';
      let icon = 'fas fa-exclamation-triangle';
      if (probabilidad >= 70) {
        nivel = 'is-success';
        icon = 'fas fa-bullseye';
      } else if (probabilidad >= 40) {
        nivel = 'is-warning';
        icon = 'fas fa-check-circle';
      }

      const card = document.createElement('div');
      card.classList.add('box', 'mb-4', 'animate__animated', 'animate__fadeInUp');
      card.innerHTML = `
        <h3 class="title is-5"><i class="${icon} ${nivel}"></i> ${juego.nombre}</h3>
        <p class="mb-2">Probabilidad estimada de aciertos significativos (3 o más):</p>
        <progress class="progress ${nivel}" value="${probabilidad}" max="100">${probabilidad.toFixed(2)}%</progress>
        <p class="has-text-weight-semibold mt-2">${probabilidad.toFixed(2)}%</p>
        <p class="is-size-7 has-text-grey">Basado en ${draws.length} sorteos analizados.</p>
      `;
      contenedor.appendChild(card);
    }
  }
};
