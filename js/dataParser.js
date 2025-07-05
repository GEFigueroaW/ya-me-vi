// js/dataParser.js

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  return lines.map((line) =>
    line.split(",").slice(1).map((num) => parseInt(num.trim()))
  );
}