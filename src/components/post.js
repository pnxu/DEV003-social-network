import { getPosts } from "../firebase/firebase.js";

export const newPost = async () => {
  const postsContainer = document.getElementById("posts-container");
  const posts = await getPosts("posts");
  let html = "";
  posts.forEach((post) => {
    html += `
    <div class="user-info">
    <img src=${post.photo}>
    <p>${post.name}</p>
    </div>
      <div class="user-post">
        <h3>${post.title}</h3>
        <p>${post.description}</p>
      </div>
    `;
  });

  postsContainer.innerHTML = html;
};

//     let html = "";
//     querySnapshot.forEach((doc) => {
//       const post = doc.data();
//       html += `
//       <div>
//         <h3>${post.title}</h3>
//         <p>${post.description}</p>
//       </div>
//       `;
//     });
//     postsContainer.innerHTML = html;
//   });
// };
//   postContainer.innerHTML = "";
//   const postContainerContent = (data) => {
//     let eachPost = `<div class="contenedorprueba">
//       <div class="img">
//         <img src="${data.element.data.photo}" alt="prueba">
//       </div>
//       <div>
//        <h3 class="username">${data.element.data.name}</h3>
//        </div>

//         `;
//     postContainer.innerHTML += eachPost;
//     return newPost;
//   };
//   posts.forEach(postContainerContent);
// };

// export const showPost = () => {
//   getPosts(addPost, "posts");
// };
