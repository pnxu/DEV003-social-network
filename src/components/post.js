import { getPosts } from '../firebase/firebase.js';

export const newPost = async () => {
  const postsContainer = document.getElementById('posts-container');
  const posts = await getPosts('posts');
  let html = '';
  posts.forEach((post) => {
    html += `
  <article>
    <div class="user-info">
      <img src=${post.photo}>
      <p>${post.name}</p>
    </div>
    <div class="user-post">
      <h3>${post.title}</h3>
      <p>${post.description}</p>
    </div>
  </article>
    `;
  });

  postsContainer.innerHTML = html;
};
