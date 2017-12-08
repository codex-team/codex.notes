'use strict';
const {ipcMain} = require('electron');
const electronOAuth = require('electron-oauth2');
const request = require('request-promise');

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
    ipcMain.on('auth - google auth', () => {
      this.googleAuth();
    });
  }

  /**
   * Send auth request to Google api and get user`s profile information
   *
   * @returns {Object} profileInfo
   *          {String} profileInfo.name — user name
   *          {String} profileInfo.avatar — user avatar
   */
  async googleAuth() {
    // const profileApiUrl =

    const googleOAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://www.googleapis.com/oauth2/v4/token',
      redirectUri: 'http://localhost'
    };

    const windowParams = {
      alwaysOnTop: true,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false
      }
    };

    const options = {
      scope: 'profile',
      accessType: 'offline'
    };

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

      return {
        name: profileInfo.name,
        avatar: profileInfo.picture
      };
    } catch (e) {
      console.log('Can`t sign in to Google account because of', e);
    }
  }

}


module.exports = AuthController;