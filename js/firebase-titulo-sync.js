// Script para forzar la sincronización entre Firebase Auth y el título personalizado
console.log('🔧 Cargando fix de sincronización Firebase-Título...');

// Función para forzar la actualización del título con datos de Firebase directamente
function forzarActualizacionTitulo() {
    console.log('🎯 FORZANDO actualización del título...');
    
    const tituloElement = document.getElementById('titulo-sorteo');
    if (!tituloElement) {
        console.log('❌ No se encontró elemento titulo-sorteo');
        return;
    }
    
    // Intentar obtener datos directamente de Firebase
    let nombreUsuario = '';
    
    if (window.auth && window.auth.currentUser) {
        const user = window.auth.currentUser;
        console.log('🔍 Usuario Firebase disponible:', user);
        
        if (user.displayName) {
            nombreUsuario = user.displayName.split(' ')[0];
            console.log('✅ Nombre obtenido de Firebase displayName:', nombreUsuario);
        } else if (user.email) {
            nombreUsuario = user.email.split('@')[0];
            console.log('✅ Nombre obtenido de Firebase email:', nombreUsuario);
        }
    }
    
    // Si no hay Firebase, usar variables globales
    if (!nombreUsuario) {
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
    } else {
        tituloElement.textContent = `🎯 Combinaciones sugeridas por IA para TI para el sorteo 4083`;
        console.log('⚠️ Título actualizado SIN nombre');
    }
}

// Hacer la función disponible globalmente
window.forzarActualizacionTitulo = forzarActualizacionTitulo;

// Esperar a que Firebase esté listo y luego intentar múltiples veces
setTimeout(() => {
    console.log('🔄 Intentando actualización de título (2s)...');
    forzarActualizacionTitulo();
}, 2000);

setTimeout(() => {
    console.log('🔄 Intentando actualización de título (5s)...');
    forzarActualizacionTitulo();
}, 5000);

setTimeout(() => {
    console.log('🔄 Intentando actualización de título (8s)...');
    forzarActualizacionTitulo();
}, 8000);

setTimeout(() => {
    console.log('🔄 Intentando actualización de título (12s)...');
    forzarActualizacionTitulo();
}, 12000);

console.log('✅ Fix de sincronización Firebase-Título cargado');
