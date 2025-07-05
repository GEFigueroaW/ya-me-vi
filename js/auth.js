// auth.js

// Espera a que Firebase esté listo
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

  // Mostrar nombre de usuario si existe un contenedor
  if (user && document.getElementById("userName")) {
    document.getElementById("userName").textContent = `👤 ${user.displayName}`;
  }
});

// Función de login con Google
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth()
    .signInWithRedirect(provider)
    .catch((error) => {
      console.error("Error al iniciar sesión:", error.message);
      alert("Hubo un problema con el inicio de sesión. Intenta nuevamente.");
    });
}

// Función de logout (cierre de sesión)
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "home.html";
  });
}

// Asignar eventos a botones si existen
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn) loginBtn.addEventListener("click", loginWithGoogle);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});
