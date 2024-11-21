import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAZmzDzMA_l53Sl6Cfi3oAjB3eVI2UZdIY",
    authDomain: "mystable-983a0.firebaseapp.com",
    projectId: "mystable-983a0",
    storageBucket: "mystable-983a0.appspot.com",
    messagingSenderId: "125084559501",
    appId: "1:125084559501:web:73cfe42dc213809e45dac4",
    measurementId: "G-C9WW0W6F80"
  };

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});


export { app, auth, db }