// /js/config.js

// URLs oficiales (puedes reemplazar por las URLs directas si cambian)
const GAME_CONFIG = {
  melate: {
    name: "Melate",
    csvUrl: "https://www.pakin.lat/static/files/melate.csv",
    maxNumber: 56
  },
  revancha: {
    name: "Revancha",
    csvUrl: "https://www.pakin.lat/static/files/revancha.csv",
    maxNumber: 56
  },
  revanchita: {
    name: "Revanchita",
    csvUrl: "https://www.pakin.lat/static/files/revanchita.csv",
    maxNumber: 56
  }
};

// Cuántos sorteos analizar por juego
const MAX_SORTEOS = 50;

// Rango de secciones (para calcular % por grupo)
const NUMBER_SECTIONS = [
  { name: "1–9",     min: 1,  max: 9 },
  { name: "10–18",   min: 10, max: 18 },
  { name: "19–27",   min: 19, max: 27 },
  { name: "28–36",   min: 28, max: 36 },
  { name: "37–45",   min: 37, max: 45 },
  { name: "46–56",   min: 46, max: 56 }
];

// Colores asociados (útiles para la visualización)
const SECTION_COLORS = [
  "#FF6F61", "#FFD700", "#A3CB38", "#1F3A93", "#6C5CE7", "#F39C12"
];
