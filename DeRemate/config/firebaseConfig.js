import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage  from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCPFp1aarYkZP-W9nJMBGBhrGOQFRL7xnc',
  authDomain: 'logistics-management-26709.firebaseapp.com',
  projectId: 'logistics-management-26709',
  storageBucket: 'logistics-management-26709.appspot.com', 
  messagingSenderId: '144917112266',
  appId: '1:144917112266:android:34806a43a00f0f9fac9b33',
};


const app = initializeApp(firebaseConfig);

var auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

const db = getFirestore(app);

export { app, auth, db };