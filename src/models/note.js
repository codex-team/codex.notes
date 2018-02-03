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
    let query = {
          _id : this._id
        },
        data,
        options = {
          returnUpdatedDocs: true
        };

    /**
     * Make Title from the first Text Block in case when it is not presented.
     *
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
     * If Note has no folderId then put it into Root Folder
     */
    if (this.folderId === null) {
        this.folderId = await db.getRootFolderId();
    }

    /**
     * If Note has no _id then we should insert it
     * Runs on creating a new local item
     */
    if (!this._id) {
      /**
       * Set Notes's dates
       */
      this.dtCreate = Time.now;
      this.dtModify = Time.now;

      data = this.data;

      /**
       * Insert a new item to local DB
       *
       * @returns {object._id} - _id for a new item
       */
      let createdNote = await db.insert(db.NOTES, data);

      this._id = createdNote._id;

      /**
       * Update Folder's dtModify
       */
      await this.updateFolderModifyDate(this.dtModify);

      /**
       * Return Note's data
       */
      return this.data;
    }

    /**
     * Try to get item in local DB
     *
     * @returns {object|null}
     */
    let noteFromLocalDB = await db.findOne(db.NOTES, query);

    data = this.data;

    /**
     * If we have no Note in local DB
     * Runs if you have got a new item from Cloud
     */
    if (!noteFromLocalDB) {

      /**
       * Insert a new item to local DB
       *
       * @returns {object._id} - _id for a new item
       */
      let createdNote = await db.insert(db.NOTES, data);

      this._id = createdNote._id;

      /**
       * Update Folder's dtModify
       */
      await this.updateFolderModifyDate(this.dtModify);

      /**
       * Return Note's data
       */
      return this.data;
    }

    /**
     * We need to update Note if new dtModify
     * is greater than item's dtModify from DB
     */
    if (noteFromLocalDB.dtModify < this.dtModify) {
      data = this.data;

      /**
       * We don't need to rewrite an _id field
       */
      delete data._id;

      let updateResponse = await db.update(db.NOTES, query, {$set: data}, options);

      this.data = updateResponse.affectedDocuments;

      /**
       * Update Folder's dtModify
       */
      await this.updateFolderModifyDate(this.dtModify);
    }

    /**
     * Return Note's data
     */
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
   * Get Note by ID
   *
   * @param {String} id
   *
   * @returns {NoteData}
   */
  static async get(id) {
    let noteFromDB = await db.findOne(db.NOTES, {_id: id});

    let note = new Note(noteFromDB);

    return note;
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
