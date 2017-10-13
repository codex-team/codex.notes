'use strict';

const API = require('../api/call');

/**
 * Model for current user representation.
 */
class User {

  /**
   * Initialize DB connection
   * @param db - DB object
   */
  constructor(db) {
    this.db = db;
    this.api = new API();
  }

  /**
   * Return current user if exists, otherwise create new identity.
   * {
   *   user: {
   *     user_id - User unique ID
   *     password - User unique password
   *   }
   * }
   * @returns user identity
   */
  async register() {

    try {
      let user = await this.get();
      if (user) {
        return user;
      }

      let newUser = await this.api.userRegister();
      if (!newUser) {
        console.log("API error: userRegister() action");
        return false;
      }

      await this.db.insert(this.db.USER, {'user': newUser});
      return newUser;
    }
    catch (err) {
      console.log("User register error: ", err);
    }

  }

  /**
   * Get current user.
   * @returns {*}
   */
  get() {
    return this.db.findOne(this.db.USER, { "user": { $exists: true } });
  }

}

module.exports = User;