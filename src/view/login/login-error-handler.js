// FUNCION QUE MANEJA LOS ERRORES DEL LOGIN
export const loginErrorHandler = (error) => {
  const errorCode = error.code;
  console.log(errorCode);
  const errorFeedback = document.getElementById('error-feedback');

  if (errorCode === 'auth/invalid-email') {
    errorFeedback.innerHTML = `<img src="./assets/error.png" alt="error" class="error-icon" />
    <span>Ingresa un correo válido.</span>`;
  } else if (errorCode === 'auth/user-not-found') {
    errorFeedback.innerHTML = `<img src="./assets/error.png" alt="error" class="error-icon" />
    <span>Usuario no registrado.</span>`;
  } else if (errorCode === 'auth/internal-error') {
    errorFeedback.innerHTML = `<img src="./assets/error.png" alt="error" class="error-icon" />
    <span>Ingresa una constraseña.</span>`;
  } else if (errorCode === 'auth/wrong-password') {
    errorFeedback.innerHTML = `<img src="./assets/error.png" alt="error" class="error-icon" />
    <span>Correo y/o contraseña inválidos.</span>`;
  } else if (errorCode === 'auth/too-many-requests') {
    errorFeedback.innerHTML = `<img src="./assets/error.png" alt="error" class="error-icon" />
    <span>Se han realizado demasiados intentos fállidos.</span>`;
  }
};
