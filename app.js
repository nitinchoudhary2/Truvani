// app.js - FINAL WORKING VERSION
import { db } from "./firebase-config.js";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const newsContainer = document.getElementById("news-container");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

// --- 1. THEME LOGIC ---
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Load Saved Theme
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-theme');
  themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

// --- 2. LOAD NEWS ---
function loadNews() {
  newsContainer.innerHTML = '<div class="loading">Loading Updates...</div>';
  
  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
  
  onSnapshot(q, (snapshot) => {
    newsContainer.innerHTML = "";
    
    if (snapshot.empty) {
      newsContainer.innerHTML = `<div style="text-align:center; width:100%">No news found!</div>`;
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status === 'published' || !data.status) {
        createNewsCard(docSnap.id, data);
      }
    });
  });
}

// --- 3. CREATE CARD (With Reactions & Read More Fix) ---
function createNewsCard(id, data) {
  const card = document.createElement("div");
  card.classList.add("news-card");
  card.dataset.category = data.category || 'General';
  card.dataset.title = (data.title || '').toLowerCase();

  // Stats
  const likes = data.reactions?.['👍'] || 0;
  const hearts = data.reactions?.['❤️'] || 0;
  const fires = data.reactions?.['🔥'] || 0;
  
  // Date Format
  const dateObj = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
  const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const imageHtml = data.imageUrl 
    ? `<img src="${data.imageUrl}" class="news-image" loading="lazy" alt="News">` 
    : `<div class="news-image" style="background:#333; display:flex; align-items:center; justify-content:center;">📰</div>`;

  card.innerHTML = `
    ${imageHtml}
    <div class="news-content">
      <div class="news-category">${data.category || 'News'}</div>
      <h2 class="news-title">${data.title}</h2>
      <p class="news-excerpt">${data.content ? data.content.substring(0, 100) : ''}...</p>
      
      <div class="news-meta">
        <span><i class="fa-regular fa-eye"></i> ${data.views || 0}</span>
        <span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
      </div>
      
      <div class="reactions" style="margin: 10px 0; display:flex; gap:10px;">
        <button class="reaction-btn" data-id="${id}" data-type="👍">👍 ${likes}</button>
        <button class="reaction-btn" data-id="${id}" data-type="❤️">❤️ ${hearts}</button>
        <button class="reaction-btn" data-id="${id}" data-type="🔥">🔥 ${fires}</button>
      </div>
      
      <button class="read-more-btn" style="width:100%; margin-top:10px;">Read More →</button>
    </div>
  `;

  newsContainer.appendChild(card);

  // Reaction Click Event
  card.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      react(btn.dataset.id, btn.dataset.type);
      btn.style.transform = 'scale(1.2)';
      setTimeout(() => btn.style.transform = 'scale(1)', 200);
    });
  });

  // Read More Click Event (Fix)
  const readBtn = card.querySelector('.read-more-btn');
  readBtn.addEventListener('click', async () => {
    await incrementView(id);
    window.location.href = `article.html?id=${id}`;
  });
}

// --- 4. UTILITY FUNCTIONS ---
async function react(id, type) {
  try {
    const newsRef = doc(db, "news", id);
    await updateDoc(newsRef, { [`reactions.${type}`]: increment(1) });
  } catch (e) { console.error(e); }
}

async function incrementView(id) {
  if (sessionStorage.getItem(`viewed_${id}`)) return;
  try {
    await updateDoc(doc(db, "news", id), { views: increment(1) });
    sessionStorage.setItem(`viewed_${id}`, 'true');
  } catch (e) { console.error(e); }
}

// Search & Filter
if(searchInput) searchInput.addEventListener('input', filterNews);
if(categoryFilter) categoryFilter.addEventListener('click', (e) => {
    if(e.target.classList.contains('chip')) {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        filterNews(e.target.innerText); // Pass category text
    }
});

function filterNews(categoryOrEvent) {
    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
    // Check if argument is event or string
    let activeCat = 'All';
    if(typeof categoryOrEvent === 'string') activeCat = categoryOrEvent;
    else {
        const activeChip = document.querySelector('.chip.active');
        if(activeChip) activeCat = activeChip.innerText;
    }

    document.querySelectorAll('.news-card').forEach(card => {
        const title = card.dataset.title;
        const cat = card.dataset.category;
        
        const matchSearch = title.includes(searchVal);
        const matchCat = activeCat === 'All' || cat === activeCat;
        
        card.style.display = matchSearch && matchCat ? 'block' : 'none';
    });
}

// Start
loadNews();
