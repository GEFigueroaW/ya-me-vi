/**
 * Admin Data Manager - Maneja datos reales desde Firebase para el panel de administración
 * Reemplaza AdminDataSimulator con datos reales de la base de datos
 */

import { auth, db } from './firebase-init.js';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  startAfter,
  getCountFromServer,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export class AdminDataManager {
  
  /**
   * Obtiene estadísticas reales de usuarios
   * @returns {Promise<Object>} Estadísticas de usuarios
   */
  static async getUserStats() {
    try {
      console.log('📊 Obteniendo estadísticas reales de usuarios...');
      
      // Obtener total de usuarios
      const usersRef = collection(db, "users");
      const totalUsersSnapshot = await getCountFromServer(usersRef);
      const totalUsers = totalUsersSnapshot.data().count;
      
      // Obtener usuarios activos (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUsersQuery = query(
        usersRef,
        where("lastLogin", ">=", Timestamp.fromDate(thirtyDaysAgo))
      );
      const activeUsersSnapshot = await getDocs(activeUsersQuery);
      const activeUsers = activeUsersSnapshot.size;
      
      // Obtener usuarios por dispositivo
      const mobileQuery = query(usersRef, where("lastDeviceType", "==", "mobile"));
      const desktopQuery = query(usersRef, where("lastDeviceType", "==", "desktop"));
      
      const mobileSnapshot = await getDocs(mobileQuery);
      const desktopSnapshot = await getDocs(desktopQuery);
      
      const mobileUsers = mobileSnapshot.size;
      const desktopUsers = desktopSnapshot.size;
      const totalDeviceUsers = mobileUsers + desktopUsers;
      
      const mobileRatio = totalDeviceUsers > 0 ? Math.round((mobileUsers / totalDeviceUsers) * 100) : 50;
      const desktopRatio = 100 - mobileRatio;
      
      console.log('✅ Estadísticas de usuarios obtenidas:', {
        totalUsers,
        activeUsers,
        deviceRatio: `${mobileRatio}% / ${desktopRatio}%`
      });
      
      return {
        totalUsers,
        activeUsers,
        deviceRatio: `${mobileRatio}% / ${desktopRatio}%`,
        mobileUsers,
        desktopUsers
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de usuarios:', error);
      // Fallback a datos simulados si hay error
      return {
        totalUsers: 0,
        activeUsers: 0,
        deviceRatio: "-- / --",
        mobileUsers: 0,
        desktopUsers: 0
      };
    }
  }
  
  /**
   * Obtiene estadísticas de consultas/análisis realizados
   * @returns {Promise<Object>} Estadísticas de consultas
   */
  static async getQueryStats() {
    try {
      console.log('🔎 Obteniendo estadísticas de consultas...');
      
      // Contar análisis de números individuales
      const individualAnalysisRef = collection(db, "individual_analysis");
      const individualSnapshot = await getCountFromServer(individualAnalysisRef);
      const individualAnalysis = individualSnapshot.data().count;
      
      // Contar análisis de combinaciones
      const combinationAnalysisRef = collection(db, "combination_analysis");
      const combinationSnapshot = await getCountFromServer(combinationAnalysisRef);
      const combinationAnalysis = combinationSnapshot.data().count;
      
      // Contar sugerencias generadas
      const suggestionsRef = collection(db, "generated_suggestions");
      const suggestionsSnapshot = await getCountFromServer(suggestionsRef);
      const suggestions = suggestionsSnapshot.data().count;
      
      const totalQueries = individualAnalysis + combinationAnalysis + suggestions;
      
      console.log('✅ Estadísticas de consultas obtenidas:', {
        totalQueries,
        individualAnalysis,
        combinationAnalysis,
        suggestions
      });
      
      return {
        totalQueries,
        individualAnalysis,
        combinationAnalysis,
        suggestions
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de consultas:', error);
      return {
        totalQueries: 0,
        individualAnalysis: 0,
        combinationAnalysis: 0,
        suggestions: 0
      };
    }
  }
  
  /**
   * Obtiene información sobre el tamaño de la base de datos
   * @returns {Promise<Object>} Información de la base de datos
   */
  static async getDatabaseStats() {
    try {
      console.log('💾 Obteniendo estadísticas de base de datos...');
      
      // Contar registros en las principales colecciones
      const collections = ['users', 'individual_analysis', 'combination_analysis', 'generated_suggestions'];
      let totalRecords = 0;
      const collectionStats = {};
      
      for (const collectionName of collections) {
        try {
          const collectionRef = collection(db, collectionName);
          const snapshot = await getCountFromServer(collectionRef);
          const count = snapshot.data().count;
          collectionStats[collectionName] = count;
          totalRecords += count;
        } catch (error) {
          console.warn(`⚠️ No se pudo obtener conteo de ${collectionName}:`, error);
          collectionStats[collectionName] = 0;
        }
      }
      
      console.log('✅ Estadísticas de base de datos obtenidas:', {
        totalRecords,
        collectionStats
      });
      
      return {
        totalRecords,
        collectionStats
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de base de datos:', error);
      return {
        totalRecords: 0,
        collectionStats: {}
      };
    }
  }
  
  /**
   * Obtiene la lista de usuarios más recientes
   * @param {number} limit - Número máximo de usuarios a obtener
   * @returns {Promise<Array>} Lista de usuarios recientes
   */
  static async getRecentUsers(limit = 10) {
    try {
      console.log(`👥 Obteniendo últimos ${limit} usuarios...`);
      
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        orderBy("lastLogin", "desc"),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const lastLogin = data.lastLogin ? data.lastLogin.toDate() : new Date();
        
        users.push({
          id: doc.id,
          email: data.email || 'No disponible',
          name: data.displayName || data.name || 'Usuario',
          lastAccess: this.formatDate(lastLogin),
          device: this.getDeviceString(data.lastDeviceType, data.lastDeviceInfo),
          createdAt: data.createdAt ? data.createdAt.toDate() : null,
          isAdmin: data.isAdmin || false
        });
      });
      
      console.log(`✅ ${users.length} usuarios obtenidos`);
      return users;
      
    } catch (error) {
      console.error('❌ Error obteniendo usuarios recientes:', error);
      return [];
    }
  }
  
  /**
   * Obtiene estadísticas de actividad por días
   * @param {number} days - Número de días hacia atrás
   * @returns {Promise<Array>} Datos de actividad por día
   */
  static async getActivityStats(days = 30) {
    try {
      console.log(`📈 Obteniendo estadísticas de actividad de últimos ${days} días...`);
      
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);
      
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("lastLogin", ">=", Timestamp.fromDate(daysAgo)),
        orderBy("lastLogin", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const dailyActivity = {};
      
      // Inicializar todos los días con 0
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dailyActivity[dateKey] = 0;
      }
      
      // Contar actividad por día
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.lastLogin) {
          const loginDate = data.lastLogin.toDate();
          const dateKey = loginDate.toISOString().split('T')[0];
          if (dailyActivity.hasOwnProperty(dateKey)) {
            dailyActivity[dateKey]++;
          }
        }
      });
      
      // Convertir a array ordenado
      const activityArray = Object.entries(dailyActivity)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      console.log(`✅ Estadísticas de actividad obtenidas para ${days} días`);
      return activityArray;
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de actividad:', error);
      return [];
    }
  }
  
  /**
   * Combina todas las estadísticas principales
   * @returns {Promise<Object>} Objeto con todas las estadísticas
   */
  static async getAllStats() {
    try {
      console.log('🚀 Obteniendo todas las estadísticas del admin...');
      
      const [userStats, queryStats, dbStats] = await Promise.all([
        this.getUserStats(),
        this.getQueryStats(),
        this.getDatabaseStats()
      ]);
      
      return {
        activeUsers: userStats.activeUsers,
        totalUsers: userStats.totalUsers,
        totalQueries: queryStats.totalQueries,
        deviceRatio: userStats.deviceRatio,
        dbSize: dbStats.totalRecords,
        breakdown: {
          users: userStats,
          queries: queryStats,
          database: dbStats
        }
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas completas:', error);
      throw error;
    }
  }
  
  /**
   * Formatea una fecha para mostrar
   * @param {Date} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  static formatDate(date) {
    if (!date || !(date instanceof Date)) {
      return 'Nunca';
    }
    
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  }
  
  /**
   * Obtiene todas las estadísticas necesarias para el panel de administración
   * @returns {Promise<Object>} Todas las estadísticas
   */
  static async getAllStats() {
    try {
      console.log('📊 Obteniendo todas las estadísticas...');
      
      const [userStats, queryStats, dbStats] = await Promise.all([
        this.getUserStats(),
        this.getQueryStats(),
        this.getDatabaseStats()
      ]);
      
      const allStats = {
        users: userStats,
        queries: queryStats,
        database: dbStats,
        summary: {
          totalUsers: userStats.totalUsers,
          activeUsers: userStats.activeUsers,
          dailyQueries: queryStats.dailyQueries,
          totalAnalysis: queryStats.totalAnalysis,
          databaseSize: dbStats.totalSize
        },
        loadedAt: new Date()
      };
      
      console.log('✅ Todas las estadísticas obtenidas:', allStats);
      return allStats;
      
    } catch (error) {
      console.error('❌ Error obteniendo todas las estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtiene los usuarios más recientes
   * @param {number} limitCount - Número de usuarios a obtener
   * @returns {Promise<Array>} Lista de usuarios recientes
   */
  static async getRecentUsers(limitCount = 10) {
    try {
      console.log(`👥 Obteniendo ${limitCount} usuarios más recientes...`);
      
      const usersRef = collection(db, "users");
      const recentQuery = query(
        usersRef,
        orderBy("lastLogin", "desc"),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(recentQuery);
      const recentUsers = [];
      
      snapshot.forEach((doc) => {
        const userData = doc.data();
        recentUsers.push({
          id: doc.id,
          email: userData.email,
          lastLogin: userData.lastLogin?.toDate() || null,
          lastDeviceType: userData.lastDeviceType || 'desktop',
          lastDeviceInfo: userData.lastDeviceInfo || 'Desconocido',
          createdAt: userData.createdAt?.toDate() || null
        });
      });
      
      console.log(`✅ ${recentUsers.length} usuarios recientes obtenidos`);
      return recentUsers;
      
    } catch (error) {
      console.error('❌ Error obteniendo usuarios recientes:', error);
      return [];
    }
  }

  /**
   * Carga todos los datos reales necesarios para el panel de administración
   * @returns {Promise<Object>} Todos los datos cargados
   */
  static async loadRealData() {
    try {
      console.log('🔄 Cargando datos reales de administración...');
      
      // Cargar todas las estadísticas en paralelo
      const [userStats, queryStats, dbStats] = await Promise.all([
        this.getUserStats(),
        this.getQueryStats(), 
        this.getDatabaseStats()
      ]);
      
      const completeStats = {
        users: userStats,
        queries: queryStats,
        database: dbStats,
        loadedAt: new Date()
      };
      
      console.log('✅ Datos reales cargados exitosamente:', completeStats);
      return completeStats;
      
    } catch (error) {
      console.error('❌ Error cargando datos reales:', error);
      throw error;
    }
  }

  /**
   * Obtiene string del dispositivo
   * @param {string} deviceType - Tipo de dispositivo
   * @param {string} deviceInfo - Información adicional del dispositivo
   * @returns {string} String del dispositivo
   */
  static getDeviceString(deviceType, deviceInfo) {
    if (!deviceType) return 'Desconocido';
    
    const typeMap = {
      'mobile': '📱 Móvil',
      'desktop': '💻 Escritorio',
      'tablet': '📋 Tablet'
    };
    
    const baseType = typeMap[deviceType] || '❓ Desconocido';
    
    if (deviceInfo) {
      return `${baseType} (${deviceInfo})`;
    }
    
    return baseType;
  }
}
