// === Inicialización de Firebase YA ME VI ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// Puedes importar otros servicios si lo necesitas desde este archivo

const firebaseConfig = {
  apiKey: "AIzaSyB4bCGyyPuQo-3-ONMPFKtqPEJDFl8Cb54",
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.firebasestorage.app",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:web:070d1eb476d38594d002fe",
  measurementId: "G-D7R797S5BC"
};

// Inicializa Firebase
export const app = initializeApp(firebaseConfig);
