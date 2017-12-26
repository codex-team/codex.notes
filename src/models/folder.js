'use strict';

const random = require('../utils/random');
const db = require('../utils/database');
const Api = require('./api');

/**
 * @typedef {Object} FolderData
 * @property {String|null} id          - Folder's id
 * @property {String} title       - Folder's title
 * @property {Number} dtModify    - Last modification timestamp
 * @property {String} ownerId     - Folder owner's id
 * @property {Array} notes        - Folder's Notes list
 */

/**
 * @class Folder
 * @classdesc Folder's model type
 *
 * @typedef {Folder} Folder
 * @property {String} id
 * @property {String} title
 * @property {Number} dtModify
 * @property {String} ownerId
 * @property {Note[]} notes
 *
 */
class Folder {

  /**
   * Initialize params for the API
   */
  constructor({id, title, ownerId, dtModify, notes}) {
    this.id = id || null;
    this.title = title || null;
    this.dtModify = dtModify || null;
    this.ownerId = ownerId || null;
    this.notes = notes || [];
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
   * Saves new Folder into the Database.
   * @returns {Promise.<FolderData>}
   */
  async add() {
    let savedFolder = await db.insert(db.DIRECTORY, this.data);

    if (savedFolder._id){
      this.id = savedFolder._id;
    }

    /**
     * @todo Sync with API
     */

    return savedFolder;
  }


  /**
   * Delete Folder from the Database
   *
   * @returns {Boolean}
   */
  async delete() {

    let deleteNotesResult = await db.remove(db.NOTES, {folderId: this.id}, {});
    let deleteFolderResult = await db.remove(db.DIRECTORY, {_id: this.id}, {});
    let deletedFromServer;

    /**
     * @todo Sent Folder mutation to the API
     */
    return deleteFolderResult & deleteNotesResult & ( deletedFromServer || true );

  }

  /**
   * Get directory by ID in format:
   * {
   *   id - unique folder ID
   *   name - folder name (visible)
   *   notes: [] - array of notes
   * }
   * @param id - directory ID
   * @returns {Object} - Folder's data
   */
  async get(id) {
    try {
      let dir = await db.findOne(db.DIRECTORY, {_id: id});

      if (dir) {
        return Folder.format(dir);
      } else {
        return false;
      }
    } catch (err) {
      console.log('Folder get error: ', err);
      return false;
    }
  }


  /**
   * Renames directory by id.
   * @param {ObjectId} id  - directory ID
   * @param {String} name - new name
   * @returns {Boolean}
   */
  async rename(id, name) {
    try {
      return await db.update(db.DIRECTORY, {_id: id}, { name, dt_update: + new Date() });
    } catch (err) {
      console.log('Folder renaming error: ', err);
      return false;
    }
  }

  /**
   * Invite a new member to the folder.
   * @param {ObjectId} id  - directory ID
   * @param {String} email - member's email
   * @returns {Boolean}
   */
  async addMember(id, email) {
    try {
      await this.api.sendRequest('folder/addCollaborator', {
        user: global.user.id,
        collaborator: email,
        folder: id
      });

      console.log(`addMember API request with params {user: ${global.user.id}, collaborator: '${email}', folder: ${id}`);
      return true;
    } catch (err) {
      console.log('Error while inviting a new member to the folder: ', err);
      return false;
    }
  }

  /**
   * Get updates action. Make a packet of data changed from last sync date specified.
   */
  async getUpdates(dt_update) {
    try {
      let newFolders = await db.find(db.DIRECTORY, {dt_update: { $gt: dt_update }});

      return newFolders;
    } catch (err) {
      console.log('getUpdates folders error: ', err);
      return false;
    }
  }

  /**
   * Transform DB element into structure for frontend module.
   * @param {Object} record
   * @param {String} record._id
   * @param {String} record.title
   * @param {String|null} record.ownerId
   * @param {Array} record.notes
   * @returns {{title: string, id: string, notes: (Array|*|Notes)}}
   */
  static format(record) {
    return {
      title: record.title,
      id: record._id,
      notes: record.notes
    };
  }


  /**
   * Updates a Folder in the Database
   */
  async syncWithDB() {
    try {

      console.log('Now we will update Folder with id: ', this.id);

      let updateResponse = await db.update(db.DIRECTORY,
        // where
        {
          _id: this.id
        },
        // new data
        {
          _id: this.id,
          title: this.title,
          dt_update: this.dtModify,
        },
        // options
        {
          upsert: true
        });
      return updateResponse.affectedDocuments;

    } catch (err) {
      console.log(`Folder ${this.id} [${this.title}] sync failed: `, err);
      return false;
    }
  }

}

module.exports = Folder;
