import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5NrGVsCaqJ_LigOlAjq3uhGPJlpoImBU",
  authDomain: "hamouda-display.firebaseapp.com",
  projectId: "hamouda-display",
  storageBucket: "hamouda-display.firebasestorage.app",
  messagingSenderId: "919480813129",
  appId: "1:919480813129:web:e6a4f22bac5c868d0ee198",
  measurementId: "G-XMZ94WCTQG"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
