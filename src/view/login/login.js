import { loginEmail, loginGoogle } from '../../firebase/firebase.js';

import { loginErrorHandler } from './login-error-handler.js';

import { footer } from '../../components/footer.js';

export const login = () => {
  const viewLogIn = document.createElement('div');
  viewLogIn.classList.add('login-container');
  viewLogIn.innerHTML = `
  <header>
  <div class="logo-container">
    <img src="./assets/logo.webp" alt="logo" />
    <h1>Purrfect Books</h1>
  </div>
  </header>

  <main>
   <section>
  <div class="container">

  <h2>Ingresar</h2>
  <form id="login-form">
    <div class="container-item">
      <label for="login-email">Correo</label>
      <input type="text" id="login-email" class="login-input" placeholder="ejemplo@email.com" />
    </div>
    <div class="container-item">
      <label for="login-password">Contraseña</label>
      <input type="password" id="login-password" class="login-input" placeholder="**************" />
      <div class="error-feedback-container" id="error-feedback"></div>
    </div>
    <div class="signup-container-btn">
    <button type="submit" id="login-form-button" class="login-btn">
      Iniciar sesión
    </button>
    </div>
    </form>
    <div class="login-google">
    <p>o</p>
    <button type="button" id="login-google" class="login-google-btn">
      <img src="./assets/btn_google_signin.png" alt="logo-google" />
    </button>
    </div>
    <div class="login-span">
      <span
        >¿Todavía no tienes cuenta? <a href="#/signup" class="span-btn">Regístrate aquí.</a
        ></span>
        </div>
  </div>
  </section>
  </main>
  `;
  const loginForm = viewLogIn.querySelector('#login-form-button');
  loginForm.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const email = document.querySelector('#login-email').value;
      const password = document.querySelector('#login-password').value;
      const response = await loginEmail(email, password);

      console.log({ response });
      window.location.hash = '#/dashboard';
    } catch (err) {
      loginErrorHandler(err);
    }
  });
  // LOGIN GOOGLE
  const loginGoogleBtn = viewLogIn.querySelector('#login-google');
  loginGoogleBtn.addEventListener('click', () => {
    loginGoogle();
  });
  viewLogIn.appendChild(footer());
  return viewLogIn;
};
