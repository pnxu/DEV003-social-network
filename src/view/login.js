import { loginEmail, loginGoogle } from "../firebase/firebase.js";

export const login = () => {
  const viewLogIn = document.createElement("div");
  viewLogIn.classList.add("login-container");
  viewLogIn.innerHTML = `
  <main>
  <div class="container">
  <div class="logo-container">
    <img src="./assets/logo.webp" alt="logo" />
    <h1>Purrfect Books</h1>
  </div>
  <h2>Ingresar</h2>
  <form id="login-form">
    <div class="container-item">
      <label for="login-email">Mail</label>
      <input type="text" id="login-email" class="login-input" placeholder="ejemplo@email.com" />
    </div>
    <div class="container-item">
      <label for="login-password">Contraseña</label>
      <input type="password" id="login-password" class="login-input" placeholder="**************" />
      <span class="error-feedback" id="error-feedback"></span>
    </div>
    <div class="signup-container-btn">
    <button type="submit" id="login-button" class="login-btn">
      Iniciar sesión
    </button>
    </div>
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
  </form>
  </div>
  </main>
  `;
  const loginForm = viewLogIn.querySelector("#login-form");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const email = document.querySelector("#login-email").value;
      const password = document.querySelector("#login-password").value;
      const errorTexts = viewLogIn.querySelectorAll(".error-text");

      errorTexts.forEach((errorText) => {
        errorText.style.display = "none";
      });
      const response = await loginEmail(email, password);

      console.log({ response });
      window.location.hash = "#/dashboard";
    } catch (err) {
      loginErrorHandler(err);
    }
  });
  // LOGIN GOOGLE
  const loginGoogleBtn = viewLogIn.querySelector("#login-google");
  loginGoogleBtn.addEventListener("click", (e) => {
    loginGoogle();
  });
  return viewLogIn;
};
// FUNCION QUE CONTROLA LOS ERRORES
const loginErrorHandler = (error) => {
  const errorCode = error.code;
  console.log(errorCode);
  const errorFeedback = document.getElementById("error-feedback");

  if (errorCode === "auth/invalid-email") {
    errorFeedback.innerHTML = "Ingresa un mail válido.";
  } else if (errorCode === "auth/user-not-found") {
    errorFeedback.innerHTML = "Usuario no registrado.";
  } else if (errorCode === "auth/internal-error") {
    errorFeedback.innerHTML = "Ingresa una constraseña.";
  } else if (errorCode === "auth/wrong-password") {
    errorFeedback.innerHTML = "Correo o contraseña inválida";
  } else if (errorCode === "auth/too-many-requests") {
    errorFeedback.innerHTML = "too many requests";
  }
};
