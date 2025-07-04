// /js/auth.js

// Verifica si ya hay un usuario logeado (útil si alguien ya inició sesión previamente)
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    // Usuario autenticado: redirige a la app
    window.location.href = "index.html";
  }
});

// Iniciar sesión con Google
document.getElementById("loginBtn").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      console.log("Login exitoso:", user.displayName);
      // Redirige manualmente en caso de que el onAuthStateChanged no lo haga
      window.location.href = "index.html";
    })
    .catch(error => {
      console.error("Error al iniciar sesión:", error);
      alert("Hubo un problema con el inicio de sesión. Intenta nuevamente.");
    });
});
