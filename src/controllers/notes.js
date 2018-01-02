'use strict';
let {ipcMain} = require('electron');

const Note = require('../models/note');
const Folder = require('../models/folder');

/**
 * Notes controller.
 * Works with events:
 *  - save note
 *  - load notes list (in specified Folder)
 *  - get note
 */
class NotesController {

  /**
   * Setup event handlers
   */
  constructor() {

    ipcMain.on('save note', (event, {note}) => {
      console.log('Controller Notes: save, ', note);
      this.saveNote(note, event);
    });

    // ipcMain.on('load notes list', (event, folderId) => {
    //   this.loadNotesList(folderId, event);
    // });

    // ipcMain.on('get note', (event, {id}) => {
    //   this.getNote(id, event);
    // });

    // ipcMain.on('delete note', (event, {id}) => {
    //   this.deleteNote(id, event);
    // });
  }

  /**
   * Save Note and return result to the event emitter.
   *
   * @param {object} noteData
   * @param {object|null} noteData.folderId      - in which Folder Note was created. Null for the Root Folder.
   * @param {string} noteData.title              - Note's title
   * @param {object} noteData.data               - Note data got from the CodeX Editor
   * @param {string|null} noteData.data.id       - On editing, stores Note's id
   * @param {string} noteData.data.items         - Note's content
   * @param {number} noteData.data.time          - Note's saving time
   * @param {string} noteData.data.version       - used CodeX Editor version
   *
   * @param {GlobalEvent} event - {@link https://electronjs.org/docs/api/ipc-main#event-object}
   *
   * Send 'note saved' action to the event emitter with the following message.
   * {
   *   id - unique note ID
   *   title - note title
   *   folderId - Folder ID
   * }
   * @returns {Promise.<void>}
   */
  async saveNote(noteData, event) {
    try {
      let note = new Note({
        title: noteData.title,
        editorVersion: noteData.data.version,
        dtModify: +new Date(),
        authorId: global.user ? global.user.id : null,
        folderId: noteData.folderId,
        content: noteData.data.items,
        _id: noteData.data.id || null,
      });
      let newNote = await note.save();

      console.log('Note saving result: ', newNote);

      if (newNote) {
        event.sender.send('note saved', {
          note: newNote
        });
      }
    } catch (err) {
      console.log('Note saving failed because of ', err);
    }
  }

  /**
   * Load notes from Folder with an ID specified.
   * Send 'update notes list' action to the event emitter with the following structure. This structure also will be
   * returned to the event emitter as the result.
   * {
   *   notes: [{
   *     id - note ID
   *     title - note title
   *     folderId - Folder ID
   *   }],
   *   folder: {
   *     name - Folder visible name
   *     id - folder ID
   *     notes - [] - array of notes (TODO: it is not needed)
   * }
   * @param folderId - folder ID
   * @param event
   * @returns {Promise.<boolean>}
   */
  async loadNotesList(folderId, event) {
    try {

      let folderModel = new Folder();
      let folder = await folderModel.get(folderId);
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

  /**
   * Updates Notes data in the DB and sends new state to the Client
   * @param {NoteData[]} notes - new Notes's list
   * @return {Promise<void>}
   */
  async renew(notes){
    // await folders.forEach( async folderData => {
    //
    //   let folder = new Folder(folderData);
    //   let updatedFolder = await folder.save();
    //
    //   console.log('updatedFolder: ', updatedFolder);
    // });
  }
}

module.exports = NotesController;