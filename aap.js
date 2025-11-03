// app.js - ULTRA ADVANCED VERSION 🚀
import { db } from "./firebase-config.js";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const newsContainer = document.getElementById("news-container");
const searchInput = document.getElementById("searchInput");
const voiceSearch = document.getElementById("voiceSearch");
const themeToggle = document.getElementById("themeToggle");
const translateBtn = document.getElementById("translateBtn");
const notificationBtn = document.getElementById("notificationBtn");
const fab = document.getElementById("fab");

let allArticles = [];
let currentLang = 'en';
let speechSynth = window.speechSynthesis;
let currentSpeaking = null;

// 🎨 Theme Toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const icon = themeToggle.querySelector('i');
  icon.className = document.body.classList.contains('light-theme') 
    ? 'fas fa-sun' 
    : 'fas fa-moon';
  localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
  showToast('Theme changed! 🎨');
});

// Load saved theme
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-theme');
  themeToggle.querySelector('i').className = 'fas fa-sun';
}

// 🎙️ Voice Search
let recognition;
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  
  voiceSearch.addEventListener('click', () => {
    recognition.start();
    voiceSearch.classList.add('listening');
    showToast('🎤 Listening...', 'info');
  });
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
    filterNews();
    voiceSearch.classList.remove('listening');
    showToast(`Searching: ${transcript}`);
  };
  
  recognition.onerror = () => {
    voiceSearch.classList.remove('listening');
    showToast('Voice search failed', 'error');
  };
  
  recognition.onend = () => {
    voiceSearch.classList.remove('listening');
  };
} else {
  voiceSearch.style.display = 'none';
}

// 🌐 Language Toggle
translateBtn.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'hi' : 'en';
  showToast(`Language: ${currentLang === 'en' ? 'English' : 'हिंदी'}`);
  translatePage();
});

// 🔔 Notifications
notificationBtn.addEventListener('click', () => {
  requestNotificationPermission();
  showNotificationModal();
});

// 🤖 AI Assistant FAB
fab.addEventListener('click', () => {
  showAIModal();
});

// Load News with Real-time Updates
function loadNews() {
  newsContainer.innerHTML = createSkeletons(6);
  
  const newsRef = collection(db, "news");
  const q = query(newsRef, orderBy("createdAt", "desc"));
  
  onSnapshot(q, (snapshot) => {
    allArticles = [];
    newsContainer.innerHTML = "";
    
    if (snapshot.empty) {
      newsContainer.innerHTML = createEmptyState();
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      
      if (data.status === 'published' || !data.status) {
        allArticles.push({ id, ...data });
      }
    });
    
    // Calculate trending
    calculateTrending();
    
    // Render cards
    allArticles.forEach(article => {
      createNewsCard(article.id, article);
    });
    
    console.log(`✅ Loaded ${allArticles.length} articles`);
    
    // Send push notification for new articles
    checkNewArticles();
  });
}

// 🔥 Calculate Trending
function calculateTrending() {
  const sorted = [...allArticles].sort((a, b) => {
    const scoreA = (a.views || 0) * 2 + getTotalReactions(a.reactions);
    const scoreB = (b.views || 0) * 2 + getTotalReactions(b.reactions);
    return scoreB - scoreA;
  });
  
  if (sorted.length > 0) {
    const trending = sorted[0];
    document.getElementById('trendingText').textContent = 
      `🔥 Trending: ${trending.title} (${trending.views || 0} views)`;
  }
}

function getTotalReactions(reactions) {
  if (!reactions) return 0;
  return Object.values(reactions).reduce((sum, val) => sum + val, 0);
}

// Create News Card with Advanced Features
function createNewsCard(id, data) {
  const card = document.createElement("div");
  card.classList.add("news-card");
  card.dataset.category = data.category || 'General';
  card.dataset.title = (data.title || '').toLowerCase();

  const likes = data.reactions?.['👍'] || 0;
  const hearts = data.reactions?.['❤️'] || 0;
  const fires = data.reactions?.['🔥'] || 0;
  const views = data.views || 0;
  const comments = data.comments || 0;

  const imageHtml = data.imageUrl 
    ? `<img src="${data.imageUrl}" alt="News" class="news-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x220?text=News'">` 
    : '<div class="news-image" style="background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;font-size:3rem">📰</div>';

  const categoryClass = `cat-${(data.category || 'general').toLowerCase()}`;

  card.innerHTML = `
    ${imageHtml}
    <div class="news-content">
      <div class="news-header">
        <div class="news-category ${categoryClass}">${data.category || 'General'}</div>
        <button class="tts-btn" data-id="${id}" title="Listen to article">
          <i class="fas fa-volume-up"></i>
        </button>
      </div>
      
      <h2 class="news-title">${escape(data.title || 'Untitled')}</h2>
      <p class="news-excerpt">${escape(truncate(data.content || '', 120))}</p>
      
      <div class="news-meta">
        <span><i class="fas fa-eye"></i> ${formatNumber(views)}</span>
        <span><i class="fas fa-comments"></i> ${comments}</span>
        <span><i class="fas fa-clock"></i> ${getTimeAgo(data.createdAt)}</span>
      </div>
      
      <div class="reactions">
        <button class="reaction-btn" data-id="${id}" data-type="👍">
          👍 <span>${formatNumber(likes)}</span>
        </button>
        <button class="reaction-btn" data-id="${id}" data-type="❤️">
          ❤️ <span>${formatNumber(hearts)}</span>
        </button>
        <button class="reaction-btn" data-id="${id}" data-type="🔥">
          🔥 <span>${formatNumber(fires)}</span>
        </button>
      </div>
      
      <button class="read-more-btn" data-id="${id}">
        Read Full Article <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  `;

  newsContainer.appendChild(card);
  
  // Event Listeners
  card.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      react(btn.dataset.id, btn.dataset.type);
      animateButton(btn);
    });
  });
  
  card.querySelector('.read-more-btn').addEventListener('click', () => {
    showArticleModal(id, data);
  });
  
  card.querySelector('.tts-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    speakArticle(e.currentTarget, data);
  });
  
  incrementView(id);
}

// 🔊 Text-to-Speech
function speakArticle(btn, data) {
  if (currentSpeaking === btn) {
    speechSynth.cancel();
    btn.classList.remove('playing');
    currentSpeaking = null;
    return;
  }
  
  if (currentSpeaking) {
    currentSpeaking.classList.remove('playing');
    speechSynth.cancel();
  }
  
  const text = `${data.title}. ${data.content}`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLang === 'hi' ? 'hi-IN' : 'en-US';
  utterance.rate = 0.9;
  
  utterance.onend = () => {
    btn.classList.remove('playing');
    currentSpeaking = null;
  };
  
  btn.classList.add('playing');
  currentSpeaking = btn;
  speechSynth.speak(utterance);
  showToast('🔊 Playing audio...');
}

// React with Animation
async function react(id, type) {
  try {
    await updateDoc(doc(db, "news", id), {
      [`reactions.${type}`]: increment(1)
    });
    showToast(`Reacted with ${type}!`);
  } catch (err) {
    console.error("Reaction error:", err);
  }
}

function animateButton(btn) {
  btn.style.transform = 'scale(1.3)';
  setTimeout(() => btn.style.transform = 'scale(1)', 300);
}

// Increment View
async function incrementView(id) {
  const key = `viewed_${id}`;
  if (sessionStorage.getItem(key)) return;
  
  try {
    await updateDoc(doc(db, "news", id), {
      views: increment(1)
    });
    sessionStorage.setItem(key, 'true');
  } catch (err) {
    console.error("View error:", err);
  }
}

// 📊 Show Full Article Modal
function showArticleModal(id, data) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h2>${escape(data.title)}</h2>
        <button onclick="this.closest('.modal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text)">
          <i class="fas fa-times"></i>
        </button>
      </div>
      ${data.imageUrl ? `<img src="${data.imageUrl}" style="width:100%;border-radius:12px;margin-bottom:20px">` : ''}
      <div style="color:var(--muted);margin-bottom:20px">
        <span>${data.category}</span> • 
        <span>${getTimeAgo(data.createdAt)}</span> • 
        <span>${data.views || 0} views</span>
      </div>
      <p style="line-height:1.8;color:var(--text)">${escape(data.content)}</p>
      
      <div style="margin-top:30px;padding-top:20px;border-top:2px solid var(--border)">
        <h3 style="margin-bottom:15px">💬 Comments</h3>
        <textarea id="commentInput" placeholder="Add a comment..." style="width:100%;padding:12px;border:2px solid var(--border);border-radius:8px;background:var(--bg-light);color:var(--text);min-height:80px;margin-bottom:10px"></textarea>
        <button onclick="postComment('${id}')" style="padding:10px 20px;background:var(--gradient);color:white;border:none;border-radius:8px;cursor:pointer">
          Post Comment
        </button>
        <div id="commentsContainer" style="margin-top:20px"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Post Comment
window.postComment = async (articleId) => {
  const input = document.getElementById('commentInput');
  const text = input.value.trim();
  if (!text) return;
  
  try {
    await addDoc(collection(db, `news/${articleId}/comments`), {
      text,
      createdAt: serverTimestamp(),
      author: 'Anonymous'
    });
    input.value = '';
    showToast('Comment posted!');
  } catch (e) {
    showToast('Comment failed', 'error');
  }
};

// Category Filter
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    filterNews();
  });
});

// Search
searchInput.addEventListener('input', filterNews);

function filterNews() {
  const activeChip = document.querySelector('.filter-chip.active');
  const category = activeChip ? activeChip.dataset.category : 'all';
  const search = searchInput.value.toLowerCase();
  
  document.querySelectorAll('.news-card').forEach(card => {
    const cardCategory = card.dataset.category;
    const cardTitle = card.dataset.title;
    
    const matchCategory = category === 'all' || cardCategory === category;
    const matchSearch = !search || cardTitle.includes(search);
    
    card.style.display = matchCategory && matchSearch ? 'block' : 'none';
  });
}

// 🌐 Translate Page
function translatePage() {
  showToast('Translation coming soon! 🌐', 'info');
}

// 🔔 Notification Permission
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showToast('Notifications enabled! 🔔');
      }
    });
  }
}

// Check New Articles
let lastArticleCount = 0;
function checkNewArticles() {
  if (lastArticleCount > 0 && allArticles.length > lastArticleCount) {
    const newCount = allArticles.length - lastArticleCount;
    showToast(`${newCount} new article${newCount > 1 ? 's' : ''} added!`, 'info');
    
    if (Notification.permission === 'granted') {
      new Notification('Truvani News', {
        body: `${newCount} new article${newCount > 1 ? 's' : ''} published!`,
        icon: '/icon-192.png'
      });
    }
  }
  lastArticleCount = allArticles.length;
}

// Show AI Modal
function showAIModal() {
  showToast('AI Assistant coming soon! 🤖', 'info');
}

// Show Notification Modal
function showNotificationModal() {
  showToast('Notifications: 3 new updates!', 'info');
}

// Toast Notification
function showToast(msg, type = 'success') {
  const colors = {
    success: 'linear-gradient(135deg, #667eea, #764ba2)',
    error: 'linear-gradient(135deg, #f093fb, #f5576c)',
    info: 'linear-gradient(135deg, #4facfe, #00f2fe)'
  };
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;top:80px;right:20px;padding:15px 25px;
    border-radius:12px;color:white;font-weight:600;z-index:9999;
    background:${colors[type] || colors.success};
    animation:slideInRight 0.5s ease;box-shadow:0 8px 30px rgba(0,0,0,0.3);
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Utility Functions
function escape(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncate(text, length) {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function getTimeAgo(timestamp) {
  if (!timestamp) return 'Recently';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, sec] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / sec);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

function createSkeletons(count) {
  return Array(count).fill(0).map(() => `
    <div class="news-card">
      <div class="skeleton" style="height:220px"></div>
      <div style="padding:25px">
        <div class="skeleton" style="height:30px;margin-bottom:15px;width:70%"></div>
        <div class="skeleton" style="height:60px;margin-bottom:15px"></div>
        <div class="skeleton" style="height:40px"></div>
      </div>
    </div>
  `).join('');
}

function createEmptyState() {
  return `
    <div style="text-align:center;padding:60px;grid-column:1/-1">
      <div style="font-size:5rem;margin-bottom:20px">📰</div>
      <h2>No articles yet!</h2>
      <p style="color:var(--muted)">Check back soon for latest news</p>
    </div>
  `;
}

// Initialize
console.log('🚀 Truvani News - Advanced Mode Activated');
loadNews();

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showToast('Install app for better experience! 📱', 'info');
});
