'use strict';
const random = require('../utils/random');
const db = require('../utils/database');

/**
 * Model for current user representation.
 */
class User {

  /**
   * User model {
   *  {string} id – unique user ID
   *  {string} name – user name
   *  {string} avatar – avatar string URL,
   *  {string} dt_sync – last synchronization timestamp
   *  {object} oauth – authentication data {
   *    {string} provider – oauth provider (ex. google)
   *    {string} access_token – oauth access token
   *    {string} refresh_token – oauth refresh token
   *    {string} token_type – type of the oauth token
   *  }
   */
  constructor() {
    this._id = null;
    this.name = null;
    this.avatar = null;
    this.dt_sync = 0;
    this.oauth = {};
  }

  /**
   * Initialize current model if user exists, otherwise create a new identity.
   */
  async init() {
    try {
      let user = await this.get();

      if (user) {
        this._id = user.user._id;
        this.name = user.user.name;
        this.avatar = user.user.avatar;
        this.dt_sync = user.user.dt_sync;
        this.oauth = user.oauth;
      } else {
        this.name = null;
        this.avatar = null;
        this.dt_sync = 0;
        let savedUser = await db.insert(db.USER, this.prepare());
        this._id = savedUser._id;
      }
    } catch (err) {
      console.log('User register error: ', err);
    }
  }

  /**
   * Convert model to JSON for the further saving to the DB
   * @returns {{user: {name: (null|*), avatar: (null|*), dt_sync: (number|*)}, oauth: *}}
   */
  prepare() {
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
    return await db.update(db.USER, {'user': {$exists: true}}, this.prepare());
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
