'use strict';

const db = require('../utils/database');

/**
 * Note Model
 */
const Note = require('../models/note.js');

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
module.exports = class Folder {

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

    if (this._id){
      folderData._id = this._id;
    }

    return folderData;
  }

  /**
   * Folder data setter
   * @param {FolderData} folderData
   */
  set data(folderData) {
    this._id = folderData.id || folderData._id || null;
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
   * @param {Object|null} dataToUpdate  — if you need to update only specified fields,
   *                                      pass it directly with this parameter
   * @returns {Promise.<FolderData>}
   */
  async save(dataToUpdate = null) {
    let query = {
          _id : this._id
        },
        data = {},
        options = {
          upsert: true,
          returnUpdatedDocs: true
        };
    /**
     * Set creation date for the new Folder
     */
    if (!this._id) {
      this.dtCreate = +new Date();
    }

    /**
     * Renew modification date
     */
    // this.dtModify = +new Date();

    /**
     * Save only passed fields or save the full model data
     */
    if (dataToUpdate) {
      data = {
        $set: dataToUpdate // we use $set modifier to update only passed values end keep other saved fields
      };
    } else {
      data = this.data;

      /**
       * We don't need to rewrite an _id field
       */
      delete data._id;


      /**
       * On sync, we need to save given id as _id in the DB.
       */
      // if (this.id !== null){
      //   data = Object.assign(data, {_id: this.id});
      // }
    }

    /**
     * Update Notes
     */
    if (data.notes.length){
      this.updateNotes(data.notes);
      /**
       * Notes array stores in other Collection, we don't need to save them to the Folder document
       */
      delete data.notes;
    }

    // let currentUpdatedAt = await db.find(db.FOLDERS, query);

    // console.log('\n\n\n\n Current Folder state: ', currentUpdatedAt);


    let savedFolder = await db.update(db.FOLDERS, query, data, options);

    /**
     * Renew Model id with the actual value
     */
    if (savedFolder._id){
      this._id = savedFolder._id;
    }

    console.log('Была ли обновлена папка ->>>>', savedFolder.numAffected);


    console.log('\n\n\n\n After updating Folder state: ', savedFolder.affectedDocuments);

    console.log('\n\n\n\n this.data: ', this.data);
    if (savedFolder.affectedDocuments === this.data){
      console.log('NOTHING CHANGED');
    } else {
      console.log('SOMETHING CHANGED. Need to update dtModify.');
      /**
       * @todo update dtModify.
       */
      // let savedFolder = await db.update(db.FOLDERS, query, {
      // dtMofidy: +new Date()
      // }, options);
    }

    return savedFolder.affectedDocuments;
  }

  /**
   * Update each Note in this Folder
   * @param {Array|null} notes - save passed Notes instead of this.notes
   * @return {Promise<void>}
   */
  updateNotes(notes) {
    let notesToUpdate = notes || this.notes;
    notesToUpdate.forEach( async (noteData) => {
      let note = new Note(Object.assign(noteData, {folderId: this.id}));
      let savingResult = await note.save();

      console.log('Note', savingResult._id, 'updated due to Folder', this.id, 'saving');
    });
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
   * @param {String|null} id - Folder ID
   * @returns {FolderData} - Folder's data
   */
  async get(id) {
    let folder = await db.findOne(db.FOLDERS, {
      _id: id || this._id || this.id
    });

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
};
