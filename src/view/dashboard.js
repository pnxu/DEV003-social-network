import { logout } from '../firebase/firebase.js';

export const dashboard = () => {
  const viewDashboard = document.createElement('div');
  viewDashboard.classList.add('login-container');
  viewDashboard.innerHTML = `
    <button type="button" id="logout-btn">logout</button>
    `;
  viewDashboard.querySelector('#logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  return viewDashboard;
};
