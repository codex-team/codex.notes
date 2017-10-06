'use strict';

const fs = require('fs');
const Datastore = require('nedb');

module.exports = function () {
  let connect = function (path) {
    this.appFolder = path + '/codex.notes/';

    if (!fs.existsSync(this.appFolder)) {
      fs.mkdirSync(this.appFolder);
    }

    this.db = new Datastore({ filename: this.appFolder + 'storage.db', autoload: true });
  };

  let find = function (query) {
    return new Promise((resolve, reject) => {
      this.db.find(query, function (err, docs) {
        if (err) {
          reject(err);
        }

        resolve(docs);
      });
    });
  };

  let findOne = function (query) {
    return new Promise((resolve, reject) => {
      this.db.findOne(query, function (err, doc) {
        if (err) {
          reject(err);
        }

        resolve(doc);
      });
    });
  };

  let insert = function (data) {
    return new Promise((resolve, reject) => {
      this.db.insert(data, function (err, insertedData) {
        if (err) {
          reject(err);
        }

        resolve(insertedData);
      });
    });
  };

  let update = function (query, data, options) {
    return new Promise((resolve, reject) => {
      this.db.insert(query, data, options, function (err, numReplaced) {
        if (err) {
          reject(err);
        }

        resolve(numReplaced);
      });
    });
  };

  let remove = function (query, options) {
    return new Promise((resolve, reject) => {
      this.db.insert(query, options, function (err, numDeleted) {
        if (err) {
          reject(err);
        }

        resolve(numDeleted);
      });
    });
  };

  return {connect, find, findOne, insert, update, remove};
}();