// FUNCION QUE MANEJA LOS ERRORES DEL LOGIN
export const loginErrorHandler = (error) => {
  const errorCode = error.code;
  console.log(errorCode);
  const errorFeedback = document.getElementById('error-feedback');

  if (errorCode === 'auth/invalid-email') {
    errorFeedback.innerHTML = 'Ingresa un correo válido.';
  } else if (errorCode === 'auth/user-not-found') {
    errorFeedback.innerHTML = 'Usuario no registrado.';
  } else if (errorCode === 'auth/internal-error') {
    errorFeedback.innerHTML = 'Ingresa una constraseña.';
  } else if (errorCode === 'auth/wrong-password') {
    errorFeedback.innerHTML = 'Correo y/o contraseña inválidos.';
  } else if (errorCode === 'auth/too-many-requests') {
    errorFeedback.innerHTML = 'Se han realizado demasiados intentos fállidos.';
  }
};
