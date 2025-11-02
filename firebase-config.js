// Firebase configuration (replace your details)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAeGWwKLkHB43i1FbedgkANPKcTCBh0Z9A",
  authDomain: "truvani-news.firebaseapp.com",
  projectId: "truvani-news",
  storageBucket: "truvani-news.appspot.com",
  messagingSenderId: "1056789456123",
  appId: "1:1056789456123:web:abc123xyz"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp };
