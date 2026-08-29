import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDgsDBb2oFfWQ6QYrW-sYXcMTaBTpGt8cw",
  authDomain: "wolf-and-sheep-game.firebaseapp.com",
  projectId: "wolf-and-sheep-game",
  storageBucket: "wolf-and-sheep-game.firebasestorage.app",
  messagingSenderId: "894728422115",
  appId: "1:894728422115:web:875af78e90096869887bd6"
};

// Prevent duplicate initialisation during HMR (hot module reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
