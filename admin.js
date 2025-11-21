import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// API KEY CONFIG
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

// --- INIT ADVANCED COMPONENTS ---
// 1. Quill Editor
var quill = new Quill('#quillEditor', {
  theme: 'snow',
  placeholder: 'Compose your story with full formatting...',
  modules: {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ]
  }
});

// 2. Chart.js
let viewsChart;
function initChart(viewsData) {
  const ctx = document.getElementById('viewsChart').getContext('2d');
  
  // Destroy if exists to update
  if(viewsChart) viewsChart.destroy();

  viewsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Dummy timeline
      datasets: [{
        label: 'Weekly Views',
        data: viewsData, // We will feed real aggregated data here
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: '#3f3f46' }, ticks: { color: '#a1a1aa' } },
        x: { grid: { display: false }, ticks: { color: '#a1a1aa' } }
      }
    }
  });
}

let editingId = null;
let allNews = [];

// --- AUTH ---
onAuthStateChanged(auth, (user) => {
  if(user) {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('adminUI').style.display = 'flex';
    loadDashboard();
  } else {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('adminUI').style.display = 'none';
  }
});

document.getElementById('loginBtn').onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value);
    addLog("Admin Logged In");
  } catch(e) { document.getElementById('loginMsg').innerText = e.message; }
};
document.getElementById('logoutBtn').onclick = () => signOut(auth);

// --- CREATE / UPDATE NEWS ---
document.getElementById('publishBtn').onclick = async () => {
  const title = document.getElementById('inpTitle').value;
  const content = quill.root.innerHTML; // Get HTML from Quill
  const cat = document.getElementById('inpCategory').value;
  const sub = document.getElementById('inpSub').value;
  const file = document.getElementById('inpFile').files[0];
  let img = document.getElementById('inpUrl').value;

  if(!title || quill.getText().trim().length === 0) return showToast("Empty Article!");

  document.getElementById('publishBtn').innerText = "Deploying...";

  try {
    if(file) {
      const sRef = ref(storage, `news/${Date.now()}_${file.name}`);
      await uploadBytes(sRef, file);
      img = await getDownloadURL(sRef);
    }

    const data = {
      title, content, category: cat, subcategory: sub, imageUrl: img,
      updatedAt: serverTimestamp()
    };

    if(editingId) {
      await updateDoc(doc(db, "news", editingId), data);
      showToast("System Updated Article");
      addLog(`Updated: ${title}`);
    } else {
      data.createdAt = serverTimestamp();
      data.views = 0;
      data.reactions = {'👍':0, '❤️':0, '🔥':0};
      await addDoc(collection(db, "news"), data);
      showToast("Deployed Successfully");
      addLog(`Published: ${title}`);
    }
    resetForm();
  } catch(e) { showToast(e.message); }
  document.getElementById('publishBtn').innerText = "Deploy Article";
};

// --- DASHBOARD & DATA ---
function loadDashboard() {
  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
  
  onSnapshot(q, (snap) => {
    allNews = [];
    let totalViews = 0;
    let totalLikes = 0;
    const tbody = document.getElementById('newsTableBody');
    tbody.innerHTML = "";
    
    // For Chart Simulation
    let chartData = [10, 25, 40, 30, 50, 70, 0]; 

    snap.forEach(doc => {
      const d = doc.data();
      const id = doc.id;
      allNews.push({...d, id});

      totalViews += (d.views || 0);
      const r = (d.reactions?.['👍']||0) + (d.reactions?.['❤️']||0) + (d.reactions?.['🔥']||0);
      totalLikes += r;

      tbody.innerHTML += `
        <tr>
          <td style="display:flex; align-items:center; gap:10px;">
            <img src="${d.imageUrl}" style="width:40px; height:40px; border-radius:8px; object-fit:cover;">
            <b>${d.title}</b>
          </td>
          <td><span style="background:#3f3f46; padding:4px 8px; border-radius:5px; font-size:0.8rem;">${d.category}</span></td>
          <td>👁️ ${d.views||0} / ❤️ ${r}</td>
          <td>
            <i class="fa-solid fa-pen action-icon" style="color:#10b981;" onclick="window.edit('${id}')"></i>
            <i class="fa-solid fa-trash action-icon" style="color:#ef4444;" onclick="window.del('${id}')"></i>
          </td>
        </tr>
      `;
    });

    document.getElementById('totalNews').innerText = snap.size;
    document.getElementById('totalViews').innerText = totalViews;
    document.getElementById('totalLikes').innerText = totalLikes;

    // Update Chart with current view total as the last point (Simulation)
    chartData[6] = totalViews; 
    initChart(chartData);
  });
}

// --- HELPERS ---
window.edit = (id) => {
  const n = allNews.find(x => x.id === id);
  document.getElementById('inpTitle').value = n.title;
  quill.root.innerHTML = n.content; // Set Quill content
  document.getElementById('inpCategory').value = n.category;
  document.getElementById('inpSub').value = n.subcategory || '';
  document.getElementById('inpUrl').value = n.imageUrl;
  editingId = id;
  
  switchTab('create');
  document.getElementById('publishBtn').innerText = "Update System";
  showToast("Loaded into Editor");
};

window.del = async (id) => {
  if(confirm("Confirm deletion?")) {
    await deleteDoc(doc(db, "news", id));
    addLog("Deleted an article");
  }
};

function resetForm() {
  editingId = null;
  document.getElementById('inpTitle').value = "";
  quill.root.innerHTML = "";
  document.getElementById('inpUrl').value = "";
  document.getElementById('inpFile').value = "";
  document.getElementById('publishBtn').innerText = "Deploy Article";
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerText = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function addLog(action) {
  const list = document.getElementById('activityList');
  const div = document.createElement('div');
  div.className = 'log-item';
  div.innerHTML = `<span>${action}</span><span class="log-time">Just now</span>`;
  list.prepend(div);
}
