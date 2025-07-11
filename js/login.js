
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const googleBtn = document.getElementById("googleLogin");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          window.location.href = "home.html";
        })
        .catch((error) => {
          alert("Error al iniciar sesión: " + error.message);
        });
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener("click", function () {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider)
        .then((result) => {
          window.location.href = "home.html";
        })
        .catch((error) => {
          alert("Error al iniciar sesión con Google: " + error.message);
        });
    });
  }
});
