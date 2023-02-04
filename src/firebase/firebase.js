import { app } from "../firebase/firebase-config.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const provider = new GoogleAuthProvider();

const auth = getAuth();

// CORREO DE VERIFICACION
export const sendVerification = () => {
  return sendEmailVerification(auth.currentUser);
};

// LOGIN CON CORREO Y CONTRASEÑA
export const loginEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// REGISTRO CON CORREO Y CONSTRASEÑA
export const newRegister = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// GOOGLE SIGNIN
export const loginGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      alert(result.user.displayName);
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
};
