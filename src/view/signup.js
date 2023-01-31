import { loginGoogle } from "../firebase/firebase.js";

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
        <form id="signup-form">
          <div class="container-item">
            <label for="signup-username">Nombre de usuario</label>
            <input
              type="text"
              id="signup-username"
              placeholder="ej: @juan-perez"
            />
          </div>
          <div class="container-item">
            <label for="signup-email">Correo</>
            <input
              type="email"
              id="signup-email"
              placeholder="ejemplo@email.com"
            />
          </div>
          <div class="container-item">
            <label for="signup-password">Contraseña</label>
            <input
              type="password"
              id="signup-password"
              placeholder="**************"
            />
          </div>
          <div class="container-item">
            <label for="signup-confirm-password">Confirmar contraseña</label>
            <input
              type="password"
              id="signup-confirm-password"
              placeholder="**************"
            />
          </div>
          <div class="signup-btn">
            <button type="submit" id="signup-button" class="signup-btn">
              Iniciar sesión
            </button>
          </div>
          <div class="signin-google">
            <p>o</p>
            <button type="button" id="login-google" class="login-google-btn">
              <img src="./assets/btn_google_signin.png" alt="logo-google" />
            </button>
          </div>
          <div class="login-span">
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

  return viewSingUp;
};
