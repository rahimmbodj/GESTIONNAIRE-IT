// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBloQQvcd1lMANCU5Frdv7XIFB6vLI74Pk",
  authDomain: "focus-melody-467918-u9.firebaseapp.com",
  projectId: "focus-melody-467918-u9",
  storageBucket: "focus-melody-467918-u9.firebasestorage.app",
  messagingSenderId: "289948248371",
  appId: "1:289948248371:web:089fc30fdeccb2beecf646",
  measurementId: "G-3BFXRCW10N"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, db, auth, storage };
