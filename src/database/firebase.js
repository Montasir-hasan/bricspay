import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyDWyrP8xniw9kUJUBVCdhEIRs3Mw-BATj0",
  authDomain: "brics-pay.firebaseapp.com",
  databaseURL: "https://brics-pay-default-rtdb.firebaseio.com",
  projectId: "brics-pay",
  storageBucket: "brics-pay.firebasestorage.app",
  messagingSenderId: "516647996624",
  appId: "1:516647996624:web:a881e38c92c3c7cb3ea2d5",
  measurementId: "G-XPLKCMKF79"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export  {db};

