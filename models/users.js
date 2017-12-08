'use strict';
const random = require('../utils/random');
const db = require('../utils/database');

/**
 * Model for current user representation.
 */
class User {

  constructor() {}

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

      let userId = random.generatePassword();
      let newUser = {"user_id": userId, "name": null};
      await db.insert(db.USER, {'user': newUser});
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
  async get() {
    return await db.findOne(db.USER, { "user": { $exists: true } });
  }

}

module.exports = User;