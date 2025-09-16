/**
 * YA ME VI - AdMob Manager
 * Gestor principal de publicidad con unidades de demostración
 * Implementa todas las funcionalidades requeridas para pruebas seguras
 */

import { ADMOB_DEMO_UNITS } from './admob-config.js';

// === CONFIGURACIÓN DE DISPOSITIVOS DE PRUEBA ===
const TEST_DEVICE_CONFIG = {
  enabled: true, // Cambiar a false en producción
  deviceIds: [
    // Los emuladores de Android se configuran automáticamente
    // Agregar IDs específicos aquí después de obtenerlos del Logcat
  ]
};

// === CONFIGURACIÓN ESTRATÉGICA PARA YA ME VI ===
const AD_STRATEGY = {
  // Frecuencia de anuncios optimizada para lotería
  frequencies: {
    banner: true, // Siempre visible en páginas principales
    intersticial: {
      cooldown: 120000, // 2 minutos entre intersticiales
      triggers: ['page_navigation', 'analysis_complete', 'predictions_generated']
    },
    recompensado: {
      available: true, // Siempre disponible para recompensas
      rewards: ['premium_access', 'extra_combinations', 'detailed_analysis', 'remove_ads']
    },
    nativo: {
      integration: 'content_feed', // Integrado en listas de resultados
      frequency: 3 // Cada 3 elementos de contenido
    }
  },
  
  // Ubicaciones específicas para YA ME VI
  placements: {
    banner: {
      pages: ['analisis.html', 'combinacion.html', 'sugeridas.html', 'home.html'],
      position: 'bottom',
      exclude_when: 'premium_active'
    },
    intersticial: {
      triggers: [
        'navigation_analisis_to_sugeridas',
        'after_combination_analysis',
        'before_ai_predictions',
        'app_resume'
      ]
    },
    recompensado: {
      triggers: [
        'unlock_premium_features',
        'extra_lottery_combinations', 
        'advanced_statistics',
        'remove_ads_temporary'
      ]
    },
    nativo: {
      locations: [
        'analysis_results_feed',
        'prediction_suggestions_list',
        'historical_data_view'
      ]
    }
  }
};

// === CLASE PRINCIPAL ADMOB MANAGER ===
class YaMeViAdMobManager {
  constructor() {
    this.initialized = false;
    this.adsLoaded = {};
    this.lastInterstitialTime = 0;
    this.interactionCount = 0;
    this.premiumStatus = this.checkPremiumStatus();
    
    console.log('🎰 YA ME VI AdMob Manager inicializado');
    console.log('📱 Modo demostración: Usando unidades de prueba de Google');
  }
  
  // === INICIALIZACIÓN PRINCIPAL ===
  async initialize() {
    try {
      console.log('🚀 Inicializando AdMob para YA ME VI...');
      
      // Verificar compatibilidad
      if (!this.isCompatibleEnvironment()) {
        console.log('💻 Entorno web detectado - Simulando AdMob');
        this.initializeWebSimulation();
        return;
      }
      
      // Configurar dispositivos de prueba
      if (TEST_DEVICE_CONFIG.enabled) {
        await this.setupTestDevices();
      }
      
      // Inicializar tipos de anuncios
      await this.initializeAllAdTypes();
      
      // Configurar eventos específicos de YA ME VI
      this.setupLotterySpecificEvents();
      
      this.initialized = true;
      console.log('✅ AdMob inicializado correctamente para YA ME VI');
      
      // Mostrar banner inicial si no es premium
      if (!this.premiumStatus.active) {
        this.showBanner();
      }
      
    } catch (error) {
      console.error('❌ Error inicializando AdMob:', error);
      this.initialized = false;
    }
  }
  
  // === VERIFICACIÓN DE ENTORNO ===
  isCompatibleEnvironment() {
    return typeof window !== 'undefined' && 
           (window.cordova || window.capacitor || window.webkit || 
            navigator.userAgent.includes('wv')); // WebView
  }
  
  initializeWebSimulation() {
    console.log('🌐 Inicializando simulación web de AdMob');
    this.initialized = true;
    this.adsLoaded = {
      banner: true,
      interstitial: true,
      rewarded: true,
      native: true
    };
    
    // Mostrar banner de demostración en web
    if (!this.premiumStatus.active) {
      this.showBanner();
    }
  }
  
  // === CONFIGURACIÓN DE DISPOSITIVOS DE PRUEBA ===
  async setupTestDevices() {
    console.log('🔧 Configurando dispositivos de prueba...');
    console.log('📝 Instrucciones para obtener ID de dispositivo:');
    console.log('1. Ejecutar app con anuncios integrados');
    console.log('2. Buscar en Logcat: "Use RequestConfiguration.Builder.setTestDeviceIds"');
    console.log('3. Copiar el ID mostrado y agregarlo al código');
    console.log('');
    console.log('💡 Los anuncios de prueba mostrarán "Anuncio de prueba"');
    
    // En implementación real, aquí se llamaría:
    /*
    if (window.admob) {
      const testDeviceIds = TEST_DEVICE_CONFIG.deviceIds;
      await window.admob.configRequest({
        testDeviceIds: testDeviceIds
      });
    }
    */
  }
  
  // === INICIALIZACIÓN DE TIPOS DE ANUNCIOS ===
  async initializeAllAdTypes() {
    console.log('📱 Inicializando todos los tipos de anuncios...');
    
    await Promise.all([
      this.initializeBanners(),
      this.initializeInterstitials(), 
      this.initializeRewardedAds(),
      this.initializeNativeAds(),
      this.initializeAppOpenAds()
    ]);
    
    console.log('✅ Todos los tipos de anuncios inicializados');
  }
  
  // === BANNERS ===
  async initializeBanners() {
    console.log('🏷️ Inicializando banners adaptativos...');
    
    this.createBannerContainer();
    this.adsLoaded.banner = true;
    
    console.log(`📱 Banner ID: ${ADMOB_DEMO_UNITS.banner_adaptable}`);
  }
  
  createBannerContainer() {
    if (document.getElementById('yamevi-banner-container')) return;
    
    const container = document.createElement('div');
    container.id = 'yamevi-banner-container';
    container.className = 'fixed bottom-0 left-0 right-0 z-40';
    container.style.cssText = `
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255,255,255,0.1);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(container);
    
    // Ajustar padding del body para el banner
    document.body.style.paddingBottom = '70px';
  }
  
  showBanner() {
    if (!this.adsLoaded.banner || this.premiumStatus.active) return;
    
    const container = document.getElementById('yamevi-banner-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="flex items-center justify-between p-3 text-white">
        <div class="flex items-center gap-3 flex-1">
          <div class="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            Anuncio de prueba
          </div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🎰</span>
            <div>
              <div class="font-bold text-sm">YA ME VI Premium</div>
              <div class="text-xs opacity-90">Sin anuncios, predicciones ilimitadas</div>
            </div>
          </div>
        </div>
        <button onclick="window.yamevi_admob.showRewardedForPremium()" 
                class="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold text-sm transition-colors">
          Obtener Gratis
        </button>
        <button onclick="window.yamevi_admob.hideBanner()" 
                class="ml-2 text-white hover:text-gray-300 p-1">
          ✕
        </button>
      </div>
    `;
    
    container.style.transform = 'translateY(0)';
    console.log('📱 Banner mostrado');
  }
  
  hideBanner() {
    const container = document.getElementById('yamevi-banner-container');
    if (container) {
      container.style.transform = 'translateY(100%)';
      setTimeout(() => {
        container.style.display = 'none';
      }, 300);
    }
  }
  
  // === INTERSTICIALES ===
  async initializeInterstitials() {
    console.log('📺 Inicializando anuncios intersticiales...');
    this.adsLoaded.interstitial = true;
    
    console.log(`📺 Intersticial ID: ${ADMOB_DEMO_UNITS.intersticial}`);
  }
  
  showInterstitial(trigger = 'manual') {
    if (!this.adsLoaded.interstitial || this.premiumStatus.active) return false;
    
    // Verificar cooldown
    const now = Date.now();
    if (now - this.lastInterstitialTime < AD_STRATEGY.frequencies.intersticial.cooldown) {
      console.log('⏰ Intersticial en cooldown');
      return false;
    }
    
    console.log(`📺 Mostrando intersticial - trigger: ${trigger}`);
    this.createInterstitialModal(trigger);
    this.lastInterstitialTime = now;
    
    return true;
  }
  
  createInterstitialModal(trigger) {
    const overlay = document.createElement('div');
    overlay.id = 'yamevi-interstitial-overlay';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center';
    
    const triggerTexts = {
      page_navigation: 'Navegación entre páginas',
      analysis_complete: 'Análisis completado',
      predictions_generated: 'Predicciones generadas',
      manual: 'Manual'
    };
    
    overlay.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <div class="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-6 inline-block">
          Anuncio de prueba
        </div>
        
        <div class="text-6xl mb-4">🎰</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">YA ME VI</h3>
        <p class="text-gray-600 mb-6">
          Anuncio intersticial de demostración<br>
          <span class="text-sm text-gray-500">Trigger: ${triggerTexts[trigger]}</span>
        </p>
        
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-6">
          <div class="font-bold mb-1">¿Cansado de anuncios?</div>
          <div class="text-sm opacity-90">Obtén Premium gratis viendo un video</div>
        </div>
        
        <div class="flex gap-3">
          <button onclick="window.yamevi_admob.closeInterstitial()" 
                  class="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors">
            Cerrar
          </button>
          <button onclick="window.yamevi_admob.showRewardedForPremium(); window.yamevi_admob.closeInterstitial();" 
                  class="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Ver Video
          </button>
        </div>
        
        <div class="mt-4 text-xs text-gray-500">
          Se cerrará automáticamente en <span id="countdown">5</span> segundos
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Countdown
    let seconds = 5;
    const countdownEl = document.getElementById('countdown');
    const countdownInterval = setInterval(() => {
      seconds--;
      if (countdownEl) countdownEl.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(countdownInterval);
        this.closeInterstitial();
      }
    }, 1000);
  }
  
  closeInterstitial() {
    const overlay = document.getElementById('yamevi-interstitial-overlay');
    if (overlay) {
      overlay.remove();
      console.log('📺 Intersticial cerrado');
    }
  }
  
  // === ANUNCIOS RECOMPENSADOS ===
  async initializeRewardedAds() {
    console.log('🎁 Inicializando anuncios recompensados...');
    this.adsLoaded.rewarded = true;
    
    console.log(`🎁 Recompensado ID: ${ADMOB_DEMO_UNITS.video_recompensado}`);
  }
  
  showRewardedAd(rewardType = 'premium_access') {
    if (!this.adsLoaded.rewarded) return false;
    
    console.log(`🎁 Mostrando anuncio recompensado - recompensa: ${rewardType}`);
    this.createRewardedModal(rewardType);
    
    return true;
  }
  
  showRewardedForPremium() {
    this.showRewardedAd('premium_access');
  }
  
  createRewardedModal(rewardType) {
    const overlay = document.createElement('div');
    overlay.id = 'yamevi-rewarded-overlay';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center';
    
    const rewardConfigs = {
      premium_access: {
        title: '👑 Acceso Premium 24h',
        description: 'Sin anuncios, predicciones ilimitadas, estadísticas avanzadas',
        icon: '👑',
        color: 'from-yellow-400 to-orange-500'
      },
      extra_combinations: {
        title: '🎯 3 Combinaciones Extra',
        description: 'Predicciones adicionales con IA avanzada',
        icon: '🎯',
        color: 'from-green-400 to-blue-500'
      },
      detailed_analysis: {
        title: '📊 Análisis Detallado',
        description: 'Estadísticas profundas de 18 meses',
        icon: '📊',
        color: 'from-purple-400 to-pink-500'
      },
      remove_ads: {
        title: '🚫 Quitar Anuncios 2h',
        description: 'Experiencia sin interrupciones',
        icon: '🚫',
        color: 'from-red-400 to-purple-500'
      }
    };
    
    const config = rewardConfigs[rewardType] || rewardConfigs.premium_access;
    
    overlay.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <div class="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-6 inline-block">
          Anuncio de prueba
        </div>
        
        <div class="text-6xl mb-4">${config.icon}</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">¡Recompensa Disponible!</h3>
        <p class="text-gray-600 mb-6">Ve un video corto para obtener:</p>
        
        <div class="bg-gradient-to-r ${config.color} text-white p-6 rounded-xl mb-6 shadow-lg">
          <div class="font-bold text-lg mb-2">${config.title}</div>
          <div class="text-sm opacity-90">${config.description}</div>
        </div>
        
        <div class="flex gap-3">
          <button onclick="window.yamevi_admob.closeRewarded(false)" 
                  class="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors">
            Cancelar
          </button>
          <button onclick="window.yamevi_admob.closeRewarded(true, '${rewardType}')" 
                  class="flex-1 bg-gradient-to-r ${config.color} text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Ver Video
          </button>
        </div>
        
        <div class="mt-4 text-xs text-gray-500">
          📱 Video de 15-30 segundos
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }
  
  closeRewarded(completed = false, rewardType = '') {
    const overlay = document.getElementById('yamevi-rewarded-overlay');
    if (overlay) {
      overlay.remove();
      
      if (completed) {
        this.grantReward(rewardType);
      }
      
      console.log(`🎁 Anuncio recompensado ${completed ? 'completado' : 'cancelado'}`);
    }
  }
  
  // === SISTEMA DE RECOMPENSAS ===
  grantReward(rewardType) {
    console.log(`🏆 Otorgando recompensa: ${rewardType}`);
    
    switch (rewardType) {
      case 'premium_access':
        this.activatePremium(24); // 24 horas
        break;
      case 'extra_combinations':
        this.addExtraCombinations(3);
        break;
      case 'detailed_analysis':
        this.unlockDetailedAnalysis();
        break;
      case 'remove_ads':
        this.removeAdsTemporary(2); // 2 horas
        break;
    }
    
    this.showRewardNotification(rewardType);
    this.updatePremiumStatus();
  }
  
  activatePremium(hours = 24) {
    const until = Date.now() + (hours * 60 * 60 * 1000);
    localStorage.setItem('yamevi_premium_until', until.toString());
    console.log(`👑 Premium activado por ${hours} horas`);
    
    // Ocultar banner si está visible
    this.hideBanner();
  }
  
  addExtraCombinations(count = 3) {
    const current = parseInt(localStorage.getItem('yamevi_extra_combinations') || '0');
    localStorage.setItem('yamevi_extra_combinations', (current + count).toString());
    console.log(`🎯 ${count} combinaciones extra agregadas (total: ${current + count})`);
  }
  
  unlockDetailedAnalysis() {
    const until = Date.now() + (24 * 60 * 60 * 1000); // 24 horas
    localStorage.setItem('yamevi_detailed_analysis_until', until.toString());
    console.log('📊 Análisis detallado desbloqueado por 24 horas');
  }
  
  removeAdsTemporary(hours = 2) {
    const until = Date.now() + (hours * 60 * 60 * 1000);
    localStorage.setItem('yamevi_no_ads_until', until.toString());
    console.log(`🚫 Anuncios removidos por ${hours} horas`);
    
    this.hideBanner();
  }
  
  showRewardNotification(rewardType) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-xl z-[10000] transform translate-x-full transition-all duration-500 shadow-2xl';
    
    const messages = {
      premium_access: '👑 ¡Premium Activado por 24h!',
      extra_combinations: '🎯 ¡3 Combinaciones Extra!',
      detailed_analysis: '📊 ¡Análisis Detallado Desbloqueado!',
      remove_ads: '🚫 ¡Anuncios Removidos por 2h!'
    };
    
    notification.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="text-3xl">🎉</div>
        <div>
          <div class="font-bold text-lg">¡Recompensa Obtenida!</div>
          <div class="text-sm opacity-90">${messages[rewardType] || 'Recompensa especial'}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remover
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 500);
    }, 4000);
  }
  
  // === ANUNCIOS NATIVOS ===
  async initializeNativeAds() {
    console.log('📰 Inicializando anuncios nativos...');
    this.adsLoaded.native = true;
    
    console.log(`📰 Nativo ID: ${ADMOB_DEMO_UNITS.nativo}`);
  }
  
  // === ANUNCIOS DE INICIO DE APLICACIÓN ===
  async initializeAppOpenAds() {
    console.log('🚀 Inicializando anuncios de inicio de aplicación...');
    this.adsLoaded.appOpen = true;
    
    console.log(`🚀 App Open ID: ${ADMOB_DEMO_UNITS.app_open}`);
  }
  
  // === EVENTOS ESPECÍFICOS DE YA ME VI ===
  setupLotterySpecificEvents() {
    console.log('🎰 Configurando eventos específicos de lotería...');
    
    // Eventos personalizados para YA ME VI
    this.trackLotteryInteraction = (type, details = {}) => {
      this.interactionCount++;
      console.log(`🎰 Interacción lotería: ${type}`, details);
      
      // Lógica específica para mostrar anuncios según el contexto
      switch (type) {
        case 'analysis_requested':
          if (this.interactionCount % 3 === 0) {
            this.showInterstitial('analysis_complete');
          }
          break;
        case 'predictions_viewed':
          if (this.interactionCount % 4 === 0) {
            this.showInterstitial('predictions_generated');
          }
          break;
        case 'combination_evaluated':
          if (this.interactionCount % 5 === 0) {
            this.showInterstitial('page_navigation');
          }
          break;
      }
    };
  }
  
  // === UTILIDADES DE ESTADO ===
  checkPremiumStatus() {
    const premiumUntil = parseInt(localStorage.getItem('yamevi_premium_until') || '0');
    const noAdsUntil = parseInt(localStorage.getItem('yamevi_no_ads_until') || '0');
    const now = Date.now();
    
    return {
      active: now < premiumUntil || now < noAdsUntil,
      premiumUntil: premiumUntil,
      noAdsUntil: noAdsUntil,
      isPremium: now < premiumUntil,
      isAdFree: now < noAdsUntil
    };
  }
  
  updatePremiumStatus() {
    this.premiumStatus = this.checkPremiumStatus();
    
    if (this.premiumStatus.active) {
      this.hideBanner();
    } else if (this.initialized) {
      this.showBanner();
    }
  }
  
  getExtraCombinations() {
    return parseInt(localStorage.getItem('yamevi_extra_combinations') || '0');
  }
  
  useExtraCombination() {
    const current = this.getExtraCombinations();
    if (current > 0) {
      localStorage.setItem('yamevi_extra_combinations', (current - 1).toString());
      return true;
    }
    return false;
  }
  
  // === API PÚBLICA ===
  isDetailedAnalysisUnlocked() {
    const until = parseInt(localStorage.getItem('yamevi_detailed_analysis_until') || '0');
    return Date.now() < until;
  }
  
  // === DEBUGGING Y MÉTRICAS ===
  getAdStatus() {
    return {
      initialized: this.initialized,
      adsLoaded: this.adsLoaded,
      premiumStatus: this.premiumStatus,
      interactionCount: this.interactionCount,
      extraCombinations: this.getExtraCombinations(),
      detailedAnalysisUnlocked: this.isDetailedAnalysisUnlocked()
    };
  }
}

// === INICIALIZACIÓN GLOBAL ===
window.yamevi_admob = new YaMeViAdMobManager();

// === INICIALIZACIÓN AUTOMÁTICA ===
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 Inicializando AdMob para YA ME VI...');
  
  // Verificar estado premium periódicamente
  setInterval(() => {
    window.yamevi_admob.updatePremiumStatus();
  }, 60000); // Cada minuto
  
  // Inicializar después de que la página cargue
  setTimeout(() => {
    window.yamevi_admob.initialize();
  }, 1500);
});

// === EXPORTACIONES ===
export default YaMeViAdMobManager;
export { ADMOB_DEMO_UNITS, TEST_DEVICE_CONFIG, AD_STRATEGY };

console.log('🎰 YA ME VI AdMob Manager cargado con unidades de demostración');
console.log('📱 Listo para pruebas seguras sin riesgo de tráfico inválido');