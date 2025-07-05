// auth.js

// Obtener resultado después del redirect (si aplica)
firebase.auth().getRedirectResult()
  .then((result) => {
    if (result.user) {
      console.log("Usuario autenticado tras redirect:", result.user.displayName);
      window.location.href = "index.html"; // Redirige tras login exitoso
    }
  })
  .catch((error) => {
    console.error("Error después del redirect:", error.message);
    alert("Error tras el inicio de sesión. Intenta de nuevo.");
  });

// Control de sesión y redirección automática
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

// Login con Google
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth().signInWithRedirect(provider)
    .catch((error) => {
      console.error("Error al iniciar sesión:", error.message);
      alert("Hubo un problema con el inicio de sesión. Intenta nuevamente.");
    });
}

// Logout
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "home.html";
  });
}

// Asignación de eventos
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn) loginBtn.addEventListener("click", loginWithGoogle);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});
