'use strict';

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

      let newUser = {"user_id": 0, "name": "user"};
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