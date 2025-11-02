// app.js
import { db, doc, updateDoc, collection, onSnapshot } from "./firebase-config.js";
import { increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const newsContainer = document.getElementById("news-container");

function loadNewsRealtime() {
  const q = collection(db, "news");
  onSnapshot(q, (snapshot) => {
    newsContainer.innerHTML = "";
    if (snapshot.empty) {
      newsContainer.innerHTML = "<p>No news available yet.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      const newsCard = document.createElement("div");
      newsCard.classList.add("news-card");

      const likes = data.reactions?.['👍'] || 0;
      const hearts = data.reactions?.['❤️'] || 0;
      const fires = data.reactions?.['🔥'] || 0;

      newsCard.innerHTML = `
        <h2>${data.title}</h2>
        <p>${data.content}</p>
        <div class="reactions">
          <button onclick="react('${id}','👍')">👍 ${likes}</button>
          <button onclick="react('${id}','❤️')">❤️ ${hearts}</button>
          <button onclick="react('${id}','🔥')">🔥 ${fires}</button>
        </div>
      `;

      newsContainer.appendChild(newsCard);
    });
  });
}

window.react = async (id, type) => {
  const ref = doc(db, "news", id);
  try {
    await updateDoc(ref, {
      [`reactions.${type}`]: increment(1),
    });
  } catch (err) {
    console.error("Reaction error:", err);
  }
};

loadNewsRealtime();
