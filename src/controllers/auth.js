'use strict';
const {ipcMain, BrowserWindow, dialog, app} = require('electron');
const request = require('request-promise');
const url = require('url');
const API = require('../models/api');
const User = require('../models/user');
const isOnline = require('is-online');
const db = require('../utils/database');

/**
 * @class AuthController
 * @classdesc Work with user`s authentication
 */
class AuthController {

  /**
   * @constructor
   *
   * Bind events
   */
  constructor() {
    ipcMain.on('auth - google auth', event => {
      this.auth(event);
    });
  }

  /**
   * @param {Event} event — see {@link https://electronjs.org/docs/api/ipc-main#event-object}
   */
  async auth(event) {
    try {
      event.returnValue = await this.googleAuth();
    } catch (e) {
      console.log('Auth failed ', e);
      event.returnValue = false;
    }
  }

  /**
   * Send auth request to Google api and get user`s profile information from server
   *
   * 1. Open popup window with google oauth page
   * 2. Google redirect to API server with oauth code
   * 3. Server gets token and profile info and render page with JWT
   * 4. Using WebContents Main Process gets JWT from popup
   *
   */
  async googleAuth() {
    return new Promise((resolve, reject) => {
      let window = new BrowserWindow({
        alwaysOnTop: true,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false
        }
      });

      /**
       * See {@link https://github.com/electron/electron/blob/master/docs/api/web-contents.md}
       * @type {Electron.WebContents}
       */
      let webContents = window.webContents,
          success = false;

      /**
       * Fires when popup page is refreshed
       * @param {Event} loadEvent – onload event
       */
      webContents.on('did-finish-load', async (loadEvent) => {
        let sender = loadEvent.sender,
            currentPage = sender.history[sender.currentIndex],
            parsedUrl = url.parse(currentPage),
            path = parsedUrl.protocol + '//' + parsedUrl.host + parsedUrl.pathname;

        /**
         * If current page uri equal to GOOGLE_REDIRECT_URI, tha means we on page with JWT.
         * Else we should just do nothing.
         */
        if (process.env.GOOGLE_REDIRECT_URI !== path) return;

        try {
          /**
           * Just get content from div with "jwt" id, contains user`s JWT
           */
          let jwt = await webContents.executeJavaScript('document.body.textContent');

          /** Decode JWT payload */
          let payload = new Buffer(jwt.split('.')[1], 'base64');

          /** Try to parse payload as JSON. If this step fails, it means that auth failed at all */
          payload = JSON.parse(payload);

          await global.user.update({
            id: payload.user_id,
            name: payload.name,
            photo: payload.photo,
            google_id: payload.google_id,
            email: payload.email,
            token: jwt
          });

          /**
           * Refresh API client with the new token at the authorisation header;
           */
          global.app.syncObserver.refreshClient();

          success = true;
          window.close();
        } catch (e) {
          console.log('Google OAuth failed because of ', e);
          success = false;
          window.close();
        }
      });

      window.on('closed', () => {
        if (success) {
          resolve(global.user);
        } else {
          reject();
        }
      });

      window.loadURL('https://accounts.google.com/o/oauth2/v2/auth?' +
        'scope=email profile' +
        '&response_type=code' +
        '&state=' + process.env.GOOGLE_REDIRECT_URI +
        '&redirect_uri=' + process.env.GOOGLE_REDIRECT_URI +
        '&client_id=' + process.env.GOOGLE_CLIENT_ID);
    });
  }

  /**
   * Send CollaboratorJoin mutation to API
   *
   * @param {string} ownerId - id of Folder's owner
   * @param {string} folderId - Folder's id
   * @param {string} token - Collaborator's invitation token
   */
  async verifyCollaborator(ownerId, folderId, token) {
    if (!global.user.token) {
      try {
        await this.googleAuth();
      } catch(e) {
        dialog.showMessageBox({
          type: 'error',
          title: 'Please, login',
          message: 'You should login with your google account to get access to shared folders'
        });
        return;
      }
    }

    await global.app.syncObserver.sendVerifyCollaborator(ownerId, folderId, token);

    global.app.syncObserver.sync();
  }

  /**
   * Log out
   * Show dialog for confirm log out
   * In case of confirmation we drop User instance and sync with cloud
   * @return {Promise.<void>}
   */
  async logOut() {
    try {
      let connection = await isOnline(),
          hasUpdates = true;

      let updates = await global.app.syncObserver.getLocalUpdates();

      if (updates.folders.length === 0 && updates.notes.length === 0) {
        hasUpdates = false;
      }

      // if there is no internet connection and user has updates show dialog
      if (!connection && hasUpdates) {
        dialog.showMessageBox({
          type: 'info',
          buttons : ['Cancel', 'Continue'],
          title : 'Confirm',
          message : 'You have notes that was not synchronized yet. They will be lost after logout, because you have not connected to the Internet. Are you sure you want to continue?'
        }, (confirmed) => {
          if (confirmed) {
            return this.dropSession();
          }
        });
      } else {
        return this.dropSession();
      }
    } catch (e) {
      console.log('Error occured while logging out due to the: ', e);
    }
  }

  /**
   * Before we drop user data, we need to sync updates with cloud.
   *
   * When folders were dropped we need to create new Root folder and user temporary user
   * @return {Promise.<void>}
   */
  async dropSession() {
    await global.app.syncObserver.sync();

    // force database drop
    await db.drop(true);

    global.user = new User();

    // make initialization again
    await db.makeInitialSettings(app.getPath('userData'));

    // reload page
    global.app.mainWindow.reload();
  }

}


module.exports = AuthController;