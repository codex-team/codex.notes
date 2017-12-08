'use strict';
const random = require('../utils/random');
const db = require('../utils/database');

/**
 * Model for current user representation.
 */
class User {

  constructor() {
    this.id = null;
    this.name = null;
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
      }
      else {
        this.id = random.generatePassword();
        this.name = null;
        await db.insert(db.USER, {'user': {'id': this.id, 'name': this.name}});
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