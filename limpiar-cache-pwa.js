// Script para limpiar caché PWA y forzar actualización de iconos
console.log('🧹 Limpiando caché PWA...');

// Limpiar todas las cachés del service worker
if ('caches' in window) {
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        console.log('🗑️ Eliminando caché:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }).then(function() {
    console.log('✅ Todas las cachés eliminadas');
    
    // Desregistrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          console.log('🔄 Desregistrando service worker');
          registration.unregister();
        }
        console.log('✅ Service workers desregistrados');
        console.log('🔄 Recarga la página para aplicar cambios');
      });
    }
  });
} else {
  console.log('⚠️ Cache API no disponible');
}

// También limpiar localStorage relacionado con PWA
Object.keys(localStorage).forEach(key => {
  if (key.includes('pwa') || key.includes('icon') || key.includes('manifest')) {
    localStorage.removeItem(key);
    console.log('🗑️ Eliminado de localStorage:', key);
  }
});

console.log('🎉 Limpieza completada. Elimina la PWA del iPhone y agrégala nuevamente.');
