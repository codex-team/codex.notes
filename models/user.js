'use strict';

const API = require('../api/call');

class User {

  constructor(db) {
    this.db = db;
    this.api = new API();
  }

  async register() {

    try {
      let user = await this.get();
      if (user) {
        return user;
      }

      let newUser = await this.api.userRegister();
      await this.db.insert(this.db.USER, {'user': newUser});

      return newUser;
    }
    catch (err) {
      console.log("User register error: ", err);
    }

  }

  get() {
    return this.db.findOne(this.db.USER, { "user": { $exists: true } });
  }

}

module.exports = User;