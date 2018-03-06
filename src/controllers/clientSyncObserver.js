'use strict';
let {ipcMain} = require('electron');

/**
 * Client Sync Observer
 *
 * Class in responsible for sending updates to the Client
 */
class ClientSyncObserver {
  constructor(){
  }

  /**
   * Sends updated or added Note to the client
   * @param {Note} note - changed Note
   */
  sendNote(note){
    global.app.mainWindow.webContents.send('note updated', note);
  }

  /**
   * Sends updated or added Folder to the client
   * @param {Folder} folder - changed Folder
   */
  sendFolder(folder){
    global.app.mainWindow.webContents.send('folder updated', folder);
  }
}

module.exports = ClientSyncObserver;