import { db, collection, addDoc, onSnapshot, deleteDoc, doc } from './firebase-config.js';

const loginBtn = document.getElementById('loginBtn');
const adminSection = document.getElementById('adminSection');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const addNewsBtn = document.getElementById('addNewsBtn');
const newsTitle = document.getElementById('newsTitle');
const newsContent = document.getElementById('newsContent');
const allNews = document.getElementById('allNews');

// Fixed admin login
loginBtn.addEventListener('click', () => {
  if (adminEmail.value === 'nitinchoudharyw55@gmail.com' && adminPassword.value === 'choudhary9462&') {
    adminSection.style.display = 'block';
    loginBtn.style.display = 'none';
  } else {
    alert('❌ Wrong Email or Password!');
  }
});

// Add news
addNewsBtn.addEventListener('click', async () => {
  if (!newsTitle.value || !newsContent.value) return alert("Please fill all fields!");
  await addDoc(collection(db, "news"), {
    title: newsTitle.value,
    content: newsContent.value,
    createdAt: new Date(),
  });
  newsTitle.value = "";
  newsContent.value = "";
  alert("✅ News Added!");
});

// Show all news in admin
onSnapshot(collection(db, "news"), (snapshot) => {
  allNews.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    allNews.innerHTML += `
      <div class="admin-news-card">
        <h4>${data.title}</h4>
        <p>${data.content}</p>
        <button onclick="deleteNews('${docSnap.id}')">🗑 Delete</button>
      </div>
    `;
  });
});

window.deleteNews = async (id) => {
  await deleteDoc(doc(db, "news", id));
  alert("🗑 News Deleted!");
};
