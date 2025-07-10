// js/logout.js

// Botón manual de logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      localStorage.clear();
      window.location.href = 'index.html';
    });
  });
}

// Logout automático a la medianoche
function autoLogoutAtMidnight() {
  const now = new Date();
  const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) - now;
  setTimeout(() => {
    firebase.auth().signOut().then(() => {
      localStorage.clear();
      window.location.href = 'index.html';
    });
  }, millisTillMidnight);
}

autoLogoutAtMidnight();
