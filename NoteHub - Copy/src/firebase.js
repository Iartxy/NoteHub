// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNN_kPNKZHQlhTqu7M4vwXg6Ax5qTYuwE",
  authDomain: "notehub-cc177.firebaseapp.com",
  projectId: "notehub-cc177",
  storageBucket: "notehub-cc177.firebasestorage.app",
  messagingSenderId: "44050763178",
  appId: "1:44050763178:web:b65fa2ce31a7f779e86fd3",
  measurementId: "G-66S64PPERW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;