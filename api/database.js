'use strict';

const fs = require('fs');
const path = require('path');
const Datastore = require('nedb');

class Database {
  constructor(appFolder) {
    this.appFolder = appFolder;

    if (!fs.existsSync(this.appFolder)) {
      fs.mkdirSync(this.appFolder);
    }

    let filename = path.join(this.appFolder, 'storage.db');

    this.db = new Datastore({ filename: filename, autoload: true });
  }

  find(query) {
    return new Promise((resolve, reject) => {
      this.db.find(query, function (err, docs) {
        if (err) {
          reject(err);
        }

        resolve(docs);
      });
    });
  }

  findOne(query) {
    return new Promise((resolve, reject) => {
      this.db.findOne(query, function (err, doc) {
        if (err) {
          reject(err);
        }

        resolve(doc);
      });
    });
  }

  insert(data) {
    return new Promise((resolve, reject) => {
      this.db.insert(data, function (err, insertedData) {
        if (err) {
          reject(err);
        }

        resolve(insertedData);
      });
    });
  }

  update(query, data, options) {
    return new Promise((resolve, reject) => {
      this.db.update(query, data, options, function (err, numReplaced) {
        if (err) {
          reject(err);
        }

        resolve(numReplaced);
      });
    });
  }

  remove(query, options) {
    return new Promise((resolve, reject) => {
      this.db.remove(query, options, function (err, numDeleted) {
        if (err) {
          reject(err);
        }

        resolve(numDeleted);
      });
    });
  }
}

module.exports = Database;