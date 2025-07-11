
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth } from "./firebase-init.js";

const provider = new GoogleAuthProvider();

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Inicio de sesión exitoso");
        window.location.href = "bienvenida.html";
    } catch (error) {
        console.error(error.message);
        alert("Error al iniciar sesión: " + error.message);
    }
});

document.getElementById("google-login-btn").addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
        alert("Inicio de sesión con Google exitoso");
        window.location.href = "bienvenida.html";
    } catch (error) {
        console.error(error.message);
        alert("Error con Google: " + error.message);
    }
});
