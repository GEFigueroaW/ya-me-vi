
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth } from "./firebase-init.js";

const provider = new GoogleAuthProvider();

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        alert("Registro exitoso");
        window.location.href = "bienvenida.html";
    } catch (error) {
        console.error(error.message);
        alert("Error al registrar: " + error.message);
    }
});

document.getElementById("google-register-btn").addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
        alert("Registro con Google exitoso");
        window.location.href = "bienvenida.html";
    } catch (error) {
        console.error(error.message);
        alert("Error con Google: " + error.message);
    }
});
