import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKmBLtC9YP9lqV_mNb2dhQmyegMg4YCac",
  authDomain: "on-road-service-de0b4.firebaseapp.com",
  projectId: "on-road-service-de0b4",
  storageBucket: "on-road-service-de0b4.firebasestorage.app",
  messagingSenderId: "1046155527535",
  appId: "1:1046155527535:web:a9d27f5058eba4d1bed49a",
  measurementId: "G-JWKE3N35YJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
