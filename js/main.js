const background = document.getElementById('background');
const images = ['assets/vg1.jpg', 'assets/vg2.jpg', 'assets/vg3.jpg', 'assets/vg4.jpg', 'assets/vg5.jpg'];
let bgIndex = 0;

function rotateBackground() {
  bgIndex = (bgIndex + 1) % images.length;
  background.style.opacity = 0.5;
  setTimeout(() => {
    background.style.backgroundImage = `url(${images[bgIndex]})`;
    background.style.opacity = 1;
  }, 500);
}
background.style.backgroundImage = `url(${images[bgIndex]})`;
background.style.backgroundSize = 'cover';
background.style.backgroundPosition = 'center';
background.style.transition = 'background-image 1s ease-in-out';
setInterval(rotateBackground, 3000);

// Firebase
let userUID = null;
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    userUID = user.uid;
    showMenu(user);
    checkDream(user.uid);
    logoutAtMidnight();
  } else {
    document.getElementById('auth-section').classList.remove('is-hidden');
    document.getElementById('menu').classList.add('is-hidden');
  }
});

document.getElementById('loginGoogleBtn').addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).catch(console.error);
});

document.getElementById('registerBtn').addEventListener('click', () => {
  const email = prompt("Tu correo:");
  const password = prompt("Tu contraseña:");
  const name = prompt("¿Cómo quieres que te llamemos?");
  if (email && password && name) {
    firebase.auth().createUserWithEmailAndPassword(email, password).then(async (cred) => {
      await firebase.firestore().collection('users').doc(cred.user.uid).set({ name });
    }).catch(console.error);
  }
});

document.getElementById('loginEmailBtn').addEventListener('click', () => {
  const email = prompt("Tu correo:");
  const password = prompt("Tu contraseña:");
  if (email && password) {
    firebase.auth().signInWithEmailAndPassword(email, password).catch(console.error);
  }
});

document.getElementById('resetPasswordLink').addEventListener('click', () => {
  const email = prompt("Introduce tu correo:");
  if (email) {
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => alert("Revisa tu correo para restablecer tu contraseña"))
      .catch(console.error);
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  firebase.auth().signOut();
});

function showMenu(user) {
  document.getElementById('auth-section').classList.add('is-hidden');
  document.getElementById('menu').classList.remove('is-hidden');
  const welcome = document.getElementById('welcome');
  firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
    const name = doc.data()?.name || user.displayName || "Usuario";
    const dream = doc.data()?.dream || "";
    welcome.textContent = dream
      ? `¡Bienvenido de nuevo! Vas tras tu sueño: ${dream}.`
      : `¡Hola ${name}!`;
  });
}

function checkDream(uid) {
  firebase.firestore().collection('users').doc(uid).get().then(doc => {
    if (!doc.exists || !doc.data().dream) {
      document.getElementById('dreamModal').classList.add('is-active');
    }
  });
}

// Selección de sueños
document.querySelectorAll('.dream-button').forEach(btn => {
  btn.addEventListener('click', async () => {
    const dream = btn.dataset.dream;
    await firebase.firestore().collection('users').doc(userUID).update({ dream });
    document.getElementById('dreamModal').classList.remove('is-active');
    document.getElementById('welcome').textContent = `¡Bienvenido! Vas tras tu sueño: ${dream}.`;
  });
});

// Ir a análisis o combinación
document.getElementById('goToAnalisis').addEventListener('click', () => {
  window.location.href = 'analisis.html';
});
document.getElementById('goToCombinacion').addEventListener('click', () => {
  window.location.href = 'combinacion.html';
});

// Cerrar sesión automática a medianoche
function logoutAtMidnight() {
  const now = new Date();
  const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
  setTimeout(() => firebase.auth().signOut(), msToMidnight);
}
