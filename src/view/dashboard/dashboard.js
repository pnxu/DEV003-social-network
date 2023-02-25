// import { footer } from "../../components/footer.js";

import {
  addPost, onGetPost, postEdit, deletePost, likes, logout,
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
      <button type="button" class="edit-button" data-id='${doc.id}', '${post.title}', '${post.description}'></button>
    <div>
      <button type="button" class="likeButton"></button>
    </div>
  </article>
    `;
    });
    postsContainer.innerHTML = html;

    // funcion editar

    const editar = postsContainer.querySelectorAll('.editButton');
    // const editPost = setDoc(doc(db, 'posts', id), {
    // });
    editar.forEach((element) => {
      element.addEventListener('click', (id, titulo, descripcion) => {
        viewDashboard.querySelector('#post-title').value = titulo;
        viewDashboard.querySelector('#post-description').value = descripcion;
        // const buttonPublicar = viewDashboard.querySelector('.editButton');
        editar.addEventListener('click', () => {
          const tituloPost = viewDashboard.querySelector('#post-title').value;
          const descripcionPost = viewDashboard.querySelector('#post-description').value;
          return postEdit.update({
            title: tituloPost,
            description: descripcionPost,
          })
            .then(() => {
              console.log('documento editado con exito');
            })
            .catch((error) => {
              console.error('error al editar', error);
            });
        });
      });
    });
    // funcion editar
    // const editar = postsContainer.querySelector('.edit-button');
    // // const editPost = setDoc(doc(db, 'posts', id), {
    // // });
    // editar.addEventListener('click', (id, titulo, descripcion) => {
    //   postsContainer.querySelector('#post-title').value = titulo;
    //   postsContainer.querySelector('#post-description').value = descripcion;
    //   editar.addEventListener('click', () => {
    //     const tituloPost = viewDashboard.querySelector('#post-title').value;
    //     const descripcionPost = viewDashboard.querySelector('#post-description').value;
    //     return postEdit.update({
    //       title: tituloPost,
    //       description: descripcionPost,
    //     })
    //       .then(() => {
    //         console.log('documento editado con exito');
    //       })
    //       .catch((error) => {
    //         console.error('error al editar', error);
    //       });
    //   });
    // });

    // funcion borrar post
    const btnDelete = postsContainer.querySelectorAll('.eliminar');
    btnDelete.forEach((button) => {
      button.addEventListener('click', ({ target: { dataset } }) => {
        deletePost(dataset.id);
      });
    });

    // funcion dar like
    const likeButton = postsContainer.querySelectorAll('.likeButton');
    likeButton.forEach((like) => {
      like.addEventListener('click', () => {
        const postIdLike = like.value;
        const userId = auth.currentUser.uid;
        likes(postIdLike, userId)
          .then(() => {
            console.log(likes(postIdLike, userId));
          });
        console.log(likes(postIdLike, userId));
      });
    });
  });

  // ADDING POST
  const dashboardPost = viewDashboard.querySelector('#button-post-save');
  dashboardPost.addEventListener('click', (e) => {
    e.preventDefault();
    const title = viewDashboard.querySelector('#post-title').value;
    const description = viewDashboard.querySelector('#post-description').value;
    if (title === '' || description === '') {
      alert('Debes completar todos los campos');
    } else {
      addPost(title, description);
      viewDashboard.querySelector('#post-form').reset();
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
