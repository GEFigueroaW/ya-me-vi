// js/auth-protect.js

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const isLoginPage = path.endsWith("login.html") || path === "/login.html";

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // ✅ Redirección desde login a index si ya hay sesión activa
      if (isLoginPage) {
        window.location.href = "index.html";
      } else {
        // ✅ Mostrar nombre del usuario si está logueado
        const nameSpan = document.getElementById("userName");
        if (nameSpan && user.displayName) {
          nameSpan.textContent = `Hola, ${user.displayName}`;
        }
      }
    } else {
      // ⛔ Redirección a login si no hay sesión activa
      if (!isLoginPage) {
        window.location.href = "login.html";
      }
    }
  });

  // 🔘 Botón de cierre de sesión
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await firebase.auth().signOut();
        window.location.href = "login.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Ocurrió un error al cerrar sesión. Intenta de nuevo.");
      }
    });
  }
});
