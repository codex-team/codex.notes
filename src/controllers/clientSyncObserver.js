'use strict';
let {ipcMain} = require('electron');
let db = require('../utils/database');

/**
 * Client Sync Observer
 *
 * Class in responsible for sending updates to the Client
 */
class ClientSyncObserver {
  constructor() {
  }

  /**
   * Sends updated or added Note to the client
   * @param {Note} note - changed Note
   */
  async sendNote(note){
    let rootFolderId = await db.getRootFolderId();
    global.app.mainWindow.webContents.send('note updated', {
      note,
      isRootFolder: note.folderId === rootFolderId
    });
  }

  /**
   * Force open target note
   *
   * @param {Note} note
   */
  openNote(note){
    global.app.mainWindow.webContents.send('open note', {
      note
    });
  }

  /**
   * Sends updated or added Folder to the client
   * @param {Folder} folder - changed Folder
   */
  sendFolder(folder){
    if (!folder.isRoot) {
      global.app.mainWindow.webContents.send('folder updated', folder);
    }
  }

  /**
   * Add collaborator to list
   *
   * @param collaborator
   */
  sendCollaborator(collaborator) {
    global.app.mainWindow.webContents.send('folder - add collaborator', collaborator);
  }

  /**
   * Show update button
   */
  showUpdateButton() {
    global.app.mainWindow.webContents.send('show update button');
  }
}

module.exports = ClientSyncObserver;
