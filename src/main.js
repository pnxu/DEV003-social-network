import { router } from './lib/router.js';
import { observer } from './firebase/firebase.js';

const init = () => {
  window.location.hash = '#/login';
  router(window.location.hash);
  observer();
};
init();

window.addEventListener('hashchange', () => {
  router(window.location.hash);
  observer();
});
