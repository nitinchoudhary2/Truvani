import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAeGWwKLkHB43i1FbedgkANPKcTCBh0Z9A",
  authDomain: "truvani-news-5ac15.firebaseapp.com",
  projectId: "truvani-news-5ac15",
  storageBucket: "truvani-news-5ac15.appspot.com",
  messagingSenderId: "742142167141",
  appId: "1:742142167141:web:c2c116f5e50a574de85e8c"
};

// 🔹 Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// DOM elements
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const postBtn = document.getElementById("postBtn");
const uploadProgress = document.getElementById("uploadProgress");
const imageInput = document.getElementById("imageInput");
const adminArea = document.getElementById("adminArea");
const authArea = document.getElementById("authArea");
const authMsg = document.getElementById("authMsg");

// 🔹 Login
loginBtn.onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    authArea.style.display = "none";
    adminArea.style.display = "block";
    logoutBtn.style.display = "block";
    loadArticles();
  } catch (e) {
    authMsg.innerText = "Login failed! Check credentials.";
  }
};

// 🔹 Logout
logoutBtn.onclick = async () => {
  await signOut(auth);
  adminArea.style.display = "none";
  authArea.style.display = "block";
  logoutBtn.style.display = "none";
};

// 🔹 Upload Image
uploadProgress.onclick = () => imageInput.click();
let uploadedImageUrl = "";

imageInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const storageRef = ref(storage, "images/" + file.name);
  uploadProgress.innerText = "Uploading...";
  await uploadBytes(storageRef, file);
  uploadedImageUrl = await getDownloadURL(storageRef);
  uploadProgress.innerText = "✅ Uploaded";
};

// 🔹 Publish Article
postBtn.onclick = async () => {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const category = document.getElementById("category").value;
  const subcategory = document.getElementById("subcategory").value;
  const imageUrl = uploadedImageUrl || document.getElementById("imageUrl").value;

  if (!title || !content) {
    alert("Title and Content are required!");
    return;
  }

  await addDoc(collection(db, "news"), {
    title,
    content,
    category,
    subcategory,
    imageUrl,
    createdAt: new Date(),
    views: 0
  });

  alert("✅ Article Published!");
  loadArticles();
};

// 🔹 Load Articles
async function loadArticles() {
  const articlesList = document.getElementById("articlesList");
  articlesList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "news"));

  querySnapshot.forEach((docSnap) => {
    const a = docSnap.data();
    const div = document.createElement("div");
    div.classList.add("article-item");
    div.innerHTML = `
      <h3>${a.title}</h3>
      <p>${a.content.slice(0, 100)}...</p>
      <img src="${a.imageUrl}" width="100%">
      <small>${a.category}</small> |
      <small>${a.views || 0} Views</small>
      <button class="btn deleteBtn" data-id="${docSnap.id}">🗑️ Delete</button>
    `;
    articlesList.appendChild(div);
  });

  // Delete buttons
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-id");
      await deleteDoc(doc(db, "news", id));
      loadArticles();
    };
  });
}
