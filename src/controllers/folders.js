/**
 * Folders controller.
 * Works with events:
 *  - create folder
 *  - load folders list
 *  - delete folder
 */
'use strict';
let {ipcMain} = require('electron');

const Folder = require('../models/folder');
const FoldersList = require('../models/foldersList');

/**
 * Time helper
 */
const Time = require('../utils/time.js');

class FoldersController {

  /**
   * Setup event handlers
   */
  constructor() {
    ipcMain.on('folder - get', (event, folderId) => {
      this.getFolderData(event, folderId);
    });

    ipcMain.on('folder - create', (event, folderTitle) => {
      this.createFolder(event, folderTitle);
    });

    ipcMain.on('folders list - load', (event) => {
      this.loadFolders(event);
    });

    ipcMain.on('folder - delete', (event, folderId) => {
      this.deleteFolder(event, folderId);
    });

    ipcMain.on('folder - change title', (event, {id, title}) => {
      this.changeTitle(event, id, title);
    });

    ipcMain.on('folder - collaborator add', (event, {id, email}) => {
      this.addCollaborator(event, id, email);
    });

    ipcMain.on('folder - get collaborators', (event, {folder}) => {
      this.getCollaborators(event, folder);
    });
  }

  /**
   * Load Folder data
   * @param {GlobalEvent} event
   * @param {string} folderId
   * @return {Promise<void>}
   */
  async getFolderData(event, folderId) {
    try {
      event.returnValue = await Folder.get(folderId);
    } catch (err) {
      global.logger.debug('Cannot load Folder data because of: ', err);
      event.returnValue = false;
    }
  }

  /**
   * Load list of Folders.
   *
   * @param {GlobalEvent} event
   * @return {void}
   */
  async loadFolders(event) {
    try {
      let list = new FoldersList();
      let userFolders = await list.get();

      event.sender.send('update folders list', {userFolders});
    } catch (err) {
      global.logger.debug('Folders list loading failed because of ', err);
    }
  }

  /**
   * Saves new Folder
   *
   * @param {GlobalEvent} event
   * @param {String} folderTitle - new Folder's title
   *
   * @return {{id: string, title: string, notes: []}}
   */
  async createFolder(event, folderTitle) {
    try {
      let folder = new Folder({
        title: folderTitle,
        ownerId: global.user && global.user.token ? global.user.id : null
      });

      let savedFolder = await folder.save();

      /**
       * Sync with an API
       */
      global.app.cloudSyncObserver.sync();

      event.returnValue = savedFolder;
    } catch (err) {
      global.logger.debug('Folder addition failed because of ', err);
    }
  }

  /**
   * Delete Folder
   *
   * @param {GlobalEvent} event
   * @param {String} folderId
   * @return {Boolean}
   */
  async deleteFolder(event, folderId) {
    try {
      let folder = await Folder.get(folderId);

      let folderRemovingResult = await folder.delete();

      global.app.cloudSyncObserver.sync();

      event.returnValue = !!folderRemovingResult.isRemoved;
    } catch (err) {
      global.logger.debug('Folder removing failed because of ',  err);
      event.returnValue = false;
    }
  }

  /**
   * Change Folder's title
   * @param {GlobalEvent} event - {@link https://electronjs.org/docs/api/ipc-main#event-object}
   * @param {String} id         - Folder's id
   * @param {string} title      - new title
   */
  async changeTitle(event, id, title) {
    try {
      let folder = await Folder.get(id);

      folder.title = title;
      folder.dtModify = Time.now;

      event.returnValue = await folder.save();

      /**
       * Sync with an API
       */
      global.app.cloudSyncObserver.sync();
    } catch (err) {
      global.logger.debug('Folder renaming failed because of ', err);
      event.returnValue = false;
    }
  }

  /**
   * Add a new Collaborator to the Folder
   * @param {GlobalEvent} event   - {@link https://electronjs.org/docs/api/ipc-main#event-object}
   * @param {String} id           - Folder's id
   * @param {string} email        - invited User's email
   */
  async addCollaborator(event, id, email) {
    try {
      let folder = new Folder({
        _id: id,
        ownerId: global.user ? global.user.id : null,
      });

      event.returnValue = await folder.addCollaborator(email);
    } catch (err) {
      global.logger.debug('Collaborator invitation failed because of ', err);
      event.returnValue = {
        success: false,
        message: err.message
      };
    }
  }

  /**
   * Get Collaborator's list for current Folder
   *
   * @param {GlobalEvent} event - {@link https://electronjs.org/docs/api/ipc-main#event-object}
   * @param {String} id         - current Folder's id
   */
  async getCollaborators(event, id) {
    try {
      let folder = new Folder({
        _id: id,
        ownerId: global.user ? global.user.id : null
      });

      let collaborators = await folder.getCollaborators();

      event.sender.send('folder - collaborators list', {collaborators});
    } catch (err) {
      global.logger.debug('Collaborators list loading failed because of ', err);
    }
  }

  /**
   * Updates Folders data in the DB and sends new state to the Client
   * @param {FolderData[]} folders - new Folder's list
   * @return {Promise<void>}
   */
  // static async renew(folders) {
  //   try {
  //     // await folders.forEach(async folderData => {
  //     //   try {
  //     //     let folder = new Folder(folderData);
  //     //     await folder.save();
  //     //   } catch (error) {
  //     //     global.logger.debug('Folder saving error:', error);
  //     //   }
  //     // });
  //
  //     let list = new FoldersList();
  //     let userFolders = await list.get();
  //
  //     global.app.mainWindow.webContents.send('update folders list', {userFolders});
  //   } catch (err){
  //     global.logger.debug('Can not renew Folder because of:', err);
  //   }
  // }
}

module.exports = FoldersController;
