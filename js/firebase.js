import { initializeApp } from "https://cdn.jsdelivr.net/npm/firebase@10.7.0/app/+esm";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://cdn.jsdelivr.net/npm/firebase@10.7.0/auth/+esm";
import { getFirestore, doc, setDoc, getDoc, addDoc, collection, updateDoc, deleteDoc, query, orderBy, where, onSnapshot } from "https://cdn.jsdelivr.net/npm/firebase@10.7.0/firestore/+esm";

const firebaseConfig = {
  apiKey: "AIzaSyAt5OmubFA4DvywVI4-visMfT2S5hX8r9o",
  authDomain: "soravin-studio.firebaseapp.com",
  projectId: "soravin-studio",
  storageBucket: "soravin-studio.firebasestorage.app",
  messagingSenderId: "526706525527",
  appId: "1:526706525527:web:59c9dbb6a7d98661d4ea12",
  measurementId: "G-ML6DFSTZT7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc, addDoc, collection, updateDoc, deleteDoc, query, orderBy, where, onSnapshot };
