/**
 * Admin Data Simulator - Genera datos aleatorios para el panel de administración
 * Este script es temporal y debería ser reemplazado por datos reales de Firebase
 * cuando se implemente la versión completa del panel de administración.
 */

export class AdminDataSimulator {
  /**
   * Genera datos aleatorios para el panel de administración
   * @returns {Object} Objeto con datos simulados
   */
  static generateData() {
    const activeUsers = Math.floor(Math.random() * 1000) + 200;
    const totalQueries = Math.floor(Math.random() * 50000) + 10000;
    const mobileRatio = Math.floor(Math.random() * 30) + 60; // 60-90% móvil
    const desktopRatio = 100 - mobileRatio;
    const dbSize = Math.floor(Math.random() * 10000) + 1000;
    
    return {
      activeUsers,
      totalQueries,
      deviceRatio: `${mobileRatio}% / ${desktopRatio}%`,
      dbSize
    };
  }
  
  /**
   * Genera una lista de usuarios simulados
   * @param {number} count Número de usuarios a generar
   * @returns {Array} Lista de usuarios simulados
   */
  static generateUsers(count = 10) {
    const names = [
      'maria_lopez', 'juan_perez', 'carlos_rodriguez', 'ana_martinez', 
      'luis_fernandez', 'laura_gonzalez', 'miguel_sanchez', 'sofia_diaz',
      'javier_ruiz', 'elena_moreno', 'francisco_jimenez', 'silvia_navarro',
      'alejandro_torres', 'rocio_vega', 'daniel_ortiz', 'carmen_molina'
    ];
    
    const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
    const devices = ['iPhone 16', 'Samsung S25', 'Huawei P60', 'Xiaomi 13T', 'Google Pixel 9',
                     'Windows PC', 'MacBook Pro', 'iPad Air', 'Android Tablet'];
    
    const users = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      
      // Fecha aleatoria en los últimos 7 días
      const date = new Date(now);
      date.setDate(now.getDate() - Math.floor(Math.random() * 7));
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));
      
      // Formatear fecha: DD/MM/YYYY HH:MM
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const dateStr = `${day}/${month}/${year} ${hours}:${minutes}`;
      
      users.push({
        email: `${name}@${domain}`,
        lastAccess: dateStr,
        device
      });
    }
    
    // Ordenar por fecha de acceso (más reciente primero)
    return users.sort((a, b) => {
      const dateA = a.lastAccess.split(' ')[0].split('/').reverse().join('') + a.lastAccess.split(' ')[1].replace(':', '');
      const dateB = b.lastAccess.split(' ')[0].split('/').reverse().join('') + b.lastAccess.split(' ')[1].replace(':', '');
      return dateB.localeCompare(dateA);
    });
  }
  
  /**
   * Genera datos simulados para las gráficas
   * @returns {Object} Objeto con datos para las gráficas
   */
  static generateChartData() {
    // Estos datos serían reemplazados por Chart.js en la implementación real
    return {
      userChart: 'https://via.placeholder.com/800x400.png?text=Gráfica+de+Usuarios',
      dreamChart: 'https://via.placeholder.com/800x400.png?text=Top+Sueños'
    };
  }
}
