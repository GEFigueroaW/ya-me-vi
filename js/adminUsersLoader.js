/**
 * Admin Users Loader - Módulo optimizado para cargar usuarios en el panel de administración
 * Resuelve problemas de índices de Firestore y carga de datos de usuarios
 */

export class AdminUsersLoader {
  
  constructor(db, currentUser) {
    this.db = db;
    this.currentUser = currentUser;
    this.isLoading = false;
  }

  /**
   * Carga usuarios con múltiples estrategias fallback
   * @returns {Promise<Array>} Lista de usuarios cargados
   */
  async loadUsersWithFallback() {
    if (this.isLoading) {
      console.warn('⚠️ Carga de usuarios ya en progreso');
      return [];
    }

    this.isLoading = true;
    console.log('📊 === INICIANDO CARGA OPTIMIZADA DE USUARIOS ===');
    console.log('🔑 Usuario actual:', this.currentUser?.email, 'UID:', this.currentUser?.uid);

    try {
      const { collection, getDocs, query, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      
      let snapshot;
      let strategy = 'unknown';

      // === ESTRATEGIA 1: Acceso básico sin ordenamiento ===
      console.log('🎯 Estrategia 1: Acceso básico a colección users...');
      try {
        snapshot = await getDocs(collection(this.db, 'users'));
        strategy = 'basic';
        console.log(`✅ Acceso básico exitoso: ${snapshot.size} documentos`);
      } catch (basicError) {
        console.error('❌ Error en acceso básico:', basicError.code, basicError.message);
        throw basicError;
      }

      // === ESTRATEGIA 2: Intentar ordenamiento optimizado ===
      if (snapshot.size > 0) {
        console.log('🎯 Estrategia 2: Intentando ordenamientos optimizados...');
        
        // Lista de estrategias de ordenamiento a probar
        const orderingStrategies = [
          { field: 'createdAt', desc: true, strategy: 'createdAt_desc' },
          { field: '__name__', desc: true, strategy: '__name___desc' },
          { field: 'ultimoAcceso', desc: true, strategy: 'ultimoAcceso_desc' },
          { field: 'fechaRegistro', desc: true, strategy: 'fechaRegistro_desc' }
        ];

        for (const orderStrategy of orderingStrategies) {
          try {
            console.log(`🔍 Probando ordenamiento por ${orderStrategy.field}...`);
            const direction = orderStrategy.desc ? 'desc' : 'asc';
            const usersQuery = query(
              collection(this.db, 'users'), 
              orderBy(orderStrategy.field, direction), 
              limit(50)
            );
            const orderedSnapshot = await getDocs(usersQuery);
            snapshot = orderedSnapshot;
            strategy = orderStrategy.strategy;
            console.log(`✅ Ordenamiento por ${orderStrategy.field} exitoso: ${snapshot.size} documentos`);
            break;
          } catch (orderError) {
            console.warn(`⚠️ Error ordenando por ${orderStrategy.field}:`, orderError.message);
          }
        }
      }

      const userCount = snapshot.size;
      console.log(`📊 Total usuarios obtenidos: ${userCount} (estrategia: ${strategy})`);

      // Convertir snapshot a array de usuarios
      const usersArray = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const userData = {
          id: doc.id,
          email: data.email || 'Sin email',
          displayName: data.displayName || data.name || 'Usuario',
          isAdmin: data.isAdmin === true,
          // Priorizar diferentes campos de fecha para ordenamiento manual
          timestamp: this.extractBestTimestamp(data),
          rawData: data
        };
        usersArray.push(userData);
      });

      // === Ordenamiento manual si es necesario ===
      if (strategy === 'basic') {
        usersArray.sort((a, b) => {
          const timeA = this.normalizeTimestamp(a.timestamp);
          const timeB = this.normalizeTimestamp(b.timestamp);
          return timeB.getTime() - timeA.getTime(); // Más recientes primero
        });
        console.log('🔄 Usuarios ordenados manualmente por timestamp');
        strategy = 'basic_manual_sort';
      }

      console.log(`✅ USUARIOS PROCESADOS: ${usersArray.length} usuarios con estrategia ${strategy}`);
      
      this.isLoading = false;
      return {
        users: usersArray.slice(0, 50), // Limitar a 50 usuarios
        totalCount: userCount,
        strategy: strategy
      };

    } catch (error) {
      this.isLoading = false;
      console.error('❌ Error en carga de usuarios:', error);
      throw error;
    }
  }

  /**
   * Extrae el mejor timestamp disponible de los datos del usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Date|string} Mejor timestamp encontrado
   */
  extractBestTimestamp(userData) {
    // Prioridad: createdAt (Firestore timestamp) > fechaRegistro > ultimoAcceso > fecha actual
    if (userData.createdAt) {
      return userData.createdAt;
    }
    if (userData.fechaRegistro) {
      return userData.fechaRegistro;
    }
    if (userData.ultimoAcceso) {
      return userData.ultimoAcceso;
    }
    // Fallback a fecha actual
    return new Date();
  }

  /**
   * Normaliza diferentes tipos de timestamp a Date
   * @param {*} timestamp - Timestamp en cualquier formato
   * @returns {Date} Fecha normalizada
   */
  normalizeTimestamp(timestamp) {
    try {
      if (!timestamp) {
        return new Date();
      }
      
      // Firestore Timestamp
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      
      // Ya es Date
      if (timestamp instanceof Date) {
        return timestamp;
      }
      
      // String ISO o timestamp numérico
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return new Date(); // Fallback a fecha actual
      }
      
      return date;
    } catch (error) {
      console.warn('⚠️ Error normalizando timestamp:', error.message);
      return new Date();
    }
  }

  /**
   * Formatea una fecha para mostrar en la UI
   * @param {Date} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatDate(date) {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'N/A';
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
    } catch (error) {
      console.warn('⚠️ Error formateando fecha:', error.message);
      return 'Fecha inválida';
    }
  }

  /**
   * Actualiza la tabla HTML con los usuarios cargados
   * @param {Array} users - Lista de usuarios
   * @param {string} strategy - Estrategia usada para cargar
   * @param {number} totalCount - Total de usuarios
   */
  updateUsersTable(users, strategy, totalCount) {
    try {
      console.log('🔄 Actualizando tabla de usuarios...');
      
      // Actualizar contadores
      const totalUsersElement = document.getElementById('total-users');
      const usersCountElement = document.getElementById('users-count');
      
      if (totalUsersElement) totalUsersElement.textContent = totalCount;
      if (usersCountElement) usersCountElement.textContent = totalCount;

      // Obtener tabla
      const tbody = document.getElementById('users-table-body');
      if (!tbody) {
        console.error('❌ No se encontró tabla de usuarios');
        return;
      }

      // Limpiar tabla
      tbody.innerHTML = '';

      if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-400">📭 No hay usuarios para mostrar</td></tr>';
        return;
      }

      // Agregar usuarios a la tabla
      users.forEach((userData, index) => {
        try {
          const row = document.createElement('tr');
          row.className = 'border-b border-gray-700 hover:bg-gray-800 transition-colors';
          
          const email = userData.email;
          const adminBadge = userData.isAdmin ? 
            ' <span class="ml-2 px-2 py-1 bg-yellow-600 text-xs rounded font-medium">ADMIN</span>' : '';
          
          // Formatear fecha
          const timestamp = this.normalizeTimestamp(userData.timestamp);
          const fechaDisplay = this.formatDate(timestamp);
          
          row.innerHTML = `
            <td class="py-3 px-4">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 shadow-md">
                  ${email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div class="font-medium text-white">${email}${adminBadge}</div>
                  <div class="text-xs text-gray-400">ID: ${userData.id.substring(0, 12)}...</div>
                </div>
              </div>
            </td>
            <td class="py-3 px-4 text-gray-300">${userData.displayName}</td>
            <td class="py-3 px-4 text-gray-400">${fechaDisplay}</td>
            <td class="py-3 px-4">
              <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white shadow-sm">
                ✅ Activo
              </span>
            </td>
          `;
          
          tbody.appendChild(row);
          
        } catch (rowError) {
          console.warn('⚠️ Error creando fila para usuario:', userData.id, rowError.message);
        }
      });

      // Agregar información de estrategia al final
      const infoRow = document.createElement('tr');
      infoRow.innerHTML = `
        <td colspan="4" class="py-2 px-4 text-xs text-gray-500 text-center border-t border-gray-600">
          📊 Estrategia: ${strategy} | Total: ${totalCount} usuarios | Mostrando: ${users.length}
        </td>
      `;
      tbody.appendChild(infoRow);

      console.log(`✅ Tabla actualizada con ${users.length} usuarios`);

    } catch (error) {
      console.error('❌ Error actualizando tabla de usuarios:', error);
    }
  }

  /**
   * Muestra error en la tabla de usuarios
   * @param {Error} error - Error a mostrar
   */
  showError(error) {
    console.error('❌ Mostrando error en tabla de usuarios:', error);
    
    let errorMessage = 'Error cargando usuarios';
    let errorDetails = '';
    
    switch (error.code) {
      case 'permission-denied':
        errorMessage = '🚫 Sin permisos para leer usuarios';
        errorDetails = 'Verificar reglas de Firestore y permisos de admin';
        break;
      case 'failed-precondition':
        errorMessage = '⚙️ Error de configuración de base de datos';
        errorDetails = 'Índices de Firestore no disponibles';
        break;
      case 'unavailable':
        errorMessage = '🌐 Servicio temporalmente no disponible';
        errorDetails = 'Problemas de conectividad con Firebase';
        break;
      default:
        errorMessage = `❌ Error: ${error.code || 'Desconocido'}`;
        errorDetails = error.message || 'Error no especificado';
    }
    
    // Actualizar contadores
    const totalUsersElement = document.getElementById('total-users');
    const usersCountElement = document.getElementById('users-count');
    
    if (totalUsersElement) totalUsersElement.textContent = '⚠️';
    if (usersCountElement) usersCountElement.textContent = 'Error';

    // Mostrar error en tabla
    const tbody = document.getElementById('users-table-body');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-8">
            <div class="text-red-400 font-medium">${errorMessage}</div>
            <div class="text-gray-500 text-sm mt-2">${errorDetails}</div>
            <button onclick="window.retryLoadUsers()" class="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors">
              🔄 Reintentar
            </button>
          </td>
        </tr>
      `;
    }
  }

  /**
   * Carga usuarios y actualiza la tabla automáticamente
   */
  async loadAndDisplayUsers() {
    try {
      // Mostrar loader
      const tbody = document.getElementById('users-table-body');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-blue-400 animate-pulse">🔄 Cargando usuarios...</td></tr>';
      }

      // Cargar usuarios
      const result = await this.loadUsersWithFallback();
      
      // Actualizar tabla
      this.updateUsersTable(result.users, result.strategy, result.totalCount);
      
    } catch (error) {
      this.showError(error);
    }
  }
}

// Función global para reintentar carga
window.retryLoadUsers = function() {
  if (window.adminUsersLoader) {
    window.adminUsersLoader.loadAndDisplayUsers();
  } else {
    console.warn('⚠️ AdminUsersLoader no está disponible');
  }
};