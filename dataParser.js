const DataParser = {
  async parseCSV(file) {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`No se pudo cargar el archivo: ${file}`);
      const text = await res.text();
      return text
        .trim()
        .split('\n')
        .map(row => row.split(',').map(Number));
    } catch (error) {
      console.error('Error al leer CSV:', error);
      return [];
    }
  },

  getFrequencies(draws) {
    const freq = Array(56).fill(0);
    draws.forEach(draw => draw.forEach(num => freq[num - 1]++));
    return freq;
  },

  getDelays(draws) {
    const lastSeen = Array(56).fill(-1);
    for (let i = draws.length - 1; i >= 0; i--) {
      draws[i].forEach(num => {
        if (lastSeen[num - 1] === -1) {
          lastSeen[num - 1] = draws.length - 1 - i;
        }
      });
    }
    return lastSeen.map(v => (v === -1 ? draws.length : v));
  },

  getSectionDistribution(draws) {
    const sections = [0, 0, 0, 0, 0, 0];
    draws.forEach(draw => {
      draw.forEach(num => {
        const index = Math.floor((num - 1) / 9);
        sections[index]++;
      });
    });
    return sections;
  }
};
