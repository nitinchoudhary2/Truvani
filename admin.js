import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ Firebase Config
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

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const authArea = document.getElementById("authArea");
  const adminArea = document.getElementById("adminArea");
  const authMsg = document.getElementById("authMsg");
  const postBtn = document.getElementById("postBtn");
  const aiBtn = document.getElementById("aiGenerateBtn");
  const cancelEdit = document.getElementById("cancelEdit");
  const articlesList = document.getElementById("articlesList");

  // 🔹 LOGIN
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    authMsg.innerText = "Logging in...";

    try {
      await signInWithEmailAndPassword(auth, email, password);
      authMsg.innerText = "✅ Login Successful!";
      authArea.style.display = "none";
      adminArea.style.display = "block";
      logoutBtn.style.display = "block";
      loadArticles(); // load existing news
    } catch (e) {
      authMsg.innerText = "❌ " + e.message;
    }
  });

  // 🔹 LOGOUT
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    authArea.style.display = "block";
    adminArea.style.display = "none";
    logoutBtn.style.display = "none";
  });

  // 🔹 POST NEW ARTICLE
  postBtn.addEventListener("click", async () => {
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const imageUrl = document.getElementById("imageUrl").value.trim();
    const category = document.getElementById("category").value;
    const subcategory = document.getElementById("subcategory").value;
    const status = document.getElementById("status").value;

    if (!title || !content) {
      alert("Please enter title and content!");
      return;
    }

    try {
      await addDoc(collection(db, "news"), {
        title, content, imageUrl, category, subcategory, status,
        createdAt: serverTimestamp()
      });
      alert("✅ Article Published!");
      document.getElementById("title").value = "";
      document.getElementById("content").value = "";
      document.getElementById("imageUrl").value = "";
      loadArticles();
    } catch (e) {
      alert("❌ " + e.message);
    }
  });

  // 🔹 AI GENERATE (demo)
  aiBtn.addEventListener("click", () => {
    document.getElementById("content").value =
      "🧠 AI Generated Sample News:\n\nToday, the Truvani News team achieved another milestone with new updates and better design!";
  });

  // 🔹 CANCEL EDIT (dummy)
  cancelEdit.addEventListener("click", () => {
    document.getElementById("formTitle").innerText = "📰 Create New Article";
    cancelEdit.style.display = "none";
  });

  // 🔹 LOAD ARTICLES
  async function loadArticles() {
    articlesList.innerHTML = "<p>Loading articles...</p>";
    const snap = await getDocs(collection(db, "news"));
    articlesList.innerHTML = "";

    snap.forEach(docSnap => {
      const a = docSnap.data();
      const item = document.createElement("div");
      item.classList.add("article-item");
      item.innerHTML = `
        <h3>${a.title}</h3>
        <p>${a.content.slice(0, 80)}...</p>
        <small>${a.category || "General"}</small><br>
        <button class="btn" data-id="${docSnap.id}"><i class="fa fa-trash"></i> Delete</button>
      `;
      item.querySelector("button").addEventListener("click", async () => {
        await deleteDoc(doc(db, "news", docSnap.id));
        alert("🗑️ Article deleted!");
        loadArticles();
      });
      articlesList.appendChild(item);
    });
  }
});
