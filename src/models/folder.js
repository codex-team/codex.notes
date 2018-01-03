'use strict';

const db = require('../utils/database');

/**
 * @typedef {Object} FolderData
 * @property {String|null} id          - Folder's id
 * @property {String|null} _id         - Folder's Database id
 * @property {String|null} title       - Folder's title
 * @property {Number} dtModify         - Last modification timestamp
 * @property {String} ownerId          - Folder owner's id
 * @property {Array} notes             - Folder's Notes list
 * @property {Boolean} isRoot          - Root Folder used for Notes on the first level of Aside
 */

/**
 * @class Folder
 * @classdesc Folder's model type
 *
 * @typedef {Folder} Folder
 * @property {String} id
 * @property {String|null} title
 * @property {Number} dtModify
 * @property {String} ownerId
 * @property {Note[]} notes
 * @property {Boolean} isRoot
 *
 */
module.exports = class Folder {

  /**
   * @constructor
   * Make new Folder example
   * @param {FolderData} folderData
   */
  constructor(folderData = {}) {
    this.id = null;
    this.title = null;
    this.dtModify = null;
    this.ownerId = null;
    this.notes = [];

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
      notes: this.notes
    };

    if (this.id){
      folderData.id = this.id;
    }

    return folderData;
  }

  /**
   * Folder data setter
   * @param {FolderData} folderData
   */
  set data(folderData) {

    /**
     * Folder id can be 0 on the Root Folder
     */
    if (folderData.id !== null) {
      this.id = folderData.id;
    } else if (folderData._id !== null) {
      this.id = folderData._id;
    } else {
      this.id = null;
    }

    this.title = folderData.title || null;
    this.dtModify = folderData.dtModify || null;
    this.ownerId = folderData.ownerId || null;
    this.notes = folderData.notes || [];
  }

  /**
   * Saves new Folder into the Database.
   * Update or Insert scheme
   * @param {Object|null} dataToUpdate  — if you need to update only specified fields,
   *                                      pass it directly with this parameter
   * @returns {Promise.<FolderData>}
   */
  async save(dataToUpdate = null) {
    let query = {
          _id : this.id
        },
        data = {},
        options = {
          upsert: true,
          returnUpdatedDocs: true
        };

    /**
     * Save only passed fields or save the full model data
     */
    if (dataToUpdate) {
      data = dataToUpdate;
    } else {
      data = this.data;
    }

    /**
     * On sync, we need to save given id as _id in the DB.
     * Folder's id can be 0 — on the Root Folder
     */
    if (this.id !== null){
      data = Object.assign(data, {_id: this.id});
    }

    let savedFolder = await db.update(db.FOLDERS, query, data, options);

    /**
     * Renew Model id with the actual value
     */
    if (savedFolder._id){
      this.id = savedFolder._id;
    }

    /**
     * @todo Sync with API
     */

    return savedFolder.affectedDocuments;
  }


  /**
   * Delete Folder from the Database
   * @returns {Boolean}
   */
  async delete() {
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
     * @todo Sent Folder mutation to the API
     */

    return !!deleteFolderResult;
  }

  /**
   * Get Folder by ID
   * @param {String} id - Folder ID
   * @returns {FolderData} - Folder's data
   */
  async get(id) {
    let folder = await db.findOne(db.FOLDERS, {_id: id});

    if (folder) {
      this.data = folder;
      return this.data;
    } else {
      return false;
    }
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

  /**
   * Get updates action. Make a packet of data changed from last sync date specified.
   */
  async getUpdates(dt_update) {
    try {
      let newFolders = await db.find(db.FOLDERS, {dt_update: { $gt: dt_update }});

      return newFolders;
    } catch (err) {
      console.log('getUpdates folders error: ', err);
      return false;
    }
  }

  /**
   * Return Root Folder that was create on the first opening
   * {@link Database#makeInitialSettings}
   */
  static async getRootFolderId(){
    try {
      let rootFolder = await db.findOne(db.FOLDERS, {
        'isRoot': true
      });

      console.log("rootFolder", rootFolder);
      return rootFolder._id;
    } catch( err ){
      console.log('Folder#getRootFolderId: Can not find Root Folder because: ', err);
    }
  }
};
