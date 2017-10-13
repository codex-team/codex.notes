'use strict';

const auth = require('../api/auth');
const API = require('../api/call');

/**
 * Notes model.
 */
class NotesModel {

  /**
   * Initialize parameters for API.
   * @param db - DB model object
   * @param user - user model object
   */
  constructor(db, user) {
    this.db = db;
    this.api = new API(db);
    this.user = user;
  }

  /**
   * Get note with ID.
   * {
   *   data: {
   *     id: unique note ID
   *     items: Codex Editor object
   *     time: timestamp
   *     version - current editor version
   *   }
   *   folderId - folder ID
   *   title - note title
   * }
   * @param noteId - note ID
   * @returns {Promise.<*>}
   */
  async get(noteId) {
    try {
      let directoryWithNote = await this.db.findOne(this.db.DIRECTORY, {'notes.data.id': noteId});
      if (!directoryWithNote) {
        return false;
      }
      else {
        return directoryWithNote.notes.filter(function (element) {
          return element.data.id == noteId;
        })[0];
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  /**
   * List notes in directory
   *  [{
   *    id - note ID
   *    title - note title
   *    folderId - directory ID
   *  }]
   * @param directoryId - directory ID
   * @returns {Promise.<Array>}
   */
  async list(directoryId) {
    try {
      let directory = await this.db.findOne(this.db.DIRECTORY, {'_id': directoryId});

      if (!directory) {
        return [];
      }

      return directory.notes.map(function (element) {
        return {
          'id': element.data.id,
          'title': element.title,
          'folderId': directoryId
        };
      });
    }
    catch (err) {
      console.log("Notes list error: ", err);
    }
  }

  /**
   * Save not to the directory.
   * @param directoryId - directory ID
   * @param note - note in format:
   * {
   *   data: {
   *     id - unique note ID
   *     items - Codex Editor object
   *     time - timestamp
   *     version - current editor version
   *   }
   *   folderId - folder ID
   *   title - note title
   * }
   * @returns Note in format:
   * {
   *   id - unique note ID
   *   title - note title
   *   folderId - directory ID
   * }
   */
  async save(directoryId, note) {
    try {
      if (!directoryId) {
        let directory = await this.db.findOne(this.db.DIRECTORY, {'root': true});
        directoryId = directory._id;
      }
      if (!note.data.id) {
        // create new note
        note.data.id = auth.generatePassword();
      }
      let result = await this.db.update(this.db.DIRECTORY, {'_id': directoryId }, { $addToSet: { 'notes': note } }, {});

      if (result) {
        return {
          id: note.data.id,
          title: note.title,
          folderId: directoryId
        };
      }
      else {
        return false;
      }
    }
    catch (err) {
      console.log("Note save error: ", err);
      return false;
    }
  }

}

module.exports = NotesModel;