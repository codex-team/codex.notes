'use strict';
const {ipcMain} = require('electron');
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
   * Send auth request to Google api and get user`s profile information
   *
   * @param {Event} event — see {@link https://electronjs.org/docs/api/ipc-main#event-object}
   *
   */
  async googleAuth(event) {
    /**
     * Google OAuth credentials
     */
    const googleOAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://www.googleapis.com/oauth2/v4/token',
      redirectUri: 'http://localhost'
    };

    /**
     * OAuth window params
     */
    const windowParams = {
      alwaysOnTop: true,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false
      }
    };

    /**
     * Google access token information {@link https://developers.google.com/identity/protocols/OAuth2InstalledApp}
     */
    const options = {
      scope: 'profile',
      accessType: 'offline'
    };

    /**
     * {@link https://www.npmjs.com/package/electron-oauth2}
     */
    const Oauth = electronOAuth(googleOAuthConfig, windowParams);

    try {
      let token = await Oauth.getAccessToken(options);

      let profileInfo = await request({
        url: 'https://www.googleapis.com/userinfo/v2/me',
        headers: {
          'Authorization': token['token_type'] + ' ' + token['access_token']
        },
        json: true
      });

      event.returnValue = {
        name: profileInfo.name,
        photo: profileInfo.picture,
        id: profileInfo.id
      };
    } catch (e) {
      console.log('Can`t sign in to Google account because of', e);
      event.returnValue = false;
    }
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