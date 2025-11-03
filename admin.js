import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAeGWwKLkHB43i1FbedgkANPKcTCBh0Z9A",
  authDomain: "truvani-news-5ac15.firebaseapp.com",
  projectId: "truvani-news-5ac15",
  storageBucket: "truvani-news-5ac15.appspot.com",
  messagingSenderId: "742142167141",
  appId: "1:742142167141:web:c2c116f5e50a574de85e8c"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Wait for HTML to load
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const authArea = document.getElementById("authArea");
  const adminArea = document.getElementById("adminArea");
  const authMsg = document.getElementById("authMsg");

  // 🔹 LOGIN
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    authMsg.style.color = "#fbbf24";
    authMsg.innerText = "Logging in...";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      authMsg.style.color = "#22c55e";
      authMsg.innerText = "✅ Login successful!";
      setTimeout(() => {
        authArea.style.display = "none";
        adminArea.style.display = "block";
        logoutBtn.style.display = "block";
      }, 1000);
    } catch (error) {
      authMsg.style.color = "#f87171";
      authMsg.innerText = "❌ " + error.message;
    }
  });

  // 🔹 LOGOUT
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    logoutBtn.style.display = "none";
    adminArea.style.display = "none";
    authArea.style.display = "block";
    authMsg.innerText = "";
  });

  // 🔹 ADD ARTICLE (basic example)
  const postBtn = document.getElementById("postBtn");
  postBtn.addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const imageUrl = document.getElementById("imageUrl").value;

    if (!title || !content) {
      alert("Please fill all fields!");
      return;
    }

    await addDoc(collection(db, "news"), {
      title,
      content,
      imageUrl,
      createdAt: new Date(),
    });

    alert("✅ Article Published!");
    document.getElementById("title").value = "";
    document.getElementById("content").value = "";
    document.getElementById("imageUrl").value = "";
  });
});
