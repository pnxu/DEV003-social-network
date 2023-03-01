import { footer } from '../../components/footer.js';

import {
  addPost, onGetPost, postEdit, deletePost, removeLike, addLike, logout,
} from '../../firebase/firebase.js';
import { auth } from '../../firebase/firebase-config';

export const dashboard = () => {
  const viewDashboard = document.createElement('div');
  viewDashboard.classList.add('post-container');
  viewDashboard.innerHTML = `
    <header>
      <div class="logo-container">
        <img src="assets/logo.webp"/>
        <h1>PURRFECT BOOKS</h1>
        <button type="button" id="logout-btn"></button>
      </div>
      </header>
<main>
  <section class="create-post">
    <article>
      <div>
          <h3>Escribe una reseña</h3>
        <form class="post-form" id="post-form">
            <input type="hidden" id="post-id" value="">
            <div>
            <input type="text" id="post-title" placeholder="Titulo del libro">
            </div>
            <div>
            <textarea id="post-description" placeholder="Reseña"></textarea> 
            </div>
          <div class="btn-save-container">
            <button class="button-post-save" id="button-post-save">Publicar</button>
          </div>
        </form>
      </div>
    </article>
  </section>
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
      console.log(post.userId);
      html += `
      <article>
        <div class="user-info">
          <img src=${post.photo}>
          <p>${post.name}</p>
        </div>
        `;
      if (post.userId === auth.currentUser.uid) {
        html += `
        <div class="admin-btns">
          <button type="button" class='eliminar' data-id='${doc.id}'></button>
          <button type="button" class="edit-button" data-id='${JSON.stringify({ post, id: doc.id })}'></button>
          </div>
        <div class="user-post">
          <p>${post.title}</p>
          <span>${post.description}</span>
          </div>
          <div class="likes-container">
          <button type="button" class="like-button" data-id= '${JSON.stringify({ post, id: doc.id })}'></button>
          <p>A ${post.likesCounter} personas les ha gustado esto.</p>
          </div>
      </article>
    `;
      } else {
        html += `<div class="user-post">
          <p>${post.title}</p>
          <span>${post.description}</span>
          </div>
          <div class="likes-container">
          <button type="button" class="like-button" data-id= '${JSON.stringify({ post, id: doc.id })}'></button>
          <p>A ${post.likesCounter} personas les ha gustado esto.</p>
          </div>
      </article>
    `;
      }
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

  viewDashboard.appendChild(footer());
  return viewDashboard;
};
