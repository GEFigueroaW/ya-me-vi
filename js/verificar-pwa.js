// verificar-logos.js - Script para verificar archivos de logo
export async function verificarLogos() {
  const logosRequeridos = [
    'assets/favicon.ico',
    'assets/favicon-16.png', 
    'assets/favicon-32.png',
    'assets/logo-192.png',
    'assets/logo-512.png',
    'assets/logo-512-adaptativo-circular.png'
  ];

  const resultados = {
    encontrados: [],
    faltantes: [],
    total: logosRequeridos.length
  };

  console.log('🔍 Verificando archivos de logo...');

  for (const logo of logosRequeridos) {
    try {
      const response = await fetch(logo, { method: 'HEAD' });
      if (response.ok) {
        resultados.encontrados.push(logo);
        console.log(`✅ ${logo} - Encontrado`);
      } else {
        resultados.faltantes.push(logo);
        console.log(`❌ ${logo} - No encontrado (${response.status})`);
      }
    } catch (error) {
      resultados.faltantes.push(logo);
      console.log(`❌ ${logo} - Error: ${error.message}`);
    }
  }

  // Resumen
  console.log('\n📊 Resumen de logos:');
  console.log(`✅ Encontrados: ${resultados.encontrados.length}/${resultados.total}`);
  console.log(`❌ Faltantes: ${resultados.faltantes.length}/${resultados.total}`);

  if (resultados.faltantes.length > 0) {
    console.log('\n🚨 Archivos faltantes:');
    resultados.faltantes.forEach(logo => console.log(`  - ${logo}`));
    console.log('\n📝 Instrucciones:');
    console.log('1. Sincroniza los archivos desde GitHub');
    console.log('2. Coloca los logos en la carpeta assets/');
    console.log('3. Verifica que los nombres coincidan exactamente');
  } else {
    console.log('\n🎉 ¡Todos los logos están presentes! PWA lista.');
  }

  return resultados;
}

// Verificar manifest.json
export async function verificarManifest() {
  try {
    const response = await fetch('/manifest.json');
    if (response.ok) {
      const manifest = await response.json();
      console.log('✅ manifest.json - Encontrado');
      console.log(`📱 Nombre de la app: ${manifest.name}`);
      console.log(`🎨 Color del tema: ${manifest.theme_color}`);
      console.log(`📐 Iconos configurados: ${manifest.icons.length}`);
      return true;
    } else {
      console.log('❌ manifest.json - No encontrado');
      return false;
    }
  } catch (error) {
    console.log(`❌ manifest.json - Error: ${error.message}`);
    return false;
  }
}

// Verificar Service Worker
export async function verificarServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length > 0) {
        console.log('✅ Service Worker - Registrado');
        console.log(`📍 Scope: ${registrations[0].scope}`);
        return true;
      } else {
        console.log('⚠️ Service Worker - No registrado aún');
        return false;
      }
    } catch (error) {
      console.log(`❌ Service Worker - Error: ${error.message}`);
      return false;
    }
  } else {
    console.log('❌ Service Worker - No soportado por el navegador');
    return false;
  }
}

// Verificación completa de PWA
export async function verificarPWACompleta() {
  console.log('🔍 Iniciando verificación completa de PWA...\n');
  
  const logos = await verificarLogos();
  console.log('\n' + '='.repeat(50) + '\n');
  
  const manifest = await verificarManifest();
  console.log('\n' + '='.repeat(50) + '\n');
  
  const sw = await verificarServiceWorker();
  console.log('\n' + '='.repeat(50) + '\n');

  const pwaCompleta = logos.faltantes.length === 0 && manifest && sw;
  
  if (pwaCompleta) {
    console.log('🎉 ¡PWA COMPLETAMENTE CONFIGURADA!');
    console.log('📱 La aplicación puede instalarse como app nativa');
  } else {
    console.log('⚠️ PWA PARCIALMENTE CONFIGURADA');
    console.log('📝 Revisa los elementos faltantes arriba');
  }

  return {
    logos: logos,
    manifest: manifest,
    serviceWorker: sw,
    pwaCompleta: pwaCompleta
  };
}

// Auto-verificar en consola de desarrollador
if (typeof window !== 'undefined') {
  window.verificarPWA = verificarPWACompleta;
  console.log('💡 Tip: Ejecuta verificarPWA() en la consola para verificar el estado de la PWA');
}
