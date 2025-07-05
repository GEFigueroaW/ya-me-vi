// /js/firebase-init.js

const firebaseConfig = {
  apiKey: "AIzaSyB4bCGyyPuQo-3-ONMPFKtqPEJDFl8Cb54",
  authDomain: "ya-me-vi.firebaseapp.com",
  projectId: "ya-me-vi",
  storageBucket: "ya-me-vi.appspot.com",
  messagingSenderId: "748876890843",
  appId: "1:748876890843:web:070d1eb476d38594d002fe",
  measurementId: "G-D7R797S5BC"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
