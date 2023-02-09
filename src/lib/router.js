import { login } from '../view/login/login.js';
import { signup } from '../view/signup/signup.js';
import { dashboard } from '../view/dashboard.js';

export const router = (hash) => {
  const containerRoot = document.getElementById('root');
  containerRoot.innerHTML = '';
  switch (hash) {
    case '#/':
    case '#/login':
      containerRoot.appendChild(login());
      break;

    case '#/signup':
      containerRoot.appendChild(signup());
      break;

    case '#/dashboard':
      containerRoot.appendChild(dashboard());
      break;

    default:
      containerRoot.innerHTML = 'Página no encontrada';
  }
};
