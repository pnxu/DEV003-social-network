// import { initializeApp } from 'firebase/app';
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';

import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  orderBy,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';

export {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  collection,
  addDoc,
  getDocs,
  Timestamp,
  orderBy,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  onSnapshot,
  deleteDoc,
};
