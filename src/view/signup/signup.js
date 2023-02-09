import {
  loginGoogle,
  newRegister,
  sendVerification,
} from '../../firebase/firebase.js';

export const signup = () => {
  const viewSignUp = document.createElement('div');
  viewSignUp.classList.add('signup-container');
  viewSignUp.innerHTML = `
  <main>
  <div class="container">
    <div class="logo-container">
      <img src="./assets/logo.webp" alt="logo" />
      <h1>Purrfect Books</h1>
    </div>
    <h2>Regístrate</h2>
    <form id="signup-form">
      <div class="container-item">
        <label for="signup-email">Correo</label>
        <input
          type="text"
          id="signup-email"
          class="signup-input"
          placeholder="ejemplo@email.com"
        />
        <p class="error-text" id="email-validation"></p>
      </div>
      <div class="container-item">
        <label for="signup-password">Contraseña</label>
        <input
          type="password"
          id="signup-password"
          class="signup-input"
          placeholder="**************"
        />
        <p class="error-text" id="password-validation"></p>
      </div>
      <div class="container-item">
        <label for="signup-confirm-password">Confirmar contraseña</label>
        <input
          type="password"
          id="signup-confirm-password"
          class="signup-input"
          placeholder="**************"
        />
        <p class="error-text" id="password-confirm-validation"></p>
      </div>
      <div class="container-item">
        <label for="signup-nickname">Nombre</label>
        <input
          type="text"
          id="signup-nickname"
          class="signup-input"
          placeholder="ej: Juan"
        />
        <p class="error-text" id="nickname-validation"></p>
      </div>
      <div class="signup-container-btn">
        <button type="submit" id="signup-submit-button" class="signup-btn">
          Regístrar
        </button>
      </div>
    </form>
    <div class="login-google">
      <p>o</p>
      <button type="button" id="login-google" class="login-google-btn">
        <img src="./assets/btn_google_signin.png" alt="logo-google" />
      </button>
    </div>
    <div class="signup-span">
      <span
        >¿Ya tienes cuenta?<a href="#/login" class="span-btn">
          Ingresa aquí.</a
        ></span
      >
    </div>
  </div>
</main>
`;
  // GOOGLE LOGIN
  viewSignUp.querySelector('#login-google').addEventListener('click', () => {
    loginGoogle();
    // console.log("hola");
  });

  // REGISTRO
  viewSignUp
    .querySelector('#signup-submit-button')
    .addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const email = document.querySelector('#signup-email').value;
        const password = document.querySelector('#signup-password').value;
        const passwordConfirm = document.querySelector(
          '#signup-confirm-password',
        ).value;
        const nickname = document.querySelector('#signup-nickname').value;

        // console.log({ email, password, passwordConfirm, nickname });
        const emailIsValid = validateEmail(email);
        const passwordIsValid = validatePassword(password);
        const passwordConfirmIsValid = validateConfirmPassword(
          password,
          passwordConfirm,
        );
        const nicknameIsValid = validateNickname(nickname);
        if (
          !emailIsValid ||
          !passwordIsValid ||
          !passwordConfirmIsValid ||
          !nicknameIsValid
        ) {
          return false;
        }

        const userCredential = await newRegister(email, password, nickname);
        console.log(userCredential);
        const user = userCredential.user;
        console.log({ userCredential, user });
        await sendVerification();
        alert('Se envío un enlace de verificación a tu correo.');
        window.location.hash = '#/login';
        console.log(user);
        return true;
      } catch (err) {
        signupErrorHandler(err);
      }
    });
  return viewSignUp;
};
// FUNCION PARA VALIDAR INPUT DEL CORREO
const validateEmail = (email) => {
  const emailErrorText = document.getElementById('email-validation');
  console.log({ function: 'validateEmail', email });
  emailErrorText.innerHTML = '';
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    // console.log("Email is valid");
    return true;
  } else {
    // console.log("Email is invalid");
    emailErrorText.innerHTML = 'El correo ingresado no es válido.';
    return false;
  }
};

// FUNCION PARA VALIDAR INPUT DE LA CONTRASEÑA
export const validatePassword = (password) => {
  const passwordErrorText = document.getElementById('password-validation');
  passwordErrorText.innerHTML = '';
  if (password.length === 0) {
    passwordErrorText.innerHTML = 'Este campo no puede estar vacío.';
    return false;
  } else if (password.length < 6) {
    passwordErrorText.innerHTML =
      'La contraseña debe tener un mínimo de 6 caracteres.';
    return false;
  } else if (password.length > 16) {
    passwordErrorText.innerHTML =
      'La contraseña debe tener un máximo de 16 caracteres.';
    return false;
  } else {
    return true;
  }
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
  } else if (passwordConfirm !== password) {
    passwordConfirmErrorText.innerHTML = 'Las contraseñas no coinciden.';
    return false;
  } else {
    return true;
  }
};
// FUNCION PARA VALIDAR EL NICKNAME
export const validateNickname = (nickname) => {
  const nicknameErrorText = document.getElementById('nickname-validation');
  nicknameErrorText.innerHTML = '';
  if (nickname.length === 0) {
    nicknameErrorText.innerHTML = 'Debe ingresar un nombre.';
    return false;
  } else if (nickname.length > 8) {
    nicknameErrorText.innerHTML = 'Debe tener máximo 8 caracteres.';
    return false;
  } else {
    return true;
  }
};

// FUNCION QUE MANEJA LOS ERRORES DEL SIGNUP
export const signupErrorHandler = (error) => {
  const errorCode = error.code;
  if (errorCode === 'auth/email-already-in-use') {
    alert('Este correo ya está en uso.');
  }
};
