import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCPFp1aarYkZP-W9nJMBGBhrGOQFRL7xnc',
  authDomain: 'logistics-management-26709.firebaseapp.com',
  projectId: 'logistics-management-26709',
  storageBucket: 'logistics-management-26709.appspot.com',
  messagingSenderId: '144917112266',
  appId: '1:144917112266:android:34806a43a00f0f9fac9b33',
};

// Inicializar la app de Firebase
const app = initializeApp(firebaseConfig);

// Inicializar autenticación con persistencia utilizando AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Inicializar Firestore
const db = getFirestore(app);

export { app, auth, db };
