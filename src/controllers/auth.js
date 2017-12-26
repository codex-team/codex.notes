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
     * {@link https://www.npmjs.com/package/electron-oauth2}
     */
    this.Oauth = electronOAuth(googleOAuthConfig, windowParams);

    ipcMain.on('auth - google auth', (event) => {
      this.googleAuth(event);
    });
  }

  /**
   * Send auth request to Google api and get user`s profile information
   *
   * @param {Event} event — see {@link https://electronjs.org/docs/api/ipc-main#event-object}
   *
   */
  async googleAuth(event) {
    try {
      /**
       * Google access token information {@link https://developers.google.com/identity/protocols/OAuth2InstalledApp}
       */
      const options = {
        scope: 'profile',
        accessType: 'offline'
      };

      let oauthParams = {};
      if (!global.user.oauth || !global.user.oauth.access_token) {
        let token = await this.Oauth.getAccessToken(options);
        oauthParams = await this.saveOauthParams(token);
      }
      else {
        oauthParams = await this.saveOauthParams(global.user.oauth);
      }

      event.returnValue = await this.getProfileInfo(oauthParams);
    } catch (e) {
      console.log('Can`t sign in to Google account because of', e);
      event.returnValue = false;
    }
  }

  /**
   * Get user's name and photo from Google
   * @returns {Promise.<{name, photo: *, id}>}
   */
  async getProfileInfo(token) {
    let profileInfo = await request({
      url: 'https://www.googleapis.com/userinfo/v2/me',
      headers: {
        'Authorization': token['token_type'] + ' ' + token['access_token']
      },
      json: true
    });
    return {
      name: profileInfo.name,
      photo: profileInfo.picture,
      id: profileInfo.id
    };
  }

  /**
   * Convert JSON response from Google Oauth to the DB format
   * @param token – JSON Response with Google Oauth results
   * @returns {json} Oauth params in the new format
   */
  async saveOauthParams(token) {
    let oauthParams = {
      'provider': 'google',
      'token_type': token['token_type'],
      'access_token': token['access_token'],
      'refresh_token': token['refresh_token'] || global.user.oauth['refresh_token']
    };
    global.user.oauth = oauthParams;
    await global.user.save();
    return oauthParams;
  }

  /**
   * Check if user has tokens in DB and try to authenticate him.
   * @returns {Promise.<void>}
   */
  async reAuth() {
    try {
      // @TODO: Check if access token is still valid (append expiration date)
      if (global.user.oauth && global.user.oauth.refresh_token) {
        let newToken = await this.Oauth.refreshToken(global.user.oauth.refresh_token);
        if (newToken) {
          console.log('[*] AUTH refresh token – success');
          let oauthParams = await this.saveOauthParams(newToken);
          let profileInfo =  await this.getProfileInfo(oauthParams);

          return profileInfo;
        }
        else {
          global.user.oauth = {};
          return false;
        }
      }
    } catch (e) {
      console.log('Can`t refresh token and authenticate on Google because of', e);
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