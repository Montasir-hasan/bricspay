// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWyrP8xniw9kUJUBVCdhEIRs3Mw-BATj0",
  authDomain: "brics-pay.firebaseapp.com",
  projectId: "brics-pay",
  storageBucket: "brics-pay.firebasestorage.app",
  messagingSenderId: "516647996624",
  appId: "1:516647996624:web:a881e38c92c3c7cb3ea2d5",
  measurementId: "G-XPLKCMKF79"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
const db = getFirestore(app);

// Export Firestore instance for use in your app
export { db };
