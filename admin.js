// admin.js (place alongside admin.html)
import { FIREBASE_CONFIG } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js';

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authMsg = document.getElementById('authMsg');
const adminArea = document.getElementById('adminArea');
const authArea = document.getElementById('authArea');

const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');

const postBtn = document.getElementById('postBtn');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const imageUrlInput = document.getElementById('imageUrl');
const categorySelect = document.getElementById('category');

let editId = null;

// Optional: If you want to default-fill login fields (not recommended in prod)
// emailInput.value = "nitinchoudharyw55@gmail.com";
// passInput.value = "choudhary9462&";

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const pass = passInput.value;
  if (!email || !pass) { authMsg.textContent = 'Enter credentials'; return; }
  authMsg.textContent = 'Logging in...';
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    authMsg.textContent = 'Logged in';
  } catch (e) {
    authMsg.textContent = 'Login failed: ' + e.message;
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, user => {
  if (user) {
    authArea.style.display = 'none';
    adminArea.style.display = 'block';
    logoutBtn.style.display = 'inline-block';
    loadAdminArticles();
  } else {
    authArea.style.display = 'block';
    adminArea.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
});

postBtn.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const imageUrl = imageUrlInput.value.trim();
  const category = categorySelect.value || 'General';
  if (!title || !content) return alert('Title and content required');

  postBtn.disabled = true;
  try {
    if (editId) {
      await updateDoc(doc(db, 'news', editId), {
        title, content, imageUrl, category
      });
      editId = null;
      document.getElementById('formTitle').textContent = 'Create New Article';
      document.getElementById('cancelEdit').style.display = 'none';
      alert('Article updated');
    } else {
      await addDoc(collection(db, 'news'), {
        title, content, imageUrl, category, author: auth.currentUser.email,
        timestamp: serverTimestamp(), views: 0, reactions: {"👍":0,"❤️":0,"🔥":0}
      });
      alert('Article posted');
    }
    titleInput.value = contentInput.value = imageUrlInput.value = '';
    loadAdminArticles();
  } catch (e) {
    alert('Failed: ' + e.message);
  } finally { postBtn.disabled = false; }
});

document.getElementById('cancelEdit').addEventListener('click', () => {
  editId = null;
  document.getElementById('formTitle').textContent = 'Create New Article';
  document.getElementById('cancelEdit').style.display = 'none';
  titleInput.value = contentInput.value = imageUrlInput.value = '';
});

function loadAdminArticles() {
  const list = document.getElementById('articlesList');
  list.innerHTML = 'Loading...';
  onSnapshot(collection(db, 'news'), snap => {
    list.innerHTML = '';
    snap.forEach(docSnap => {
      const d = docSnap.data(); const id = docSnap.id;
      const item = document.createElement('div');
      item.className = 'form-card';
      item.style.marginBottom = '10px';
      item.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong>${escapeHtml(d.title || '')}</strong><br>
            <small style="color:var(--muted)">${d.category || ''} • ${d.author || ''}</small>
          </div>
          <div>
            <button class="btn" data-id="${id}" data-action="edit">Edit</button>
            <button class="btn" data-id="${id}" data-action="delete" style="background:${getComputedStyle(document.documentElement).getPropertyValue('--accent2') || '#e63946'}">Delete</button>
          </div>
        </div>
      `;
      list.appendChild(item);
    });
    // attach events
    list.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const action = e.currentTarget.dataset.action;
        if (action === 'edit') loadForEdit(id);
        if (action === 'delete') {
          if (!confirm('Delete this article?')) return;
          await deleteDoc(doc(db, 'news', id));
          alert('Deleted');
        }
      });
    });
  });
}

async function loadForEdit(id) {
  const docRef = doc(db, 'news', id);
  const snap = await docRef.get?.() || null;
  // compat: fetch via getDoc
  try {
    const { getDoc } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return alert('Not found');
    const d = docSnap.data();
    titleInput.value = d.title || '';
    contentInput.value = d.content || '';
    imageUrlInput.value = d.imageUrl || '';
    categorySelect.value = d.category || 'General';
    editId = id;
    document.getElementById('formTitle').textContent = 'Edit Article';
    document.getElementById('cancelEdit').style.display = 'inline-block';
  } catch (e) { console.error(e); alert('Load for edit failed'); }
}

function escapeHtml(text){ return (text || '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
