'use strict';
const random = require('../utils/random');
const db = require('../utils/database');

/**
 * Model for current user representation.
 * @typedef {object} AuthDict
 * @property {string} provider – oauth provider (ex. google)
 * @property {string} token_type – type of the oauth token (ex. Bearer)
 * @property {string} access_token – oauth access token
 * @property {string} refresh_token – oauth refresh token
 */
class User {

  /**
   * User model
   *  @param {string} id - unique user ID
   *  @param {string} name – user name
   *  @param {string} avatar – avatar string URL,
   *  @param {string} dt_sync – last synchronization timestamp
   *  @param {AuthDict} oauth – Authentication dictionary
   */
  constructor() {
    this.id = null;
    this.name = null;
    this.avatar = null;
    this.dt_sync = 0;
    this.oauth = {
      'provider': 'google',
      'token_type': 'Bearer',
      'access_token': null,
      'refresh_token': null
    };
  }

  /**
   * Initialize current model if user exists, otherwise create a new identity.
   */
  async init() {
    try {
      let user = await this.get();

      if (user) {
        this.id = user._id;
        this.name = user.user.name;
        this.avatar = user.user.avatar;
        this.dt_sync = user.user.dt_sync;
        this.oauth = user.oauth;
      } else {
        this.name = null;
        this.avatar = null;
        this.dt_sync = 0;
        let savedUser = await db.insert(db.USER, this.data);
        this.id = savedUser._id;
      }
      console.log("[user]", this.id);
    } catch (err) {
      console.log('User register error: ', err);
    }
  }

  /**
   * Convert model to JSON for the further saving to the DB
   * @returns {{user: {name: (null|*), avatar: (null|*), dt_sync: (number|*)}, oauth: *}}
   */
  get data() {
    return {
      'user': {
        'name': this.name,
        'avatar': this.avatar,
        'dt_sync': this.dt_sync,
      },
      'oauth': this.oauth
    };
  }

  /**
   * Save current User model to the DB
   * @returns {Promise.<*>}
   */
  async save() {
    return await db.update(db.USER, {'user': {$exists: true}}, this.data);
  }

  /**
   * Get current user.
   * @returns {*}
   */
  async get() {
    return await db.findOne(db.USER, {'user': {$exists: true}});
  }

}

module.exports = User;
