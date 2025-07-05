// auth.js

// Espera el resultado del login por redirección
firebase.auth().getRedirectResult()
  .then((result) => {
    if (result.user) {
      console.log("✅ Usuario autenticado tras redirect:", result.user.displayName);
      window.location.href = "index.html"; // Redirige después del login
    }
  })
  .catch((error) => {
    console.error("❌ Error después del redirect:", error.message);
    alert("Error tras el inicio de sesión. Intenta de nuevo.");
  });

// Este bloque se mantiene para control automático de sesión
firebase.auth().onAuthStateChanged((user) => {
  const currentPage = window.location.pathname;

  // Si está en home.html y el usuario YA está logueado, redirige a index.html
  if (user && currentPage.includes("home.html")) {
    window.location.href = "index.html";
  }

  // Si está en index.html y NO hay usuario, redirige a home.html
  if (!user && currentPage.includes("index.html")) {
    window.location.href = "home.html";
  }

  // Mostrar nombre del usuario
  if (user && document.getElementById("userName")) {
    document.getElementById("userName").textContent = `👤 ${user.displayName}`;
  }
});

// Login con Google
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
}

// Logout
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "home.html";
  });
}

// Asignar eventos al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn) loginBtn.addEventListener("click", loginWithGoogle);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});
