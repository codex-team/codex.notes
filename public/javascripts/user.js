/**
 * DOM helper
 */
import $ from './dom';

import Dialog from './dialog';

/**
 * @class       User
 * @classdesc   Authentication methods and user object
 *
 * @typedef {User} User
 * @property {Element} authButton - button 'Login with Google'
 */
export default class User {

  /**
   * @constructor
   */
  constructor() {
    this.authButton = document.getElementById('js-auth-button');

    this.authButton.addEventListener('click', () => {
      this.showAuth();
    });
  }

  /**
   * Opens auth popup
   */
  showAuth() {
    let authResponse = window.ipcRenderer.sendSync('auth - google auth');

    if (authResponse && authResponse.token) {
      this.fillUserPanel(authResponse);
    } else {
      Dialog.error('Authentication failed. Please, try again.');
    }
  }

  /**
   * Fills user panel
   * @param  {Object} user
   * @param  {String} user.id
   * @param  {String} user.name
   * @param  {String} user.photo
   */
  fillUserPanel(user) {
    let panel = $.make('div', 'profile-panel'),
        photo = $.make('div', 'profile-panel__photo'),
        name = $.make('div', 'profile-panel__name');

    photo.style.backgroundImage = `url(${user.photo})`;
    name.textContent = user.name;

    $.append(panel, [photo, name]);
    $.after(panel, this.authButton);

    this.authButton.style.display = 'none';
  }
}