'use strict';
const {ipcMain, BrowserWindow} = require('electron');
const electronOAuth = require('electron-oauth2');
const request = require('request-promise');
const url = require('url');
const API = require('../models/api');

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
    ipcMain.on('auth - google auth', this.googleAuth);
  }

  /**
   * Send auth request to Google api and get user`s profile information from server
   *
   * @param {Event} event — see {@link https://electronjs.org/docs/api/ipc-main#event-object}
   *
   */
  async googleAuth(event) {
    let window = new BrowserWindow({
      alwaysOnTop: true,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false
      }
    });

    let webContents = window.webContents;

    webContents.on('did-finish-load', function (loadEvent) {
      if (loadEvent.sender.currentIndex < 1) return;

      webContents.executeJavaScript('document.getElementById("jwt").textContent')
        .then(function (jwt) {
          try {
            let payload = new Buffer(jwt.split('.')[1], 'base64');

            payload = JSON.parse(payload);

            event.returnValue = {
              name: payload.name,
              photo: payload.photo,
              id: payload.id,
              token: jwt
            };
          } catch(e) {
            event.returnValue = false;
          }

          window.close();
        });
    });

    window.loadURL('https://accounts.google.com/o/oauth2/v2/auth?' +
      'scope=email profile' +
      '&response_type=code' +
      '&state=' + process.env.GOOGLE_REDIRECT_URI +
      '&redirect_uri=' + process.env.GOOGLE_REDIRECT_URI +
      '&client_id=' + process.env.GOOGLE_CLIENT_ID);
  }

  /**
   *
   * Send `verify collaborator` request to API
   *
   * @param event
   * @param inviteUrl
   */
  async verifyCollaborator(event, inviteUrl) {
    let urlParts = url.parse(inviteUrl);

    switch (urlParts.hostname) {
      case 'join':
        let email, token;

        [email, token] = urlParts.path.slice(1).split('/');

        let api = new API();

        await api.sendRequest('folder/verifyCollaborator', {
          email: email,
          token: token,
          user: global.user.id
        });

        /** @todo fill user's shared folders */

        break;
    }
  }

}


module.exports = AuthController;