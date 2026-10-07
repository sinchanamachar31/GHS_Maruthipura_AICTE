import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const requiredEnvKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
];

const hasRequiredFirebaseEnv = requiredEnvKeys.every(
  (key) => !!import.meta.env[key] && String(import.meta.env[key]).trim() !== ""
);

const firebaseConfig = hasRequiredFirebaseEnv
  ? {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || undefined,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
    }
  : {};

const app = hasRequiredFirebaseEnv ? initializeApp(firebaseConfig) : null;

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

if (!hasRequiredFirebaseEnv) {
  console.warn(
    "Firebase environment variables are missing. Add VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID to your .env or deployment environment so Firestore can initialize."
  );
}