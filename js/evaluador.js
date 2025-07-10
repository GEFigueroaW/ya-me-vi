document.addEventListener('DOMContentLoaded', () => {
  const evaluateBtn = document.getElementById('evaluateBtn');
  const backBtn = document.getElementById('backBtn');

  evaluateBtn.addEventListener('click', async () => {
    const nums = [];
    for (let i = 1; i <= 6; i++) {
      const val = parseInt(document.getElementById(`num${i}`).value);
      if (!isNaN(val)) nums.push(val);
    }

    // Validaciones
    const unique = [...new Set(nums)];
    if (nums.length !== 6 || unique.length !== 6 || nums.some(n => n < 1 || n > 56)) {
      alert('Por favor ingresa 6 números válidos y distintos entre 1 y 56.');
      return;
    }

    await mlPredictor.mostrarEvaluacion(nums);
  });

  backBtn.addEventListener('click', () => {
    window.location.href = 'menu.html';
  });
});

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
      let frecuenciaPorNumero = Array(56).fill(0);

      draws.forEach(draw => {
        const intersection = draw.filter(n => nums.includes(n));
        if (intersection.length >= 3) matchCount++;
        draw.forEach(n => { if (nums.includes(n)) frecuenciaPorNumero[n - 1]++; });
      });

      const probabilidadCombinada = (matchCount / draws.length) * 100;

      const detalles = nums.map(n => {
        const veces = frecuenciaPorNumero[n - 1];
        const porcentaje = (veces / draws.length) * 100;
        return `<li>Número <strong>${n}</strong>: apareció en <strong>${veces}</strong> sorteos (${porcentaje.toFixed(2)}%)</li>`;
      }).join('');

      const card = document.createElement('div');
      card.classList.add('box', 'has-background-light', 'mb-4');
      card.innerHTML = `
        <h3 class="title is-5">${juego.nombre}</h3>
        <p>Probabilidad de aciertos significativos (≥3): <strong>${probabilidadCombinada.toFixed(2)}%</strong></p>
        <ul>${detalles}</ul>
      `;
      contenedor.appendChild(card);
    }
  }
};
