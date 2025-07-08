// --- CONFIGURACIÓN DE FIREBASE (¡AHORA CON TUS CREDENCIALES!) ---
const firebaseConfig = {
    apiKey: "AIzaSyCScJA-UGs3WcBnfAm-6K94ybZ4bzBahz8",
    authDomain: "brain-storm-8f0d8.firebaseapp.com",
    projectId: "brain-storm-8f0d8",
    storageBucket: "brain-storm-8f0d8.appspot.com",
    messagingSenderId: "401208607043",
    appId: "1:401208607043:web:6f35fc81fdce7b3fbeaff6"
    // measurementId: "TU_MEASUREMENT_ID" // Si lo tienes, puedes añadirlo aquí
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();
// --- FIN DE CONFIGURACIÓN DE FIREBASE ---


// --- ELEMENTOS DEL DOM (se mantienen igual) ---
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

// --- IMÁGENES DEL CARRUSEL (se mantienen igual) ---
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

// --- FUNCIONES DE LA INTERFAZ (se mantienen igual) ---

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
            section.style.display = 'flex';
        } else {
            section.classList.remove('active-section');
            section.style.display = 'none';
        }
    });
}

function startCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }

    carouselContainer.innerHTML = ''; // Asegurarse de que el contenedor esté vacío

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

function stopCarousel() {
    clearInterval(carouselInterval);
}

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


// --- LÓGICA DE AUTENTICACIÓN (¡AHORA REAL CON FIREBASE!) ---

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
        // console.log("Usuario autenticado:", result.user); // Puedes descomentar para depurar
        // handleAuthStateChanged ya se encargaría de actualizar la UI
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
        alert("Error al iniciar sesión. Por favor, inténtalo de nuevo. Detalles: " + error.message);
    }
}

async function signOutGoogle() {
    try {
        await auth.signOut();
        // console.log("Sesión cerrada"); // Puedes descomentar para depurar
        // handleAuthStateChanged ya se encargaría de actualizar la UI
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Error al cerrar sesión. Por favor, inténtalo de nuevo. Detalles: " + error.message);
    }
}


// --- LÓGICA DEL SUEÑO/OBJETIVO (AHORA CON FIREBASE FIRESTORE) ---
async function checkUserDreamStatus(uid) {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists && userDoc.data().dream) {
            // El usuario ya tiene un sueño guardado, ir directamente a la sección de análisis
            showSection(nextDrawAnalysisSection);
            startCarousel();
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
        startCarousel();
    } catch (error) {
        console.error("Error al guardar el sueño:", error);
        alert("Hubo un error al guardar tu sueño. Por favor, inténtalo de nuevo. Detalles: " + error.message);
    }
}


// --- EVENT LISTENERS (Actualizados para Firebase) ---
document.addEventListener('DOMContentLoaded', () => {
    // Esto es vital para Firebase Auth. Escucha cambios en el estado de autenticación.
    auth.onAuthStateChanged(handleAuthStateChanged);

    // Navegación principal
    navNextDraw.addEventListener('click', (e) => {
        e.preventDefault();
        if (auth.currentUser) { // Solo permitir navegar si está logueado
            showSection(nextDrawAnalysisSection);
            startCarousel();
        } else {
            alert("Por favor, inicia sesión para acceder a esta sección.");
            showSection(welcomeSection);
        }
    });

    navMyCombination.addEventListener('click', (e) => {
        e.preventDefault();
        if (auth.currentUser) { // Solo permitir navegar si está logueado
            showSection(myCombinationAnalysisSection);
            stopCarousel();
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
