// import {
//   deletePost, onGetPost, likes, postEdit,
// } from '../firebase/firebase.js';
// import { dashboard } from '../view/dashboard/dashboard.js';
// import { auth } from '../firebase/firebase-config.js';

// export const newPost = () => {
//   onGetPost((querySnapshot) => {
//     let html = '';
//     const postsContainer = document.getElementById('posts-container');
//     querySnapshot.forEach((doc) => {
//       const post = doc.data();
//       html += `
//   <article>
//     <div class="user-info">
//       <img src=${post.photo}>
//       <p>${post.name}</p>
//     </div>
//     <di class="user-post">
//       <h3>${post.title}</h3>
//       <p>${post.description}</p>

//       <button type="button" data-id='${doc.id}' class='eliminar'></button>
//       <button type="button" class="editButton" data-id='${doc.id}', '${post.title}', '${post.description}'></button>
//     <div>
//       <button type="button" class="likeButton"></button>
//     </div>
//   </article>
//     `;
//     });

//     postsContainer.innerHTML = html;
//     const btnDelete = postsContainer.querySelectorAll('.eliminar');
//     const titulo = viewDashboard.querySelector('#post-title');

//     btnDelete.forEach((button) => {
//       button.addEventListener('click', ({ target: { dataset } }) => {
//         deletePost(dataset.id);
//       });
//     });
//     const likeButton = postsContainer.querySelectorAll('.likeButton');
//     likeButton.forEach((like) => {
//       like.addEventListener('click', () => {
//         const postIdLike = like.value;
//         const userId = auth.currentUser.uid;
//         likes(postIdLike, userId);
//       });
//     });
//   });
// };
