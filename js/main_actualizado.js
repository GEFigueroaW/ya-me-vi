
// Fondo rotatorio
const background = document.getElementById('background');
const images = ['assets/vg1.jpg', 'assets/vg2.jpg', 'assets/vg3.jpg', 'assets/vg4.jpg', 'assets/vg5.jpg'];
let bgIndex = 0;

function rotateBackground() {
  bgIndex = (bgIndex + 1) % images.length;
  background.style.opacity = 0.5;
  setTimeout(() => {
    background.style.backgroundImage = `url(${images[bgIndex]})`;
    background.style.opacity = 1;
  }, 500);
}

background.style.backgroundImage = `url(${images[bgIndex]})`;
background.style.backgroundSize = 'cover';
background.style.backgroundPosition = 'center';
background.style.transition = 'background-image 1s ease-in-out';
setInterval(rotateBackground, 3000);

// Login y selección de sueño
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;
    const db = firebase.firestore();
    const docRef = db.collection("users").doc(user.uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Mostrar modal visual de sueño
      document.getElementById("modalSueno").classList.add("is-active");

      document.getElementById("btnGuardarSueno").onclick = async () => {
        const seleccionado = document.querySelector('input[name="sueno"]:checked');
        if (!seleccionado) {
          alert("Por favor, selecciona un sueño antes de continuar.");
          return;
        }
        const suenoElegido = seleccionado.value;
        await docRef.set({
          name: user.displayName,
          email: user.email,
          sueño: suenoElegido
        });

        alert(`¡Bienvenido, ${user.displayName}! Vas tras tu sueño: ${suenoElegido}`);
        document.getElementById("modalSueno").classList.remove("is-active");
        window.location.href = "analisis.html";
      };
    } else {
      const data = doc.data();
      alert(`¡Bienvenido de nuevo, ${data.name}! Vas tras tu sueño: ${data.sueño}`);
      window.location.href = "analisis.html";
    }
  } catch (error) {
    console.error("Error de login:", error);
    alert("No se pudo iniciar sesión.");
  }
});
