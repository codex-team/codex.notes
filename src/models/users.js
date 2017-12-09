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
   * }
   */
  constructor() {
    this.id = null;
    this.name = null;
    this.avatar = null;
    this.dt_sync = 0;
  }

  /**
   * Initialize current model if user exists, otherwise create a new identity.
   */
  async init() {
    try {
      let user = await this.get();

      if (user) {
        this.id = user.user.id;
        this.name = user.user.name;
        this.avatar = user.user.avatar;
        this.dt_sync = user.user.dt_sync;
      } else {
        this.id = random.generatePassword();
        this.name = null;
        this.avatar = null;
        this.dt_sync = 0;
        await db.insert(db.USER, {'user': {'id': this.id, 'name': this.name, 'avatar': this.avatar, 'dt_sync': this.dt_sync}});
      }
    } catch (err) {
      console.log('User register error: ', err);
    }
  }

  /**
   * Get current user.
   * @returns {*}
   */
  async get() {
    return await db.findOne(db.USER, { 'user': { $exists: true } });
  }

}

module.exports = User;
