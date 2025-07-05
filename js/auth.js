// ===============================
// YA ME VI - Autenticación Firebase
// ===============================

// 🔁 Obtener resultado del login por redirección (solo una vez)
firebase.auth().getRedirectResult()
  .then((result) => {
    if (result.user) {
      console.log("✅ Usuario autenticado tras redirect:", result.user.displayName);
      // Redirige a la app si fue desde login
      window.location.href = "index.html";
    }
  })
  .catch((error) => {
    console.error("❌ Error tras redirect:", error.message);
    alert("Error al iniciar sesión. Intenta nuevamente.");
  });

// 👁️ Monitorea el estado de sesión del usuario
firebase.auth().onAuthStateChanged((user) => {
  const path = window.location.pathname;

  // Si está logueado y está en home.html, redirige a index
  if (user && path.includes("home.html")) {
    window.location.href = "index.html";
  }

  // Si NO está logueado y está en index.html, redirige a home
  if (!user && path.includes("index.html")) {
    window.location.href = "home.html";
  }

  // Si hay usuario y existe el contenedor, muestra su nombre
  const userNameEl = document.getElementById("userName");
  if (user && userNameEl) {
    userNameEl.textContent = `👤 ${user.displayName}`;
  }
});

// 🔐 Login con Google
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
}

// 🔓 Logout y volver a inicio
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "home.html";
  });
}

// 🧠 Eventos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn) loginBtn.addEventListener("click", loginWithGoogle);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});
