import { getDoc } from 'firebase/firestore';
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  orderBy,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  onSnapshot,
  deleteDoc,
  query,
} from '../lib/firebase-utils';

import { auth, db } from './firebase-config.js';

const provider = new GoogleAuthProvider();

// coleccion de usuarios
export const userData = async (userId, userEmail) => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      id: userId,
      username: userEmail,
    });
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

// coleccion de usuarios google
const googleUsers = async () => {
  const user = auth.currentUser;
  if (user !== null) {
    const docRef = await addDoc(collection(db, 'googleUsers'), {
      name: user.displayName,
      email: user.email,
      uid: user.uid,
      photo: user.photoURL,
    });
    console.log(docRef);
  }
};

// CORREO DE VERIFICACION
export const sendVerification = () => sendEmailVerification(auth.currentUser);

// LOGIN CON CORREO Y CONTRASEÑA
export const loginEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);

// REGISTRO CON CORREO Y CONSTRASEÑA
export const newRegister = (email, password, username) => createUserWithEmailAndPassword(auth, email, password, username);

// GOOGLE SIGNIN
export const ssoGoogle = async () => {
  try {
    const sso = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(sso);
    if (credential.accessToken) {
      googleUsers();
      window.alert(sso.user.displayName);
      window.location.hash = '#/dashboard';
      return true;
    }
    window.alert('LOGIN INVALIDO');
    return false;
  } catch (err) {
    console.log('SSO FAILED', err);
    return err;
  }
};

// LOGOUT
export const logout = () => {
  signOut(auth).then(() => {
    console.log('logout');
    window.location.hash = '#/login';
    // Sign-out successful.
  });
  // .catch((error) => {
  // An error happened.
  // });
};

// create post
export const addPost = (
  title,
  description,
) => {
  addDoc(collection(db, 'posts'), {
    userId: auth.currentUser.uid,
    name: auth.currentUser.displayName,
    username: auth.currentUser.email,
    photo: auth.currentUser.photoURL,
    title,
    description,
    datePosted: new Date(),
    likes: [],
    likesCounter: 0,
  });
};

// obtener posts
export const getPosts = (callback) => onSnapshot(query(collection(db, 'posts'), orderBy('datePosted', 'desc')), callback);

// cargar pagina
export const onGetPost = async (callback) => {
  const getPost = await onSnapshot(collection(db, 'posts'), callback, {
  });
  return getPost;
};

// editar post
export const postEdit = async (id, title, description) => {
  const postRef = doc(db, 'posts', id);
  console.log(postRef);
  await updateDoc(postRef, {
    title,
    description,
  });
  console.log(postRef);
};

// eliminar post
export const deletePost = async (id) => {
  const eliminarPost = await deleteDoc(doc(db, 'posts', id), {
  });
  return eliminarPost;
};

// Dar like
export const removeLike = async (userId, postId) => {
  const postRef = doc(db, 'posts', postId);
  const postSnapshot = await getDoc(postRef);
  const likes = postSnapshot.get('likes');
  const likesCounter = postSnapshot.get('likesCounter');
  await updateDoc(postRef, {
    likes: arrayRemove(userId),
    likesCounter: likesCounter - 1,
  });
  console.log(likes);
};

export const addLike = async (userId, postId) => {
  const postRef = doc(db, 'posts', postId);
  const postSnapshot = await getDoc(postRef);
  const likes = postSnapshot.get('likes');
  const likesCounter = postSnapshot.get('likesCounter');
  await updateDoc(postRef, {
    likes: arrayUnion(userId),
    likesCounter: likesCounter + 1,
  });
  console.log(likes);
};

export const observer = () => {
  onAuthStateChanged(auth, (user) => {
    console.log(user);
    if (user == null) {
      // window.location.hash = '#/';
      // window.location.hash = '#/signup';
    }
    if (window.location.hash === '#/' && user) {
      window.location.hash = '#/dashboard';
    }
    if (window.location.hash === '' && user) {
      window.location.hash = '#/dashboard';
    }
  });
};
