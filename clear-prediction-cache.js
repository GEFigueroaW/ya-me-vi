// Script para limpiar cache de predicciones y forzar regeneración

console.log('🧹 Limpiando cache de predicciones...');

// Limpiar localStorage relacionado con predicciones
const keysToDelete = [];

// Buscar todas las claves relacionadas con predicciones
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
        key.includes('yaViPrediccionesIA') ||
        key.includes('yaViCSVHash') ||
        key.includes('yaViSessionId') ||
        key.includes('predicciones')
    )) {
        keysToDelete.push(key);
    }
}

console.log(`📋 Encontradas ${keysToDelete.length} claves de cache a eliminar:`);
keysToDelete.forEach(key => {
    console.log(`  - ${key}`);
    localStorage.removeItem(key);
});

console.log('✅ Cache limpiado completamente');
console.log('🔄 Las próximas predicciones usarán el algoritmo MEJORADO');

// Información sobre el nuevo algoritmo
console.log('\n🎯 NUEVO ALGORITMO IMPLEMENTADO:');
console.log('- Basado en análisis real del sorteo 4110');
console.log('- 83% números de frecuencia media-alta (posiciones 1-20)');
console.log('- 17% números de frecuencia baja (diversidad)');
console.log('- Balance por décadas');
console.log('- Análisis de gaps (última aparición)');
console.log('- Personalización por usuario');

alert('✅ Cache de predicciones limpiado. El sistema ahora usará el algoritmo MEJORADO basado en patrones reales.');