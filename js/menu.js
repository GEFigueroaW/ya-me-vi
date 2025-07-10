// js/menu.js

document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyzeOption');
  const combinationBtn = document.getElementById('combinationOption');

  analyzeBtn.addEventListener('click', () => {
    analyzeBtn.classList.add('is-selected');
    combinationBtn.classList.remove('is-selected');
    setTimeout(() => {
      window.location.href = 'analisis.html';
    }, 500);
  });

  combinationBtn.addEventListener('click', () => {
    combinationBtn.classList.add('is-selected');
    analyzeBtn.classList.remove('is-selected');
    setTimeout(() => {
      window.location.href = 'combinacion.html';
    }, 500);
  });
});
