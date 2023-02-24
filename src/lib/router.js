import { login } from '../view/login/login.js';
import { signup } from '../view/signup/signup.js';
import { dashboard } from '../view/dashboard/dashboard.js';

export const router = (hash) => {
  const containerRoot = document.getElementById('root');
  containerRoot.innerHTML = '';
  const sessionUser = localStorage.getItem('sessionUser');
  const sessionToken = localStorage.getItem('sessionToken');
  if (sessionUser && sessionToken) {
    switch (hash) {
      case '#/':
      case '#/login':
        window.location.hash = '#/dashboard';
        break;

      case '#/signup':
        window.location.hash = '#/dashboard';
        break;

      case '#/dashboard':
        containerRoot.appendChild(dashboard());
        break;

      default:
        containerRoot.innerHTML = 'Página no encontrada';
    }
  } else {
    switch (hash) {
      case '#/':
      case '#/login':
        containerRoot.appendChild(login());
        break;

      case '#/signup':
        containerRoot.appendChild(signup());
        break;

      case '#/dashboard':
        alert("No estas autenticado, por favor inicia sesion");
        window.location.hash = '#/login';
        break;

      default:
        containerRoot.innerHTML = 'Página no encontrada';
    }
  }
};
