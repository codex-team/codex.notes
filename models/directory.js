'use strict';

const auth = require('../api/auth');
const API = require('../api/call');

class Directory {

  constructor(db, user) {
    this.db = db;
    this.api = new API(db);
    this.user = user;
  }

  async create(name) {
    try {
      let dirId = auth.generatePassword();
      let dir = await this.db.insert(this.db.DIRECTORY, { 'name': name, 'notes': [] } );
      console.log("Directory created: ", dir);
      return dir;
    }
    catch (err) {
      console.log("Directory create error: ", err);
      return false;
    }
  }

  async get(id) {
    try {
      console.log(id);
      let dir = await this.db.findOne(this.db.DIRECTORY, {'_id': id});
      if (dir) {
        return this.format(dir);
      }
      else {
        return false;
      }
    }
    catch (err) {
      console.log("Directory get error: ", err);
      return false;
    }
  }

  async list() {
    try {
      let list = await this.db.find(this.db.DIRECTORY, {});

      return list.map(this.format);
    }
    catch (err) {
      console.log("Directory list error: ", err);
      return false;
    }
  }

  async delete(directoryId) {
    try {
      return await this.db.remove(this.db.DIRECTORY, {'_id': directoryId});
    }
    catch (err) {
      console.log("Directory delete error: ", err);
      return false;
    }
  }

  format (element) {
    return {
      'name': element.name,
      'id': element._id,
      'notes': element.notes
    };
  }

}

module.exports = Directory;