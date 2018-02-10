/**
 * DOM helper
 */
import $ from './dom';

import Dialog from './dialog';
import AuthObserver from './auth-observer';

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
    this.authButton = $.get('js-auth-button');

    let userData = window.ipcRenderer.sendSync('user - get');

    this.authObserver = new AuthObserver({
      user: userData,
      onLogin: (user) => {
        this.fillUserPanel(user);
        codex.notes.aside.folderSettings.toggleCollaboratorInput();
      }
    });

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
      this.authObserver.login(authResponse);
      window.ipcRenderer.send('user - sync');
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
    if (!user.name) return;

    let userPanel = $.get('user-panel'),
        photo = $.get('user-photo');

    userPanel.classList.add('aside__header-avatar--filled');
    photo.style.backgroundImage = `url(${user.photo})`;
  }
}