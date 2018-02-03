const db = require('../utils/database');
const Note = require('./note.js');

/**
 * @typedef {NotesList} NotesList
 * @property {string} folderId - in which Folder we should to find Notes
 */
module.exports = class NotesList {

  /**
   * @param {string} folderId - from which Folder we need to create Notes List
   */
  constructor({folderId}) {
      this.folderId = folderId;
  }

  /**
   * Returns Notes list
   *
   * @return {Promise.<Note[]>}
   */
  async get() {

    if (!this.folderId){
      this.folderId = await db.getRootFolderId();
    }

    let notesList = await db.find(db.NOTES, {
      folderId: this.folderId,
      isRemoved: {
        $ne: true
      }
    });

    return notesList.map( note => new Note(note));
  }

};
