// js/auth-protect.js

document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged((user) => {
    const isLoginPage = window.location.pathname.includes("login.html");

    if (user) {
      // Si hay sesión activa y estás en login.html, redirige al index
      if (isLoginPage) {
        window.location.href = "index.html";
      } else {
        // Mostrar el nombre del usuario en todas las páginas protegidas
        const nameSpan = document.getElementById("userName");
        if (nameSpan) nameSpan.textContent = `Hola, ${user.displayName}`;
      }
    } else {
      // Si no hay sesión activa y no estás en login, redirige a login
      if (!isLoginPage) {
        window.location.href = "login.html";
      }
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
