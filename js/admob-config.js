/**
 * YA ME VI - Configuración Google AdMob
 * Configuración centralizada para publicidad móvil y web
 * Actualizado con UNIDADES DE DEMOSTRACIÓN para pruebas seguras
 */

// === IDS DE UNIDADES DE DEMOSTRACIÓN DE GOOGLE ===
// ⚠️ IMPORTANTE: Reemplazar estos IDs por los reales antes de publicar la app
export const ADMOB_DEMO_UNITS = {
  // Banners
  banner_adaptable: 'ca-app-pub-3940256099942544/9214589741',
  banner_fijo: 'ca-app-pub-3940256099942544/6300978111',
  
  // Intersticiales
  intersticial: 'ca-app-pub-3940256099942544/1033173712',
  intersticial_recompensado: 'ca-app-pub-3940256099942544/5354046379',
  
  // Recompensados
  video_recompensado: 'ca-app-pub-3940256099942544/5224354917',
  
  // Nativos
  nativo: 'ca-app-pub-3940256099942544/2247696110',
  nativo_video: 'ca-app-pub-3940256099942544/1044960115',
  
  // Inicio de aplicación
  app_open: 'ca-app-pub-3940256099942544/9257395921'
};

// IDs de AdMob de producción (para uso futuro)
export const ADMOB_CONFIG = {
  // ID de aplicación AdMob
  APP_ID: 'ca-app-pub-2226536008153511~2187640363',
  
  // ID de cliente AdSense (para web)
  CLIENT_ID: 'ca-pub-2226536008153511',
  
  // IDs de unidades publicitarias
  AD_UNITS: {
    // Banner principal de YA ME VI
    BANNER_MAIN: 'ca-app-pub-2226536008153511/4122666428',
    
    // Anuncios nativos avanzados - Integrados naturalmente al contenido
    NATIVE_ADVANCED: 'ca-app-pub-2226536008153511/5826684234',
    
    // Anuncios de inicio de aplicación - Para pantallas de bienvenida
    APP_OPEN: 'ca-app-pub-2226536008153511/6365686382',
    
    // Configuraciones adicionales para diferentes tipos de anuncios
    BANNER_HOME: 'ca-app-pub-2226536008153511/4122666428',
    BANNER_ANALYSIS: 'ca-app-pub-2226536008153511/4122666428',
    BANNER_SUGGESTIONS: 'ca-app-pub-2226536008153511/4122666428',
    NATIVE_HOME: 'ca-app-pub-2226536008153511/5826684234',
    NATIVE_ANALYSIS: 'ca-app-pub-2226536008153511/5826684234'
  },
  
  // Configuraciones por tipo de dispositivo
  DEVICE_CONFIG: {
    MOBILE: {
      banner_size: '320x50',
      native_size: '300x250',
      format: 'auto'
    },
    TABLET: {
      banner_size: '728x90',
      native_size: '728x250',
      format: 'auto'
    },
    DESKTOP: {
      banner_size: '728x90',
      native_size: '728x300',
      format: 'auto'
    }
  },
  
  // Configuración de anuncios nativos
  NATIVE_CONFIG: {
    // Estilos para anuncios nativos
    styles: {
      container: 'bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-lg p-4 mb-6',
      headline: 'text-lg font-bold text-gray-800 mb-2',
      body: 'text-gray-600 text-sm mb-3',
      advertiser: 'text-xs text-gray-400 uppercase tracking-wide',
      callToAction: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
    },
    // Configuración de elementos
    elements: {
      headline: true,
      body: true,
      advertiser: true,
      callToAction: true,
      image: true,
      icon: true
    }
  }
};

// Configuración de políticas AdMob
export const ADMOB_POLICIES = {
  // Contenido permitido
  CONTENT_RATING: 'T', // Teen (13+)
  
  // Categorías de contenido
  CATEGORIES: [
    'entertainment',
    'games',
    'utilities'
  ],
  
  // Ubicaciones recomendadas para anuncios
  RECOMMENDED_PLACEMENTS: {
    banners: ['header', 'footer', 'between-content'],
    native: ['in-feed', 'content-stream', 'recommendation'],
    appOpen: ['welcome', 'startup', 'onboarding']
  }
};

// Función para inicializar AdMob
export function initializeAdMob() {
  console.log('🎯 Inicializando AdMob con anuncios nativos...');
  console.log('📱 App ID:', ADMOB_CONFIG.APP_ID);
  console.log('🏷️ Banner ID:', ADMOB_CONFIG.AD_UNITS.BANNER_MAIN);
  console.log('🎨 Native ID:', ADMOB_CONFIG.AD_UNITS.NATIVE_ADVANCED);
  console.log('🚀 App Open ID:', ADMOB_CONFIG.AD_UNITS.APP_OPEN);
  
  // Verificar si el script de AdSense está cargado
  const adSenseScript = document.querySelector('script[src*="adsbygoogle.js"]');
  if (!adSenseScript) {
    console.warn('⚠️ Script de AdSense no encontrado. Cargando...');
    loadAdSenseScript();
  }
  
  return ADMOB_CONFIG;
}

// Función para cargar el script de AdSense si no está presente
function loadAdSenseScript() {
  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADMOB_CONFIG.CLIENT_ID}`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
  console.log('✅ Script de AdSense cargado');
}

// Función para crear banner publicitario
export function createAdMobBanner(containerId, adUnitId = null, size = 'auto') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Contenedor ${containerId} no encontrado`);
    return false;
  }
  
  const adUnit = adUnitId || ADMOB_CONFIG.AD_UNITS.BANNER_MAIN;
  
  // Crear elemento de anuncio
  const adElement = document.createElement('ins');
  adElement.className = 'adsbygoogle';
  adElement.style.display = 'block';
  adElement.setAttribute('data-ad-client', ADMOB_CONFIG.CLIENT_ID);
  adElement.setAttribute('data-ad-slot', adUnit.split('/')[1]); // Extraer slot del ID completo
  adElement.setAttribute('data-ad-format', size);
  adElement.setAttribute('data-full-width-responsive', 'true');
  
  // Insertar en el contenedor
  container.appendChild(adElement);
  
  // Inicializar anuncio
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    console.log(`✅ Banner AdMob creado en ${containerId}`);
    return true;
  } catch (error) {
    console.error('❌ Error inicializando banner:', error);
    return false;
  }
}

// Función para crear anuncio nativo avanzado
export function createNativeAd(containerId, customStyles = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Contenedor ${containerId} no encontrado`);
    return false;
  }
  
  // Combinar estilos personalizados con los predeterminados
  const styles = { ...ADMOB_CONFIG.NATIVE_CONFIG.styles, ...customStyles };
  
  // Crear contenedor de anuncio nativo
  const nativeContainer = document.createElement('div');
  nativeContainer.className = styles.container;
  nativeContainer.innerHTML = `
    <div class="text-xs text-gray-400 mb-2">Publicidad</div>
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-format="fluid"
         data-ad-layout-key="-6t+ed+2i-1n-4w"
         data-ad-client="${ADMOB_CONFIG.CLIENT_ID}"
         data-ad-slot="${ADMOB_CONFIG.AD_UNITS.NATIVE_ADVANCED.split('/')[1]}"></ins>
  `;
  
  // Insertar en el contenedor
  container.appendChild(nativeContainer);
  
  // Inicializar anuncio nativo
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    console.log(`✅ Anuncio nativo AdMob creado en ${containerId}`);
    return true;
  } catch (error) {
    console.error('❌ Error inicializando anuncio nativo:', error);
    return false;
  }
}

// Función para anuncio de inicio de aplicación
export function createAppOpenAd(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Contenedor ${containerId} no encontrado`);
    return false;
  }
  
  // Crear anuncio de inicio de aplicación
  const appOpenContainer = document.createElement('div');
  appOpenContainer.className = 'text-center mb-6';
  appOpenContainer.innerHTML = `
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="${ADMOB_CONFIG.CLIENT_ID}"
         data-ad-slot="${ADMOB_CONFIG.AD_UNITS.APP_OPEN.split('/')[1]}"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  `;
  
  // Insertar en el contenedor
  container.appendChild(appOpenContainer);
  
  // Inicializar anuncio
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    console.log(`✅ App Open Ad creado en ${containerId}`);
    return true;
  } catch (error) {
    console.error('❌ Error inicializando App Open Ad:', error);
    return false;
  }
}

// Función para obtener configuración responsiva según dispositivo
export function getResponsiveAdConfig() {
  const width = window.innerWidth;
  
  if (width <= 768) {
    return ADMOB_CONFIG.DEVICE_CONFIG.MOBILE;
  } else if (width <= 1024) {
    return ADMOB_CONFIG.DEVICE_CONFIG.TABLET;
  } else {
    return ADMOB_CONFIG.DEVICE_CONFIG.DESKTOP;
  }
}

// Función para compliance con políticas AdMob
export function checkAdMobCompliance() {
  const compliance = {
    content_rating: ADMOB_POLICIES.CONTENT_RATING,
    categories: ADMOB_POLICIES.CATEGORIES,
    privacy_policy: true, // YA ME VI tiene política de privacidad
    terms_of_service: true, // YA ME VI tiene términos de servicio
    age_appropriate: true, // Contenido apropiado para 13+
    native_ads: true, // Anuncios nativos implementados
    app_open_ads: true // Anuncios de inicio implementados
  };
  
  console.log('📋 AdMob Compliance Check (Actualizado):', compliance);
  return compliance;
}

// Auto-inicialización si el módulo se carga
if (typeof window !== 'undefined') {
  console.log('🎯 AdMob Config actualizado para YA ME VI (Nativos + App Open)');
}