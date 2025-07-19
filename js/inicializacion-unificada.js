// Script unificado para cargar todas las funciones y datos necesarios
console.log('🚀 Iniciando carga unificada de sistema...');

// Función para cargar e inicializar todo el sistema
async function inicializarSistemaCompleto() {
    try {
        console.log('📦 PASO 1: Importando módulos...');
        
        // Importar todas las funciones necesarias
        const dataModule = await import('./dataParser.js');
        const mlModule = await import('./mlPredictor.js');
        const firebaseModule = await import('./firebase-init.js');
        
        console.log('✅ Módulos importados exitosamente');
        
        // Exportar funciones críticas a window
        window.cargarDatosHistoricos = dataModule.cargarDatosHistoricos;
        window.generarCombinacionesAleatorias = dataModule.generarCombinacionesAleatorias;
        window.analizarSumaNumeros = dataModule.analizarSumaNumeros;
        window.analizarParesImpares = dataModule.analizarParesImpares;
        window.analizarDecadaTerminacion = dataModule.analizarDecadaTerminacion;
        window.calcularFrecuencias = dataModule.calcularFrecuencias;
        window.generarPrediccionPersonalizada = mlModule.generarPrediccionPersonalizada;
        window.auth = firebaseModule.auth;
        window.onAuthStateChanged = firebaseModule.onAuthStateChanged;
        
        console.log('✅ Funciones exportadas a window');
        
        // Verificar acceso a archivos CSV
        console.log('📊 PASO 2: Verificando archivos CSV...');
        const csvFiles = ['assets/Melate.csv', 'assets/Revancha.csv', 'assets/Revanchita.csv'];
        const csvStatus = {};
        
        for (const file of csvFiles) {
            try {
                const response = await fetch(file);
                csvStatus[file] = response.ok ? 'OK' : `Error ${response.status}`;
                if (response.ok) {
                    const content = await response.text();
                    console.log(`✅ ${file}: ${content.split('\n').length} líneas`);
                } else {
                    console.error(`❌ ${file}: HTTP ${response.status}`);
                }
            } catch (error) {
                csvStatus[file] = `Error: ${error.message}`;
                console.error(`❌ ${file}:`, error);
            }
        }
        
        console.log('📊 Estado de archivos CSV:', csvStatus);
        
        // Configurar autenticación
        console.log('🔐 PASO 3: Configurando autenticación...');
        if (window.auth && window.onAuthStateChanged) {
            window.onAuthStateChanged(window.auth, async (user) => {
                if (!user) {
                    console.log('❌ Usuario no autenticado, redirigiendo...');
                    window.location.href = "index.html";
                } else {
                    console.log('✅ Usuario autenticado:', user.uid);
                    
                    // Establecer variables globales
                    window.usuarioActualID = user.uid;
                    window.usuarioActualNombre = user.displayName;
                    window.usuarioActualEmail = user.email;
                    globalThis.usuarioActualID = user.uid;
                    globalThis.usuarioActualNombre = user.displayName;
                    globalThis.usuarioActualEmail = user.email;
                    
                    console.log('👤 Datos del usuario establecidos:', {
                        id: user.uid,
                        nombre: user.displayName,
                        email: user.email
                    });
                    
                    // Cargar datos históricos
                    console.log('📊 PASO 4: Cargando datos históricos...');
                    if (window.cargarDatosHistoricos) {
                        try {
                            window.datosHistoricos = await window.cargarDatosHistoricos('todos');
                            console.log('✅ Datos históricos cargados:', {
                                melate: window.datosHistoricos?.melate?.sorteos?.length || 0,
                                revancha: window.datosHistoricos?.revancha?.sorteos?.length || 0,
                                revanchita: window.datosHistoricos?.revanchita?.sorteos?.length || 0
                            });
                            
                            // Activar el sistema de sugerencias
                            console.log('🎯 PASO 5: Activando sistema de sugerencias...');
                            if (window.generarYMostrarNumerosSorteos) {
                                setTimeout(() => {
                                    console.log('🚀 Ejecutando generación de números...');
                                    window.generarYMostrarNumerosSorteos();
                                }, 1000);
                            }
                            
                        } catch (error) {
                            console.error('❌ Error cargando datos históricos:', error);
                        }
                    }
                    
                    // Actualizar título
                    setTimeout(() => {
                        if (window.forzarActualizacionTitulo) {
                            window.forzarActualizacionTitulo();
                        }
                    }, 2000);
                }
            });
        } else {
            console.error('❌ Firebase Auth no disponible');
        }
        
        console.log('✅ Sistema completamente inicializado');
        
    } catch (error) {
        console.error('❌ ERROR CRÍTICO inicializando sistema:', error);
    }
}

// Función para verificar estado del sistema
window.verificarEstadoSistema = function() {
    console.log('🔍 ESTADO DEL SISTEMA:');
    console.log('- Datos históricos:', !!window.datosHistoricos);
    console.log('- ML disponible:', !!window.generarPrediccionPersonalizada);
    console.log('- Cargar datos disponible:', !!window.cargarDatosHistoricos);
    console.log('- Usuario autenticado:', !!window.usuarioActualID);
    console.log('- Variables usuario:', {
        id: window.usuarioActualID,
        nombre: window.usuarioActualNombre,
        email: window.usuarioActualEmail
    });
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistemaCompleto);
} else {
    inicializarSistemaCompleto();
}

console.log('✅ Script de inicialización unificada cargado');
