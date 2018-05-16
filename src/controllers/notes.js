'use strict';
let {ipcMain} = require('electron');

const Note = require('../models/note');
const NotesList = require('../models/notesList');

/**
 * Time helper
 */
const Time = require('../utils/time.js');

/**
 * Notes controller.
 * Works with events:
 *  - note - save
 *  - notes list - load (in specified Folder)
 *  - note - get
 */
class NotesController {

  /**
   * Setup event handlers
   */
  constructor() {
    ipcMain.on('note - save', (event, {note}) => {
      this.saveNote(note, event);
    });

    ipcMain.on('notes list - load', (event, folderId) => {
      this.loadNotesList(folderId, event);
    });

    ipcMain.on('note - get', (event, {id}) => {
      this.getNote(id, event);
    });

    ipcMain.on('note - delete', (event, {id}) => {
      this.deleteNote(id, event);
    });

    ipcMain.on('notes - get unread states', async (event, {noteIds}) => {
      this.getNotesUnreadState(event, noteIds);
    })
  }

  /**
   * Save Note and return result to the event emitter.
   *
   * @typedef {object} SavingNoteData
   * @property {object|null} folderId      - in which Folder Note was created. Null for the Root Folder.
   * @property {string} title              - Note's title
   * @property {object} data               - Note data got from the CodeX Editor
   * @property {string|null} data.id       - On editing, stores Note's id
   * @property {string} data.items         - Note's content
   * @property {number} data.time          - Note's saving time
   * @property {string} data.version       - used CodeX Editor version
   *
   * @param {SavingNoteData} noteData - Note's data from the Client
   * @param {GlobalEvent} event       - {@link https://electronjs.org/docs/api/ipc-main#event-object}
   *
   * Send 'note saved' action to the event emitter with the saved Note data.
   * @returns {Promise.<void>}
   */
  async saveNote(noteData, event) {
    try {
      let note = new Note({
        _id: noteData.data.id || null,
        title: noteData.title,
        content: noteData.data.content,
        editorVersion: noteData.data.version,
        authorId: global.user && global.user.token ? global.user.id : null,
        folderId: noteData.folderId,
      });

      note.dtModify = Time.now;

      // mark edited Note as seen
      global.app.seenStateObserver.touch(noteData.data.id);

      let newNoteResponse = await note.save();
      let newNote = newNoteResponse.data;

      await global.app.syncQueue.add( {
        type : Note.syncableType,
        entityId : note._id
      });

      global.app.cloudSyncObserver.sync();

      event.sender.send('note saved', {
        note: newNote,
        isRootFolder: !noteData.folderId
      });

      // mark edited Note as seen
      global.app.seenStateObserver.touch(noteData.data.id);

    } catch (err) {
      global.logger.debug('Note saving failed because of ', err);
      global.catchException(err);
    }
  }

  /**
   * Load Notes from Folder with the specified id.
   * Send 'notes list - update' action to the event emitter with Notes list.
   *
   * @param {string} folderId - Folder's id
   * @param {GlobalEvent} event
   * @returns {Promise.<Object|boolean>}
   */
  async loadNotesList(folderId, event) {
    try {
      let list = new NotesList(folderId);
      let notesInFolder = await list.get();

      let returnValue = {
        notes: notesInFolder,
        isRootFolder: !folderId
      };

      event.returnValue = returnValue;

      event.sender.send('notes list - update', returnValue);
    } catch (err) {
      global.logger.debug('Notes list loading failed because of ', err);
      global.catchException(err);
      event.returnValue = false;

    }
  }

  /**
   * Get Note with the ID specified
   * @param {string} noteId  - Note's id
   * @param {GlobalEvent} event
   * @returns {Promise.<boolean>}
   */
  async getNote(noteId, event) {
    try {
      let note = await Note.get(noteId);

      // set note as visited
      global.app.seenStateObserver.touch(noteId);

      event.returnValue = note;
    } catch (err) {
      global.logger.debug('Note\'s data loading failed because of', err);
      global.catchException(err);
      event.returnValue = false;
    }
  }

  /**
   * Delete Note with specified ID
   *
   * @param {string} noteId
   * @param {GlobalEvent} event
   *
   * @returns {Promise.<boolean>}
   */
  async deleteNote(noteId, event) {
    try {
      let note = await Note.get(noteId);

      let noteRemovingResult = await note.delete();

      await global.app.syncQueue.add( {
        type : Note.syncableType,
        entityId : noteRemovingResult._id
      });

      global.app.cloudSyncObserver.sync();

      event.returnValue = !!noteRemovingResult.isRemoved;
    } catch (err) {
      global.logger.debug('Note failed because of', err);
      global.catchException(err);
      event.returnValue = false;
    }
  }

  /**
   * Get's information about seen-state of passed notes and emits the event
   * @param {ipcRenderer.Event} event - "notes - get visit time" event from client side
   * @param {Array} noteIds - list of note ids
   * @return {Promise.<void>}
   */
  async getNotesUnreadState(event, noteIds) {
    try {
      let unreadStates = await global.app.seenStateObserver.getNotesUndreadState(noteIds);

      event.sender.send('notes - set unread state', unreadStates);
    } catch (err){
      global.logger.debug('Cannot collect notes visit time:', err);
      global.catchException(err);
    }
  }
}

module.exports = NotesController;
