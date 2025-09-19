// Análisis de combinaciones vs sorteo real 4110

const numeros4110 = [3, 12, 15, 29, 36, 50];
const combinacionesUsuario = [
  [3, 8, 21, 33, 45, 47],
  [3, 9, 16, 21, 33, 45], 
  [2, 7, 18, 28, 32, 53]
];

console.log('🎯 Sorteo 4110 real:', numeros4110.join(', '));
console.log('\n📋 Combinaciones jugadas:');

combinacionesUsuario.forEach((combo, i) => {
  const coincidencias = combo.filter(n => numeros4110.includes(n));
  console.log(`Combinación ${i+1}: ${combo.join(', ')}`);
  console.log(`Coincidencias: ${coincidencias.length} números - ${coincidencias.join(', ') || 'ninguna'}`);
  console.log('');
});

console.log('🔍 Análisis del problema:');
console.log('- Solo 1 coincidencia por combinación (el 3)');
console.log('- Los números ganadores (12, 15, 29, 36, 50) NO estaban en las predicciones');
console.log('- Esto indica que el algoritmo no está analizando correctamente los patrones históricos');

// Análisis de frecuencias de los números ganadores
console.log('\n📊 Análisis de números ganadores:');
console.log('3: Número que SÍ predijimos (coincidencia)');
console.log('12: Número medio-bajo, probablemente con frecuencia moderada');
console.log('15: Número bajo-medio, zona de números frecuentes');
console.log('29: Número medio, zona balanceada');
console.log('36: Número medio-alto, zona de números menos frecuentes');
console.log('50: Número alto, zona de números poco frecuentes');

console.log('\n💡 Recomendaciones de mejora:');
console.log('1. Incluir números de todas las décadas (1-10, 11-20, 21-30, 31-40, 41-50, 51-56)');
console.log('2. Balancear números calientes vs números fríos');
console.log('3. Considerar patrones de suma (suma del sorteo 4110: 145)');
console.log('4. Analizar gaps entre apariciones');
console.log('5. Verificar que el sistema use TODOS los datos históricos, no solo 18 meses');