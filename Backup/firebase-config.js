// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyATiNRjz17IU2gBa_eJV1Uf3RpisiKQP3g",
  authDomain: "camiongame.firebaseapp.com",
  projectId: "camiongame",
  storageBucket: "camiongame.firebasestorage.app",
  messagingSenderId: "398232960171",
  appId: "1:398232960171:web:896ff964124b4bd516cbee",
  measurementId: "G-3VHY268JGL"
};

// Inicialización
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
