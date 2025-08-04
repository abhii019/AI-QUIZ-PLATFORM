// firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUbMYmKlbKkPQkogn44H8OprWTzjqkMKU",
  authDomain: "ai-quiz-platform-d7e15.firebaseapp.com",
  projectId: "ai-quiz-platform-d7e15",
  storageBucket: "ai-quiz-platform-d7e15.appspot.com", // fixed typo here
  messagingSenderId: "829927785298",
  appId: "1:829927785298:web:30d6edaeb30c96bfa5308b",
  measurementId: "G-HC0FW5NEZV",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
const provider = new GoogleAuthProvider();
export { provider }; // Exporting provider for use in auth functions

