// admin.js - ULTRA ADVANCED AI-POWERED ADMIN 🚀 (Updated for subcategory/tags)
import { auth, db, storage } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, getDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// DOM Elements (Added new ones)
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
const imageInput = document.getElementById('imageInput');
const imageUrlInput = document.getElementById('imageUrl');
const categorySelect = document.getElementById('category');
const statusSelect = document.getElementById('status');
const uploadArea = document.getElementById('uploadArea');
const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const exportBtn = document.getElementById('exportBtn');
const analyticsBtn = document.getElementById('analyticsBtn');

// NEW Elements
const subcategoryInput = document.getElementById('subcategory');
const tagsInput = document.getElementById('tags');
const tagsContainer = document.getElementById('tagsInput');

let editId = null;
let currentTags = [];  // NEW: Track tags

// 🎨 Toast Notifications (same)
function toast(msg, type = 'success') {
  const colors = {
    success: 'linear-gradient(135deg, #667eea, #764ba2)',
    error: 'linear-gradient(135deg, #f093fb, #f5576c)',
    info: 'linear-gradient(135deg, #4facfe, #00f2fe)'
  };
  
  const t = document.createElement('div');
  t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${msg}`;
  t.style.cssText = `
    position:fixed;top:20px;right:20px;padding:18px 30px;
    border-radius:12px;color:white;font-weight:700;z-index:9999;
    background:${colors[type] || colors.success};
    animation:slideIn 0.5s ease;box-shadow:0 10px 40px rgba(0,0,0,0.5);
    display:flex;align-items:center;gap:12px;
  `;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'slideOut 0.5s ease';
    setTimeout(() => t.remove(), 500);
  }, 3000);
}

// 🔐 Login/Logout/Auth (same as before)
loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const pass = passInput.value;
  
  if (!email || !pass) {
    authMsg.textContent = '❌ Please enter credentials';
    authMsg.style.background = 'rgba(239, 68, 68, 0.2)';
    return;
  }
  
  authMsg.textContent = '⏳ Authenticating...';
  authMsg.style.background = 'rgba(99, 102, 241, 0.2)';
  loginBtn.disabled = true;
  
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    authMsg.textContent = '✅ Login Successful!';
    authMsg.style.background = 'rgba(16, 185, 129, 0.2)';
    toast('🎉 Welcome to Admin Panel!');
  } catch (e) {
    authMsg.textContent = '❌ Failed: ' + e.message;
    authMsg.style.background = 'rgba(239, 68, 68, 0.2)';
    toast('Login failed!', 'error');
  } finally {
    loginBtn.disabled = false;
  }
});

logoutBtn.addEventListener('click', async () => {
  if (confirm('⚠️ Are you sure you want to logout?')) {
    await signOut(auth);
    toast('Logged out successfully');
  }
});

onAuthStateChanged(auth, user => {
  if (user) {
    authArea.style.display = 'none';
    adminArea.style.display = 'block';
    logoutBtn.style.display = 'flex';
    loadDashboard();
    loadArticles();
    initTags();  // NEW: Init tags on login
  } else {
    authArea.style.display = 'block';
    adminArea.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
});

// 📤 Drag & Drop Image Upload (same)
uploadArea.addEventListener('click', () => imageInput.click());

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    uploadImage(file);
  } else {
    toast('Please drop an image file!', 'error');
  }
});

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) uploadImage(file);
});

async function uploadImage(file) {
  if (!file.type.startsWith('image/')) {
    toast('Select image only!', 'error');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    toast('Image must be less than 5MB!', 'error');
    return;
  }
  
  const uploadBtn = document.getElementById('uploadProgress');
  uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
  uploadBtn.disabled = true;
  
  try {
    const storageRef = ref(storage, `news/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    imageUrlInput.value = url;
    uploadBtn.innerHTML = '<i class="fas fa-check"></i> Uploaded!';
    toast('✅ Image uploaded successfully!');
    setTimeout(() => {
      uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
      uploadBtn.disabled = false;
    }, 2000);
  } catch (e) {
    uploadBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
    toast('Upload failed: ' + e.message, 'error');
    setTimeout(() => {
      uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choose Image';
      uploadBtn.disabled = false;
    }, 2000);
  }
}

// 🤖 AI Generate Article (Updated for subcategory/tags)
aiGenerateBtn.addEventListener('click', () => {
  const titles = [
    'Breaking: Major Development in Technology Sector',
    'Sports Update: Record-Breaking Performance',
    'Health Alert: New Research Findings Released',
    'Business News: Market Reaches All-Time High',
    'Entertainment: Blockbuster Movie Breaks Records'
  ];
  
  const contents = [
    'In a groundbreaking development, experts have announced significant progress that could reshape the industry. Stakeholders are calling this a watershed moment with far-reaching implications for the future.',
    'Analysts predict this trend will continue in the coming months, bringing substantial changes to the landscape. Industry leaders are optimistic about the outcomes and potential opportunities ahead.',
    'Sources close to the matter suggest that comprehensive measures are being implemented to address key concerns. This initiative marks a pivotal step towards achieving long-term sustainability goals.'
  ];
  
  titleInput.value = titles[Math.floor(Math.random() * titles.length)];
  contentInput.value = contents[Math.floor(Math.random() * contents.length)];
  subcategoryInput.value = '';  // NEW
  tagsInput.value = '';  // NEW
  currentTags = [];  // NEW: Clear tags
  updateTagsDisplay();  // NEW
  
  toast('🤖 AI Article Generated!', 'info');
});

// 📥 Export Data (same)
exportBtn.addEventListener('click', async () => {
  try {
    const snapshot = await getDocs(collection(db, 'news'));
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truvani-news-${Date.now()}.json`;
    a.click();
    
    toast('✅ Data exported successfully!');
  } catch (e) {
    toast('Export failed!', 'error');
  }
});

// 📊 Analytics (same)
analyticsBtn.addEventListener('click', () => {
  toast('📊 Analytics dashboard coming soon!', 'info');
});

// NEW: Tags Functionality
function initTags() {
  tagsInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && tagsInput.value.trim()) {
      e.preventDefault();
      addTag(tagsInput.value.trim());
      tagsInput.value = '';
    }
  });

  tagsInput.addEventListener('blur', () => {
    if (tagsInput.value.trim()) {
      addTag(tagsInput.value.trim());
      tagsInput.value = '';
    }
  });
}

function addTag(tagText) {
  if (currentTags.includes(tagText)) return;
  currentTags.push(tagText);
  updateTagsDisplay();
  toast(`Tag "${tagText}" added!`, 'info');
}

function removeTag(index) {
  currentTags.splice(index, 1);
  updateTagsDisplay();
}

function updateTagsDisplay() {
  tagsContainer.innerHTML = '';
  currentTags.forEach((tag, index) => {
    const tagEl = document.createElement('span');
    tagEl.className = 'tag';
    tagEl.innerHTML = `${tag} <span class="tag-remove" onclick="removeTag(${index})">&times;</span>`;
    tagsContainer.appendChild(tagEl);
  });
  // Add input back
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'tags';
  input.placeholder = 'Add tags...';
  input.style.border = 'none';
  input.style.background = 'transparent';
  input.style.color = 'var(--text)';
  input.style.flex = '1';
  input.style.outline = 'none';
  tagsContainer.appendChild(input);
  // Re-attach listeners
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      e.preventDefault();
      addTag(input.value.trim());
    }
  });
  input.addEventListener('blur', () => {
    if (input.value.trim()) {
      addTag(input.value.trim());
    }
  });
}

// 📤 Post/Update Article (Updated for subcategory/tags)
postBtn.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const imageUrl = imageUrlInput.value.trim();
  const category = categorySelect.value;
  const subcategory = subcategoryInput.value.trim();  // NEW
  const tags = currentTags;  // NEW
  const status = statusSelect.value;
  
  if (!title || !content) {
    toast('⚠️ Title and content required!', 'error');
    return;
  }

  postBtn.disabled = true;
  postBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
  
  try {
    const data = {
      title,
      content,
      imageUrl,
      category,
      status,
      updatedAt: serverTimestamp()
    };

    // NEW: Add subcategory and tags
    if (subcategory) data.subcategory = subcategory;
    if (tags.length > 0) data.tags = tags;

    if (editId) {
      await updateDoc(doc(db, 'news', editId), data);
      toast('✅ Article updated successfully!');
      resetForm();
    } else {
      data.author = auth.currentUser.email;
      data.createdAt = serverTimestamp();
      data.views = 0;
      data.comments = 0;
      data.reactions = { "👍": 0, "❤️": 0, "🔥": 0 };
      
      await addDoc(collection(db, 'news'), data);
      toast('✅ Article published successfully!');
      resetForm();
    }
    
    loadDashboard();
  } catch (e) {
    toast('❌ Error: ' + e.message, 'error');
  } finally {
    postBtn.disabled = false;
    postBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Article';
  }
});

// 🔄 Reset Form (Updated for new fields)
function resetForm() {
  editId = null;
  titleInput.value = '';
  contentInput.value = '';
  imageUrlInput.value = '';
  imageInput.value = '';
  categorySelect.value = 'General';
  statusSelect.value = 'published';
  subcategoryInput.value = '';  // NEW
  currentTags = [];  // NEW
  updateTagsDisplay();  // NEW
  document.getElementById('formTitle').innerHTML = '<i class="fas fa-pen-fancy"></i> Create New Article';
  document.getElementById('cancelEdit').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('cancelEdit').addEventListener('click', resetForm);

// 📊 Dashboard Analytics (same)
async function loadDashboard() {
  try {
    const snapshot = await getDocs(collection(db, 'news'));
    let total = 0, views = 0, published = 0, draft = 0;
    
    snapshot.forEach(doc => {
      const d = doc.data();
      total++;
      views += d.views || 0;
      if (d.status === 'published') published++;
      if (d.status === 'draft') draft++;
    });
    
    animateCounter('totalArticles', total);
    animateCounter('totalViews', views);
    animateCounter('publishedCount', published);
    animateCounter('draftCount', draft);
  } catch (e) {
    console.error('Dashboard error:', e);
  }
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 20);
}

// 📰 Load Articles with Real-time Updates (Updated to show subcategory/tags)
function loadArticles() {
  const list = document.getElementById('articlesList');
  list.innerHTML = '<p style="text-align:center;padding:30px"><i class="fas fa-spinner fa-spin" style="font-size:2rem"></i><br>Loading articles...</p>';
  
  const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
  
  onSnapshot(q, snapshot => {
    list.innerHTML = '';
    
    if (snapshot.empty) {
      list.innerHTML = `
        <div style="text-align:center;padding:60px;color:var(--muted)">
          <i class="fas fa-newspaper" style="font-size:4rem;margin-bottom:20px;opacity:0.3"></i>
          <p style="font-size:1.2rem">No articles yet. Create your first one!</p>
        </div>
      `;
      return;
    }
    
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const id = docSnap.id;
      
      const item = document.createElement('div');
      item.className = 'article-item';
      
      const badge = d.status === 'published' 
        ? '<span class="badge badge-success"><i class="fas fa-check"></i> Published</span>' 
        : '<span class="badge badge-warning"><i class="fas fa-file-alt"></i> Draft</span>';
      
      const date = d.createdAt?.toDate?.();
      const formattedDate = date ? date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }) : 'Recently';
      
      // NEW: Show subcategory and tags
      const subInfo = d.subcategory ? ` | Sub: ${d.subcategory}` : '';
      const tagsInfo = d.tags && d.tags.length > 0 ? ` | Tags: ${d.tags.join(', ')}` : '';
      
      item.innerHTML = `
        <div class="article-content">
          ${d.imageUrl ? `<img src="${d.imageUrl}" class="article-thumb" onerror="this.style.display='none'">` : 
            '<div class="article-thumb" style="background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;font-size:2rem">📰</div>'}
          <div class="article-info">
            <h3>${escape(d.title || 'Untitled')}${subInfo}</h3>
            <div class="article-meta">
              <span><i class="fas fa-folder"></i> ${d.category || 'General'}${tagsInfo}</span>
              <span><i class="fas fa-eye"></i> ${d.views || 0} views</span>
              <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
              ${badge}
            </div>
          </div>
        </div>
        <div class="article-actions">
          <button class="btn btn-warning" onclick="loadEdit('${id}')">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-danger" onclick="deleteArticle('${id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      `;
      
      list.appendChild(item);
    });
  });
}

// ✏️ Load for Edit (Updated for new fields)
window.loadEdit = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, 'news', id));
    if (!docSnap.exists()) {
      toast('Article not found!', 'error');
      return;
    }
    
    const d = docSnap.data();
    titleInput.value = d.title || '';
    contentInput.value = d.content || '';
    imageUrlInput.value = d.imageUrl || '';
    categorySelect.value = d.category || 'General';
    statusSelect.value = d.status || 'published';
    subcategoryInput.value = d.subcategory || '';  // NEW
    currentTags = d.tags || [];  // NEW
    updateTagsDisplay();  // NEW
    editId = id;
    
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Article';
    document.getElementById('cancelEdit').style.display = 'inline-flex';
    postBtn.innerHTML = '<i class="fas fa-save"></i> Update Article';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('📝 Article loaded for editing', 'info');
  } catch (e) {
    toast('Failed to load: ' + e.message, 'error');
  }
};

// 🗑️ Delete Article (same)
window.deleteArticle = async (id) => {
  if (!confirm('⚠️ Are you sure you want to delete this article?\n\nThis action cannot be undone!')) {
    return;
  }
  
  try {
    await deleteDoc(doc(db, 'news', id));
    toast('✅ Article deleted successfully!');
    loadDashboard();
  } catch (e) {
    toast('Delete failed: ' + e.message, 'error');
  }
};

// 🛡️ Utility Functions (same)
function escape(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add CSS animations (same)
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

console.log('🚀 Advanced Admin Panel Loaded');
console.log('✅ AI Features Activated');
console.log('🔒 Secure Authentication Ready');
console.log('🆕 Subcategory & Tags Support Added!');  // NEW
