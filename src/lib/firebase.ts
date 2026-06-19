import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function getApp(): FirebaseApp {
  if (!_app && typeof window !== 'undefined') {
    _app = initializeApp(firebaseConfig);
  }
  return _app as FirebaseApp;
}

export function getDB(): Firestore {
  if (!_db && typeof window !== 'undefined') {
    _db = getFirestore(getApp());
  }
  return _db as Firestore;
}

export function getAuthInstance(): Auth {
  if (!_auth && typeof window !== 'undefined') {
    _auth = getAuth(getApp());
  }
  return _auth as Auth;
}

export default getApp;
