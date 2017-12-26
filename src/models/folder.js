'use strict';

const random = require('../utils/random');
const db = require('../utils/database');
const Api = require('./api');

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
  constructor() {
    this.id = '';
    this.title = '';
    this.dtModify = null;
    this.ownerId = null;
    this.notes = [];


  }

  /**
   * Create new directory with the name specified.
   * @param title - directory title
   * @returns {Promise.<*>}
   */
  async create(title) {
    try {
      let dtModify = + new Date();
      let dir = await db.insert(db.DIRECTORY, {
        title,
        notes: [],
        dtModify,
        ownerId: global.user ? global.user.id : null
      });

      // if (data.user) {
        // let data = {
        //   id: dir._id,
        //   title,
        //   dtModify,
        //   user: global.user ? global.user.id : null
        // };
        // await this.api.sendRequest('folder/create', data);
      // }

      return dir;
    } catch (err) {
      console.log('Folder creation error: ', err);
      return false;
    }
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
   * Returns Folders list
   *
   * @return {Promise.<Folder[]>}
   */
  async list() {
    try {
      let list = await db.find(db.DIRECTORY, {_id: { $ne: 0 }});

      console.log('Folders in DB', list);

      return list.map(Folder.format);
    } catch (err) {
      console.log('Folder list error: ', err);
      return false;
    }
  }

  /**
   * Delete directory with ID.
   * @param directoryId - directory ID
   * @returns Bool result
   */
  async delete(directoryId) {
    try {

      let deleteNotesResult = await db.remove(db.NOTES, {folderId: directoryId}, {});
      let deleteFolderResult = await db.remove(db.DIRECTORY, {_id: directoryId}, {});
      let deletedFromServer;

        let data = {
            id: directoryId,
            user: global.user ? global.user.id : null
        };

        if (data.user) {
          // deletedFromServer = await this.api.sendRequest('folder/delete', data);
        }

      return deleteFolderResult & deleteNotesResult & ( deletedFromServer || true );
    } catch (err) {
      console.log('Folder delete error: ', err);
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
   * @param folder
   */
  async syncWithDB(folder) {
    try {

      console.log('What we will update: ', folder.id);

      let updateResponse = await db.update(db.DIRECTORY,
        // where
        {
          _id: folder.id
        },
        // new data
        {
          _id: folder.id,
          title: folder.title,
          dt_update: folder.dtModify,
        },
        // options
        {
          upsert: true
        });
      return updateResponse.affectedDocuments;

    } catch (err) {
      console.log(`Folder ${folder.id} [${folder.name}] sync failed: `, err);
      return false;
    }
  }

}

module.exports = Folder;
