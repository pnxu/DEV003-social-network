import {
  deletePost, onGetPost, likes,
} from '../firebase/firebase.js';
import { auth } from '../firebase/firebase-config.js';

export const newPost = () => {
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
      <button class="eliminar" data-id="${doc.id}"><img src="../assets/eliminar.png"/></button>
      <button class="likeButton"><img src="./assets/MeGusta_inicial.png"></button>
    </div>
  </article>
    `;
    });

    postsContainer.innerHTML = html;
    const btnDelete = postsContainer.querySelectorAll('.eliminar');

    btnDelete.forEach((button) => {
      button.addEventListener('click', ({ target: { dataset } }) => {
        deletePost(dataset.id);
      });
    });
    const likeButton = postsContainer.querySelectorAll('.likeButton');
    likeButton.forEach((like) => {
      like.addEventListener('click', () => {
        const postIdLike = like.value;
        const userId = auth.currentUser.uid;
        likes(postIdLike, userId);
      });
    });
  });
};
