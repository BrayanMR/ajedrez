import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyBOdK6vynO5V3flKKKBmvXln_y9GmDKdSc',
  authDomain: 'aljedrez-8962d.firebaseapp.com',
  projectId: 'aljedrez-8962d',
  storageBucket: 'aljedrez-8962d.firebasestorage.app',
  messagingSenderId: '554584302085',
  appId: '1:554584302085:web:5a3aa004f18758d2fc726c',
  measurementId: 'G-XCVW9NKMES'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
