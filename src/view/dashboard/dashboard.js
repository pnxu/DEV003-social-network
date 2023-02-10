import { logout } from '../../firebase/firebase.js';

export const dashboard = () => {
  const viewDashboard = document.createElement('div');
  viewDashboard.classList.add('post-container');
  viewDashboard.innerHTML = `
<div class= "post-div">
  <div class="logo-container">
    <img src="assets/logo.webp"/>
    <h1>PURRFECT BOOKS</h1>
  </div>
  <form class="post-form" id="post-form" >
  <h4>Nombre</h4>
  <div class="post-fields">
    <label for="title"></label>
  </div>
  <input type="text" id= "post-title" placeholder="TÃ­tulo del libro">
  <div >
    <label for="description"></label>
  </div>  
  <div>
    <textarea id="post-description" placeholder="ReseÃ±a"></textarea>
  </div>
  <div >
    <button class="button-post-save" id="button-post-save">Publicar</button>
  </div>
  <button type="button" id="logout-btn">logout</button>
</div>

  <div id="post-container"></div>
</form>`;

  viewDashboard.querySelector('#logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  return viewDashboard;
};
