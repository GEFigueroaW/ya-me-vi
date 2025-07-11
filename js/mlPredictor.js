// Utilidad: genera una semilla numérica desde una cadena (userId)
function hashCode(str) {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

// === Generar predicción personalizada ===
export async function generarPrediccionPersonalizada(userId, datos) {
  console.log('🤖 Generando predicción personalizada para usuario:', userId);
  
  const numeros = datos.numeros || [];
  
  if (numeros.length === 0) {
    console.warn('⚠️ No hay números históricos, usando predicción por defecto');
    return [3, 7, 15, 23, 31, 42];
  }

  // Usar predicción por frecuencia con personalización
  return generarPrediccionPorFrecuencia(userId, datos);
}

// Función principal para predicción por frecuencia
function generarPrediccionPorFrecuencia(userId, datos) {
  console.log('📊 Generando predicción por frecuencia para usuario:', userId);
  
  const numeros = datos.numeros || [];
  const seed = hashCode(userId);
  
  if (numeros.length === 0) {
    // Números basados en semilla personalizada
    const base = [1, 7, 14, 21, 28, 35, 42, 49];
    return base
      .map(n => ((n + seed) % 56) + 1)
      .filter((n, i, arr) => arr.indexOf(n) === i)
      .slice(0, 6)
      .sort((a, b) => a - b);
  }
  
  // Análisis de frecuencia
  const frecuencia = Array(56).fill(0);
  numeros.forEach(n => {
    if (n >= 1 && n <= 56) {
      frecuencia[n - 1]++;
    }
  });
  
  // Combinar frecuencia con personalización del usuario
  const ponderados = frecuencia.map((freq, i) => {
    const numeroActual = i + 1;
    const factorPersonal = (seed % (numeroActual + 7)) / 100;
    const factorFrecuencia = freq / Math.max(...frecuencia);
    
    return {
      numero: numeroActual,
      score: (factorFrecuencia * 0.7) + (factorPersonal * 0.3) + (Math.random() * 0.1)
    };
  });
  
  // Seleccionar top 6 números únicos
  const top6 = ponderados
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(n => n.numero)
    .sort((a, b) => a - b);
  
  console.log('✅ Predicción por frecuencia generada:', top6);
  return top6;
}
