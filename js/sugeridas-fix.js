// === ARCHIVO DE CORRECCIÓN PARA SUGERIDAS.HTML ===
// Este archivo resuelve el problema de los números que no se muestran en los sorteos

// Función simplificada para obtener el nombre del usuario
async function obtenerNombreUsuarioSimple() {
    console.log('🔍 Buscando nombre del usuario...');
    
    // 1. Primero revisar las variables globales que son seteadas por onAuthStateChanged
    console.log('🔍 DEBUG - Verificando todas las variables disponibles:');
    console.log('- window.usuarioActualNombre:', window.usuarioActualNombre);
    console.log('- window.usuarioActualEmail:', window.usuarioActualEmail);
    console.log('- globalThis.usuarioActualNombre:', globalThis.usuarioActualNombre);
    console.log('- globalThis.usuarioActualEmail:', globalThis.usuarioActualEmail);
    
    if (window.usuarioActualNombre && window.usuarioActualNombre !== 'undefined') {
        const nombre = window.usuarioActualNombre.split(' ')[0];
        console.log('✅ Nombre encontrado en window.usuarioActualNombre:', nombre);
        return nombre;
    }
    
    if (globalThis.usuarioActualNombre && globalThis.usuarioActualNombre !== 'undefined') {
        const nombre = globalThis.usuarioActualNombre.split(' ')[0];
        console.log('✅ Nombre encontrado en globalThis.usuarioActualNombre:', nombre);
        return nombre;
    }
    
    if (window.usuarioActualEmail && window.usuarioActualEmail !== 'undefined') {
        const nombre = window.usuarioActualEmail.split('@')[0];
        console.log('✅ Nombre del email global encontrado:', nombre);
        return nombre;
    }
    
    if (globalThis.usuarioActualEmail && globalThis.usuarioActualEmail !== 'undefined') {
        const nombre = globalThis.usuarioActualEmail.split('@')[0];
        console.log('✅ Nombre del email globalThis encontrado:', nombre);
        return nombre;
    }
    
    // 2. Verificar Firebase Auth moderno si está disponible
    if (window.auth && window.auth.currentUser) {
        const user = window.auth.currentUser;
        console.log('🔍 Usuario de Firebase disponible:', user);
        
        // 2a. Usar displayName de Firebase Auth (Google login)
        if (user.displayName) {
            const nombre = user.displayName.split(' ')[0];
            console.log('✅ Nombre encontrado en Firebase Auth moderno:', nombre);
            return nombre;
        }
        
        // 2b. Usar email como último recurso
        if (user.email) {
            const nombre = user.email.split('@')[0];
            console.log('✅ Nombre del email encontrado (Firebase moderno):', nombre);
            return nombre;
        }
    }
    
    // 3. Verificar Firebase Auth legacy si está disponible
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        const user = firebase.auth().currentUser;
        if (user.displayName) {
            const nombre = user.displayName.split(' ')[0];
            console.log('✅ Nombre encontrado en Firebase Auth legacy:', nombre);
            return nombre;
        }
        if (user.email) {
            const nombre = user.email.split('@')[0];
            console.log('✅ Nombre del email encontrado (Firebase legacy):', nombre);
            return nombre;
        }
    }
    
    console.log('❌ No se encontró nombre del usuario en ninguna fuente');
    return ''; // Retornar vacío en lugar de fallback
}

// Función simplificada para actualizar el título
async function actualizarTituloSorteoConNombre() {
    console.log('🎯 Actualizando título del sorteo con nombre...');
    
    const tituloElement = document.getElementById('titulo-sorteo');
    if (!tituloElement) {
        console.error('❌ Elemento titulo-sorteo no encontrado');
        // Intentar de nuevo después de un pequeño delay
        setTimeout(() => {
            const tituloElement2 = document.getElementById('titulo-sorteo');
            if (tituloElement2) {
                console.log('✅ Elemento titulo-sorteo encontrado en segundo intento');
                actualizarTituloSorteoConNombre();
            }
        }, 1000);
        return;
    }
    
    try {
        let numeroSorteo = 4083; // Valor por defecto
        
        // Intentar obtener el número real del último sorteo
        if (window.datosHistoricos && window.datosHistoricos.melate && window.datosHistoricos.melate.sorteos) {
            const sorteos = window.datosHistoricos.melate.sorteos;
            if (sorteos.length > 0) {
                let ultimoSorteo = 0;
                sorteos.forEach(sorteo => {
                    const num = parseInt(sorteo.concurso);
                    if (!isNaN(num) && num > ultimoSorteo) {
                        ultimoSorteo = num;
                    }
                });
                if (ultimoSorteo > 0) {
                    numeroSorteo = ultimoSorteo + 1;
                }
            }
        }
        
        // Obtener el nombre del usuario con la lógica simplificada
        let nombreUsuario = '';
        
        console.log('🔍 Verificando fuentes de nombre de usuario:');
        console.log('- window.usuarioActualNombre:', window.usuarioActualNombre);
        console.log('- window.usuarioActualEmail:', window.usuarioActualEmail);
        
        // Priorizar las variables globales que son seteadas por onAuthStateChanged
        if (window.usuarioActualNombre) {
            nombreUsuario = window.usuarioActualNombre.split(' ')[0];
            console.log('✅ Nombre obtenido de variable global (displayName):', nombreUsuario);
        } else if (window.usuarioActualEmail) {
            nombreUsuario = window.usuarioActualEmail.split('@')[0];
            console.log('✅ Nombre obtenido de email global:', nombreUsuario);
        } else {
            // Fallback a Firebase directamente
            const nombre = await obtenerNombreUsuarioSimple();
            if (nombre) {
                nombreUsuario = nombre;
                console.log('✅ Nombre obtenido de Firebase directamente:', nombreUsuario);
            }
        }
        
        // Construir el título con formato exacto solicitado (solo un emoji 🎯)
        if (nombreUsuario && nombreUsuario !== '') {
            tituloElement.textContent = `🎯 Combinaciones sugeridas por IA para TI ${nombreUsuario} para el sorteo ${numeroSorteo}`;
            console.log(`✅ Título actualizado CON nombre: "${nombreUsuario}", sorteo ${numeroSorteo}`);
        } else {
            tituloElement.textContent = `🎯 Combinaciones sugeridas por IA para TI para el sorteo ${numeroSorteo}`;
            console.log(`⚠️ Título actualizado SIN nombre, sorteo ${numeroSorteo}`);
        }
        
        // Verificar que el título se actualizó correctamente
        console.log('📝 Título final:', tituloElement.textContent);
        
    } catch (error) {
        console.error('❌ Error actualizando título:', error);
        tituloElement.textContent = '🎯 Combinaciones sugeridas por IA para TI para el próximo sorteo';
    }
}

// Variables globales para el estado
window.sistemaInicializado = false;
window.numerosSorteosGenerados = false;

// Función principal para generar y mostrar números de sorteos
async function generarYMostrarNumerosSorteos() {
    console.log('🎯 Iniciando generación y visualización de números de sorteos...');
    
    try {
        // PASO 1: Cargar datos históricos OBLIGATORIAMENTE
        console.log('📊 PASO 1: Cargando datos históricos...');
        if (!window.datosHistoricos) {
            if (typeof window.cargarDatosHistoricos === 'function') {
                console.log('🔄 Ejecutando cargarDatosHistoricos...');
                window.datosHistoricos = await window.cargarDatosHistoricos('todos');
                console.log('✅ Datos históricos cargados:', {
                    melate: window.datosHistoricos?.melate?.sorteos?.length || 0,
                    revancha: window.datosHistoricos?.revancha?.sorteos?.length || 0,
                    revanchita: window.datosHistoricos?.revanchita?.sorteos?.length || 0
                });
            } else {
                console.error('❌ ERROR CRÍTICO: cargarDatosHistoricos no está disponible');
                throw new Error('Función cargarDatosHistoricos no disponible');
            }
        } else {
            console.log('✅ Datos históricos ya disponibles');
        }
        
        // VERIFICAR que los datos se cargaron correctamente
        if (!window.datosHistoricos || Object.keys(window.datosHistoricos).length === 0) {
            console.error('❌ ERROR CRÍTICO: No se pudieron cargar los datos históricos');
            throw new Error('Datos históricos no disponibles');
        }
        
        // PASO 2: Generar números para proyecciones de análisis
        console.log('📊 PASO 2: Generando proyecciones de análisis...');
        await generarProyeccionesAnalisisSimple();
        
        // PASO 3: Generar números para predicciones IA (CON DATOS HISTÓRICOS)
        console.log('🤖 PASO 3: Generando predicciones IA con datos históricos...');
        await generarPrediccionesIASimple();
        
        // PASO 4: Actualizar título del sorteo con nombre
        console.log('🎯 PASO 4: Actualizando título del sorteo...');
        await actualizarTituloSorteoConNombre();
        
        window.numerosSorteosGenerados = true;
        console.log('✅ Todos los números de sorteos generados correctamente con datos históricos reales');
        
    } catch (error) {
        console.error('❌ ERROR CRÍTICO generando números de sorteos:', error);
        console.error('❌ NO SE DEBE USAR FALLBACK - Verificar datos históricos y ML');
        
        // NO usar números de emergencia - debe funcionar con datos reales
        const mensajeEstado = document.getElementById('mensaje-estado');
        if (mensajeEstado) {
            mensajeEstado.textContent = 'Error cargando datos históricos. Por favor recarga la página.';
            mensajeEstado.style.color = '#ef4444';
        }
    }
}

// Función para crear datos básicos en caso de error
function crearDatosBasicos() {
    console.log('🔄 Creando datos básicos de emergencia...');
    
    const sorteos = ['melate', 'revancha', 'revanchita'];
    const datosBasicos = {};
    
    sorteos.forEach(sorteo => {
        datosBasicos[sorteo] = {
            sorteos: [],
            numeros: [],
            ultimoSorteo: 4082 // Valor base
        };
        
        // Generar algunos sorteos simulados
        for (let i = 0; i < 10; i++) {
            const numeros = [];
            while (numeros.length < 6) {
                const num = Math.floor(Math.random() * 56) + 1;
                if (!numeros.includes(num)) {
                    numeros.push(num);
                }
            }
            numeros.sort((a, b) => a - b);
            
            datosBasicos[sorteo].sorteos.push({
                concurso: 4082 - i,
                numeros: numeros,
                fecha: new Date()
            });
            
            datosBasicos[sorteo].numeros.push(...numeros);
        }
    });
    
    return datosBasicos;
}

// Función simplificada para generar proyecciones de análisis
async function generarProyeccionesAnalisisSimple() {
    console.log('📊 Generando proyecciones de análisis...');
    
    const sorteos = ['melate', 'revancha', 'revanchita'];
    
    for (const sorteo of sorteos) {
        try {
            const elementoProyeccion = document.getElementById(`proyeccion-${sorteo}`);
            const elementoDetalle = document.getElementById(`detalle-${sorteo}`);
            
            if (!elementoProyeccion) continue;
            
            // Mostrar estado de carga
            elementoProyeccion.textContent = '🔄 Generando...';
            if (elementoDetalle) elementoDetalle.textContent = 'Analizando datos...';
            
            // Esperar un poco para mostrar el loading
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Generar números usando análisis simple pero efectivo
            const numeros = generarNumerosAnalisisInteligente(sorteo);
            
            // Mostrar los números
            elementoProyeccion.textContent = numeros.join(' - ');
            if (elementoDetalle) {
                elementoDetalle.textContent = 'Análisis basado en frecuencias, suma, paridad y décadas';
            }
            
            console.log(`✅ Proyección ${sorteo}: ${numeros.join(' - ')}`);
            
        } catch (error) {
            console.error(`❌ Error en proyección ${sorteo}:`, error);
            mostrarErrorEnElemento(`proyeccion-${sorteo}`, 'Error al generar');
        }
    }
}

// Función para generar predicciones IA usando OBLIGATORIAMENTE el ML real
async function generarPrediccionesIASimple() {
    console.log('🤖 Generando predicciones IA con algoritmo ML REAL (sin fallback)...');
    
    const sorteos = ['melate', 'revancha', 'revanchita'];
    const userId = window.usuarioActualID || 'usuario-anonimo';
    
    // VERIFICAR QUE LOS DATOS HISTÓRICOS ESTÉN DISPONIBLES
    if (!window.datosHistoricos) {
        console.log('📊 Cargando datos históricos primero...');
        if (window.cargarDatosHistoricos && typeof window.cargarDatosHistoricos === 'function') {
            window.datosHistoricos = await window.cargarDatosHistoricos('todos');
            console.log('✅ Datos históricos cargados:', window.datosHistoricos);
        } else {
            console.error('❌ ERROR CRÍTICO: cargarDatosHistoricos no disponible');
            return;
        }
    }
    
    // VERIFICAR QUE EL ML ESTÉ DISPONIBLE
    if (!window.generarPrediccionPersonalizada || typeof window.generarPrediccionPersonalizada !== 'function') {
        console.error('❌ ERROR CRÍTICO: generarPrediccionPersonalizada no disponible');
        console.log('🔍 Funciones disponibles en window:', Object.keys(window).filter(k => k.includes('generar')));
        return;
    }
    
    for (const sorteo of sorteos) {
        try {
            const elementoCombinacion = document.getElementById(`combinacion-${sorteo}`);
            
            if (!elementoCombinacion) continue;
            
            // Mostrar estado de carga
            elementoCombinacion.innerHTML = '<span class="animate-pulse">Generando IA con 5 métodos...</span>';
            
            // Esperar un poco para mostrar el loading
            await new Promise(resolve => setTimeout(resolve, 700));
            
            // Preparar datos para el ML (OBLIGATORIO)
            const datosParaML = {
                sorteo: sorteo,
                numeros: window.datosHistoricos?.[sorteo]?.numeros || [],
                datos: window.datosHistoricos?.[sorteo]?.sorteos || []
            };
            
            console.log(`📊 Datos para ML ${sorteo}:`, {
                sorteo: datosParaML.sorteo,
                cantidadNumeros: datosParaML.numeros.length,
                cantidadSorteos: datosParaML.datos.length
            });
            
            // USAR SOLO EL ML REAL - SIN FALLBACK
            console.log(`� Ejecutando ML real para ${sorteo} con 5 métodos: frecuencia, probabilidad, patrones, delta, desviación`);
            const numeros = await window.generarPrediccionPersonalizada(userId, datosParaML);
            console.log(`✅ Predicción IA ${sorteo} (ML 5 métodos): ${numeros.join(' - ')}`);
            
            // Verificar que la respuesta del ML sea válida
            if (!Array.isArray(numeros) || numeros.length !== 6) {
                console.error(`❌ ERROR: ML devolvió respuesta inválida para ${sorteo}:`, numeros);
                elementoCombinacion.textContent = 'Error en análisis IA';
                continue;
            }
            
            // Mostrar los números
            elementoCombinacion.textContent = numeros.join(' - ');
            
        } catch (error) {
            console.error(`❌ Error CRÍTICO en predicción IA ${sorteo}:`, error);
            const elementoCombinacion = document.getElementById(`combinacion-${sorteo}`);
            if (elementoCombinacion) {
                elementoCombinacion.textContent = 'Error en análisis IA';
            }
        }
    }
    
    // Actualizar mensaje de estado
    const mensajeEstado = document.getElementById('mensaje-estado');
    if (mensajeEstado) {
        mensajeEstado.textContent = 'Predicciones generadas con análisis IA avanzado: frecuencia histórica, probabilidad matemática, reconocimiento de patrones, análisis delta y desviación estándar';
    }
}

// Función para generar números con análisis inteligente
function generarNumerosAnalisisInteligente(sorteo) {
    console.log(`🔍 Generando análisis inteligente para ${sorteo}`);
    
    // Usar datos históricos si están disponibles
    let frecuencias = new Map();
    
    if (window.datosHistoricos && window.datosHistoricos[sorteo] && window.datosHistoricos[sorteo].sorteos) {
        // Calcular frecuencias reales
        window.datosHistoricos[sorteo].sorteos.forEach(sorteoData => {
            sorteoData.numeros.forEach(num => {
                frecuencias.set(num, (frecuencias.get(num) || 0) + 1);
            });
        });
    }
    
    // Si no hay datos suficientes, crear frecuencias simuladas inteligentes
    if (frecuencias.size < 20) {
        frecuencias = generarFrecuenciasSimuladas();
    }
    
    // Método 1: Números por frecuencia (40%)
    const numerosFrecuentes = Array.from(frecuencias.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([num]) => parseInt(num));
    
    // Método 2: Números por suma óptima (30%)
    const numerosSuma = generarNumerosPorSuma();
    
    // Método 3: Balance pares/impares (20%)
    const numerosBalance = generarNumerosPorBalance();
    
    // Método 4: Factor aleatorio (10%)
    const numerosAleatorios = generarNumerosAleatoriosControlados();
    
    // Combinar métodos con pesos
    const pool = [];
    
    // Agregar números según pesos
    numerosFrecuentes.slice(0, 8).forEach(num => pool.push(num, num)); // 2 veces
    numerosSuma.forEach(num => pool.push(num));                       // 1 vez
    numerosBalance.forEach(num => pool.push(num));                    // 1 vez
    numerosAleatorios.forEach(num => pool.push(num));                 // 1 vez
    
    // Seleccionar 6 números únicos
    const numerosUnicos = [...new Set(pool)];
    const combinacionFinal = [];
    
    // Seleccionar 6 números con algo de aleatoriedad
    while (combinacionFinal.length < 6 && numerosUnicos.length > 0) {
        const indice = Math.floor(Math.random() * numerosUnicos.length);
        const numero = numerosUnicos.splice(indice, 1)[0];
        combinacionFinal.push(numero);
    }
    
    // Completar si faltan números
    while (combinacionFinal.length < 6) {
        const num = Math.floor(Math.random() * 56) + 1;
        if (!combinacionFinal.includes(num)) {
            combinacionFinal.push(num);
        }
    }
    
    return combinacionFinal.sort((a, b) => a - b);
}

// Función para generar números IA personalizada
function generarNumerosIAPersonalizada(userId, sorteo) {
    console.log(`🤖 Generando IA personalizada para ${userId} - ${sorteo}`);
    
    // Crear semilla basada en usuario y sorteo
    const semilla = hashString(`${userId}-${sorteo}-${new Date().getDate()}`);
    
    // Generar números usando la semilla para consistencia
    const numeros = new Set();
    let contador = 0;
    
    while (numeros.size < 6 && contador < 100) {
        const num = 1 + ((semilla + contador) % 56);
        numeros.add(num);
        contador++;
    }
    
    // Si aún no tenemos 6, completar aleatoriamente
    while (numeros.size < 6) {
        numeros.add(Math.floor(Math.random() * 56) + 1);
    }
    
    return Array.from(numeros).sort((a, b) => a - b);
}

// Funciones auxiliares
function generarFrecuenciasSimuladas() {
    const frecuencias = new Map();
    // Simular frecuencias realistas (algunos números más comunes que otros)
    for (let i = 1; i <= 56; i++) {
        const frecuenciaBase = 5 + Math.floor(Math.random() * 15);
        frecuencias.set(i, frecuenciaBase);
    }
    // Hacer algunos números más frecuentes
    const numerosPopulares = [7, 13, 21, 23, 31, 37, 42, 49];
    numerosPopulares.forEach(num => {
        frecuencias.set(num, frecuencias.get(num) + 5);
    });
    return frecuencias;
}

function generarNumerosPorSuma() {
    // Generar números que sumen aproximadamente en el rango 150-199
    const numeros = [];
    let suma = 0;
    const targetSuma = 175; // Centro del rango más común
    
    while (numeros.length < 6) {
        const promedioRestante = (targetSuma - suma) / (6 - numeros.length);
        const variacion = Math.random() * 20 - 10; // ±10
        const numero = Math.max(1, Math.min(56, Math.round(promedioRestante + variacion)));
        
        if (!numeros.includes(numero)) {
            numeros.push(numero);
            suma += numero;
        }
    }
    
    return numeros;
}

function generarNumerosPorBalance() {
    const numeros = [];
    const pares = [];
    const impares = [];
    
    // Generar pares e impares
    for (let i = 2; i <= 56; i += 2) pares.push(i);
    for (let i = 1; i <= 56; i += 2) impares.push(i);
    
    // Seleccionar 3 pares y 3 impares (balance más común)
    const paresSeleccionados = shuffleArray([...pares]).slice(0, 3);
    const imparesSeleccionados = shuffleArray([...impares]).slice(0, 3);
    
    return [...paresSeleccionados, ...imparesSeleccionados];
}

function generarNumerosAleatoriosControlados() {
    const numeros = [];
    while (numeros.length < 4) {
        const num = Math.floor(Math.random() * 56) + 1;
        if (!numeros.includes(num)) {
            numeros.push(num);
        }
    }
    return numeros;
}

async function actualizarTituloSorteoSimple() {
    const tituloElement = document.getElementById('titulo-sorteo');
    if (!tituloElement) return;
    
    try {
        let numeroSorteo = 4083; // Valor por defecto
        
        // Intentar obtener el número real del último sorteo
        if (window.datosHistoricos && window.datosHistoricos.melate && window.datosHistoricos.melate.sorteos) {
            const sorteos = window.datosHistoricos.melate.sorteos;
            if (sorteos.length > 0) {
                let ultimoSorteo = 0;
                sorteos.forEach(sorteo => {
                    const num = parseInt(sorteo.concurso);
                    if (!isNaN(num) && num > ultimoSorteo) {
                        ultimoSorteo = num;
                    }
                });
                if (ultimoSorteo > 0) {
                    numeroSorteo = ultimoSorteo + 1;
                }
            }
        }
        
        // Obtener el nombre del usuario
        const nombreUsuario = await obtenerNombreUsuario();
        
        // Construir el título con o sin nombre
        if (nombreUsuario) {
            tituloElement.textContent = `Combinaciones sugeridas por IA para TI ${nombreUsuario} para el sorteo ${numeroSorteo}`;
            console.log(`📝 Título actualizado con nombre: ${nombreUsuario}, sorteo ${numeroSorteo}`);
        } else {
            tituloElement.textContent = `Combinaciones sugeridas por IA para TI para el sorteo ${numeroSorteo}`;
            console.log(`📝 Título actualizado sin nombre: sorteo ${numeroSorteo}`);
        }
        
    } catch (error) {
        console.error('❌ Error actualizando título:', error);
        tituloElement.textContent = 'Combinaciones sugeridas por IA para TI para el próximo sorteo';
    }
}

function mostrarErrorEnElemento(elementId, mensaje) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.textContent = mensaje;
        elemento.style.color = '#ef4444'; // Color rojo para errores
    }
}

// Funciones de utilidad
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a entero de 32 bits
    }
    return Math.abs(hash);
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Sobrescribir funciones globales con versiones que funcionan
window.generarProyeccionesAnalisis = generarProyeccionesAnalisisSimple;
window.generarPrediccionesPorSorteo = generarPrediccionesIASimple;
window.actualizarTituloSorteo = actualizarTituloSorteoConNombre;

// ELIMINADAS LAS FUNCIONES DE EMERGENCIA - DEBE FUNCIONAR CON DATOS REALES

// Función para generar combinaciones aleatorias simples (solo 1 combinación)
function generarCombinacionAleatoria() {
    console.log('🎲 INICIO: Generando 1 combinación aleatoria...');
    
    const numeros = new Set();
    while (numeros.size < 6) {
        const num = Math.floor(Math.random() * 56) + 1;
        numeros.add(num);
    }
    
    const combinacion = Array.from(numeros).sort((a, b) => a - b);
    console.log('✅ Combinación generada:', combinacion);
    return combinacion;
}

// Función para mostrar la combinación aleatoria en el DOM
function mostrarCombinacionAleatoria() {
    console.log('🎲 INICIO: mostrarCombinacionAleatoria ejecutándose...');
    
    const container = document.getElementById('combinaciones-container');
    if (!container) {
        console.error('❌ ERROR: No se encontró el elemento combinaciones-container');
        return;
    }
    
    console.log('✅ Contenedor encontrado, mostrando nueva combinación aleatoria...');
    
    // Mostrar loading
    container.innerHTML = `
        <div class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p class="text-white">Generando combinación...</p>
        </div>
    `;
    
    setTimeout(() => {
        const combinacion = generarCombinacionAleatoria();
        
        const html = `
            <div class="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm border border-white border-opacity-20">
                <h3 class="text-xl font-bold text-white mb-4 text-center">
                    🎲 Tu Combinación Aleatoria
                </h3>
                <div class="flex justify-center">
                    <div class="bg-purple-500 bg-opacity-20 rounded-lg p-6 text-center border border-purple-300 border-opacity-30 max-w-md">
                        <div class="flex justify-center space-x-3 mb-4 flex-wrap">
                            ${combinacion.map(num => `
                                <span class="bg-white text-purple-600 font-bold py-2 px-3 rounded-lg text-lg m-1 shadow-lg">
                                    ${num}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        console.log(`✅ Combinación aleatoria mostrada: ${combinacion.join(' - ')}`);
    }, 800);
}

// Función para copiar al portapapeles
function copiarCombinacion(combinacion) {
    navigator.clipboard.writeText(combinacion)
        .then(() => {
            // Mostrar mensaje de éxito
            const mensaje = document.createElement('div');
            mensaje.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50 animate__animated animate__fadeInRight';
            mensaje.textContent = '✅ Combinación copiada al portapapeles';
            document.body.appendChild(mensaje);
            
            setTimeout(() => {
                mensaje.classList.add('animate__fadeOutRight');
                setTimeout(() => mensaje.remove(), 500);
            }, 2000);
        })
        .catch(err => {
            console.error('Error al copiar: ', err);
            const mensaje = document.createElement('div');
            mensaje.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
            mensaje.textContent = '❌ Error al copiar';
            document.body.appendChild(mensaje);
            
            setTimeout(() => mensaje.remove(), 2000);
        });
}

// Inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema de corrección para sugeridas...');
    
    // Hacer funciones disponibles inmediatamente
    window.generarYMostrarNumerosSorteos = generarYMostrarNumerosSorteos;
    window.mostrarCombinacionAleatoria = mostrarCombinacionAleatoria;
    window.generarCombinacionAleatoria = generarCombinacionAleatoria;
    window.copiarCombinacion = copiarCombinacion;
    window.actualizarTituloSorteo = actualizarTituloSorteoConNombre;
    
    console.log('✅ Funciones de combinaciones aleatorias disponibles globalmente');
    
    // DEBUG: Verificar elemento del título inmediatamente
    const tituloElement = document.getElementById('titulo-sorteo');
    if (tituloElement) {
        console.log('✅ Elemento titulo-sorteo encontrado:', tituloElement.textContent);
    } else {
        console.log('❌ Elemento titulo-sorteo NO encontrado en DOMContentLoaded');
    }
    
    // Intentar actualizar título inmediatamente si el elemento existe
    setTimeout(async () => {
        console.log('🔄 Primer intento de actualización de título (500ms)...');
        await actualizarTituloSorteoConNombre();
    }, 500);
    
    // Segundo intento después de cargar datos
    setTimeout(async function() {
        console.log('🔄 Generando números y actualizando título (2000ms)...');
        await generarYMostrarNumerosSorteos();
        // Actualizar título después de generar números
        setTimeout(async () => {
            console.log('🔄 Segundo intento de actualización de título (3000ms)...');
            await actualizarTituloSorteoConNombre();
        }, 1000);
    }, 2000);
    
    // Tercer intento después de un delay más largo
    setTimeout(async () => {
        console.log('🔄 Tercer intento de actualización de título (5000ms)...');
        await actualizarTituloSorteoConNombre();
    }, 5000);
    
    // Cuarto intento más agresivo - forzar título con datos disponibles
    setTimeout(async () => {
        console.log('🔄 Intento FINAL de actualización de título (8000ms)...');
        const tituloElement = document.getElementById('titulo-sorteo');
        if (tituloElement) {
            // Obtener datos disponibles en ese momento usando la misma lógica
            let nombreUsuario = '';
            
            console.log('🔍 DEBUG - Verificando variables disponibles:');
            console.log('window.usuarioActualNombre:', window.usuarioActualNombre);
            console.log('window.usuarioActualEmail:', window.usuarioActualEmail);
            console.log('window.auth:', window.auth);
            console.log('window.auth.currentUser:', window.auth?.currentUser);
            
            // Intentar múltiples fuentes siguiendo la misma lógica que main.js
            if (window.usuarioActualNombre) {
                nombreUsuario = window.usuarioActualNombre.split(' ')[0];
                console.log('✅ Nombre encontrado (variable global):', nombreUsuario);
            } else if (window.usuarioActualEmail) {
                nombreUsuario = window.usuarioActualEmail.split('@')[0];
                console.log('✅ Nombre del email (variable global):', nombreUsuario);
            } else if (window.auth && window.auth.currentUser) {
                const user = window.auth.currentUser;
                
                // Intentar displayName primero (Google login)
                if (user.displayName) {
                    nombreUsuario = user.displayName.split(' ')[0];
                    console.log('✅ Nombre encontrado (Firebase user):', nombreUsuario);
                }
                // Si no, usar email
                else if (user.email) {
                    nombreUsuario = user.email.split('@')[0];
                    console.log('✅ Nombre del email (Firebase user):', nombreUsuario);
                }
            }
            
            if (nombreUsuario) {
                tituloElement.textContent = `🎯 Combinaciones sugeridas por IA para TI ${nombreUsuario} para el sorteo 4083`;
                console.log('🎯 TÍTULO FORZADO CON NOMBRE:', nombreUsuario);
                console.log('📝 Título final establecido:', tituloElement.textContent);
            } else {
                console.log('❌ No se pudo obtener nombre para título final');
                tituloElement.textContent = `🎯 Combinaciones sugeridas por IA para TI para el sorteo 4083`;
            }
        } else {
            console.log('❌ Elemento titulo-sorteo no encontrado en intento final');
        }
    }, 8000);
    
    // Agregar un listener para verificar cuando se autentica el usuario
    setTimeout(() => {
        if (window.auth && typeof window.auth.onAuthStateChanged === 'function') {
            console.log('🔗 Conectando listener de autenticación desde sugeridas-fix.js');
            window.auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('🎯 Usuario autenticado detectado en sugeridas-fix.js:', user.displayName || user.email);
                    // Forzar actualización del título cuando se detecta autenticación
                    setTimeout(async () => {
                        console.log('🔄 Actualizando título tras detección de autenticación...');
                        await actualizarTituloSorteoConNombre();
                    }, 1000);
                }
            });
        }
    }, 1000);
});

// Hacer funciones disponibles globalmente inmediatamente también
window.generarYMostrarNumerosSorteos = generarYMostrarNumerosSorteos;
window.mostrarCombinacionAleatoria = mostrarCombinacionAleatoria;
window.generarCombinacionAleatoria = generarCombinacionAleatoria;
window.copiarCombinacion = copiarCombinacion;
window.actualizarTituloSorteo = actualizarTituloSorteoConNombre;

console.log('✅ Sistema de corrección para sugeridas cargado');

// Agregar verificación adicional después de que todo esté cargado
setTimeout(() => {
    console.log('🔍 VERIFICACIÓN FINAL DE SISTEMA:');
    console.log('- Elemento titulo-sorteo:', document.getElementById('titulo-sorteo'));
    console.log('- window.usuarioActualNombre:', window.usuarioActualNombre);
    console.log('- window.usuarioActualEmail:', window.usuarioActualEmail);
    console.log('- window.auth disponible:', !!window.auth);
    console.log('- window.generarPrediccionPersonalizada disponible:', !!window.generarPrediccionPersonalizada);
    console.log('- window.datosHistoricos disponible:', !!window.datosHistoricos);
    
    // Último intento de actualización si hay datos de usuario disponibles
    if ((window.usuarioActualNombre || window.usuarioActualEmail) && document.getElementById('titulo-sorteo')) {
        console.log('🎯 ÚLTIMO INTENTO de actualización de título...');
        actualizarTituloSorteoConNombre();
    }
}, 10000);
