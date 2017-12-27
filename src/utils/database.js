'use strict';

const fs = require('fs');
const path = require('path');
const Datastore = require('nedb');

/**
 * Database class. neDB - https://github.com/louischatriot/nedb.
 */
class Database {

  constructor() {}

  /**
   * Create directory in user application folder and initialize collections USER and DIRECTORY.
   * Create root directory if not exists.
   * @returns {Promise.<void>}
   */
  async makeInitialSettings(appFolder) {
    this.appFolder = appFolder;

    if (!fs.existsSync(this.appFolder)) {
      fs.mkdirSync(this.appFolder);
    }

    this.USER = new Datastore({ filename: path.join(this.appFolder, 'user.db'), autoload: true });
    this.DIRECTORY = new Datastore({ filename: path.join(this.appFolder, 'dir.db'), autoload: true });
    this.NOTES = new Datastore({ filename: path.join(this.appFolder, 'notes.db'), autoload: true });

    let rootDirectory = await this.find(this.DIRECTORY, {'root': true });

    if (rootDirectory.length === 0) {
      await this.insert(this.DIRECTORY, {
        'root': true,
        'name': 'root',
        '_id': 0,
        'notes': []
      });
    }
  }

  find(collection, query) {
    return new Promise((resolve, reject) => {
      collection.find(query, function (err, docs) {
        if (err) {
          reject(err);
        }

        resolve(docs);
      });
    });
  }

  findOne(collection, query) {
    return new Promise((resolve, reject) => {
      collection.findOne(query, function (err, doc) {
        if (err) {
          reject(err);
        }

        resolve(doc);
      });
    });
  }

  insert(collection, data) {
    return new Promise((resolve, reject) => {
      collection.insert(data, function (err, insertedData) {
        if (err) {
          reject(err);
        }

        resolve(insertedData);
      });
    });
  }

  /**
   * Update query
   * @see https://github.com/louischatriot/nedb#updating-documents
   *
   * @param  {Object} query       - is a query object to find records that need to be updated (see Queries)
   * @param  {Object} data        - update is the replacement object
   * @param  {Object} options
   * @param  {Boolean|null} options.multi   - update all records that match the query object, default is false (only the first one found is updated)
   * @param  {Boolean|null} options.upsert  - if true and no records match the query, insert update as a new record
   * @param  {Boolean|null} options.raw     - driver returns updated document as BSON binary Buffer, default:false
   * @param  {Boolean|null} options.returnUpdatedDocs  -  (defaults to false, not MongoDB-compatible)
   *                                                      if set to true and update is not an upsert,
   *                                                      will return the array of documents matched by the find query
   *                                                      and updated. Updated documents will be returned even if
   *                                                      the update did not actually modify them.
   *
   * @return {Promise<{numAffected: number, affectedDocuments: object|null}>}
   */
  update(collection, query, data, options = {}) {
    return new Promise((resolve, reject) => {
      collection.update(query, data, options, function (err, numAffected, affectedDocuments, upsert) {
        if (err) {
          reject(err);
        }

        /**
         * For an upsert,
         *    affectedDocuments contains the inserted document and the upsert flag is set to true.
         *
         * For a standard update with returnUpdatedDocs flag set to false,
         *    affectedDocuments is not set.
         *
         * For a standard update with returnUpdatedDocs flag set to true and multi to false,
         *    affectedDocuments is the updated document.
         *
         * For a standard update with returnUpdatedDocs flag set to true and multi to true,
         *    affectedDocuments is the array of updated documents.
         */
        resolve({
          numAffected,
          affectedDocuments,
          upsert
        });
      });
    });
  }

  remove(collection, query, options) {
    return new Promise((resolve, reject) => {
      collection.remove(query, options, function (err, numDeleted) {
        if (err) {
          reject(err);
        }

        resolve(numDeleted);
      });
    });
  }
}

module.exports = new Database();
