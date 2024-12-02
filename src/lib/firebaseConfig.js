// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEWcaHAmlfHPOwgxB4LVg56usgITgP3fw",
  authDomain: "recipe-management-system-7a532.firebaseapp.com",
  projectId: "recipe-management-system-7a532",
  storageBucket: "recipe-management-system-7a532.appspot.com", // Fixed typo
  messagingSenderId: "358530597401",
  appId: "1:358530597401:web:18b7373cbb363d8ea42088",
  measurementId: "G-QSD4L99414"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics only in the browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Export the Firestore database and Firebase config
export { db, firebaseConfig };
