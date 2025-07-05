// js/firebase-init.js

// SDK Compat (Firebase 9+ en modo compatibilidad)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js";

// Configuración del proyecto YA ME VI
const firebaseConfig = {
  apiKey: "AIzaSyCScJA-UGs3WcBnfAm-6K94ybZ4bzBahz8",
  authDomain: "brain-storm-8f0d8.firebaseapp.com",
  databaseURL: "https://brain-storm-8f0d8-default-rtdb.firebaseio.com",
  projectId: "brain-storm-8f0d8",
  storageBucket: "brain-storm-8f0d8.appspot.com",
  messagingSenderId: "401208607043",
  appId: "1:401208607043:web:6f35fc81fdce7b3fbeaff6"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
