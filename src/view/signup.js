import { loginGoogle, newRegister } from "../firebase/firebase.js";

export const signup = () => {
  const viewSingUp = document.createElement("div");
  viewSingUp.classList.add("signup-container");
  viewSingUp.innerHTML = `
  <main>
  <div class="container">
        <div class="logo-container">
          <img src="./assets/logo.webp" alt="logo" />
          <h1>Purrfect Books</h1>
        </div>
  <h2>Regístrate</h2>
        <form id="signup-form">
          <div class="container-item">
            <label for="signup-username">Nombre de usuario</label>
            <input
              type="text"
              id="signup-username"
              class="signup-input"
              placeholder="ej: @juan-perez"
            />
          </div>
          <div class="container-item">
            <label for="signup-email">Correo</label>
            <input
              type="email"
              id="signup-email"
              class="signup-input"
              placeholder="ejemplo@email.com"
            />
          </div>
          <div class="container-item">
            <label for="signup-password">Contraseña</label>
            <input
              type="password"
              id="signup-password"
              class="signup-input"
              placeholder="**************"
            />
          </div>
          <div class="container-item">
            <label for="signup-confirm-password">Confirmar contraseña</label>
            <input
              type="password"
              id="signup-confirm-password"
              class="signup-input"
              placeholder="**************"
            />
          </div>
          <div class="signup-container-btn">
            <button type="submit" id="signup-button" class="signup-btn">
              Regístrar
            </button>
          </div>
          <div class="login-google">
            <p>o</p>
            <button type="button" id="login-google" class="login-google-btn">
              <img src="./assets/btn_google_signin.png" alt="logo-google" />
            </button>
          </div>
          <div class="signup-span">
          <span>¿Ya tienes cuenta?<a href="#/login" class="span-btn"> Ingresa aquí.</a></span>
          </div>
        </form>
        </div>
      </main>
`;
  viewSingUp.querySelector("#login-google").addEventListener("click", (e) => {
    loginGoogle();
    // console.log("hola");
  });

  viewSingUp.querySelector(".signup-btn").addEventListener("click", (e) => {
    e.preventDefault();
    const email = document.querySelector("#signup-email").value;
    const password = document.querySelector("#signup-password").value;
    console.log("click");
    newRegister(email, password)
      .then((userCredential) => {
        console.log("signup");
        // Signed in
        const user = userCredential.user;
        console.log(user);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
        // ..
      });
  });
  return viewSingUp;
};
