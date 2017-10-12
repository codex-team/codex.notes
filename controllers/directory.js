'use strict';
let {ipcMain} = require('electron');

const Directory = require('../models/directory');

class DirectoryController {

  constructor(db, user) {
    this.db = db;
    this.user = user;
    let directory = new Directory(db, user);
    let self = this;

    ipcMain.on('create folder', function (event, folderName) {
      self.createFolder(directory, event, folderName);
    });

    ipcMain.on('load folders list', function (event) {
      self.loadFolders(directory, event);
    });

    ipcMain.on('delete folder', function (event, folderId) {
      self.deleteFolder(directory, event, folderId);
    });
  }

  async loadFolders(directory, event) {
    try {
      let userFolders = await directory.list();
      event.sender.send('update folders list', {userFolders}); // name userFolders matters
    }
    catch (err) {
      console.log(err);
    }
  }

  async createFolder(directory, event, folderName) {
    try {
      let dir = await directory.create(folderName);
      event.returnValue = {
        'id': dir._id,
        'name': dir.name,
        'notes': dir.notes
      };
    }
    catch (err) {
      console.log(err);
    }
  }

  async deleteFolder(directory, event, folderId) {
    try {
      // delete notes from folder
      await directory.remove(folderId);
      event.returnValue = true;
    }
    catch (err) {
      console.log(err);
      event.returnValue = false;
    }
  }

}

module.exports = DirectoryController;