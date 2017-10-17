'use strict';

const random = require('../utils/random');
const db = require('../utils/database');

/**
 * Notes model.
 */
class NotesModel {

  /**
   * Initialize parameters for API.
   */
  constructor() {
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
      let note = await db.findOne(db.NOTES, {'_id': noteId});
      if (!note) {
        console.log("Note is not found", noteId);
        return false;
      }
      else {
        return note;
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
      let directory = await db.findOne(db.DIRECTORY, {'_id': directoryId});

      // Additional check to perform clever logging
      if (!directory) {
        return [];
      }

      let notes = await db.find(db.NOTES, {'folderId': directoryId});

      return notes.map(function (element) {
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
        let directory = await db.findOne(db.DIRECTORY, {'root': true});
        directoryId = directory._id;
        note.folderId = directoryId; // make sure that null or false is 0
      }
      if (!note.data.id) {
        // create new note
        note.data.id = random.generatePassword();
      }
      note._id = note.data.id;

      let newNote = await db.update(db.NOTES, {'_id': note._id }, note, {'upsert': true});
      if (newNote) {
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