// Firebase configuration - imports from root firebaseConfig.js
import { auth, firestore } from "@/firebaseConfig";
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";

// Re-export auth and firestore from root config
export { auth };
export const db = firestore;

// Initialize storage (using same app instance)
const firebaseConfig = {
  apiKey: "AIzaSyBdv7Fam8KP8mkyF_UP7RfURM6OwFNd7vQ",
  authDomain: "shikshak-sarthi.firebaseapp.com",
  projectId: "shikshak-sarthi",
  storageBucket: "shikshak-sarthi.firebasestorage.app",
  messagingSenderId: "726257831587",
  appId: "1:726257831587:web:2b83f3d3e05ebf9df23916",
  measurementId: "G-B890CNWZLE",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
