import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAeGWwKLkHB43i1FbedgkANPKcTCBh0Z9A",
  authDomain: "truvani-news-5ac15.firebaseapp.com",
  projectId: "truvani-news-5ac15",
  storageBucket: "truvani-news-5ac15.appspot.com",
  messagingSenderId: "742142167141",
  appId: "1:742142167141:web:c2c116f5e50a574de85e8c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// --- TOOLS INIT ---
var quill = new Quill('#editor', { theme: 'snow', placeholder: 'Story yahan likhein...' });
let myChart = null;
let editingId = null;
let allNews = [];

// --- 🔒 STRICT SECURITY LOGIC (MAGIC PART) ---

// Step 1: Default State = LOCKED
const authScreen = document.getElementById('authScreen');
const adminUI = document.getElementById('adminUI');

// Ensure UI starts Hidden
authScreen.style.display = 'flex';
adminUI.style.display = 'none';

// Step 2: Monitor Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Agar user login hai -> Lock kholo
    authScreen.style.display = 'none';
    adminUI.style.display = 'flex';
    loadDashboard();
    Swal.fire({ icon: 'success', title: 'Unlocked', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
  } else {
    // Agar user nahi hai -> Lock lagao
    authScreen.style.display = 'flex';
    adminUI.style.display = 'none';
  }
});

// Step 3: Login Function (With Session Persistence)
document.getElementById('loginBtn').addEventListener('click', async () => {
  const e = document.getElementById('email').value;
  const p = document.getElementById('password').value;
  const btn = document.getElementById('loginBtn');

  btn.innerText = "Checking...";

  try {
    // Ye line ensure karti hai ki Tab band karte hi Logout ho jaye
    await setPersistence(auth, browserSessionPersistence);
    
    // Ab login karo
    await signInWithEmailAndPassword(auth, e, p);
    
    btn.innerText = "Unlock Success";
  } catch (err) {
    btn.innerText = "Secure Login";
    Swal.fire({ icon: 'error', title: 'Wrong Password', text: 'Access Denied!' });
  }
});

// Step 4: Logout Function
document.getElementById('logoutBtn').addEventListener('click', () => {
  signOut(auth).then(() => {
    Swal.fire('Locked', 'Dashboard Secured.', 'success');
  });
});

// --- 📝 CRUD OPERATIONS (News Upload/Edit/Delete) ---

// Publish Button
document.getElementById('publishBtn').addEventListener('click', async () => {
  const title = document.getElementById('inpTitle').value;
  const content = quill.root.innerHTML;
  const cat = document.getElementById('inpCat').value;
  const sub = document.getElementById('inpSub').value;
  const file = document.getElementById('inpFile').files[0];
  let url = document.getElementById('inpUrl').value;

  if(!title) return Swal.fire('Error', 'Title likhna zaroori hai', 'warning');

  const btn = document.getElementById('publishBtn');
  btn.innerText = "Uploading...";
  btn.disabled = true;

  try {
    // 1. Upload Image (Agar select ki hai)
    if(file) {
      const sRef = ref(storage, `news/${Date.now()}_${file.name}`);
      await uploadBytes(sRef, file);
      url = await getDownloadURL(sRef);
    }

    const data = { 
      title, content, category: cat, subcategory: sub, imageUrl: url, 
      updatedAt: serverTimestamp() 
    };

    if(editingId) {
      // Edit Mode
      await updateDoc(doc(db, "news", editingId), data);
      Swal.fire('Updated!', 'News update ho gayi.', 'success');
    } else {
      // New Post Mode
      data.createdAt = serverTimestamp();
      data.views = 0;
      data.reactions = {'👍':0, '❤️':0, '🔥':0};
      data.status = 'published';
      await addDoc(collection(db, "news"), data);
      Swal.fire('Published!', 'News live ho gayi.', 'success');
    }
    resetForm();
  } catch(e) { 
    Swal.fire('Error', e.message, 'error'); 
  } finally {
    btn.innerText = "Publish News 🚀";
    btn.disabled = false;
  }
});

// Load Dashboard Data
function loadDashboard() {
  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
  
  onSnapshot(q, (snap) => {
    allNews = [];
    let v = 0, l = 0;
    const tbody = document.getElementById('newsTable');
    tbody.innerHTML = "";

    snap.forEach(doc => {
      const d = doc.data();
      const id = doc.id;
      allNews.push({...d, id});
      
      v += (d.views || 0);
      const r = (d.reactions?.['👍']||0) + (d.reactions?.['❤️']||0) + (d.reactions?.['🔥']||0);
      l += r;

      tbody.innerHTML += `
        <tr>
          <td>
            <div style="display:flex; gap:10px; align-items:center;">
              <img src="${d.imageUrl || 'https://via.placeholder.com/50'}" style="width:40px;height:40px;border-radius:5px;object-fit:cover;">
              <div><b>${d.title}</b><br><small style="color:#aaa">${d.category}</small></div>
            </div>
          </td>
          <td>👁️ ${d.views||0} ❤️ ${r}</td>
          <td>
            <button class="action-btn edit" onclick="window.editNews('${id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="action-btn del" onclick="window.delNews('${id}')"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`;
    });

    document.getElementById('totalNews').innerText = snap.size;
    document.getElementById('totalViews').innerText = v;
    document.getElementById('totalLikes').innerText = l;
    renderChart(v, l);
  });
}

// --- 🌍 GLOBAL HELPERS ---
window.switchTab = (id) => {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(id).classList.add('active');
};

window.editNews = (id) => {
  const n = allNews.find(x => x.id === id);
  document.getElementById('inpTitle').value = n.title;
  quill.root.innerHTML = n.content;
  document.getElementById('inpCat').value = n.category;
  document.getElementById('inpSub').value = n.subcategory || '';
  document.getElementById('inpUrl').value = n.imageUrl;
  editingId = id;
  
  window.switchTab('create');
  document.getElementById('publishBtn').innerText = "Update News";
  document.getElementById('cancelBtn').style.display = "inline-block";
};

window.delNews = async (id) => {
  const res = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
  if(res.isConfirmed) await deleteDoc(doc(db, "news", id));
};

document.getElementById('cancelBtn').addEventListener('click', resetForm);

function resetForm() {
  editingId = null;
  document.getElementById('inpTitle').value = "";
  quill.root.innerHTML = "";
  document.getElementById('inpUrl').value = "";
  document.getElementById('inpFile').value = "";
  document.getElementById('publishBtn').innerText = "Publish News 🚀";
  document.getElementById('cancelBtn').style.display = "none";
}

function renderChart(views, likes) {
  const ctx = document.getElementById('viewChart').getContext('2d');
  if(myChart) myChart.destroy();
  
  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Views', 'Total Reactions'],
      datasets: [{
        label: 'Performance',
        data: [views, likes],
        backgroundColor: ['#6366f1', '#10b981'],
        borderRadius: 10
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { color: '#334155' } } }
    }
  });
}

// Search Function
document.getElementById('searchBox').addEventListener('input', (e) => {
  const val = e.target.value.toLowerCase();
  document.querySelectorAll('#newsTable tr').forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
  });
});

// Live Preview Text
document.getElementById('inpTitle').addEventListener('input', (e) => document.getElementById('prevTitle').innerText = e.target.value);
