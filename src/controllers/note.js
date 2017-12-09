'use strict';
let {ipcMain} = require('electron');

const Notes = require('../models/notes');
const Directory = require('../models/directory');

/**
 * Note controller.
 * Works with events:
 *  - save note
 *  - load notes list (in specified directory)
 *  - get note
 */
class NoteController {

  /**
   * Setup event handlers
   */
  constructor() {
    this.notes = new Notes();
    this.directory = new Directory();

    ipcMain.on('save note', (event, {note}) => {
      this.saveNote(note, event);
    });

    ipcMain.on('load notes list', (event, folderId) => {
      this.loadNotesList(folderId, event);
    });

    ipcMain.on('get note', (event, {id}) => {
      this.getNote(id, event);
    });

    ipcMain.on('delete note', (event, {id}) => {
      this.deleteNote(id, event);
    });
  }

  /**
   * Save note and return result to the event emitter.
   * @param note - note structure in the following format:
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
   *
   * Send 'note saved' action to the event emitter with the following message.
   * {
   *   id - unique note ID
   *   title - note title
   *   folderId - directory ID
   * }
   * @param event
   * @returns {Promise.<void>}
   */
  async saveNote(note, event) {
    try {
      let folderId = note.folderId;
      let newNote = await this.notes.save(folderId, note);

      if (newNote) {
        event.sender.send('note saved', {note: newNote});
      }
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Load notes from directory with an ID specified.
   * Send 'update notes list' action to the event emitter with the following structure. This structure also will be
   * returned to the event emitter as the result.
   * {
   *   notes: [{
   *     id - note ID
   *     title - note title
   *     folderId - directory ID
   *   }],
   *   folder: {
   *     name - forder visible name
   *     id - folder ID
   *     notes - [] - array of notes (TODO: it is not needed)
   * }
   * @param folderId - folder ID
   * @param event
   * @returns {Promise.<boolean>}
   */
  async loadNotesList(folderId, event) {
    try {
      let folder = await this.directory.get(folderId);
      let notesList = await this.notes.list(folderId);

      let returnValue = {'notes': notesList, 'folder': folder};

      event.returnValue = returnValue;
      event.sender.send('update notes list', returnValue);
    } catch (err) {
      console.log('Load notes list error: ', err);
      event.returnValue = false;
    }
  }

  /**
   * Get note with the ID specified. Return the following message to the event emitter:
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
   * @param noteId
   * @param event
   * @returns {Promise.<boolean>}
   */
  async getNote(noteId, event) {
    try {
      let note = await this.notes.get(noteId);

      if (!note) {
        return false;
      }
      event.returnValue = note;
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Delete note with specified ID. Return boolean result.
   * @param noteId
   * @param event
   * @returns {Promise.<boolean>}
   */
  async deleteNote(noteId, event) {
    try {
      let result = await this.notes.delete(noteId);

      event.returnValue = true;
    } catch (err) {
      console.log(err);
      event.returnValue = false;
    }
  }

}

module.exports = NoteController;
