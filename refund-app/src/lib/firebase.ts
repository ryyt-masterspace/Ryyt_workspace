import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration for Ryyt Refunds
const firebaseConfig = {
    apiKey: "AIzaSyBeST3a-DjMwkH93SpiWpu-_XT3sAbvirE",
    authDomain: "ryyt-refunds.firebaseapp.com",
    projectId: "ryyt-refunds",
    storageBucket: "ryyt-refunds.firebasestorage.app",
    messagingSenderId: "508699270884",
    appId: "1:508699270884:web:790800dec2fce4ab2396f1"
};

// Initialize Firebase (Singleton pattern to prevent re-initialization errors in Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
