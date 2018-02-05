'use strict';
const {ipcMain, BrowserWindow} = require('electron');
const request = require('request-promise');
const url = require('url');
const API = require('../models/api');
const UserModel = require('../models/user');


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
   * 1. Open popup window with google oauth page
   * 2. Google redirect to API server with oauth code
   * 3. Server gets token and profile info and render page with JWT
   * 4. Using WebContents Main Process gets JWT from popup
   *
   * @param {Event} event — see {@link https://electronjs.org/docs/api/ipc-main#event-object}
   *
   */
  async googleAuth(event) {

    let channel = 'CDXCHNL';

    let window = new BrowserWindow({
      alwaysOnTop: true,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false
      }
    });

    global.app.sockets.listenChannel(channel, async jwt => {
      console.log('jwt ->>', jwt);

      window.close();

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

      event.returnValue = global.user;

    });

    window.on('closed', () => {
      if (event.returnValue === undefined) {
        event.returnValue = false;
      }
    });

    window.loadURL('https://accounts.google.com/o/oauth2/v2/auth?' +
      'scope=email profile' +
      '&response_type=code' +
      '&state=' + channel +
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