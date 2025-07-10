const mlPredictor = {
  async generarPrediccion(draws) {
    const frequency = Array(56).fill(0);
    const lastSeen = Array(56).fill(draws.length);

    // Cálculo de frecuencia y delay
    for (let i = draws.length - 1; i >= 0; i--) {
      draws[i].forEach(num => {
        frequency[num - 1]++;
        if (lastSeen[num - 1] === draws.length) {
          lastSeen[num - 1] = draws.length - i;
        }
      });
    }

    // Escala ambos vectores a valores entre 0 y 1
    const freqMax = Math.max(...frequency);
    const delayMax = Math.max(...lastSeen);

    const normalized = frequency.map((f, i) => ({
      num: i + 1,
      value: (f / freqMax + lastSeen[i] / delayMax) / 2
    }));

    // Ordena por valor de "potencial" y elige los 6 mejores
    normalized.sort((a, b) => b.value - a.value);
    const top = normalized.slice(0, 12); // De aquí se eligen al azar 6

    // IA simple: selección aleatoria ponderada entre top 12
    const prediccion = [];
    while (prediccion.length < 6) {
      const randIndex = Math.floor(Math.random() * top.length);
      const num = top[randIndex].num;
      if (!prediccion.includes(num)) prediccion.push(num);
    }

    return prediccion.sort((a, b) => a - b);
  }
};
