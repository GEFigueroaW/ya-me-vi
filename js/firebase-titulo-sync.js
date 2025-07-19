// Script para forzar la sincronización entre Firebase Auth y el título personalizado
console.log('🔧 Cargando fix de sincronización Firebase-Título...');

// Función para conectar directamente con Firebase Auth y obtener datos del usuario
async function obtenerDatosUsuarioFirebase() {
    console.log('🔍 Obteniendo datos del usuario desde Firebase...');
    
    // Intentar obtener datos directamente desde Firebase
    if (window.auth) {
        // Esperamos hasta que Firebase esté completamente inicializado
        return new Promise((resolve) => {
            if (window.auth.currentUser) {
                console.log('✅ Usuario ya autenticado en Firebase');
                resolve(window.auth.currentUser);
            } else {
                console.log('⏳ Esperando autenticación de Firebase...');
                const unsubscribe = window.auth.onAuthStateChanged((user) => {
                    if (user) {
                        console.log('✅ Usuario autenticado detectado:', user);
                        unsubscribe();
                        resolve(user);
                    }
                });
                
                // Timeout después de 10 segundos
                setTimeout(() => {
                    console.log('⏰ Timeout esperando autenticación Firebase');
                    unsubscribe();
                    resolve(null);
                }, 10000);
            }
        });
    }
    
    return null;
}

// Función para forzar la actualización del título con datos de Firebase directamente
async function forzarActualizacionTitulo() {
    console.log('🎯 FORZANDO actualización del título...');
    
    const tituloElement = document.getElementById('titulo-sorteo');
    if (!tituloElement) {
        console.log('❌ No se encontró elemento titulo-sorteo');
        return false;
    }
    
    // Obtener datos del usuario directamente de Firebase
    const user = await obtenerDatosUsuarioFirebase();
    let nombreUsuario = '';
    
    if (user) {
        console.log('🔍 Usuario Firebase obtenido:', {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email
        });
        
        if (user.displayName) {
            nombreUsuario = user.displayName.split(' ')[0];
            console.log('✅ Nombre obtenido de Firebase displayName:', nombreUsuario);
        } else if (user.email) {
            nombreUsuario = user.email.split('@')[0];
            console.log('✅ Nombre obtenido de Firebase email:', nombreUsuario);
        }
        
        // Establecer variables globales para otros scripts
        window.usuarioActualID = user.uid;
        window.usuarioActualNombre = user.displayName;
        window.usuarioActualEmail = user.email;
        console.log('✅ Variables globales establecidas desde Firebase directo');
    } else {
        console.log('❌ No se pudo obtener usuario de Firebase');
        
        // Fallback a variables globales existentes
        if (window.usuarioActualNombre && window.usuarioActualNombre !== 'undefined') {
            nombreUsuario = window.usuarioActualNombre.split(' ')[0];
            console.log('✅ Nombre obtenido de variable global:', nombreUsuario);
        } else if (window.usuarioActualEmail && window.usuarioActualEmail !== 'undefined') {
            nombreUsuario = window.usuarioActualEmail.split('@')[0];
            console.log('✅ Nombre obtenido de email global:', nombreUsuario);
        }
    }
    
    // Actualizar título
    if (nombreUsuario) {
        tituloElement.textContent = `🎯 Combinaciones sugeridas por IA para TI ${nombreUsuario} para el sorteo 4083`;
        console.log('🎯 ✅ TÍTULO ACTUALIZADO CON NOMBRE:', nombreUsuario);
        console.log('📝 Título final:', tituloElement.textContent);
        return true;
    } else {
        tituloElement.textContent = `🎯 Combinaciones sugeridas por IA para TI para el sorteo 4083`;
        console.log('⚠️ Título actualizado SIN nombre');
        return false;
    }
}

// Hacer las funciones disponibles globalmente
window.forzarActualizacionTitulo = forzarActualizacionTitulo;
window.obtenerDatosUsuarioFirebase = obtenerDatosUsuarioFirebase;

// Función para intentar la actualización hasta que tenga éxito
async function intentarActualizacionPersistente() {
    console.log('🔄 Iniciando intentos persistentes de actualización...');
    
    let intentos = 0;
    const maxIntentos = 20; // 20 intentos durante 1 minuto
    
    const intervalo = setInterval(async () => {
        intentos++;
        console.log(`🔄 Intento ${intentos}/${maxIntentos} de actualización del título...`);
        
        const exito = await forzarActualizacionTitulo();
        
        if (exito) {
            console.log('🎯 ✅ TÍTULO ACTUALIZADO EXITOSAMENTE - Deteniendo intentos');
            clearInterval(intervalo);
        } else if (intentos >= maxIntentos) {
            console.log('⏰ Máximo de intentos alcanzado - Deteniendo');
            clearInterval(intervalo);
        }
    }, 3000); // Cada 3 segundos
}

// Iniciar intentos inmediatamente
console.log('✅ Iniciando sincronización Firebase-Título...');
setTimeout(intentarActualizacionPersistente, 1000);
