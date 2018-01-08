'use strict';

/**
 * HTML Sanitizer {@link https://github.com/punkave/sanitize-html}
 * @type {sanitizeHtml}
 */
const sanitizeHtml = require('sanitize-html');

/**
 * Database wrapper
 * @type {Database}
 */
const db = require('../utils/database');

/**
 * Folder Model
 */
const Folder = require('../models/folder.js');

/**
 * @typedef {Object} NoteData
 * @property {String} _id           — Note's id
 * @property {String} authorId      — Note's Author id
 * @property {String} folderId      - Note's Folder id
 * @property {String} content       - JSON with Note's body
 * @property {Number} dtModify      - timestamp of last modification
 * @property {Number} dtCreate      - timestamp of Note creation
 * @property {Boolean} isRemoved    - Note's removed state
 * @property {String|null} editorVersion - used CodeX Editor version
 */

/**
 * Notes model.
 */
class Note {
  /**
   * @constructor
   * Makes new Note example
   *
   * @param {NoteData} noteData  - Note's data to fill the Model
   */
  constructor(noteData = {}) {
    this._id = null;
    this.title = null;
    this.content = null;
    this.dtCreate = null;
    this.dtModify = null;
    this.authorId = null;
    this.folderId = null;
    this.isRemoved = false;
    this.editorVersion = null;

    this.data = noteData;
  }

  /**
   * Note data setter
   * @param {NoteData} noteData
   */
  set data(noteData) {
    this._id = noteData._id || null;
    this.authorId = noteData.authorId || null;
    this.folderId = noteData.folderId || null;
    this.title = noteData.title || null;
    this.content = noteData.content || null;
    this.dtCreate = noteData.dtCreate || null;
    this.dtModify = noteData.dtModify || null;
    this.isRemoved = noteData.folderId || false;
    this.editorVersion = noteData.editorVersion || null;
  }

  /**
   * Note data getter
   * @return {NoteData}
   */
  get data() {
    let noteData = {
      authorId: this.authorId,
      folderId: this.folderId,
      title: this.title,
      content: this.content,
      dtCreate: this.dtCreate,
      dtModify: this.dtModify,
      isRemoved: this.isRemoved,
      editorVersion: this.editorVersion,
    };

    if (this._id){
      noteData._id = this._id;
    }

    return noteData;
  }


  /**
   * Save current Note to the DB
   */
  async save(){

    /**
     * Set creation date for the new Note
     */
    if (!this._id) {
      console.log('\n\n Note creation: \n\n');
      this.dtCreate = +new Date();
    } else {
      console.log('\n\n Note updating ', this._id, '\n\n');
    }

    /**
     * Update modification time
     */
    this.dtModify = +new Date();

    /**
     * Make Title from the first Text Block in case when it is not presented.
     */
    if (!this.title) {
      if (this.content.items.length && this.content.items[0].data) {
        let titleFromText = this.content.items[0].data.text;

        this.title = sanitizeHtml(titleFromText, {allowedTags: []});
      }
    }

    /**
     * If Note is not included at any Folder, save it to the Root Folder
     */
    if (this.folderId === null) {
      this.folderId = await Folder.getRootFolderId();
    }

    let query = {
          _id : this._id
        },
        data = this.data,
        options = {
          upsert: true,
          returnUpdatedDocs: true
        };

    let savedNote = await db.update(db.NOTES, query, data, options);

    /**
     * Renew Model id with the actual value
     */
    if (savedNote._id) {
      this._id = savedNote._id;
    }

    /**
     * Update Folder's modification time
     */
    let folder = new Folder({
      id: this.folderId,
    });

    folder = await folder.save({
      dtModify: this.dtModify
    });

    console.log('\n Folder\'s modify date updated ', folder, '\n');

    /**
     * @todo Sync with API
     */

    return savedNote.affectedDocuments;
  }

  /**
   * Get note with ID.
   * {
   *   data: {
   *     id: unique note ID
   *     items: Codex Editor object
   *     dt_update: last update
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
        console.log('Note is not found', noteId);
        return false;
      } else {
        return note;
      }
    } catch (err) {
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
      let directory = await db.findOne(db.FOLDERS, {'_id': directoryId});

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
    } catch (err) {
      console.log('Notes list error: ', err);
    }
  }

  /**
   * Get updates action. Make a packet of data changed from last sync date specified.
   */
  async getUpdates(dt_update) {
    try {
      let newNotes = await db.find(db.NOTES, {'dt_update': { $gt: dt_update }});

      return newNotes;
    } catch (err) {
      console.log('getUpdates notes error: ', err);
      return false;
    }
  }

  /**
   * Delete note by specified ID.
   * @param noteId
   * @returns {Promise.<boolean>}
   */
  async delete(noteId) {
    try {
      let result = await db.remove(db.NOTES, {'_id': noteId}, {});

      return true;
    } catch (err) {
      console.log('Note delete error: ', err);
      return false;
    }
  }

}

module.exports = Note;
