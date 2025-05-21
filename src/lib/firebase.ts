// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";
// import { getAnalytics } from "firebase/analytics"; // Optional: if you enabled Analytics

// User's Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB8rCTkpb0wjpCVIae_aE28UyoYkrl7fYY",
  authDomain: "arena-77d5b.firebaseapp.com",
  projectId: "arena-77d5b",
  storageBucket: "arena-77d5b.appspot.com",
  messagingSenderId: "918795255701",
  appId: "1:918795255701:web:5a4220196d13672976809c",
  measurementId: "G-47C3JY0FYE"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
// const analytics: Analytics = getAnalytics(app); // Analytics can be optional for pure UI work

// const analytics = getAnalytics(app); // Optional

// Removed emulator connection logic

export { app, auth, db }; // Removed analytics for now to simplify, can be added back if needed. 