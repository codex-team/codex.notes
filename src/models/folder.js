'use strict';

const db = require('../utils/database');
const utils = require('../utils/utils');

/**
 * Time helper
 */
const Time = require('../utils/time.js');

/**
 * Collaborator Model
 */
const Collaborator = require('../models/collaborator');

/**
 * @typedef {Object} FolderData
 * @property {String|null} _id         - Folder's Database id
 * @property {String|null} title       - Folder's title
 * @property {Number} dtModify         - Last modification timestamp
 * @property {Number} dtCreate         - Folder's creation date
 * @property {String} ownerId          - Folder owner's id
 * @property {Array} notes             - Folder's Notes list
 * @property {Array} collaborators     - Folder's Collaborators list
 * @property {Boolean} isRoot          - Root Folder used for Notes on the first level of Aside
 * @property {Boolean} isRemoved       - removed state
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
 * @property {Collaborator[]} collaborators
 * @property {Boolean} isRoot
 * @property {Boolean} isRemoved
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
    this.collaborators = [];
    this.isRoot = false;
    this.isRemoved = false;

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
      collaborators: this.collaborators,
      isRoot: this.isRoot,
      isRemoved: this.isRemoved
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
    this.collaborators = folderData.collaborators || [];
    this.isRoot = folderData.isRoot || false;
    this.isRemoved = folderData.isRemoved || false;
  }

  /**
   * Saves new Folder into the Database.
   * Update or Insert scheme
   *
   * There are four ways to do with Folder's model on save:
   *
   * 1. Folder has no _id (create local item)
   * ---> insert a new item to DB with dates
   *
   * 2. Folder is not in DB (new item from Cloud)
   * ---> insert a new item to DB
   *
   * 3. Model's dtModify is greater than dtModify
   *   for item's form DB (update local item's data)
   * ---> update an item
   *
   * 4. Try to save not actual data for this moment.
   *    Folder has been modified after lately
   * ---> do nothing
   *
   * @returns {Promise.<FolderData>}
   */
  async save() {
    /**
     * 1. Folder has no _id then we should insert it
     */

    if (!this._id) {
      return await this.createNewItem();
    }

    /**
     * Try to get item in local DB
     *
     * @returns {object|null}
     */
    let folderFromLocalDB = await db.findOne(db.FOLDERS, {_id: this._id});

    /**
     * 2. If we do not have this Folder in local DB
     */
    if (!folderFromLocalDB) {
      return await this.createItemFromCloud();
    }

    /**
     * 3. We need to update Folder if new dtModify
     *    is greater than item's dtModify from DB
     */
    if (folderFromLocalDB.dtModify < this.dtModify) {
      await this.saveUpdatedItem();
    }

    /**
     * Return Folder's data
     */
    return this.data;
  }

  /**
   * Create a new Folder: insert a new item to DB with dates
   *
   * @returns {Promise<FolderData>}
   */
  async createNewItem() {
    /**
     * Set Folder's dates
     */
    this.dtCreate = Time.now;
    this.dtModify = Time.now;

    let data = this.data;

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
   * New item from Cloud: insert a new item to DB
   *
   * @returns {Promise<FolderData>}
   */
  async createItemFromCloud() {
    let data = this.data;

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
   * Need to update local item
   *
   * @returns {Promise<FolderData>}
   */
  async saveUpdatedItem() {
    let query = {
          _id: this._id
        },
        data = this.data,
        options = {
          returnUpdatedDocs: true
        };

    /**
     * We don't need "notes" field in DB
     */
    delete data.notes;

    /**
     * We don't need to rewrite an _id field
     */
    delete data._id;

    let updateResponse = await db.update(db.FOLDERS, query, {$set: data}, options);

    this.data = updateResponse.affectedDocuments;

    return this.data;
  }

  /**
   * Delete Folder
   *
   * @returns {Promise.<FolderData>}
   */
  async delete() {
    this.isRemoved = true;
    this.dtModify = Time.now;

    return await this.save();
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
   * Prepare updates for target time
   *
   * @param lastSyncTimestamp
   *
   * @returns {Promise.<Array>}
   */
  static async prepareUpdates(lastSyncTimestamp) {
    let notSyncedItems = await db.find(db.FOLDERS, {
      dtModify: {$gt: lastSyncTimestamp}
    });

    return notSyncedItems;
  }

  /**
   * Invite a Collaborator
   * @param {String} email - Collaborator's email
   * @returns {Boolean}
   */
  async addCollaborator(email) {
    if (await Collaborator.findByEmail(this.id, email)) {
      throw Error('Collaborator has been already invited');
    }

    let collaborator = new Collaborator({
      email: email,
      folderId: this._id,
      ownerId: global.user.id
    });

    await collaborator.save();

    await global.app.syncObserver.sendCollaboratorInvite(collaborator);

    return {
      success: true
    };
  }

  async getCollaborators() {
    return db.find(db.COLLABORATORS, {folderId: this._id});
  }
}

module.exports =  Folder;
