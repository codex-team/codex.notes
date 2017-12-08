'use strict';
const random = require('../utils/random');
const db = require('../utils/database');

/**
 * Model for current user representation.
 */
class User {

  /**
   * User model {
   *  'id' – unique user ID
   *  'name' – user name
   *  'avatar' – avatar string URL
   * }
   */
  constructor() {
    this.id = null;
    this.name = null;
    this.avatar = null;
  }

  /**
   * Initialize current model if user exists, otherwise create a new identity.
   * {
   *   user: {
   *     user_id - User unique ID
   *     password - User unique password
   *   }
   * }
   */
  async init() {

    try {
      let user = await this.get();
      if (user) {
        this.id = user.id;
        this.name = user.name;
        this.avatar = user.avatar;
      }
      else {
        this.id = random.generatePassword();
        this.name = null;
        this.avatar = null;
        await db.insert(db.USER, {'user': {'id': this.id, 'name': this.name, 'avatar': this.avatar}});
      }
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