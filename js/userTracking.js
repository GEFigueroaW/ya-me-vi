// userTracking.js - Sistema de seguimiento de usuarios para YA ME VI
import { auth, db } from './firebase-init.js';
import { registerUserInFirestore } from './firebase-init.js';

// Función para registrar actividad del usuario
export async function trackUserActivity(action, details = null, gameType = null) {
  try {
    const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    
    const user = auth.currentUser;
    if (!user) return;
    
    const activityData = {
      userId: user.uid,
      userEmail: user.email,
      action: action,
      timestamp: serverTimestamp(),
      details: details,
      gameType: gameType,
      device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
      userAgent: navigator.userAgent,
      url: window.location.pathname,
      referrer: document.referrer || null
    };
    
    await addDoc(collection(db, 'user_activity'), activityData);
    console.log('📊 Actividad registrada:', action);
    
  } catch (error) {
    console.error('❌ Error registrando actividad:', error);
  }
}

// Función para registrar análisis realizados
export async function trackAnalysis(analysisType, gameType, numbers = null, result = null) {
  try {
    const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    
    const user = auth.currentUser;
    if (!user) return;
    
    const analysisData = {
      userId: user.uid,
      userEmail: user.email,
      analysisType: analysisType, // 'combination', 'frequency', 'prediction', etc.
      gameType: gameType, // 'Melate', 'Revancha', 'Revanchita'
      numbers: numbers,
      result: result,
      timestamp: serverTimestamp(),
      device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
    };
    
    // Guardar en colección específica según el tipo
    let collectionName = 'individual_analysis';
    if (analysisType === 'combination') {
      collectionName = 'combination_analysis';
    } else if (analysisType === 'prediction') {
      collectionName = 'ml_predictions';
    }
    
    await addDoc(collection(db, collectionName), analysisData);
    console.log('🔮 Análisis registrado:', analysisType, gameType);
    
    // También actualizar contador en el usuario
    await updateUserStats(user.uid, 'totalAnalysis');
    
  } catch (error) {
    console.error('❌ Error registrando análisis:', error);
  }
}

// Función para actualizar estadísticas del usuario
async function updateUserStats(userId, field, increment = 1) {
  try {
    const { doc, updateDoc, increment: firestoreIncrement } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [field]: firestoreIncrement(increment)
    });
    
  } catch (error) {
    console.error('❌ Error actualizando estadísticas:', error);
  }
}

// Función para marcar usuario como online/offline
export async function updateUserOnlineStatus(isOnline) {
  try {
    const { doc, updateDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    
    const user = auth.currentUser;
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      isOnline: isOnline,
      lastAccess: serverTimestamp()
    });
    
    console.log('👤 Estado actualizado:', isOnline ? 'online' : 'offline');
    
  } catch (error) {
    console.error('❌ Error actualizando estado:', error);
  }
}

// Auto-inicialización cuando se carga el archivo
document.addEventListener('DOMContentLoaded', () => {
  console.log('📊 Sistema de tracking inicializado');
  
  // Registrar página visitada
  if (auth.currentUser) {
    trackUserActivity('page_view', `Página visitada: ${window.location.pathname}`);
  }
  
  // Escuchar cambios de autenticación
  auth.onAuthStateChanged((user) => {
    if (user) {
      updateUserOnlineStatus(true);
      
      // Registrar login
      trackUserActivity('login', 'Usuario autenticado');
      
      // Actualizar estado online cada 30 segundos
      setInterval(() => {
        updateUserOnlineStatus(true);
        console.log('🔄 Estado online renovado automáticamente');
      }, 30000);
    }
  });
  
  // Marcar como offline cuando se cierra la página
  window.addEventListener('beforeunload', () => {
    if (auth.currentUser) {
      updateUserOnlineStatus(false);
    }
  });
  
  // Marcar como offline si la página se oculta (cambio de pestaña)
  document.addEventListener('visibilitychange', () => {
    if (auth.currentUser) {
      if (document.hidden) {
        // No marcar como offline inmediatamente, solo reducir la frecuencia
        console.log('📱 Página oculta, reduciendo frecuencia de updates');
      } else {
        // Volver a marcar como online al regresar
        updateUserOnlineStatus(true);
        console.log('📱 Página visible, actualizando estado online');
      }
    }
  });
});

// Exportar funciones principales
export { updateUserOnlineStatus };
