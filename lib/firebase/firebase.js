// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let db;
let auth;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp(); // Se l'app è già inizializzata, usa quella
  }
  
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Errore inizializzazione Firebase:", error);
  
  // Inizializzazione di fallback per sviluppo
  if (typeof window !== 'undefined') {
    console.log("Usando configurazione di sviluppo");
    
    // Usa le stesse variabili d'ambiente anche in sviluppo
    app = initializeApp(firebaseConfig, "dev-app");
    db = getFirestore(app);
    auth = getAuth(app);
  }
}

export { db, auth }; 