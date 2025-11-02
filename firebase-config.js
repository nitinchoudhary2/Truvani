// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, serverTimestamp, doc, updateDoc, deleteDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAeGWwKLkHB43i1FbedgkANPKcTCBh0Z9A",
  authDomain: "truvani-news-5ac15.firebaseapp.com",
  projectId: "truvani-news-5ac15",
  storageBucket: "truvani-news-5ac15.firebasestorage.app",
  messagingSenderId: "742142167141",
  appId: "1:742142167141:web:c2c116f5e50a574de85e8c"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { serverTimestamp, doc, updateDoc, deleteDoc, addDoc, collection };
