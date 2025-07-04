// /js/auth-protect.js

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    // No autenticado, redirigir a login
    window.location.href = "home.html";
  } else {
    // Mostrar nombre del usuario en la interfaz
    document.getElementById("userName").innerText = `Hola, ${user.displayName}`;
  }
});

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "home.html";
  });
});
