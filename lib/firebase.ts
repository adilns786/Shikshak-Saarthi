// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdv7Fam8KP8mkyF_UP7RfURM6OwFNd7vQ",
  authDomain: "shikshak-sarthi.firebaseapp.com",
  projectId: "shikshak-sarthi",
  storageBucket: "shikshak-sarthi.firebasestorage.app",
  messagingSenderId: "726257831587",
  appId: "1:726257831587:web:2b83f3d3e05ebf9df23916",
  measurementId: "G-B890CNWZLE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only if supported (avoids SSR issues)
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

// Export instances
export { app, auth, db, storage, analytics };
