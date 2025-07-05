document.addEventListener("DOMContentLoaded", () => {
  const user = firebase.auth().currentUser;
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("userName").innerText = user.displayName;
  document.getElementById("logoutBtn").addEventListener("click", () => {
    firebase.auth().signOut().then(() => window.location.href = "index.html");
  });

  document.getElementById("analyzeBtn").addEventListener("click", handleAnalysis);
});

async function handleAnalysis() {
  const game = document.getElementById("gameSelect").value;
  const analysisBox = document.getElementById("analysisResults");
  const inputSection = document.getElementById("userInputSection");
  const comboSection = document.getElementById("suggestedComboSection");

  analysisBox.classList.remove("is-hidden");
  analysisBox.innerHTML = `<progress class="progress is-small is-primary" max="100">Cargando...</progress>`;

  try {
    const resultHTML = await analyzeGame(game);
    analysisBox.innerHTML = resultHTML;
    inputSection.classList.remove("is-hidden");
    comboSection.classList.remove("is-hidden");
  } catch (err) {
    analysisBox.innerHTML = `<div class="notification is-danger">❌ Error al analizar los sorteos: ${err.message}</div>`;
    inputSection.classList.add("is-hidden");
    comboSection.classList.add("is-hidden");
  }
}

async function analyzeGame(game) {
  const fileMap = {
    melate: "melate.csv",
    revancha: "revancha.csv",
    revanchita: "revanchita.csv"
  };

  const file = fileMap[game];
  const response = await fetch(file);
  if (!response.ok) throw new Error("Archivo no encontrado o inaccesible.");
  const text = await response.text();

  const lines = text.trim().split("\n").slice(0, 50); // Últimos 50 sorteos
  const draws = lines.map(line => line.split(",").map(n => parseInt(n)).filter(n => !isNaN(n)));

  const frequency = Array(56).fill(0);
  const delay = Array(56).fill(0);
  const lastSeen = Array(56).fill(-1);

  draws.forEach((draw, i) => {
    for (const n of draw) {
      frequency[n - 1]++;
      lastSeen[n - 1] = i;
    }
  });

  for (let i = 0; i < 56; i++) {
    delay[i] = lastSeen[i] === -1 ? 50 : 50 - lastSeen[i];
  }

  const sectionCount = [0, 0, 0, 0, 0, 0];
  draws.flat().forEach(n => sectionCount[Math.floor((n - 1) / 9)]++);

  // Generar sugerencia basada en los más frecuentes
  const topNumbers = frequency
    .map((count, i) => ({ number: i + 1, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map(obj => obj.number)
    .sort((a, b) => a - b);

  document.getElementById("suggestedCombo").innerText = topNumbers.join(" - ");

  return `
    <div class="content">
      <h3 class="title is-4">📊 Análisis del sorteo ${game.toUpperCase()}</h3>
      <ul>
        <li><strong>Frecuencia alta:</strong> ${topNumbers.join(", ")}</li>
        <li><strong>Demoras promedio:</strong> ${
          delay.reduce((a, b) => a + b, 0) / 56
        } sorteos</li>
        <li><strong>Distribución por secciones:</strong>
          <ul>
            <li>1–9: ${sectionCount[0]}</li>
            <li>10–18: ${sectionCount[1]}</li>
            <li>19–27: ${sectionCount[2]}</li>
            <li>28–36: ${sectionCount[3]}</li>
            <li>37–45: ${sectionCount[4]}</li>
            <li>46–56: ${sectionCount[5]}</li>
          </ul>
        </li>
      </ul>
    </div>
  `;
}
