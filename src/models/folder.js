'use strict';

const db = require('../utils/database');
const utils = require('../utils/utils');

/**
 * Time helper
 */
const Time = require('../utils/time.js');

/**
 * @typedef {Object} FolderData
 * @property {String|null} id         - Folder's Database id
 * @property {String|null} _id         - Folder's Database id
 * @property {String|null} title       - Folder's title
 * @property {Number} dtModify         - Last modification timestamp
 * @property {Number} dtCreate         - Folder's creation date
 * @property {String} ownerId          - Folder owner's id
 * @property {Array} notes             - Folder's Notes list
 * @property {Boolean} isRoot          - Root Folder used for Notes on the first level of Aside
 */

/**
 * @class Folder
 * @classdesc Folder's model type
 *
 * @typedef {Folder} Folder
 * @property {String} _id
 * @property {String|null} title
 * @property {Number} dtModify
 * @property {Number} dtCreate
 * @property {String} ownerId
 * @property {Note[]} notes
 * @property {Boolean} isRoot
 *
 */
class Folder {

  /**
   * @constructor
   * Make new Folder example
   * @param {FolderData} folderData
   */
  constructor(folderData = {}) {
    this._id = null;
    this.title = null;
    this.dtModify = null;
    this.dtCreate = null;
    this.ownerId = null;
    this.notes = [];
    this.isRoot = false;

    this.data = folderData;
  }

  /**
   * Folder data getter
   * @return {FolderData}
   */
  get data() {
    let folderData = {
      title: this.title,
      ownerId: this.ownerId,
      dtModify: this.dtModify,
      dtCreate: this.dtCreate,
      notes: this.notes,
      isRoot: this.isRoot
    };

    if (this._id) {
      folderData._id = this._id;
    }

    return folderData;
  }

  /**
   * Folder data setter
   * @param {FolderData} folderData
   */
  set data(folderData) {
    this._id = folderData._id || folderData.id || null;
    this.title = folderData.title || null;
    this.dtModify = folderData.dtModify || null;
    this.dtCreate = folderData.dtCreate || null;
    this.ownerId = folderData.ownerId || null;
    this.notes = folderData.notes || [];
    this.isRoot = folderData.isRoot || false;
  }

  /**
   * Saves new Folder into the Database.
   * Update or Insert scheme
   *
   * @returns {Promise.<FolderData>}
   */
  async save() {
    let query = {
          _id : this._id
        },
        data = {},
        options = {
          returnUpdatedDocs: true
        };

    /**
     * If Folder has no _id then we should insert it
     * Runs on creating a new local item
     */
    if (!this._id) {
      /**
       * Set Folder's dates
       */
      this.dtCreate = Time.now;
      this.dtModify = Time.now;

      data = this.data;

      /**
       * We don't need "notes" field in DB
       */
      delete data.notes;

      /**
       * Insert a new item to local DB
       *
       * @returns {object._id} - _id for a new item
       */
      let createdFolder = await db.insert(db.FOLDERS, data);

      this._id = createdFolder._id;

      /**
       * Return Folder's data
       */
      return this.data;
    }

    /**
     * Try to get item in local DB
     *
     * @returns {object|null}
     */
    let folderFromLocalDB = await db.findOne(db.FOLDERS, query);

    data = this.data;

    /**
     * If we have no Folder in local DB
     * Runs if you have got a new item from Cloud
     */
    if (!folderFromLocalDB) {

      /**
       * We don't need "notes" field in DB
       */
      delete data.notes;

      /**
       * Insert a new item to local DB
       *
       * @returns {object._id} - _id for a new item
       */
      let createdFolder = await db.insert(db.FOLDERS, data);

      this._id = createdFolder._id;

      /**
       * Return Folder's data
       */
      return this.data;
    }

    /**
     * We need to update Folder if new dtModify
     * is greater than item's dtModify from DB
     */
    if (folderFromLocalDB.dtModify < this.dtModify) {
      data = this.data;

      /**
       * We don't need to rewrite an _id field
       */
      delete data._id;

      console.log(' Folder update ---->', data);

      let updateResponse = await db.update(db.FOLDERS, query, {$set: data}, options);

      this.data = updateResponse.affectedDocuments;
    }

    /**
     * Return Folder's data
     */
    return this.data;
  }

  /**
   * Delete Folder from the Database
   * @returns {Boolean}
   */
  async delete() {
    /**
     * @todo Delete folder == set isRemoved=1
     */

    /**
     * 1. Remove all Notes in the Folder
     */
    await db.remove(db.NOTES, {folderId: this.id}, {});

    /**
     * 2. Remove Folder
     */
    let deleteFolderResult = await db.remove(db.FOLDERS, {_id: this.id}, {});

    /**
     * 3. Send Folder Mutation to the API
     * @todo Sent Folder mutation to the API == run sync
     */

    return !!deleteFolderResult;
  }


  /**
   * Get Folder by ID
   *
   * @param {String} id - Folder ID
   *
   * @returns {FolderData} - Folder's data
   */
  static async get(id) {

    let folderFromDB = await db.findOne(db.FOLDERS, {_id: id});

    let folder = new Folder(folderFromDB);

    return folder;
  }

  /**
   * Invite a Collaborator
   * @param {String} email - Collaborator's email
   * @returns {Boolean}
   */
  async addCollaborator(email) {
    /**
     * @todo Send Collaborator Mutation to the API
     */
    console.log('Collaborator will be added with email: ', email);

    return true;
  }
}

module.exports =  Folder;
