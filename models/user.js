'use strict';

const API = require('../api/call');

let userData = null;

class User {

  static get userID() {
    return userData;
  }

  constructor(db) {
    this.db = db;
    this.api = new API();

    this.get()
      .then((user) =>{
        userData = user;
      });
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