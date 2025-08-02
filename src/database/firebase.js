import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "your Database keys here ",
  authDomain: "your Database keys here ",
  databaseURL: "your Database keys here ",
  projectId: "your Database keys here ",
  storageBucket: "your Database keys here ",
  messagingSenderId: "your Database keys here ",
  appId: "your Database keys here ",
  measurementId: "your Database keys here "
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export  {db};
