import { getDoc } from 'firebase/firestore';
import {
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
  setDoc,
} from '../lib/firebase-utils';

import { auth, db } from './firebase-config.js';
// import { router } from '../lib/router.js';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const provider = new GoogleAuthProvider();
// const db = getFirestore();
// const auth = getAuth(app);

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
      const token = credential.accessToken;
      const user = sso.user.uid;
      localStorage.setItem('sessionUser', user);
      localStorage.setItem('sessionToken', token);
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

  // signInWithPopup(auth, provider).then((result) => {
  // This gives you a Google Access Token. You can use it to access the Google API.
  // const credential = GoogleAuthProvider.credentialFromResult(result);
  // const token = credential.accessToken;
  // The signed-in user info.
  // const user = result.user;
  // sessionStorage.setItem('token', token); // guarda token en sessionStorage
  // sessionStorage.setItem('user', JSON.stringify(user)); // guarda usuario en sessionStorage
  // googleUsers();
  // window.location.hash = '#/dashboard';
  // ...
  // });
  // .catch((error) => {
  // Handle Errors here.
  // const errorCode = error.code;
  // const errorMessage = error.message;
  // The email of the user's account used.
  // const email = error.customData.email;
  // The AuthCredential type that was used.
  // const credential = GoogleAuthProvider.credentialFromError(error);
  // ...
  // });
};

// LOGOUT
export const logout = () => {
  signOut(auth).then(() => {
    console.log('logout');
    localStorage.removeItem('sessionUser');
    localStorage.removeItem('sessionToken');
    window.location.hash = '#/login';
    // Sign-out successful.
  });
  // .catch((error) => {
  // An error happened.
  // });
};

// CREAR POST EN DASHBOARD
export const addPost = async (title, description) => {
  // const user = auth.currentUser;
  // const name = user.displayName ? user.displayName : user.email;
  const docRef = await addDoc(collection(db, 'posts'), {
    userId: auth.currentUser.uid,
    name: auth.currentUser.displayName,
    username: auth.currentUser.email,
    photo: auth.currentUser.photoURL,
    title,
    description,
    datePosted: Timestamp.fromDate(new Date()),
  });
  return docRef;
};

// get data
export const getPosts = async (posts) => {
  const querySnapshot = await getDocs(
    collection(db, posts),
    orderBy('datePosted', 'desc'),
  );
  const postsArr = [];
  querySnapshot.forEach((document) => {
    const post = document.data();
    post.id = document.id;
    postsArr.push(post);
  });
  return postsArr;
};

// export const observer = () => {
//   onAuthStateChanged(auth, (user) => {
//     if (user) {
//       window.location.hash = '#/dashboard';
//       router(window.location.hash);
//       // User is signed in, see docs for a list of available properties
//       // https://firebase.google.com/docs/reference/js/firebase.User
//       const uid = user.uid;
//       // ...
//     } else {
//       // User is signed out
//       // ...
//     }
//   });
// };
// observer();

// cargar pagina
export const onGetPost = async (callback) => {
  const getPost = await onSnapshot(collection(db, 'posts'), callback, {
  });
  return getPost;
};
// editar post
export const postEdit = async (id) => {
  const editPost = await setDoc(doc(db, 'posts', id), {
  });
  return editPost;
};

// eliminar post
export const deletePost = async (id) => {
  const eliminarPost = await deleteDoc(doc(db, 'posts', id), {
  });
  return eliminarPost;
};

// Dar like
export const likes = async (id, userId) => {
  const postRef = doc(db, 'posts', id);
  const docSnap = await getDoc(postRef);
  const postData = docSnap.data();
  const likesCount = postData.likesCounter.length;

  if (postData.likes.includes(userId)) {
    await updateDoc(postRef, {
      likes: arrayRemove(userId),
      likesCounter: likesCount - 1,
    });
  } else {
    await updateDoc(postRef, {
      likes: arrayUnion(userId),
      likesCounter: likesCount + 1,
    });
    console.log(likesCount);
  }
};
