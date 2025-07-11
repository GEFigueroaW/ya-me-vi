
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const googleBtn = document.getElementById("googleRegister");

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          window.location.href = "dream-input.html";
        })
        .catch((error) => {
          alert("Error al registrarse: " + error.message);
        });
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener("click", function () {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider)
        .then((result) => {
          window.location.href = "dream-input.html";
        })
        .catch((error) => {
          alert("Error al registrarse con Google: " + error.message);
        });
    });
  }
});
