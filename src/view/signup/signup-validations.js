// FUNCION PARA VALIDAR INPUT DEL CORREO
export const validateEmail = (email) => {
  const emailErrorText = document.getElementById("email-validation");
  console.log({ function: "validateEmail", email });
  emailErrorText.innerHTML = "";
  if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    // console.log("Email is valid");
    return true;
  }
  // console.log("Email is invalid");
  emailErrorText.innerHTML = `<img src="./assets/error.png" alt="error" class="error-icon" />
  <span>El correo ingresado no es válido.</span>`;
  return false;
};
// FUNCION PARA VALIDAR INPUT DE LA CONTRASEÑA
export const validatePassword = (password) => {
  const passwordErrorText = document.getElementById("password-validation");
  passwordErrorText.innerHTML = "";
  if (password.length === 0) {
    passwordErrorText.innerHTML = `<img src="./assets/error.png" alt="error" class="error-icon" />
    <span>Este campo no puede estar vacío.</span>`;
    return false;
  }
  if (password.length < 6) {
    passwordErrorText.innerHTML = `<img src="./assets/error.png" alt="error" class="error-icon" />
    <span>La contraseña debe tener un mínimo de 6 caracteres.</span>`;
    return false;
  }
  if (password.length > 16) {
    passwordErrorText.innerHTML = `<img src="./assets/error.png" alt="error" class="error-icon" />
    <span>La contraseña debe tener un máximo de 16 caracteres.</span>`;
    return false;
  }
  return true;
};
// FUNCION PARA VALIDAR INPUT DE CONFIRMAR CONTRASEÑA
export const validateConfirmPassword = (password, passwordConfirm) => {
  const passwordConfirmErrorText = document.getElementById(
    "password-confirm-validation"
  );
  passwordConfirmErrorText.innerHTML = "";
  if (passwordConfirm.length === 0) {
    passwordConfirmErrorText.innerHTML = `<img src="./assets/error.png" alt="error" class="error-icon" />
    <span>Este campo no puede estar vacío.</span>`;
    return false;
  }
  if (passwordConfirm !== password) {
    passwordConfirmErrorText.innerHTML = `<img src="./assets/error.png" alt="error" class="error-icon" />
    <span>Las contraseñas no coinciden.</span>`;
    return false;
  }
  return true;
};
// FUNCION PARA VALIDAR EL NICKNAME
export const validateNickname = (nickname) => {
  const nicknameErrorText = document.getElementById("nickname-validation");
  nicknameErrorText.innerHTML = "";
  if (nickname.length === 0) {
    nicknameErrorText.innerHTML = `<img src="./assets/error.png" alt="error" class="error-icon" />
    <span>Debe ingresar un nombre.</span>`;
    return false;
  }
  if (nickname.length > 8) {
    nicknameErrorText.innerHTML = `img src="./assets/error.png" alt="error" class="error-icon" />
    <span>Debe tener máximo 8 caracteres.</span>`;
    return false;
  }
  return true;
};
