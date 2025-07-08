// --- CONFIGURACIÓN DE FIREBASE (¡REEMPLAZA CON TUS PROPIAS CREDENCIALES!) ---
// Visita la consola de Firebase de tu proyecto para obtener estas configuraciones
// Ve a "Configuración del proyecto" -> "Tus apps" -> "SDK de configuración y configuración"
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID",
    measurementId: "TU_MEASUREMENT_ID" // Opcional, si usas Google Analytics
};

// Inicializa Firebase (asegúrate de que los SDKs de Firebase estén cargados en index.html)
// Ejemplo de cómo deberían verse en index.html (justo antes de <script src="js/script.js"></script>):
/*
    <script src="https://www.gstatic.com/firebasejs/9.X.X/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.X.X/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.X.X/firebase-firestore-compat.js"></script>
*/
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const db = firebase.firestore();
// const googleProvider = new firebase.auth.GoogleAuthProvider();
// --- FIN DE CONFIGURACIÓN DE FIREBASE ---


// --- ELEMENTOS DEL DOM ---
const welcomeSection = document.getElementById('welcome-section');
const dreamQuestionSection = document.getElementById('dream-question-section');
const nextDrawAnalysisSection = document.getElementById('next-draw-analysis-section');
const myCombinationAnalysisSection = document.getElementById('my-combination-analysis-section');

const navNextDraw = document.getElementById('nav-next-draw');
const navMyCombination = document.getElementById('nav-my-combination');
const authButton = document.getElementById('auth-button');
const googleSignInBtn = document.getElementById('google-signin-btn');
const userDisplay = document.getElementById('user-display');
const userNameSpan = document.getElementById('user-name');

const dreamDropdown = document.getElementById('dream-dropdown');
const customDreamInput = document.getElementById('custom-dream-input');
const saveDreamBtn = document.getElementById('save-dream-btn');

const carouselContainer = document.querySelector('.background-carousel');
const comboNumbers = document.querySelectorAll('.combo-number');
const analyzeMyComboBtn = document.getElementById('analyze-my-combo-btn');

// --- IMÁGENES DEL CARRUSEL ---
// Las rutas de tus imágenes subidas (asegúrate de que los nombres de archivo sean correctos)
const carouselImages = [
    './bg1.jpg', // Casa
    './bg2.jpg', // Coche
    './bg3.jpg', // Éxito Familiar
    './bg4.jpg', // Éxito Profesional (Hombre)
    './bg5.jpg'  // Éxito Profesional (Mujer) - Suponiendo que esta es la que buscaste
];
let currentImageIndex = 0;
let carouselInterval;

// --- FUNCIONES DE LA INTERFAZ ---

/**
 * Muestra la sección deseada y oculta las demás.
 * @param {HTMLElement} sectionToShow - La sección que se va a mostrar.
 */
function showSection(sectionToShow) {
    const allSections = [
        welcomeSection,
        dreamQuestionSection,
        nextDrawAnalysisSection,
        myCombinationAnalysisSection
    ];

    allSections.forEach(section => {
        if (section === sectionToShow) {
            section.classList.add('active-section');
            section.style.display = 'flex'; // Usar flex para centrado CSS
        } else {
            section.classList.remove('active-section');
            section.style.display = 'none'; // Ocultar
        }
    });
}

/**
 * Inicia el carrusel de imágenes de fondo.
 */
function startCarousel() {
    // Limpiar cualquier intervalo existente para evitar duplicados
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }

    // Asegurarse de que el contenedor esté vacío
    carouselContainer.innerHTML = '';

    // Cargar todas las imágenes inicialmente, pero solo la primera activa
    carouselImages.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Imagen de fondo ${index + 1}`;
        if (index === 0) {
            img.classList.add('active');
        }
        carouselContainer.appendChild(img);
    });

    const images = carouselContainer.querySelectorAll('img');

    carouselInterval = setInterval(() => {
        images[currentImageIndex].classList.remove('active');
        currentImageIndex = (currentImageIndex + 1) % images.length;
        images[currentImageIndex].classList.add('active');
    }, 8000); // Cambia cada 8 segundos (8000 ms)
}

/**
 * Detiene el carrusel de imágenes.
 */
function stopCarousel() {
    clearInterval(carouselInterval);
}

/**
 * Valida que los 6 números ingresados para la combinación sean únicos y estén dentro del rango.
 * @returns {Array|null} Array de números válidos o null si hay errores.
 */
function validateCombinationInput() {
    const numbers = [];
    let isValid = true;
    const enteredValues = new Set(); // Para verificar unicidad

    comboNumbers.forEach(input => {
        const num = parseInt(input.value);
        if (isNaN(num) || num < 1 || num > 56) {
            isValid = false;
            input.style.borderColor = 'red'; // Feedback visual
        } else if (enteredValues.has(num)) {
            isValid = false;
            input.style.borderColor = 'red'; // Feedback visual
        }
        else {
            numbers.push(num);
            enteredValues.add(num);
            input.style.borderColor = 'var(--primary-color)'; // Volver a color normal
        }
    });

    if (numbers.length !== 6) { // Asegurarse de que haya 6 números
        isValid = false;
    }

    if (!isValid) {
        alert('Por favor, ingresa 6 números únicos entre 1 y 56.');
        return null;
    }
    return numbers.sort((a, b) => a - b); // Devolver ordenados
}


// --- LÓGICA DE AUTENTICACIÓN (ESQUELETO PARA FIREBASE) ---
// Estas funciones se conectarán a Firebase Authentication una vez que esté configurado.

function handleAuthStateChanged(user) {
    if (user) {
        // Usuario logueado
        userDisplay.style.display = 'inline-block';
        userNameSpan.textContent = user.displayName || user.email;
        authButton.textContent = 'Cerrar Sesión';
        authButton.onclick = signOutGoogle;

        // Comprobar si es el primer login para preguntar por el sueño
        // (Esto requerirá interacción con Firestore para guardar el estado del usuario)
        // Por ahora, simulamos que preguntamos el sueño después del login
        checkUserDreamStatus(user.uid); // Función que se implementará con Firestore
    } else {
        // Usuario no logueado
        userDisplay.style.display = 'none';
        authButton.textContent = 'Iniciar Sesión con Google';
        authButton.onclick = signInGoogle;
        showSection(welcomeSection); // Regresar a la pantalla de bienvenida si no hay sesión
    }
}

async function signInGoogle() {
    // console.log("Intento de inicio de sesión con Google"); // Debug
    // Aquí iría la lógica de Firebase para signInWithPopup
    // try {
    //     const result = await auth.signInWithPopup(googleProvider);
    //     console.log("Usuario autenticado:", result.user);
    //     // handleAuthStateChanged ya se encargaría de actualizar la UI
    // } catch (error) {
    //     console.error("Error al iniciar sesión con Google:", error);
    //     alert("Error al iniciar sesión. Por favor, inténtalo de nuevo.");
    // }

    // --- SIMULACIÓN DE LOGIN PARA PRUEBAS SIN FIREBASE ---
    // REMOVER ESTO CUANDO FIREBASE ESTÉ ACTIVO
    const simulatedUser = {
        uid: "simulatedUserID123",
        displayName: "Usuario Demo",
        email: "demo@example.com",
        isNewUser: true // Simular que es un nuevo usuario para activar la pregunta del sueño
    };
    handleAuthStateChanged(simulatedUser);
    // --- FIN SIMULACIÓN ---
}

async function signOutGoogle() {
    // console.log("Intento de cierre de sesión"); // Debug
    // Aquí iría la lógica de Firebase para signOut
    // try {
    //     await auth.signOut();
    //     console.log("Sesión cerrada");
    //     // handleAuthStateChanged ya se encargaría de actualizar la UI
    // } catch (error) {
    //     console.error("Error al cerrar sesión:", error);
    //     alert("Error al cerrar sesión. Por favor, inténtalo de nuevo.");
    // }

    // --- SIMULACIÓN DE LOGOUT PARA PRUEBAS SIN FIREBASE ---
    // REMOVER ESTO CUANDO FIREBASE ESTÉ ACTIVO
    handleAuthStateChanged(null);
    // --- FIN SIMULACIÓN ---
}


// --- LÓGICA DEL SUEÑO/OBJETIVO (REQUERIRÁ FIREBASE FIRESTORE) ---
async function checkUserDreamStatus(uid) {
    // Esto se implementará con Firestore para verificar si el usuario ya ha establecido su sueño.
    // Si no lo ha hecho, mostrar dreamQuestionSection.
    // Si ya lo hizo, mostrar nextDrawAnalysisSection.

    // --- SIMULACIÓN PARA PRUEBAS SIN FIREBASE ---
    // Simular que el usuario no ha establecido un sueño (mostrar la sección del sueño)
    // En una aplicación real, esto se leería de Firestore.
    const userHasDream = false; // Cambiar a true para simular que ya tiene un sueño
    if (!userHasDream) {
        showSection(dreamQuestionSection);
    } else {
        showSection(nextDrawAnalysisSection);
        startCarousel();
    }
    // --- FIN SIMULACIÓN ---
}

async function saveUserDream(uid, dreamValue) {
    // console.log("Guardando sueño:", uid, dreamValue); // Debug
    // Aquí iría la lógica para guardar en Firestore
    // try {
    //     await db.collection('users').doc(uid).set({ dream: dreamValue }, { merge: true });
    //     console.log("Sueño guardado con éxito!");
    //     showSection(nextDrawAnalysisSection);
    //     startCarousel();
    // } catch (error) {
    //     console.error("Error al guardar el sueño:", error);
    //     alert("Hubo un error al guardar tu sueño. Por favor, inténtalo de nuevo.");
    // }

    // --- SIMULACIÓN PARA PRUEBAS SIN FIREBASE ---
    console.log(`Sueño simulado guardado para ${uid}: ${dreamValue}`);
    alert(`Tu sueño "${dreamValue}" ha sido guardado. ¡Ahora a analizar!`);
    showSection(nextDrawAnalysisSection);
    startCarousel();
    // --- FIN SIMULACIÓN ---
}


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Esto es vital para Firebase Auth. Escucha cambios en el estado de autenticación.
    // auth.onAuthStateChanged(handleAuthStateChanged); // Descomentar cuando Firebase esté activo

    // --- SIMULACIÓN DE INICIO: SI NO HAY USUARIO, MOSTRAR BIENVENIDA ---
    // Comenta la línea `auth.onAuthStateChanged` y descomenta la siguiente para probar sin Firebase activo.
    handleAuthStateChanged(null); // Simula que nadie está logueado al cargar
    // --- FIN SIMULACIÓN ---

    // Navegación principal
    navNextDraw.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(nextDrawAnalysisSection);
        startCarousel();
    });

    navMyCombination.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(myCombinationAnalysisSection);
        stopCarousel(); // Detener el carrusel cuando no está en la sección de análisis de sorteo
    });

    // Botón de inicio de sesión de Google en la pantalla de bienvenida
    googleSignInBtn.addEventListener('click', signInGoogle);
    // El botón en el header (authButton) se gestiona por handleAuthStateChanged

    // Lógica para el dropdown de sueño
    dreamDropdown.addEventListener('change', () => {
        if (dreamDropdown.value === 'otro') {
            customDreamInput.style.display = 'block';
        } else {
            customDreamInput.style.display = 'none';
            customDreamInput.value = ''; // Limpiar si no se usa
        }
    });

    saveDreamBtn.addEventListener('click', () => {
        const selectedDream = dreamDropdown.value;
        let dreamToSave = '';

        if (selectedDream === 'otro') {
            dreamToSave = customDreamInput.value.trim();
        } else {
            dreamToSave = selectedDream;
        }

        if (dreamToSave) {
            // Aquí se debería obtener el UID del usuario actualmente logueado de Firebase
            // Para la simulación, usamos un UID ficticio
            const userId = "simulatedUserID123"; // Reemplazar con user.uid de Firebase
            saveUserDream(userId, dreamToSave);
        } else {
            alert('Por favor, selecciona o escribe tu sueño.');
        }
    });

    // Validar input de números de combinación
    comboNumbers.forEach(input => {
        input.addEventListener('input', () => {
            if (input.value) {
                input.value = Math.max(1, Math.min(56, parseInt(input.value) || 0));
            }
        });
        input.addEventListener('blur', () => { // Quitar focus para limpiar estilos de validación
            input.style.borderColor = 'var(--primary-color)';
        });
    });

    // Botón de analizar mi combinación
    analyzeMyComboBtn.addEventListener('click', () => {
        const userCombination = validateCombinationInput();
        if (userCombination) {
            console.log("Combinación del usuario para analizar:", userCombination);
            // Aquí se llamaría a la función para analizar la combinación y mostrar resultados
            // displayCombinationAnalysis(userCombination); // Se implementará más adelante
            alert(`Analizando tu combinación: ${userCombination.join(', ')}`); // Simulación
        }
    });
});

// --- FUNCIONES DE ANÁLISIS (Se implementarán más adelante con lógica de probabilidad y datos históricos) ---
function displayHistoricalData(data) {
    // Implementar la visualización de datos históricos aquí
    console.log("Mostrar datos históricos:", data);
}

function displayPatternAnalysis(analysis) {
    // Implementar la visualización del análisis de patrones aquí
    console.log("Mostrar análisis de patrones:", analysis);
}

function displayPrediction(prediction) {
    // Implementar la visualización de la predicción aquí
    console.log("Mostrar predicción:", prediction);
}

function displayCombinationAnalysis(combination, results) {
    // Implementar la visualización de los resultados de la combinación aquí
    console.log("Mostrar análisis de combinación:", combination, results);
}

// --- Aquí se añadirán funciones para obtener datos de la API de Melate, limpiar, etc. ---
// Esto requerirá un backend (por ejemplo, con Firebase Functions) o un proxy CORS
// si la API no permite peticiones directas desde el navegador.
