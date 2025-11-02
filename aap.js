import { db, collection, onSnapshot, doc, updateDoc } from './firebase-config.js';

const newsContainer = document.getElementById('news-container');

function loadNewsRealtime() {
  const q = collection(db, "news");

  onSnapshot(q, (snapshot) => {
    newsContainer.innerHTML = "";
    if (snapshot.empty) {
      newsContainer.innerHTML = "<p>No news available yet.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const newsData = docSnap.data();
      const newsId = docSnap.id;

      const newsCard = document.createElement('div');
      newsCard.classList.add('news-card');
      newsCard.innerHTML = `
        <h3>${newsData.title}</h3>
        <p>${newsData.content}</p>
        <div class="reactions">
          <button onclick="addReaction('${newsId}', '👍')">👍 ${newsData.reactions?.['👍'] || 0}</button>
          <button onclick="addReaction('${newsId}', '❤️')">❤️ ${newsData.reactions?.['❤️'] || 0}</button>
          <button onclick="addReaction('${newsId}', '🔥')">🔥 ${newsData.reactions?.['🔥'] || 0}</button>
        </div>
      `;
      newsContainer.appendChild(newsCard);
    });
  });
}

window.addReaction = async (id, type) => {
  const docRef = doc(db, "news", id);
  await updateDoc(docRef, {
    [`reactions.${type}`]: firebase.firestore.FieldValue.increment(1),
  });
};

loadNewsRealtime();
