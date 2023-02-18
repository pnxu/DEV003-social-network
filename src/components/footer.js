export const footer = () => {
  const sectionFooter = document.createElement('div');
  sectionFooter.classList.add('footer-container');
  sectionFooter.innerHTML = `
  <p class="description-footer">Esta red social ha sido elaborada por:</p>
  <div class="nombres">
     <div>
        <p class="name-footer">Carmen</p>
        <a title="github carmen" href="https://github.com/CarmenArayaRodriguez"><img class="logo-github"src="assets/logoGithub.webp"/></a>
     </div>
     <div>
        <p class="name-footer">Francisca</p>
        <a title="github francisca" href="https://github.com/pnxu"><img class="logo-github" src="assets/logoGithub.webp"/></a>
     </div>
     <div>
        <p class="name-footer">Sara</p>
        <a title="github sara" href="https://github.com/sara040616"><img class="logo-github" src="assets/logoGithub.webp"/></a>
     </div>
  </div>
    `;
  return sectionFooter;
};
