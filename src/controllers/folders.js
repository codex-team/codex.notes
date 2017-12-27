'use strict';
let {ipcMain} = require('electron');

const Folder = require('../models/folder');
const FoldersList = require('../models/foldersList');



/**
 * Folders controller.
 * Works with events:
 *  - create folder
 *  - load folders list
 *  - delete folder
 */
class FoldersController {

  /**
   * Setup event handlers
   */
  constructor() {

    ipcMain.on('folder - create', (event, folderName) => {
      this.createFolder(event, folderName);
    });

    ipcMain.on('folders list - load', (event) => {
      this.loadFolders(event);
    });

    ipcMain.on('folder - delete', (event, folderId) => {
      this.deleteFolder(event, folderId);
    });

    ipcMain.on('folder - change name', (event, {id, name}) => {
      this.changeName(event, id, name);
    });

    // ipcMain.on('folder - collaborator add', (event, {id, email}) => {
    //   this.addMember(event, id, email);
    // });
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
      console.log('Folders list loading failed because of', err);
    }
  }

  /**
   * Saves new Folder
   *
   * @param {GlobalEvent} event
   * @param {String} folderName - new folder name
   *
   * @return {{id: string, title: string, notes: []}}
   */
  async createFolder(event, folderName) {
    try {
      let folder = new Folder({
        title: folderName,
        dtModify: +new Date(),
        ownerId: global.user ? global.user.id : null
      });

      let savedFolder = await folder.save();

      event.returnValue = {
        'id': savedFolder._id,
        'title': savedFolder.title,
        'notes': savedFolder.notes
      };

    } catch (err) {
      console.log('Folder addition failed because of ', err);
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

      let folder = new Folder({
        id: folderId,
        ownerId: global.user ? global.user.id : null
      });

      let folderRemovingResult = await folder.delete();

      event.returnValue = !!folderRemovingResult;
    } catch (err) {
      console.log('Folder removing failed because of',  err);
      event.returnValue = false;
    }
  }

  /**
   * Change Folder's name
   * @param {GlobalEvent} event - {@link https://electronjs.org/docs/api/ipc-main#event-object}
   * @param {String} id   - Folder's id
   * @param {string} title - new title
   */
  async changeName(event, id, title) {
    try {
      let folder = new Folder({
        id,
        ownerId: global.user ? global.user.id : null,
        title: title
      });
      event.returnValue = await folder.save();
    } catch (err) {
      console.log('Folder renaming failed because of', err);
      event.returnValue = false;
    }
  }

  /**
   * Add new member to the folder as a collaborator
   * @param {Event} event - see {@link https://electronjs.org/docs/api/ipc-main#event-object}
   * @param {String} id  - folder id
   * @param {string} email - invited user
   */
  async addMember(event, id, email) {
    try {
      event.returnValue = await this.folder.addMember(id, email);
    } catch (err) {
      console.log(err);
      event.returnValue = false;
    }
  }

  /**
   * Updates Folders data in the DB and sends new state to the Client
   * @param {FolderData[]} folders - new Folder's list
   * @return {Promise<void>}
   */
  async renew(folders){
    await folders.forEach( async folderData => {
      console.log('\n\nStart syncing folder' , folderData);

      let folder = new Folder(folderData);
      let updatedFolder = await folder.save();

      console.log('updatedFolder: ', updatedFolder);
    });

  }
}

module.exports = FoldersController;
