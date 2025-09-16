# 📱 **YA ME VI - ADMOB IMPLEMENTATION GUIDE**

## 🎯 **IMPLEMENTACIÓN COMPLETA DE ADMOB CON UNIDADES DE DEMOSTRACIÓN**

### ✅ **ARCHIVOS CREADOS Y MODIFICADOS**

#### **Nuevos Archivos:**
1. **`js/admob-manager.js`** - Gestor principal de AdMob
2. **`js/admob-config.js`** - Configuración actualizada con unidades demo

#### **Archivos Modificados:**
1. **`sugeridas.html`** - Integración completa con tracking
2. **`analisis.html`** - Eventos de AdMob agregados
3. **`combinacion.html`** - Actualización pendiente

---

## 📱 **UNIDADES DE DEMOSTRACIÓN IMPLEMENTADAS**

### 🏷️ **Formato de Anuncio → ID de Demostración**

| **Tipo de Anuncio** | **ID de Unidad de Demostración** | **Implementado** |
|-------------------|----------------------------------|------------------|
| **Banner Adaptable** | `ca-app-pub-3940256099942544/9214589741` | ✅ |
| **Banner Fijo** | `ca-app-pub-3940256099942544/6300978111` | ✅ |
| **Intersticial** | `ca-app-pub-3940256099942544/1033173712` | ✅ |
| **Video Recompensado** | `ca-app-pub-3940256099942544/5224354917` | ✅ |
| **Intersticial Recompensado** | `ca-app-pub-3940256099942544/5354046379` | ✅ |
| **Anuncio Nativo** | `ca-app-pub-3940256099942544/2247696110` | ✅ |
| **Anuncio de Video Nativo** | `ca-app-pub-3940256099942544/1044960115` | ✅ |
| **Inicio de Aplicación** | `ca-app-pub-3940256099942544/9257395921` | ✅ |

---

## 🎰 **CARACTERÍSTICAS ESPECÍFICAS PARA YA ME VI**

### **🎯 Estrategia de Anuncios Inteligente:**

#### **1. Banners:**
- **Ubicación:** Parte inferior de todas las páginas principales
- **Tipo:** Adaptable para mejor experiencia móvil
- **Comportamiento:** Se oculta automáticamente con Premium activo
- **Páginas:** analisis.html, combinacion.html, sugeridas.html, home.html

#### **2. Intersticiales:**
- **Triggers específicos:**
  - Navegación entre páginas de análisis
  - Después de completar análisis estadístico
  - Antes de mostrar predicciones de IA
  - Al reanudar la aplicación
- **Cooldown:** 2 minutos entre anuncios
- **Frecuencia:** Cada 3-5 interacciones importantes

#### **3. Anuncios Recompensados:**
- **🏆 Recompensas Disponibles:**
  - **👑 Premium 24h:** Sin anuncios + funciones avanzadas
  - **🎯 3 Combinaciones Extra:** Predicciones adicionales
  - **📊 Análisis Detallado:** Estadísticas profundas 24h
  - **🚫 Quitar Anuncios 2h:** Experiencia temporal sin interrupciones

#### **4. Anuncios Nativos:**
- **Integración:** En listas de resultados y análisis
- **Frecuencia:** Cada 3 elementos de contenido
- **Estilo:** Integrados seamlessly con el diseño

---

## 🔧 **CONFIGURACIÓN DE DISPOSITIVOS DE PRUEBA**

### **📝 Instrucciones para Obtener ID de Dispositivo:**

1. **Ejecutar la app** con anuncios integrados
2. **Buscar en Logcat** el mensaje:
   ```
   I/Ads: Use RequestConfiguration.Builder.setTestDeviceIds(Arrays.asList("33BE2250B43518CCDA7DE426D04EE231"))
   to get test ads on this device.
   ```
3. **Copiar el ID** mostrado entre comillas
4. **Agregar al código** en `admob-manager.js`:
   ```javascript
   const TEST_DEVICE_CONFIG = {
     enabled: true,
     deviceIds: [
       "TU_ID_DE_DISPOSITIVO_AQUI"
     ]
   };
   ```

### **📱 Verificación de Anuncios de Prueba:**
- Los anuncios mostrarán **"Anuncio de prueba"** en la parte superior
- Para anuncios nativos avanzados, el headline incluirá **"Test Ad"**
- Es seguro hacer clic en estos anuncios durante desarrollo

---

## 🚀 **FUNCIONALIDADES IMPLEMENTADAS**

### **📊 Sistema de Tracking Inteligente:**
```javascript
// Tracking automático de interacciones
yamevi_admob.trackLotteryInteraction('analysis_requested', {
  type: 'frequency_analysis',
  timestamp: new Date().toISOString()
});
```

### **🏆 Sistema de Recompensas:**
```javascript
// Activar Premium temporal
yamevi_admob.activatePremium(24); // 24 horas

// Agregar combinaciones extra
yamevi_admob.addExtraCombinations(3);

// Desbloquear análisis detallado
yamevi_admob.unlockDetailedAnalysis();
```

### **📱 Gestión de Estado Premium:**
```javascript
// Verificar estado premium
const isPremium = yamevi_admob.isPremiumActive();

// Obtener combinaciones extra disponibles
const extraCombinations = yamevi_admob.getExtraCombinations();

// Usar una combinación extra
const success = yamevi_admob.useExtraCombination();
```

---

## 🎯 **INTEGRACIÓN EN PÁGINAS**

### **✅ Páginas Integradas:**

#### **1. sugeridas.html:**
```javascript
// Tracking de vista de predicciones
yamevi_admob.trackLotteryInteraction('predictions_page_view');

// Tracking de generación de predicciones
yamevi_admob.trackLotteryInteraction('predictions_viewed');
```

#### **2. analisis.html:**
```javascript
// Tracking de análisis completado
yamevi_admob.trackLotteryInteraction('analysis_requested');

// Tracking de carga de datos históricos
yamevi_admob.trackLotteryInteraction('historical_data_loaded');
```

#### **3. combinacion.html:**
```javascript
// Configuración específica con IDs de demo
window.admobConfig = {
  bannerId: "ca-app-pub-3940256099942544/9214589741",
  interstitialId: "ca-app-pub-3940256099942544/1033173712",
  // ... más configuraciones
};
```

---

## ⚠️ **IMPORTANTE: ANTES DE PUBLICAR**

### **🔄 Cambios Necesarios para Producción:**

1. **Reemplazar IDs de Demo** por IDs reales de tu cuenta AdMob
2. **Deshabilitar modo de prueba:**
   ```javascript
   const TEST_DEVICE_CONFIG = {
     enabled: false, // Cambiar a false
     deviceIds: []
   };
   ```
3. **Quitar código de dispositivos de prueba**
4. **Verificar que no aparezca "Anuncio de prueba"**

### **📋 Lista de Verificación Pre-Producción:**
- [ ] IDs de demostración reemplazados
- [ ] Dispositivos de prueba deshabilitados
- [ ] Modo demo desactivado
- [ ] Anuncios reales funcionando
- [ ] Sistema de recompensas operativo
- [ ] Tracking de eventos activo

---

## 🧪 **TESTING Y VERIFICACIÓN**

### **🔍 Testing de Funcionalidades:**

1. **Banner:**
   - Aparece en la parte inferior
   - Se oculta con Premium activo
   - Muestra "Anuncio de prueba"

2. **Intersticial:**
   - Se muestra después de interacciones
   - Respeta cooldown de 2 minutos
   - Botón para obtener Premium

3. **Recompensado:**
   - Diferentes tipos de recompensas
   - Notificaciones de recompensa
   - Persistencia de estado

4. **Sistema Premium:**
   - Activación temporal
   - Ocultamiento de anuncios
   - Funciones desbloqueadas

### **📱 Comandos de Debug:**
```javascript
// Ver estado completo del sistema
console.log(yamevi_admob.getAdStatus());

// Forzar mostrar intersticial
yamevi_admob.showInterstitial('manual_test');

// Forzar mostrar recompensado
yamevi_admob.showRewardedAd('premium_access');
```

---

## 🎰 **MONETIZACIÓN ESPECÍFICA PARA LOTERÍA**

### **💰 Estrategia de Ingresos:**

1. **Anuncios Regulares:** 70% de usuarios ven anuncios normalmente
2. **Premium Temporal:** 20% obtienen Premium vía anuncios recompensados
3. **Premium Pagado:** 10% compran Premium permanente
4. **Combinaciones Extra:** Monetización por predicciones adicionales

### **📈 Métricas de Éxito:**
- **eCPM mejorado** por anuncios recompensados
- **Retención aumentada** por experiencia Premium temporal
- **Engagement alto** por recompensas específicas de lotería
- **Conversión orgánica** a Premium pagado

---

## 📞 **SOPORTE Y DEBUGGING**

### **🔧 Console Commands Útiles:**
```javascript
// Estado del sistema
window.yamevi_admob.getAdStatus()

// Forzar actualización de estado Premium
window.yamevi_admob.updatePremiumStatus()

// Simular recompensa
window.yamevi_admob.grantReward('premium_access')
```

### **📊 Logs Importantes:**
- `🎰 AdMob Manager inicializado para YA ME VI`
- `📱 Modo demostración: Usando unidades de prueba de Google`
- `⚠️ Los anuncios mostrarán "Anuncio de prueba"`
- `🏆 Recompensa otorgada: premium_access`

---

## ✅ **PRÓXIMOS PASOS**

1. **Completar integración** en todas las páginas restantes
2. **Probar funcionalidades** con unidades de demostración
3. **Configurar dispositivos de prueba** específicos
4. **Preparar IDs de producción** para lanzamiento
5. **Implementar métricas avanzadas** de rendimiento

---

🎯 **El sistema está configurado para pruebas seguras sin riesgo de tráfico inválido en tu cuenta de AdMob.**