// js/combinacion.js

document.addEventListener('DOMContentLoaded', () => {
  const inputContainer = document.getElementById('inputs');
  const evaluateBtn = document.getElementById('evaluateBtn');

  // Crear los 6 inputs visualmente separados
  for (let i = 0; i < 6; i++) {
    const inputField = document.createElement('div');
    inputField.className = 'control';
    inputField.innerHTML = `
      <input class="input is-rounded has-text-centered has-background-dark has-text-white"
             type="number" min="1" max="56" placeholder="${i + 1}" id="num${i}">
    `;
    inputContainer.appendChild(inputField);
  }

  evaluateBtn.addEventListener('click', () => {
    const numbers = [];
    for (let i = 0; i < 6; i++) {
      const val = parseInt(document.getElementById(`num${i}`).value, 10);
      if (!val || val < 1 || val > 56) {
        alert(`El número ${i + 1} debe estar entre 1 y 56`);
        return;
      }
      if (numbers.includes(val)) {
        alert(`El número ${val} está duplicado. Por favor, ingresa números únicos.`);
        return;
      }
      numbers.push(val);
    }

    // Llamar a evaluación con los 6 números
    mlPredictor.mostrarEvaluacion(numbers);
  });
});
