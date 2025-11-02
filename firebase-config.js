// firebase-config.js
// Modular Firebase SDK (ES modules) - used by app.js and admin.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

/*
  Replace the fields below if your Firebase project has different values.
  I have used the values you provided earlier for apiKey + project identifiers.
*/
const firebaseConfig = {
  apiKey: "AIzaSyAeGWwKLkHB43i1FbedgkANPKcTCBh0Z9A",
  authDomain: "truvani-news-5ac15.firebaseapp.com",
  projectId: "truvani-news-5ac15",
  storageBucket: "truvani-news-5ac15.appspot.com",
  messagingSenderId: "742142167141",
  appId: "1:742142167141:web:c2c116f5e50a574de85e8c"
};

// initialize app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// helper to upload image and return url
async function uploadImageFile(file, pathPrefix = "news_images") {
  if (!file) return null;
  const ref = storageRef(storage, `${pathPrefix}/${Date.now()}_${file.name}`);
  const snap = await uploadBytes(ref, file);
  const url = await getDownloadURL(snap.ref);
  return url;
}

export {
  app, db, auth, storage,
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp, increment,
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  storageRef, uploadImageFile, getDownloadURL
};
