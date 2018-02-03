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

const utils = require('../utils/utils');

const Folder = require('./folder');

/**
 * Time helper
 */
const Time = require('../utils/time.js');

/**
 * @typedef {Object} NoteData
 * @property {String} _id           — Note's id
 * @property {String} id            — similar to _id. Uses for filling Model from the GraphQL query which is 'id'
 * @property {String} title         — Note's title
 * @property {String} authorId      — Note's Author id
 * @property {String} folderId      - Note's Folder id
 * @property {String} content       - JSON with Note's body
 * @property {Number} dtModify      - timestamp of last modification
 * @property {Number} dtCreate      - timestamp of Note creation
 * @property {Boolean} isRemoved    - Note's removed state
 * @property {String|null} editorVersion - used CodeX Editor version
 * @property {{id: string, name: string, email: string}|null} author - Note's author from GraphQL query field
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
    this._id = noteData._id || noteData.id || null;
    this.authorId = noteData.authorId || null;
    this.folderId = noteData.folderId || null;
    this.title = noteData.title || null;
    this.content = noteData.content || null;
    this.dtCreate = noteData.dtCreate || null;
    this.dtModify = noteData.dtModify || null;
    this.isRemoved = noteData.isRemoved || false;
    this.editorVersion = noteData.editorVersion || null;

    if (noteData.author && noteData.author.id) {
      this.authorId = noteData.author.id;
    }
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

    if (this._id) {
      noteData._id = this._id;
    }

    return noteData;
  }


  /**
   * Save current Note to the DB
   */
  async save() {
    console.log('\nmodel note ' + this._id + ': save', this._id);
    let query = {
          _id : this._id
        },
        data,
        options = {
          upsert: true,
          returnUpdatedDocs: true
        };

    /**
     * Set dates for the new Note
     */
    if (!this._id) {
      console.log('model note ' + this._id + ': no _id -> create a new note');
      this.dtCreate = Time.now;
      this.dtModify = Time.now;
    } else {
      console.log('model note: update note with id:', this._id);
    }

    /**
     * Make Title from the first Text Block in case when it is not presented.
     * @todo find first Text block, not any first-Tool
     */
    if (!this.title) {
      let content = JSON.parse(this.content);

      if (content.length && content[0].data) {
        let titleFromText = content[0].data.text;

        this.title = sanitizeHtml(titleFromText, {allowedTags: []});
      }
    }

    /**
     * If Note is not included at any Folder, save it to the Root Folder
     */
    if (this.folderId === null) {
      console.log('model note' + this._id + ': note.folderId is null -> save to root folder');
      this.folderId = await db.getRootFolderId();
    }

    data = this.data;

    /**
     * We need to check either something in DB was updated to manually update dtModify.
     * 1. Get current DB value
     *
     * 2. Make nedb upsert (always returns numAffected and affectedDocuments)
     *
     * 3. If previous value is not equals with affectedDocument, it means that something is changed
     *
     * 4. If something is changed, update dtModify
     */
    let noteStateBeforeSaving = await db.findOne(db.NOTES, query);
    let updateResponse = await db.update(db.NOTES, query, data, options);
    let savedNote = updateResponse.affectedDocuments;

    /**
     * Renew Model id with the actual value
     */
    if (savedNote._id) {
      this._id = savedNote._id;
    }

    let somethingChanged = noteStateBeforeSaving && utils.equals(savedNote, noteStateBeforeSaving);

    if (somethingChanged) {
      /**
       * Update Note's modification time
       */
      let currentTimestamp = Time.now;

      console.log('#######\ncurrentTimestamp',currentTimestamp,'\nfor note', utils.objJSON(this));

      updateResponse = await db.update(db.NOTES, { _id: this._id }, {
        $set: { dtModify: currentTimestamp }
      }, options);

      savedNote = updateResponse.affectedDocuments;

      console.log('now we need to update Folder\'s dtModify for the Note' + this._id, currentTimestamp);

      /**
       * Update Folder's modification time
       */
      await this.updateFolderModifyDate(currentTimestamp + 100);
    }

    this.data = savedNote;

    return this.data;
  }

  /**
   * Update dtModify of parent Folder
   *
   * @param currentTimestamp
   *
   *  @returns {Promise<FolderData>}
   */
  async updateFolderModifyDate(currentTimestamp) {
    /**
     * Create Folder's model
     *
     * @type {Folder}
     */
    let folder = await Folder.get(this.folderId);

    /**
     * Update Folder's timestamp
     */
    folder.dtModify = currentTimestamp;

    /**
     * Try to save Folder
     */
    return await folder.save();
  }

  /**
   * Load current Note's data.
   * @returns {Promise.<*>}
   */
  async get() {
    let noteData = await db.findOne(db.NOTES, {
      '_id': this._id
    });

    if (!noteData) {
      return false;
    } else {
      this.data = noteData;
      return noteData;
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
   * @returns {Promise.<boolean>}
   */
  async delete() {
    return await db.remove(db.NOTES, {'_id': this._id}, {});
  }

}

module.exports = Note;
