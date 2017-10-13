'use strict';
let {ipcMain} = require('electron');

const Notes = require('../models/notes');
const Directory = require('../models/directory');

class NoteController {

  constructor(db, user) {
    this.db = db;
    this.user = user;
    let notes = new Notes(db, user);
    this.directory = new Directory(db, user);

    ipcMain.on('save note', (event, {note}) => {
      this.saveNote(notes, note, event);
    });

    ipcMain.on('load notes list', (event, folderId) => {
      this.loadNotesList(notes, folderId, event);
    });

    ipcMain.on('get note', (event, {id, folder}) => {
      this.getNote(notes, id, event);
    });
  }

  async saveNote(notes, note, event) {
    try {
      let folderId = note.folderId;
      let newNote = await notes.save(folderId, note);
      if (newNote) {
        event.sender.send('note saved', {note: newNote});
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  async loadNotesList(notes, folderId, event) {
    try {
      let folder = await this.directory.get(folderId);
      let notesList = await notes.list(folderId);

      let returnValue = {'notes': notesList, 'folder': folder};
      event.returnValue = returnValue;
      event.sender.send('update notes list', returnValue);
    }
    catch (err) {
      console.log("Load notes list error: ", err);
      return false;
    }
  }

  async getNote(notes, noteId, event) {
    try {
      let note = await notes.get(noteId);
      if (!note) {
        return false;
      }

      event.returnValue = note;
    }
    catch (err) {
      console.log(err);
    }
  }

}

module.exports = NoteController;