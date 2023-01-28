// Este es el punto de entrada de tu aplicacion

// import { myFunction } from './lib/index.js';

// myFunction();

import { router } from './lib/router.js';

const init = () => {
    window.location.hash = '#/login';
    router(window.location.hash);
    // observador();
  };
  init();

  window.addEventListener('hashchange', () => {
    router(window.location.hash);
  });
  
// const init = () => {
//     window.addEventListener('hashchange', () => console.log(window.location.hash))
// }

// window.addEventListener ('load', init)