// js/auth-protect.js

firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    // Si no hay usuario logueado, redirige al inicio de sesión
    window.location.href = 'index.html';
  }
});
