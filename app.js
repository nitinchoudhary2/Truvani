// (यह app.js फ़ाइल है)

// Firebase services को import करें
import { db, FieldValue } from './firebase-config.js'; // (आपकी Firebase config फ़ाइल)
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const newsContainer = document.getElementById('news-container');

// न्यूज़ लोड करने वाला फंक्शन
async function loadNews() {
  // ... (सारा loadNews का लॉजिक) ...
  querySnapshot.forEach((doc) => {
    // ...
    newsElement.innerHTML = `
      <h3>${newsData.title}</h3>
      <div class="reactions">
          <button class="reaction-btn" onclick="addReaction('${newsId}', '👍')">👍 ${likes}</button>
          </div>
    `;
    newsContainer.appendChild(newsElement);
  });
}

// रिएक्शन ऐड करने वाला फंक्शन
window.addReaction = async (docId, reactionType) => {
  const docRef = doc(db, "news", docId);
  await updateDoc(docRef, {
    [`reactions.${reactionType}`]: FieldValue.increment(1)
  });
  
  // नोट: पेज को रीलोड करें ताकि नया काउंट दिखे
  // (या आप onSnapshot listener का इस्तेमाल कर सकते हैं)
  location.reload(); 
};

// पेज लोड होते ही न्यूज़ लोड करें
loadNews();
