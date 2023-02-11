// FUNCION PARA VALIDAR INPUT DEL CORREO
export const validateEmail = (email) => {
  const emailErrorText = document.getElementById('email-validation');
  console.log({ function: 'validateEmail', email });
  emailErrorText.innerHTML = '';
  if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    // console.log("Email is valid");
    return true;
  }
  // console.log("Email is invalid");
  emailErrorText.innerHTML = 'El correo ingresado no es válido.';
  return false;
};
// FUNCION PARA VALIDAR INPUT DE LA CONTRASEÑA
export const validatePassword = (password) => {
  const passwordErrorText = document.getElementById('password-validation');
  passwordErrorText.innerHTML = '';
  if (password.length === 0) {
    passwordErrorText.innerHTML = 'Este campo no puede estar vacío.';
    return false;
  } if (password.length < 6) {
    passwordErrorText.innerHTML = 'La contraseña debe tener un mínimo de 6 caracteres.';
    return false;
  } if (password.length > 16) {
    passwordErrorText.innerHTML = 'La contraseña debe tener un máximo de 16 caracteres.';
    return false;
  }
  return true;
};
// FUNCION PARA VALIDAR INPUT DE CONFIRMAR CONTRASEÑA
export const validateConfirmPassword = (password, passwordConfirm) => {
  const passwordConfirmErrorText = document.getElementById(
    'password-confirm-validation',
  );
  passwordConfirmErrorText.innerHTML = '';
  if (passwordConfirm.length === 0) {
    passwordConfirmErrorText.innerHTML = 'Este campo no puede estar vacío.';
    return false;
  } if (passwordConfirm !== password) {
    passwordConfirmErrorText.innerHTML = 'Las contraseñas no coinciden.';
    return false;
  }
  return true;
};
// FUNCION PARA VALIDAR EL NICKNAME
export const validateNickname = (nickname) => {
  const nicknameErrorText = document.getElementById('nickname-validation');
  nicknameErrorText.innerHTML = '';
  if (nickname.length === 0) {
    nicknameErrorText.innerHTML = 'Debe ingresar un nombre.';
    return false;
  } if (nickname.length > 8) {
    nicknameErrorText.innerHTML = 'Debe tener máximo 8 caracteres.';
    return false;
  }
  return true;
};
