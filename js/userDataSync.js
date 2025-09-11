/**
 * Usuario Data Sync - Sincroniza usuarios conocidos en la base de datos
 * Asegura que el panel de administración tenga datos para mostrar
 */

export class UserDataSync {
  
  constructor(db, currentUser) {
    this.db = db;
    this.currentUser = currentUser;
  }

  /**
   * Sincroniza usuarios conocidos en la base de datos
   * @returns {Promise<Object>} Resultado de la sincronización
   */
  async syncKnownUsers() {
    if (!this.db || !this.currentUser) {
      throw new Error('Base de datos o usuario no disponible');
    }

    console.log('🔄 Iniciando sincronización de usuarios conocidos...');

    try {
      const { collection, getDocs, doc, setDoc, addDoc, serverTimestamp } = 
        await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      // Obtener usuarios existentes
      const existingUsersSnapshot = await getDocs(collection(this.db, 'users'));
      const existingEmails = new Set();
      
      existingUsersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.email) {
          existingEmails.add(data.email.toLowerCase());
        }
      });

      console.log(`📊 Usuarios existentes: ${existingEmails.size}`);

      // Lista de usuarios conocidos para sincronizar
      const knownUsers = [
        { email: 'gfigueroa.w@gmail.com', displayName: 'Guillermo Figueroa W', isAdmin: true },
        { email: 'eugenfw@gmail.com', displayName: 'Eugen FW', isAdmin: true },
        { email: 'admin@yamevi.com.mx', displayName: 'Admin YA ME VI', isAdmin: true },
        { email: 'guillermo.figueroaw@totalplay.com.mx', displayName: 'Guillermo Figueroa (Totalplay)', isAdmin: true },
        { email: 'juanhumbertogarciescenc@gmail.com', displayName: 'Juan Humberto Garcia' },
        { email: 'guillermo@hotmail.com', displayName: 'Guillermo' },
        { email: 'jgemez.20@gmail.com', displayName: 'J Gemez' },
        { email: 'xfuba@hotmail.com', displayName: 'Xfuba' },
        { email: 'catvram@gmail.com', displayName: 'Catvram' },
        { email: 'radazzndz2013@gmail.com', displayName: 'Radazzndz' },
        { email: 'radulform2010@hotmail.com', displayName: 'Radulform' },
        { email: 'yhonatán.alvarez@gutla.com', displayName: 'Yhonatán Alvarez' },
        { email: 'ramiro@hotmail.com', displayName: 'Ramiro' }
      ];

      let syncedCount = 0;
      let updatedCount = 0;

      for (const userData of knownUsers) {
        const emailLower = userData.email.toLowerCase();
        
        if (!existingEmails.has(emailLower)) {
          try {
            // Crear nuevo usuario
            const docRef = await addDoc(collection(this.db, 'users'), {
              email: userData.email,
              displayName: userData.displayName,
              isAdmin: userData.isAdmin || false,
              adminLevel: userData.isAdmin ? 'admin' : 'user',
              fechaRegistro: new Date().toISOString(),
              ultimoAcceso: new Date().toISOString(),
              createdAt: serverTimestamp(),
              syncedFromKnownUsers: true,
              syncDate: new Date().toISOString(),
              lastDeviceType: 'unknown',
              registrationSource: 'admin_sync'
            });
            
            syncedCount++;
            console.log(`✅ Usuario sincronizado: ${userData.email} (ID: ${docRef.id})`);
            
          } catch (error) {
            console.warn(`⚠️ Error sincronizando ${userData.email}:`, error.code, error.message);
          }
        } else {
          // Usuario existe, verificar si necesita actualización
          try {
            const userQuery = await getDocs(collection(this.db, 'users'));
            for (const userDoc of userQuery.docs) {
              const data = userDoc.data();
              if (data.email && data.email.toLowerCase() === emailLower) {
                // Actualizar campos faltantes
                const updates = {};
                let needsUpdate = false;

                if (!data.displayName && userData.displayName) {
                  updates.displayName = userData.displayName;
                  needsUpdate = true;
                }

                if (userData.isAdmin && !data.isAdmin) {
                  updates.isAdmin = true;
                  updates.adminLevel = 'admin';
                  needsUpdate = true;
                }

                if (!data.fechaRegistro) {
                  updates.fechaRegistro = new Date().toISOString();
                  needsUpdate = true;
                }

                if (!data.ultimoAcceso) {
                  updates.ultimoAcceso = new Date().toISOString();
                  needsUpdate = true;
                }

                if (needsUpdate) {
                  await setDoc(doc(this.db, 'users', userDoc.id), updates, { merge: true });
                  updatedCount++;
                  console.log(`🔄 Usuario actualizado: ${userData.email}`);
                }
                break;
              }
            }
          } catch (updateError) {
            console.warn(`⚠️ Error actualizando ${userData.email}:`, updateError.message);
          }
        }
      }

      const result = {
        syncedCount,
        updatedCount,
        totalKnown: knownUsers.length,
        existingCount: existingEmails.size
      };

      console.log('✅ Sincronización completada:', result);
      return result;

    } catch (error) {
      console.error('❌ Error en sincronización de usuarios:', error);
      throw error;
    }
  }

  /**
   * Verifica la consistencia de los datos de usuarios
   * @returns {Promise<Object>} Reporte de consistencia
   */
  async checkDataConsistency() {
    try {
      const { collection, getDocs } = 
        await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      const usersSnapshot = await getDocs(collection(this.db, 'users'));
      
      let totalUsers = 0;
      let usersWithEmail = 0;
      let usersWithDisplayName = 0;
      let adminUsers = 0;
      let usersWithDates = 0;
      const missingFields = [];

      usersSnapshot.forEach(doc => {
        const data = doc.data();
        totalUsers++;

        if (data.email) usersWithEmail++;
        if (data.displayName) usersWithDisplayName++;
        if (data.isAdmin) adminUsers++;
        if (data.fechaRegistro || data.createdAt) usersWithDates++;

        // Verificar campos faltantes
        const missing = [];
        if (!data.email) missing.push('email');
        if (!data.displayName) missing.push('displayName');
        if (!data.fechaRegistro && !data.createdAt) missing.push('fechaRegistro/createdAt');

        if (missing.length > 0) {
          missingFields.push({
            id: doc.id,
            missing: missing
          });
        }
      });

      const report = {
        totalUsers,
        usersWithEmail,
        usersWithDisplayName,
        adminUsers,
        usersWithDates,
        missingFieldsCount: missingFields.length,
        missingFields,
        consistency: {
          emailPercentage: Math.round((usersWithEmail / totalUsers) * 100),
          displayNamePercentage: Math.round((usersWithDisplayName / totalUsers) * 100),
          datesPercentage: Math.round((usersWithDates / totalUsers) * 100)
        }
      };

      console.log('📊 Reporte de consistencia:', report);
      return report;

    } catch (error) {
      console.error('❌ Error verificando consistencia:', error);
      throw error;
    }
  }

  /**
   * Ejecuta sincronización completa (sync + consistencia)
   * @returns {Promise<Object>} Resultado completo
   */
  async fullSync() {
    try {
      console.log('🚀 Iniciando sincronización completa...');

      const syncResult = await this.syncKnownUsers();
      const consistencyReport = await this.checkDataConsistency();

      const fullResult = {
        sync: syncResult,
        consistency: consistencyReport,
        timestamp: new Date().toISOString()
      };

      console.log('✅ Sincronización completa finalizada:', fullResult);
      return fullResult;

    } catch (error) {
      console.error('❌ Error en sincronización completa:', error);
      throw error;
    }
  }
}

// Función global para ejecutar sincronización desde admin panel
window.syncUserData = async function() {
  if (!window.db || !window.currentUser) {
    alert('❌ Base de datos o usuario no disponible');
    return;
  }

  try {
    const userSync = new UserDataSync(window.db, window.currentUser);
    const result = await userSync.fullSync();
    
    alert(`✅ Sincronización completada:
- ${result.sync.syncedCount} usuarios nuevos
- ${result.sync.updatedCount} usuarios actualizados  
- ${result.consistency.totalUsers} usuarios total
- ${result.consistency.consistency.emailPercentage}% tienen email`);

    // Recargar datos después de sincronización
    if (window.loadUsers) {
      await window.loadUsers();
    }

  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    alert(`❌ Error en sincronización: ${error.message}`);
  }
};