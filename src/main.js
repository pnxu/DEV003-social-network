import { router } from './lib/router.js';
import { observer } from './firebase/firebase.js';

window.addEventListener('load', () => {
  observer();
  router(window.location.hash);
});

window.addEventListener('hashchange', () => {
  observer();
  router(window.location.hash);
});
