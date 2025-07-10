// js/router.js

document.addEventListener('DOMContentLoaded', () => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // Ya está logueado
      const storedDream = localStorage.getItem('selectedDream');
      if (storedDream) {
        window.location.href = 'menu.html';
      } else {
        window.location.href = 'seleccion-suenos.html';
      }
    } else {
      // No está logueado
      window.location.href = 'login.html';
    }
  });
});
