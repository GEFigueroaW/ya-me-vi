// combinacion.js

document.addEventListener('DOMContentLoaded', () => {
  const inputContainer = document.getElementById('combinationInputs');
  const errorMsg = document.getElementById('errorMsg');
  const evaluateBtn = document.getElementById('evaluateBtn');
  const evaluationResults = document.getElementById('evaluationResults');

  // Crear 6 inputs numerados
  for (let i = 0; i < 6; i++) {
    const div = document.createElement('div');
    div.className = 'control';

    const input = document.createElement('input');
    input.className = 'input';
    input.type = 'number';
    input.min = 1;
    input.max = 56;
    input.placeholder = `${i + 1}`;
    input.id = `num${i}`;

    div.appendChild(input);
    inputContainer.appendChild(div);
  }

  evaluateBtn.addEventListener('click', async () => {
    errorMsg.textContent = '';
    evaluationResults.innerHTML = '';

    const nums = [];
    for (let i = 0; i < 6; i++) {
      const val = parseInt(document.getElementById(`num${i}`).value);
      if (!val || val < 1 || val > 56) {
        errorMsg.textContent = 'Todos los números deben estar entre 1 y 56.';
        return;
      }
      nums.push(val);
    }

    // Validar duplicados
    const unique = new Set(nums);
    if (unique.size !== 6) {
      errorMsg.textContent = 'No puedes repetir números en la combinación.';
      return;
    }

    // Ejecutar análisis
    mlPredictor.mostrarEvaluacion(nums);
  });
});
