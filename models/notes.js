'use strict';

const auth = require('../api/auth');
const API = require('../api/call');

class NotesModel {

  constructor(db, user) {
    this.db = db;
    this.api = new API(db);
    this.user = user;
  }

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

      console.log(directoryId, result);

      if (result) {
        return {
          id: note.data.id,
          title: note.title,
          folderId: directoryId
        }
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