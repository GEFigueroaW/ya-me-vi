// auth-protect.js

document.addEventListener("DOMContentLoaded", () => {
  // Esperar a que Firebase esté listo
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // Mostrar nombre del usuario
      const userName = document.getElementById("userName");
      if (userName) {
        userName.textContent = `Hola, ${user.displayName || user.email}`;
      }

      // Configurar botón de logout
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          firebase.auth().signOut().then(() => {
            window.location.href = "login.html";
          }).catch(error => {
            console.error("Error al cerrar sesión:", error);
          });
        });
      }
    } else {
      // Redirigir si no está autenticado
      window.location.href = "login.html";
    }
  });
});
