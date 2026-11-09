import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBkv56dk8q1upAnrKYZ7sMpB-eXsqiSwT8",
  authDomain: "zion-mobile-phones.firebaseapp.com",
  projectId: "zion-mobile-phones",
  storageBucket: "zion-mobile-phones.firebasestorage.app",
  messagingSenderId: "354561194698",
  appId: "1:354561194698:web:477d5a1c9583b330ac1233",
  measurementId: "G-KTEM2FRKXW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);