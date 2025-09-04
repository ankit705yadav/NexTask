// The Firebase project linked in the configuration is temporary and will be deleted once the review of this assignment is complete.
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase web app's configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXTnBoQr7pgUs_CztoNF0ZTSdoihKuhJk",
  authDomain: "nextask-15224.firebaseapp.com",
  projectId: "nextask-15224",
  storageBucket: "nextask-15224.firebasestorage.app",
  messagingSenderId: "737463308772",
  appId: "1:737463308772:web:e8fe594525dcbe43aff7f1",
};

// Initialize Firebase App
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore with persistence enabled from the start.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({}),
});

// Export the initialized services
export { auth, db };
