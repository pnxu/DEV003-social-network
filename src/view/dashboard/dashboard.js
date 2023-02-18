// import { footer } from "../../components/footer.js";

import { addPost, logout } from '../../firebase/firebase.js';

import { newPost } from '../../components/post.js';
// import { newPost } from "../../components/post.js";

export const dashboard = () => {
  const viewDashboard = document.createElement('div');
  viewDashboard.classList.add('post-container');
  viewDashboard.innerHTML = `
    <div class= "post-div">
      <div class="logo-container">
        <img src="assets/logo.webp"/>
        <h1>PURRFECT BOOKS</h1>
      </div>
      <div class="test">
      <h4>Nombre</h4>
      </div>
      <form class="post-form" id="post-form">
        <div class="post-fields">
          <label for="post-title"></label>
          <input type="text" id= "post-title" placeholder="Titulo del libro">
        </div>
        <div>
          <label for="description"></label>
          <textarea id="post-description" placeholder="Reseña"></textarea>
        </div>  
        <div>
          <button class="button-post-save" id="button-post-save">Publicar</button>
        </div>
      </form>
      <button type="button" id="logout-btn">logout</button>
      <div id="posts-container"></div>
    </div>
  `;

  // ADDING POST
  const dashboardPost = viewDashboard.querySelector('#button-post-save');
  dashboardPost.addEventListener('click', (e) => {
    e.preventDefault();
    const title = viewDashboard.querySelector('#post-title').value;
    const description = viewDashboard.querySelector('#post-description').value;
    if (title === '' || description === '') {
      alert('Debes completar todos los campos');
    } else {
      addPost(title, description).then(() => {
        viewDashboard.querySelector('#post-form').reset();
      });
      newPost();
    }
  });

  // LOGOUT BUTTON
  viewDashboard.querySelector('#logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // viewDashboard.appendChild(footer());
  return viewDashboard;
};
