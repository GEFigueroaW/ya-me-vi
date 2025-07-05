// auth.js

// Login con Google (evita redirect)
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      console.log("✅ Usuario autenticado:", result.user.displayName);
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("❌ Error en el login con popup:", error.message);
      alert("Error al iniciar sesión. Intenta de nuevo.");
    });
}

// Logout
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "home.html";
  });
}

// Control de sesión
firebase.auth().onAuthStateChanged((user) => {
  const currentPage = window.location.pathname;

  if (user && currentPage.includes("home.html")) {
    window.location.href = "index.html";
  }

  if (!user && currentPage.includes("index.html")) {
    window.location.href = "home.html";
  }

  if (user && document.getElementById("userName")) {
    document.getElementById("userName").textContent = `👤 ${user.displayName}`;
  }
});

// Asignar eventos
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn) loginBtn.addEventListener("click", loginWithGoogle);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});
