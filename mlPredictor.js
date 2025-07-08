
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

      let matchCount = 0;
      draws.forEach(draw => {
        const intersection = draw.filter(n => nums.includes(n));
        if (intersection.length >= 3) matchCount++;
      });

      const probabilidad = (matchCount / draws.length) * 100;

      const card = document.createElement('div');
      card.classList.add('box', 'has-background-light', 'mb-4');
      card.innerHTML = `
        <h3 class="title is-5">${juego.nombre}</h3>
        <p>Probabilidad estimada de aciertos significativos (≥3): <strong>${probabilidad.toFixed(2)}%</strong></p>
        <p>Basado en ${draws.length} sorteos analizados.</p>
      `;
      contenedor.appendChild(card);
    }
  }
};
