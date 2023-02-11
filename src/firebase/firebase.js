import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { app } from './firebase-config.js';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const provider = new GoogleAuthProvider();

const auth = getAuth();

// CORREO DE VERIFICACION
export const sendVerification = () => sendEmailVerification(auth.currentUser);

// LOGIN CON CORREO Y CONTRASEÑA
export const loginEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);

// REGISTRO CON CORREO Y CONSTRASEÑA
export const newRegister = (email, password, nickname) => createUserWithEmailAndPassword(auth, email, password, nickname);

// GOOGLE SIGNIN
export const loginGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential.accessToken;
      // The signed-in user info.
      // const user = result.user;
      alert(result.user.displayName);
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      // const errorCode = error.code;
      // const errorMessage = error.message;
      // The email of the user's account used.
      // const email = error.customData.email;
      // The AuthCredential type that was used.
      // const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
};

export const logout = () => {
  signOut(auth)
    .then(() => {
      console.log('logout');
      window.location.hash = '#/login';
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
    });
};
