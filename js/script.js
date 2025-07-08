// --- CONFIGURACIÓN DE FIREBASE (¡CON TUS CREDENCIALES DEL PROYECTO 'ya-me-vi'!) ---
const firebaseConfig = {
    apiKey: "AIzaSyB4bCGyyPuQo-3-ONMPFKtqPEJDFl8Cb54",
    authDomain: "ya-me-vi.firebaseapp.com",
    projectId: "ya-me-vi",
    storageBucket: "ya-me-vi.firebasestorage.app",
    messagingSenderId: "748876890843",
    appId: "1:748876890843:web:070d1eb476d38594d002fe",
    measurementId: "G-D7R797S5BC"
};

// Inicializa Firebase (usando la sintaxis 'compat' compatible con tus SDKs de index.html)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();
// --- FIN DE CONFIGURACIÓN DE FIREBASE ---


// --- ELEMENTOS DEL DOM ---
const welcomeSection = document.getElementById('welcome-section');
const dreamQuestionSection = document.getElementById('dream-question-section');
const nextDrawAnalysisSection = document.getElementById('next-draw-analysis-section');
const myCombinationAnalysisSection = document.getElementById('my-combination-analysis-section');

const navNextDraw = document.getElementById('nav-next-draw');
const navMyCombination = document.getElementById('nav-my-combination');
const authButton = document.getElementById('auth-button'); // Botón de "Iniciar Sesión" en el header
const googleSignInBtn = document.getElementById('google-signin-btn'); // Botón de "Iniciar Sesión con Google" en welcome-section
const userDisplay = document.getElementById('user-display');
const userNameSpan = document.getElementById('user-name');

const dreamDropdown = document.getElementById('dream-dropdown');
const customDreamInput = document.getElementById('custom-dream-input');
const saveDreamBtn = document.getElementById('save-dream-btn');

const carouselContainer = document.querySelector('.background-carousel');
const comboNumbers = document.querySelectorAll('.combo-number');
const analyzeMyComboBtn = document.getElementById('analyze-my-combo-btn');

// Elementos para mostrar datos históricos (nuevos)
const historicalDataLoader = document.getElementById('historical-data-loader');
const historicalDataContent = document.getElementById('historical-data-content');


// --- IMÁGENES DEL CARRUSEL ---
// Las rutas de tus imágenes subidas (asegúrate de que los nombres de archivo sean correctos y estén en la raíz)
const carouselImages = [
    './bg1.jpg', // Casa
    './bg2.jpg', // Coche
    './bg3.jpg', // Éxito Familiar
    './bg4.jpg', // Éxito Profesional (Hombre)
    './bg5.jpg'  // Éxito Profesional (Mujer)
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

    // Detener/Iniciar carrusel según la sección
    if (sectionToShow === nextDrawAnalysisSection) {
        startCarousel();
    } else {
        stopCarousel();
    }
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


// --- LÓGICA DE AUTENTICACIÓN (REAL CON FIREBASE) ---

function handleAuthStateChanged(user) {
    if (user) {
        // Usuario logueado
        userDisplay.style.display = 'inline-block';
        userNameSpan.textContent = user.displayName || user.email;
        authButton.textContent = 'Cerrar Sesión';
        authButton.onclick = signOutGoogle;

        // Comprobar si es el primer login o si ya ha definido su sueño
        checkUserDreamStatus(user.uid);
    } else {
        // Usuario no logueado
        userDisplay.style.display = 'none';
        authButton.textContent = 'Iniciar Sesión con Google';
        authButton.onclick = signInGoogle;
        showSection(welcomeSection); // Regresar a la pantalla de bienvenida si no hay sesión
    }
}

async function signInGoogle() {
    try {
        await auth.signInWithPopup(googleProvider);
        // handleAuthStateChanged ya se encargaría de actualizar la UI
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
        alert("Error al iniciar sesión. Por favor, inténtalo de nuevo. Detalles: " + error.message);
    }
}

async function signOutGoogle() {
    try {
        await auth.signOut();
        // handleAuthStateChanged ya se encargaría de actualizar la UI
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Error al cerrar sesión. Por favor, inténtalo de nuevo. Detalles: " + error.message);
    }
}


// --- LÓGICA DEL SUEÑO/OBJETIVO (CON FIREBASE FIRESTORE) ---
async function checkUserDreamStatus(uid) {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists && userDoc.data().dream) {
            // El usuario ya tiene un sueño guardado, ir directamente a la sección de análisis
            showSection(nextDrawAnalysisSection);
            // Cargar datos históricos al entrar a la sección de análisis
            fetchAndDisplayHistoricalData();
        } else {
            // Es la primera vez que se loguea o no tiene un sueño, preguntar
            showSection(dreamQuestionSection);
        }
    } catch (error) {
        console.error("Error al verificar el estado del sueño del usuario:", error);
        // En caso de error, por seguridad, mostrar la sección de pregunta de sueño
        showSection(dreamQuestionSection);
    }
}

async function saveUserDream(uid, dreamValue) {
    try {
        await db.collection('users').doc(uid).set({ dream: dreamValue }, { merge: true });
        console.log("Sueño guardado con éxito!");
        alert(`¡Tu sueño "${dreamValue}" ha sido guardado! ¡Ahora a analizar!`);
        showSection(nextDrawAnalysisSection);
        fetchAndDisplayHistoricalData(); // Cargar datos históricos después de guardar el sueño
    } catch (error) {
        console.error("Error al guardar el sueño:", error);
        alert("Hubo un error al guardar tu sueño. Por favor, inténtalo de nuevo. Detalles: " + error.message);
    }
}

// --- LÓGICA DE DATOS HISTÓRICOS Y ANÁLISIS (¡INTEGRACIÓN CON FIREBASE FUNCTIONS!) ---

/**
 * Llama a la Firebase Function para raspar los datos y luego los muestra.
 */
async function fetchAndDisplayHistoricalData() {
    historicalDataLoader.textContent = 'Cargando datos históricos... Esto puede tomar unos segundos.';
    historicalDataLoader.style.display = 'block';
    historicalDataContent.innerHTML = ''; // Limpiar contenido anterior

    try {
        // Obtenemos una referencia a la función callable
        const scrapeMelate = firebase.functions().httpsCallable('scrapeMelateResults');
        const result = await scrapeMelate();

        console.log("Resultados del scraping:", result.data.data); // Los datos que la función devuelve

        // Ahora, recuperamos los datos directamente de Firestore (son los mismos que la función guardó)
        const snapshot = await db.collection('melate_history').orderBy('timestamp', 'desc').limit(15).get();
        const historicalDraws = [];
        snapshot.forEach(doc => {
            historicalDraws.push(doc.data());
        });

        displayHistoricalData(historicalDraws); // Llama a la función para mostrar los datos
        historicalDataLoader.style.display = 'none'; // Oculta el loader

    } catch (error) {
        console.error("Error al obtener y mostrar datos históricos:", error);
        historicalDataLoader.textContent = 'Error al cargar los datos históricos. Asegúrate de que la Cloud Function esté desplegada y funcionando.';
        historicalDataLoader.style.color = 'red';
    }
}


/**
 * Muestra los datos históricos en la sección correspondiente.
 * @param {Array<Object>} data - Array de objetos de sorteos históricos.
 */
function displayHistoricalData(data) {
    if (!historicalDataContent) return; // Asegurarse de que el elemento exista

    if (data.length === 0) {
        historicalDataContent.innerHTML = '<p>No hay datos históricos disponibles aún. Intenta recargar o contacta al soporte.</p>';
        return;
    }

    let html = '<table>';
    html += '<thead><tr><th>Sorteo</th><th>Fecha</th><th>Melate</th><th>Revancha</th><th>Revanchita</th></tr></thead>';
    html += '<tbody>';

    data.forEach(draw => {
        html += `<tr>
            <td>${draw.sorteo}</td>
            <td>${draw.fecha}</td>
            <td>${draw.melate ? draw.melate.join(', ') : 'N/A'}</td>
            <td>${draw.revancha ? draw.revancha.join(', ') : 'N/A'}</td>
            <td>${draw.revanchita ? draw.revanchita.join(', ') : 'N/A'}</td>
        </tr>`;
    });

    html += '</tbody></table>';
    historicalDataContent.innerHTML = html;
}

function displayPatternAnalysis(analysis) {
    // Implementar la visualización del análisis de patrones aquí
    const patternAnalysisElement = document.querySelector('#next-draw-analysis-section .pattern-analysis p');
    if (patternAnalysisElement) {
        patternAnalysisElement.innerHTML = 'Análisis de patrones en desarrollo...'; // Placeholder
        // Aquí iría tu lógica de análisis y visualización
        // Ejemplo: patternAnalysisElement.innerHTML = `Números calientes: ${analysis.hotNumbers.join(', ')}<br>Números fríos: ${analysis.coldNumbers.join(', ')}`;
    }
    console.log("Mostrar análisis de patrones:", analysis);
}

function displayPrediction(prediction) {
    // Implementar la visualización de la predicción aquí
    const predictionElement = document.querySelector('#next-draw-analysis-section .prediction p');
    if (predictionElement) {
        predictionElement.innerHTML = 'Predicción en desarrollo...'; // Placeholder
        // Aquí iría tu lógica de predicción y visualización
        // Ejemplo: predictionElement.innerHTML = `Combinación sugerida: ${prediction.suggestedNumbers.join(', ')}`;
    }
    console.log("Mostrar predicción:", prediction);
}

function displayCombinationAnalysis(combination, results) {
    // Implementar la visualización de los resultados del análisis de la combinación del usuario
    const analysisResultsElement = document.querySelector('#my-combination-analysis-section .analysis-results p');
    if (analysisResultsElement) {
        analysisResultsElement.innerHTML = `Análisis de tu combinación ${combination.join(', ')} en desarrollo...`; // Placeholder
        // Aquí iría tu lógica de análisis de combinación y visualización
    }
    console.log("Mostrar análisis de combinación:", combination, results);
}


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Escucha cambios en el estado de autenticación de Firebase
    auth.onAuthStateChanged(handleAuthStateChanged);

    // Navegación principal
    navNextDraw.addEventListener('click', (e) => {
        e.preventDefault();
        if (auth.currentUser) { // Solo permitir navegar si está logueado
            showSection(nextDrawAnalysisSection);
            fetchAndDisplayHistoricalData(); // Cargar/actualizar datos al ir a esta sección
        } else {
            alert("Por favor, inicia sesión para acceder a esta sección.");
            showSection(welcomeSection);
        }
    });

    navMyCombination.addEventListener('click', (e) => {
        e.preventDefault();
        if (auth.currentUser) { // Solo permitir navegar si está logueado
            showSection(myCombinationAnalysisSection);
            stopCarousel(); // Detener el carrusel cuando no está en la sección de análisis de sorteo
        } else {
            alert("Por favor, inicia sesión para acceder a esta sección.");
            showSection(welcomeSection);
        }
    });

    // Botón de inicio de sesión de Google en la pantalla de bienvenida
    googleSignInBtn.addEventListener('click', signInGoogle);
    // El botón en el header (authButton) ya se gestiona por handleAuthStateChanged

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
            if (auth.currentUser) {
                saveUserDream(auth.currentUser.uid, dreamToSave);
            } else {
                alert("No hay usuario autenticado. Por favor, intenta iniciar sesión de nuevo.");
                showSection(welcomeSection);
            }
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
            displayCombinationAnalysis(userCombination); // Llama a la función para mostrar el análisis
        }
    });
});
