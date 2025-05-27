import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCPFp1aarYkZP-W9nJMBGBhrGOQFRL7xnc',
  authDomain: 'logistics-management-26709.firebaseapp.com',
  projectId: 'logistics-management-26709',
  storageBucket: 'logistics-management-26709.firebasestorage.app',
  messagingSenderId: '144917112266',
  appId: '1:144917112266:android:34806a43a00f0f9fac9b33',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { app, auth };