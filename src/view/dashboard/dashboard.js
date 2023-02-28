// import { footer } from "../../components/footer.js";

import {
  addPost, onGetPost, postEdit, deletePost, logout, addLike, removeLike,
} from '../../firebase/firebase.js';
import { auth } from '../../firebase/firebase-config';
// import { newPost } from '../../components/post.js';

export const dashboard = () => {
  const viewDashboard = document.createElement('div');
  viewDashboard.classList.add('post-container');
  viewDashboard.innerHTML = `
    <header>
      <div class="logo-container">
        <img src="assets/logo.webp"/>
        <h1>PURRFECT BOOKS</h1>
      </div>
      </header>
<main>
  <section>
    <article class="dashboard-post">
      <div class= "post-div">
        <div class="test">
          <h4>Nombre</h4>
        </div>
        <form class="post-form" id="post-form">
        <div class="post-fields">
            <input type="hidden" id="post-id" value="">
            <label for="post-title"></label>
            <input type="text" id="post-title" placeholder="Titulo del libro">
          </div>
          <div>
            <label for="description"></label>
            <textarea id="post-description" placeholder="Reseña"></textarea>
          </div>  
          <div>
            <button class="button-post-save" id="button-post-save">Publicar</button>
          </div>
        </form>
      </div>
    </article>
  </section>
      <button type="button" id="logout-btn">logout</button>
      <section>
        <div id="posts-container">
      </section>
</div>
</main>
  `;
  // Se refresca sola la pagina y se crean los post
  onGetPost((querySnapshot) => {
    let html = '';
    const postsContainer = document.getElementById('posts-container');
    querySnapshot.forEach((doc) => {
      const post = doc.data();
      html += `
      <article>
        <div class="user-info">
          <img src=${post.photo}>
          <p>${post.name}</p>
        </div>
        <div class="user-post">
          <h3>${post.title}</h3>
          <p>${post.description}</p>
          <button type="button" class='eliminar' data-id='${doc.id}'></button>
          <button type="button" class="edit-button" data-id='${JSON.stringify({ post, id: doc.id })}'></button>
        <div>
          <button type="button" class="like-button" data-id= '${JSON.stringify({ post, id: doc.id })}'></button>
          <p>${post.likesCounter}<p>
          <p>${post.likes}<p>
        </div>
      </article>
    `;
    });
    postsContainer.innerHTML = html;

    // funcion editar
    const btnEditPost = postsContainer.querySelectorAll('.edit-button');
    btnEditPost.forEach((button) => {
      button.addEventListener('click', ({ target: { dataset } }) => {
        const { post, id } = JSON.parse(dataset.id);
        const inputTitle = viewDashboard.querySelector('#post-title');
        const inputDescription = viewDashboard.querySelector('#post-description');
        const inputId = viewDashboard.querySelector('#post-id');
        inputTitle.value = post.title;
        inputDescription.value = post.description;

        inputId.value = id;
      });
    });

    // funcion borrar post
    const btnDelete = postsContainer.querySelectorAll('.eliminar');
    btnDelete.forEach((button) => {
      button.addEventListener('click', ({ target: { dataset } }) => {
        deletePost(dataset.id);
      });
    });

    // funcion dar like
    const likeButton = postsContainer.querySelectorAll('.like-button');
    likeButton.forEach((like) => {
      like.addEventListener('click', ({ target: { dataset } }) => {
        const { post, id } = JSON.parse(dataset.id);
        const userId = auth.currentUser.uid;
        const postId = id;
        // const likes = post.likes;
        // const likesCount = post.likes.length;
        console.log(userId, postId);
        if (post.likes.includes(userId)) {
          removeLike(userId, postId);
        } else {
          addLike(userId, postId);
        }
      });
    });
  });

  // ADDING POST
  const dashboardPost = viewDashboard.querySelector('#button-post-save');
  dashboardPost.addEventListener('click', (e) => {
    e.preventDefault();
    const title = viewDashboard.querySelector('#post-title').value;
    const description = viewDashboard.querySelector('#post-description').value;
    const id = viewDashboard.querySelector('#post-id').value;
    console.log(id);
    if (title === '' || description === '') {
      alert('Debes completar todos los campos');
    }
    if (!id) addPost(title, description);
    else postEdit(id, title, description);
    return viewDashboard.querySelector('#post-form').reset();
  });

  // LOGOUT BUTTON
  viewDashboard.querySelector('#logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // viewDashboard.appendChild(footer());
  return viewDashboard;
};
