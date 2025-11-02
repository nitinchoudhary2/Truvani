// 🔥 Advanced app.js for Truvani News

// Firebase import
import { db, FieldValue } from './firebase-config.js';
import { collection, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';

const newsContainer = document.getElementById('news-container');
const loader = document.createElement('div');
loader.innerHTML = `<div class="loader">Loading news...</div>`;
newsContainer.appendChild(loader);

// 🔹 Load news in real-time (no need to reload)
function loadNewsRealtime() {
  const q = collection(db, "news");

  onSnapshot(q, (snapshot) => {
    newsContainer.innerHTML = ""; // clear old news
    if (snapshot.empty) {
      newsContainer.innerHTML = "<p>No news available yet.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const newsData = docSnap.data();
      const newsId = docSnap.id;

      const newsElement = document.createElement("div");
      newsElement.classList.add("news-card");

      const likes = newsData.reactions?.['👍'] || 0;
      const hearts = newsData.reactions?.['❤️'] || 0;
      const fires = newsData.reactions?.['🔥'] || 0;

      newsElement.innerHTML = `
        <h3>${newsData.title}</h3>
        <p>${newsData.content || ""}</p>
        <div class="reactions">
          <button onclick="addReaction('${newsId}', '👍')">👍 ${likes}</button>
          <button onclick="addReaction('${newsId}', '❤️')">❤️ ${hearts}</button>
          <button onclick="addReaction('${newsId}', '🔥')">🔥 ${fires}</button>
        </div>
      `;

      newsContainer.appendChild(newsElement);
    });
  });
}

// 🔹 Add reaction function
window.addReaction = async (docId, reactionType) => {
  const docRef = doc(db, "news", docId);
  try {
    await updateDoc(docRef, {
      [`reactions.${reactionType}`]: FieldValue.increment(1),
    });
  } catch (error) {
    alert("Failed to add reaction: " + error.message);
  }
};

// 🔹 Optional: Future Gemini AI suggestion
async function suggestSummary(title, content) {
  // (Future use - integrate Gemini AI summary)
  console.log("Gemini AI Summary will suggest for:", title);
}

// 🔹 Load news on page start
loadNewsRealtime();
