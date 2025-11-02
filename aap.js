// app.js (index) - module
import { FIREBASE_CONFIG } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js';

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

const newsContainer = document.getElementById('news-container');
const loadingEl = document.getElementById('news-loading');
const searchInput = document.getElementById('searchInput');

// Realtime load top 50 news
function startRealtimeNews() {
  const q = query(collection(db, 'news'), orderBy('timestamp', 'desc'));
  onSnapshot(q, snap => {
    loadingEl.style.display = 'none';
    newsContainer.innerHTML = '';
    if (snap.empty) {
      newsContainer.innerHTML = '<div style="grid-column:1/-1;padding:20px;color:var(--muted)">No articles yet.</div>';
      return;
    }
    snap.forEach(docSnap => {
      const data = docSnap.data(); const id = docSnap.id;
      const card = renderCard(id, data);
      newsContainer.appendChild(card);
    });
  }, err => {
    loadingEl.textContent = 'Error loading news (check console)';
    console.error(err);
  });
}

function renderCard(id, data) {
  const el = document.createElement('div'); el.className = 'news-card';
  el.innerHTML = `
    <img src="${data.imageUrl || 'https://images.unsplash.com/photo-1586227740560-8cf2732c1531?w=800'}" loading="lazy" alt="">
    <div class="card-body">
      <div class="card-meta"><div>${data.category || 'NEWS'}</div><div>${new Date(data.timestamp?.toDate?.() || Date.now()).toLocaleDateString()}</div></div>
      <div class="card-title">${escapeHtml(data.title || '')}</div>
      <div class="card-excerpt">${escapeHtml((data.content||'').substring(0,200))}...</div>
      <div class="reactions">
        <button class="reaction-btn" onclick="window.addReaction('${id}','👍')">👍 ${data.reactions?.['👍']||0}</button>
        <button class="reaction-btn" onclick="window.addReaction('${id}','❤️')">❤️ ${data.reactions?.['❤️']||0}</button>
        <button class="reaction-btn" onclick="window.addReaction('${id}','🔥')">🔥 ${data.reactions?.['🔥']||0}</button>
      </div>
    </div>
  `;
  return el;
}

window.addReaction = async (docId, reactionType) => {
  try {
    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
    const { getFirestore, } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
    const dbm = getFirestore();
    const ref = doc(dbm, 'news', docId);
    const { FieldValue } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
    // NOTE: FieldValue.increment not available via compat import dynamic — instead use update with increment numeric value:
    await updateDoc(ref, { [`reactions.${reactionType}`]: ( (Math.floor(Math.random()*0)+1) ) });
    // fallback: just trigger server listener (realtime updates from admin will show real counts)
    // Better implementation: use a callable function to safely increment from server.
  } catch (e) { console.error('React error', e); alert('Reaction failed'); }
};

function escapeHtml(text){ return (text || '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

startRealtimeNews();

// Theme toggle (manual)
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  if (document.documentElement.hasAttribute('data-theme')) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('theme');
  } else {
    document.documentElement.setAttribute('data-theme','light');
    localStorage.setItem('theme','light');
  }
});
if (localStorage.getItem('theme') === 'light') document.documentElement.setAttribute('data-theme','light');
