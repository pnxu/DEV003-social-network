export const signInWithPopup = jest.fn(
  () => new Promise((resolve) => {
    resolve({ user: { displayName: '' } });
  }),
);
export const initializeApp = jest.fn();

export class GoogleAuthProvider { static credentialFromResult() {} }

export const getAuth = jest.fn();

// export const userCredential = jest.fn(
//   () => new Promise((resolve) => {
//     resolve({ userCredential, user: '' });
//   }),
// );
// const response = await loginEmail(email, password);
// CAsos de validacion de verificacion de correo.
const userNotVerified = {
  user: { emailVerified: false },
};

const userVerified = {
  user: { emailVerified: true },
};

// Caso de error de autenticacion.
const errorObj = {
  code: 0,
  message: 'Carmen',
};

export const signInWithEmailAndPassword = jest.fn(
  (email, password) => new Promise((resolve) => {
    if (email === true) { // si el correo es el correcto
      resolve(userVerified); // Resuelve el usuario
    } else if (email === false) { // si el correo no es el correcto
      resolve(userNotVerified); // caso de usuario no verificado
    } else {
      throw (errorObj); // caso de error
    }
    if (password >= 6) {
      resolve(userVerified);
    }
  }),
);

export const loginErrorHandler = jest.fn(
  (errorCode) => new Promise((resolve) => {
    if (errorCode === 'auth/invalid-email') {
      resolve(errorCode);
    }
  }),
  (errorCode) => new Promise((resolve) => {
    if (errorCode === 'auth/user-not-found') {
      resolve(errorCode);
    }
  }),
  (errorCode) => new Promise((resolve) => {
    if (errorCode === 'auth/internal-error') {
      resolve(errorCode);
    }
  }),
  (errorCode) => new Promise((resolve) => {
    if (errorCode === 'auth/wrong-password') {
      resolve(errorCode);
    }
  }),
  (errorCode) => new Promise((resolve) => {
    if (errorCode === 'auth/too-many-requests') {
      resolve(errorCode);
    }
  }),
);

// export const logout = jest.fn (

// ) => {
//   signOut(auth)
//     .then(() => {
//       console.log('logout');
//       window.location.hash = '#/login';

// export const loginErrorHandler = jest.fn(
//   (errorCode) => new Promise((resolve) => {
//     if (errorCode === 'auth/invalid-email') {
//     resolve(errorCode);
//   )},
// }),

export const logout = jest.fn(
  (auth) => new Promise((resolve) => {
    if (auth === 'signOut') {
      resolve('#/login');
    }
  }),
);
