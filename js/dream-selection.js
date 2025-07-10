// js/dream-selection.js

document.addEventListener('DOMContentLoaded', () => {
  const savedDream = localStorage.getItem('selectedDream');
  if (savedDream) {
    window.location.href = 'menu.html';
    return;
  }

  const dreamButtons = document.querySelectorAll('.dream-button');
  dreamButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.getAttribute('data-dream');
      localStorage.setItem('selectedDream', selected);

      const user = firebase.auth().currentUser;
      if (user) {
        const db = firebase.firestore();
        db.collection('users').doc(user.uid).set({
          dream: selected
        }, { merge: true }).then(() => {
          window.location.href = 'menu.html';
        });
      } else {
        window.location.href = 'menu.html';
      }
    });
  });
});
