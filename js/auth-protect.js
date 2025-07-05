// js/auth-protect.js

document.addEventListener("DOMContentLoaded", () => {
  // Esperar a que Firebase esté disponible
  if (typeof firebase === "undefined") {
    console.error("Firebase no está definido. Verifica que firebase-init.js se haya cargado correctamente.");
    return;
  }

  firebase.auth().onAuthStateChanged((user) => {
    const isLoginPage = window.location.pathname.includes("login.html");

    if (user) {
      // Si hay sesión activa y estás en login.html, redirige a index.html
      if (isLoginPage) {
        window.location.href = "index.html";
      } else {
        // Mostrar nombre del usuario en páginas protegidas
        const nameSpan = document.getElementById("userName");
        if (nameSpan) {
          nameSpan.textContent = `Hola, ${user.displayName}`;
        }
      }
    } else {
      // Si no hay sesión activa y no estás en login, redirige a login.html
      if (!isLoginPage) {
        window.location.href = "login.html";
      }
    }
  });

  // Cierre de sesión
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      firebase.auth().signOut()
        .then(() => {
          window.location.href = "login.html";
        })
        .catch((error) => {
          console.error("Error al cerrar sesión:", error);
        });
    });
  }
});
