// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
export const firestore = getFirestore(app);
export const auth = getAuth(app);
