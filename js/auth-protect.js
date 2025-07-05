// js/auth-protect.js

document.addEventListener("DOMContentLoaded", () => {
  if (typeof firebase === "undefined") {
    console.error("Firebase no está definido");
    return;
  }

  firebase.auth().onAuthStateChanged((user) => {
    const isLoginPage = window.location.pathname.includes("login.html");

    if (user) {
      // Mostrar nombre si es posible
      const nameSpan = document.getElementById("userName");
      if (nameSpan) nameSpan.textContent = `Hola, ${user.displayName || 'usuario'}`;

      if (isLoginPage) window.location.href = "index.html";
    } else {
      if (!isLoginPage) window.location.href = "login.html";
    }
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      firebase.auth().signOut().then(() => {
        window.location.href = "login.html";
      });
    });
  }
});