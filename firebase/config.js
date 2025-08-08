// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFC9YnEbTSg0jrDq8Py3SOe4QJ5yBmaAk",
  authDomain: "yoga-app-77b5f.firebaseapp.com",
  projectId: "yoga-app-77b5f",
  storageBucket: "yoga-app-77b5f.firebasestorage.app",
  messagingSenderId: "713909015890",
  appId: "1:713909015890:web:fd4dbe904f679ed0ef168b",
  measurementId: "G-PK222NGTMS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Analytics (only for web)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, db, auth, analytics };
