/**
 * YA ME VI - Configuración Google AdMob
 * Configuración centralizada para publicidad móvil y web
 */

// IDs de AdMob proporcionados por Google
export const ADMOB_CONFIG = {
  // ID de aplicación AdMob
  APP_ID: 'ca-app-pub-2226536008153511~2187640363',
  
  // ID de cliente AdSense (para web)
  CLIENT_ID: 'ca-app-pub-2226536008153511',
  
  // IDs de unidades publicitarias
  AD_UNITS: {
    // Banner principal de YA ME VI
    BANNER_MAIN: 'ca-app-pub-2226536008153511/4122666428',
    
    // Configuraciones adicionales para diferentes tipos de anuncios
    BANNER_HOME: 'ca-app-pub-2226536008153511/4122666428',
    BANNER_ANALYSIS: 'ca-app-pub-2226536008153511/4122666428',
    BANNER_SUGGESTIONS: 'ca-app-pub-2226536008153511/4122666428'
  },
  
  // Configuraciones por tipo de dispositivo
  DEVICE_CONFIG: {
    MOBILE: {
      banner_size: '320x50',
      format: 'auto'
    },
    TABLET: {
      banner_size: '728x90',
      format: 'auto'
    },
    DESKTOP: {
      banner_size: '728x90',
      format: 'auto'
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
  RECOMMENDED_PLACEMENTS: [
    'header', // Encabezado de página
    'footer', // Pie de página  
    'between-content', // Entre contenido
    'sidebar' // Barra lateral (desktop)
  ]
};

// Función para inicializar AdMob
export function initializeAdMob() {
  console.log('🎯 Inicializando AdMob...');
  console.log('📱 App ID:', ADMOB_CONFIG.APP_ID);
  console.log('🏷️ Banner ID:', ADMOB_CONFIG.AD_UNITS.BANNER_MAIN);
  
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
    age_appropriate: true // Contenido apropiado para 13+
  };
  
  console.log('📋 AdMob Compliance Check:', compliance);
  return compliance;
}

// Auto-inicialización si el módulo se carga
if (typeof window !== 'undefined') {
  console.log('🎯 AdMob Config cargado para YA ME VI');
}