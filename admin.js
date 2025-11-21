import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// 1. CONFIGURATION
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

// 2. INITIALIZE TOOLS
var quill = new Quill('#editor', { theme: 'snow', placeholder: 'Write something amazing...' });
let myChart = null;
let editingId = null;
let allNews = [];

// 3. AUTHENTICATION LOGIC
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('adminUI').style.display = 'flex';
    loadDashboard();
    Swal.fire({ icon: 'success', title: 'System Online', text: 'Welcome Admin', timer: 1500, showConfirmButton: false, background: '#1e293b', color:'#fff' });
  } else {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('adminUI').style.display = 'none';
  }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const e = document.getElementById('email').value;
  const p = document.getElementById('password').value;
  try { await signInWithEmailAndPassword(auth, e, p); } 
  catch(err) { Swal.fire({ icon: 'error', title: 'Access Denied', text: err.message }); }
});

document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

// 4. PUBLISH / UPLOAD LOGIC
document.getElementById('publishBtn').addEventListener('click', async () => {
  const title = document.getElementById('inpTitle').value;
  const content = quill.root.innerHTML;
  const cat = document.getElementById('inpCat').value;
  const sub = document.getElementById('inpSub').value;
  const file = document.getElementById('inpFile').files[0];
  let url = document.getElementById('inpUrl').value;

  if(!title) return Swal.fire('Wait!', 'Headline is required.', 'warning');
  
  const btn = document.getElementById('publishBtn');
  btn.innerText = "Processing...";

  try {
    // Upload Image if selected
    if(file) {
      const sRef = ref(storage, `news/${Date.now()}_${file.name}`);
      await uploadBytes(sRef, file);
      url = await getDownloadURL(sRef);
    }

    const data = { title, content, category: cat, subcategory: sub, imageUrl: url, updatedAt: serverTimestamp() };

    if(editingId) {
      await updateDoc(doc(db, "news", editingId), data);
      Swal.fire('Updated!', 'Article modified successfully.', 'success');
    } else {
      data.createdAt = serverTimestamp();
      data.views = 0;
      data.reactions = {'👍':0, '❤️':0, '🔥':0};
      data.status = 'published';
      await addDoc(collection(db, "news"), data);
      Swal.fire('Published!', 'Article is live.', 'success');
    }
    resetForm();
  } catch(e) { Swal.fire('Error', e.message, 'error'); }
  btn.innerText = "Publish News 🚀";
});

// 5. DASHBOARD DATA & CHART
function loadDashboard() {
  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
  
  onSnapshot(q, (snap) => {
    allNews = [];
    let v=0, l=0;
    const tbody = document.getElementById('newsTable');
    tbody.innerHTML = "";

    snap.forEach(doc => {
      const d = doc.data();
      const id = doc.id;
      allNews.push({...d, id});
      
      v += (d.views || 0);
      l += (d.reactions?.['👍'] || 0) + (d.reactions?.['❤️'] || 0);

      tbody.innerHTML += `
        <tr>
          <td>
            <div style="display:flex; gap:10px; align-items:center;">
              <img src="${d.imageUrl || 'https://via.placeholder.com/50'}" style="width:40px;height:40px;border-radius:5px;object-fit:cover;">
              <div><b>${d.title}</b><br><small style="color:#aaa">${d.category}</small></div>
            </div>
          </td>
          <td>👁️ ${d.views||0}</td>
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

// 6. GLOBAL FUNCTIONS (Attached to Window for HTML access)
window.switchTab = (id) => {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(id).classList.add('active');
};

window.delNews = async (id) => {
  const res = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
  if(res.isConfirmed) await deleteDoc(doc(db, "news", id));
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
  document.getElementById('publishBtn').innerText = "Update Article";
  document.getElementById('cancelBtn').style.display = "inline-block";
};

// 7. HELPERS
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

// Live Preview Update
document.getElementById('inpTitle').addEventListener('input', (e) => {
  document.getElementById('prevTitle').innerText = e.target.value;
});
document.getElementById('inpUrl').addEventListener('input', (e) => {
  document.getElementById('prevImg').src = e.target.value;
});
