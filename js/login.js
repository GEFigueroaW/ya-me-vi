// js/login.js

document.getElementById('googleLogin').addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      localStorage.setItem('displayName', user.displayName);
      window.location.href = 'menu.html';
    })
    .catch((error) => {
      alert('Error al iniciar sesión con Google: ' + error.message);
    });
});

document.getElementById('emailLoginForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  const displayName = document.getElementById('displayNameInput').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((result) => {
      localStorage.setItem('displayName', displayName);
      window.location.href = 'menu.html';
    })
    .catch((error) => {
      if (error.code === 'auth/user-not-found') {
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then((result) => {
            return result.user.updateProfile({ displayName: displayName });
          })
          .then(() => {
            localStorage.setItem('displayName', displayName);
            window.location.href = 'menu.html';
          });
      } else {
        alert('Error: ' + error.message);
      }
    });
});

document.getElementById('resetPassword').addEventListener('click', () => {
  const email = prompt('Ingresa tu correo para recuperar contraseña:');
  if (email) {
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => alert('Correo de recuperación enviado'))
      .catch((error) => alert('Error: ' + error.message));
  }
});
