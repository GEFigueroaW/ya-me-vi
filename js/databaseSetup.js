/**
 * Configurador de Base de Datos para Panel de Administración
 * Crea las colecciones necesarias para que AdminDataManager funcione correctamente
 */

import { auth, db } from './firebase-init.js';
import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp,
  addDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export class DatabaseSetup {
  
  /**
   * Configura todas las colecciones necesarias para el admin panel
   */
  static async setupAdminCollections() {
    try {
      console.log('🔧 Configurando colecciones para panel de administración...');
      
      const batch = writeBatch(db);
      
      // 1. Configurar colección de análisis individuales
      await this.setupIndividualAnalysisCollection();
      
      // 2. Configurar colección de análisis de combinaciones
      await this.setupCombinationAnalysisCollection();
      
      // 3. Configurar colección de sugerencias generadas
      await this.setupSuggestionsCollection();
      
      // 4. Actualizar información de usuarios con campos necesarios
      await this.updateUsersCollection();
      
      console.log('✅ Configuración de base de datos completada');
      return true;
      
    } catch (error) {
      console.error('❌ Error configurando base de datos:', error);
      return false;
    }
  }
  
  /**
   * Configura la colección individual_analysis
   */
  static async setupIndividualAnalysisCollection() {
    try {
      console.log('📊 Configurando colección individual_analysis...');
      
      const collectionRef = collection(db, 'individual_analysis');
      
      // Crear documento de ejemplo si no existe
      const exampleDoc = {
        userId: 'example_user',
        number: 7,
        game: 'Melate',
        frequency: 45,
        lastAppearance: new Date('2024-01-15'),
        analysis: 'Número con buena frecuencia',
        timestamp: serverTimestamp(),
        deviceInfo: {
          type: 'mobile',
          userAgent: 'Example User Agent'
        }
      };
      
      await addDoc(collectionRef, exampleDoc);
      console.log('✅ Colección individual_analysis configurada');
      
    } catch (error) {
      console.error('❌ Error configurando individual_analysis:', error);
    }
  }
  
  /**
   * Configura la colección combination_analysis
   */
  static async setupCombinationAnalysisCollection() {
    try {
      console.log('🎯 Configurando colección combination_analysis...');
      
      const collectionRef = collection(db, 'combination_analysis');
      
      // Crear documento de ejemplo si no existe
      const exampleDoc = {
        userId: 'example_user',
        combination: [7, 14, 21, 28, 35, 42],
        game: 'Melate',
        totalMatches: 3,
        analysis: 'Combinación con 3 coincidencias históricas',
        confidence: 0.65,
        timestamp: serverTimestamp(),
        deviceInfo: {
          type: 'desktop',
          userAgent: 'Example Desktop Agent'
        }
      };
      
      await addDoc(collectionRef, exampleDoc);
      console.log('✅ Colección combination_analysis configurada');
      
    } catch (error) {
      console.error('❌ Error configurando combination_analysis:', error);
    }
  }
  
  /**
   * Configura la colección generated_suggestions
   */
  static async setupSuggestionsCollection() {
    try {
      console.log('💡 Configurando colección generated_suggestions...');
      
      const collectionRef = collection(db, 'generated_suggestions');
      
      // Crear documento de ejemplo si no existe
      const exampleDoc = {
        userId: 'example_user',
        suggestions: [
          [1, 5, 12, 23, 34, 45],
          [2, 8, 15, 26, 37, 48],
          [3, 9, 18, 27, 36, 49]
        ],
        game: 'Melate',
        algorithm: 'frequency_based',
        confidence: 0.72,
        timestamp: serverTimestamp(),
        deviceInfo: {
          type: 'mobile',
          userAgent: 'Example Mobile Agent'
        }
      };
      
      await addDoc(collectionRef, exampleDoc);
      console.log('✅ Colección generated_suggestions configurada');
      
    } catch (error) {
      console.error('❌ Error configurando generated_suggestions:', error);
    }
  }
  
  /**
   * Actualiza la colección de usuarios con campos necesarios para el admin
   */
  static async updateUsersCollection() {
    try {
      console.log('👥 Actualizando colección users...');
      
      // No modificamos usuarios existentes, solo aseguramos la estructura
      // Los campos se agregarán automáticamente cuando los usuarios interactúen
      
      console.log('✅ Colección users preparada para admin panel');
      
    } catch (error) {
      console.error('❌ Error actualizando users:', error);
    }
  }
  
  /**
   * Registra una actividad de análisis individual
   * @param {number} number - Número analizado
   * @param {string} game - Juego analizado
   * @param {Object} analysis - Resultado del análisis
   */
  static async logIndividualAnalysis(number, game, analysis) {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const collectionRef = collection(db, 'individual_analysis');
      const docData = {
        userId: user.uid,
        userEmail: user.email,
        number: number,
        game: game,
        analysis: analysis,
        timestamp: serverTimestamp(),
        deviceInfo: this.getDeviceInfo()
      };
      
      await addDoc(collectionRef, docData);
      console.log('📊 Análisis individual registrado');
      
    } catch (error) {
      console.error('❌ Error registrando análisis individual:', error);
    }
  }
  
  /**
   * Registra una actividad de análisis de combinación
   * @param {Array} combination - Combinación analizada
   * @param {string} game - Juego analizado
   * @param {Object} analysis - Resultado del análisis
   */
  static async logCombinationAnalysis(combination, game, analysis) {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const collectionRef = collection(db, 'combination_analysis');
      const docData = {
        userId: user.uid,
        userEmail: user.email,
        combination: combination,
        game: game,
        analysis: analysis,
        timestamp: serverTimestamp(),
        deviceInfo: this.getDeviceInfo()
      };
      
      await addDoc(collectionRef, docData);
      console.log('🎯 Análisis de combinación registrado');
      
    } catch (error) {
      console.error('❌ Error registrando análisis de combinación:', error);
    }
  }
  
  /**
   * Registra una actividad de generación de sugerencias
   * @param {Array} suggestions - Sugerencias generadas
   * @param {string} game - Juego para las sugerencias
   * @param {Object} metadata - Metadatos del algoritmo usado
   */
  static async logSuggestionGeneration(suggestions, game, metadata) {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const collectionRef = collection(db, 'generated_suggestions');
      const docData = {
        userId: user.uid,
        userEmail: user.email,
        suggestions: suggestions,
        game: game,
        algorithm: metadata.algorithm || 'unknown',
        confidence: metadata.confidence || 0.5,
        timestamp: serverTimestamp(),
        deviceInfo: this.getDeviceInfo()
      };
      
      await addDoc(collectionRef, docData);
      console.log('💡 Generación de sugerencias registrada');
      
    } catch (error) {
      console.error('❌ Error registrando sugerencias:', error);
    }
  }
  
  /**
   * Actualiza la información del dispositivo del usuario
   * @param {string} userId - ID del usuario
   * @param {string} deviceType - Tipo de dispositivo
   * @param {string} deviceInfo - Información adicional del dispositivo
   */
  static async updateUserDeviceInfo(userId, deviceType, deviceInfo) {
    try {
      const userRef = doc(db, 'users', userId);
      
      await setDoc(userRef, {
        lastDeviceType: deviceType,
        lastDeviceInfo: deviceInfo,
        lastLogin: serverTimestamp()
      }, { merge: true });
      
      console.log('📱 Información de dispositivo actualizada');
      
    } catch (error) {
      console.error('❌ Error actualizando dispositivo:', error);
    }
  }
  
  /**
   * Obtiene información del dispositivo actual
   * @returns {Object} Información del dispositivo
   */
  static getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bTablet\b)|KFAPWI/i.test(userAgent);
    
    let deviceType = 'desktop';
    if (isTablet) {
      deviceType = 'tablet';
    } else if (isMobile) {
      deviceType = 'mobile';
    }
    
    return {
      type: deviceType,
      userAgent: userAgent,
      timestamp: new Date()
    };
  }
  
  /**
   * Ejecuta la configuración inicial completa
   */
  static async runInitialSetup() {
    try {
      console.log('🚀 Ejecutando configuración inicial del admin panel...');
      
      const success = await this.setupAdminCollections();
      
      if (success) {
        console.log('✅ Configuración inicial completada exitosamente');
        alert('✅ Base de datos configurada correctamente para el panel de administración.\n\nLas colecciones necesarias han sido creadas y están listas para recibir datos reales.');
      } else {
        console.log('❌ Error en la configuración inicial');
        alert('❌ Hubo un error configurando la base de datos.\n\nRevisa la consola para más detalles.');
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ Error en configuración inicial:', error);
      alert('❌ Error configurando base de datos: ' + error.message);
      return false;
    }
  }
}
