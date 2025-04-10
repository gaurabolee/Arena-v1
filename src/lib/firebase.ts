// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// import { getAnalytics } from "firebase/analytics"; // Optional: if you enabled Analytics

// User's Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB8rCTkpb0wjpCVIae_aE28UyoYkrl7fYY",
  authDomain: "arena-77d5b.firebaseapp.com",
  projectId: "arena-77d5b",
  storageBucket: "arena-77d5b.firebasestorage.app", // Corrected: use .appspot.com if provided, otherwise check console
  messagingSenderId: "918795255701",
  appId: "1:918795255701:web:5a4220196d13672976809c",
  measurementId: "G-47C3JY0FYE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app); // Optional

export { app, auth, db, analytics }; // Export the initialized services 