import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: 'AIzaSyBOdK6vynO5V3flKKKBmvXln_y9GmDKdSc',
  authDomain: 'aljedrez-8962d.firebaseapp.com',
  projectId: 'aljedrez-8962d',
  storageBucket: 'aljedrez-8962d.firebasestorage.app',
  messagingSenderId: '554584302085',
  appId: '1:554584302085:web:5a3aa004f18758d2fc726c',
  measurementId: 'G-XCVW9NKMES'
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics (safely for browser/SSR environments)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
