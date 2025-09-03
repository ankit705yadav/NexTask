import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web app's configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXTnBoQr7pgUs_CztoNF0ZTSdoihKuhJk",
  authDomain: "nextask-15224.firebaseapp.com",
  projectId: "nextask-15224",
  storageBucket: "nextask-15224.firebasestorage.app",
  messagingSenderId: "737463308772",
  appId: "1:737463308772:web:e8fe594525dcbe43aff7f1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
