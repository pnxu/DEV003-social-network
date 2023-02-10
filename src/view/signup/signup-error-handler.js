// FUNCION QUE MANEJA LOS ERRORES DEL SIGNUP
export const signupErrorHandler = (error) => {
  const errorCode = error.code;
  if (errorCode === 'auth/email-already-in-use') {
    alert('Este correo ya está en uso.');
  }
};
