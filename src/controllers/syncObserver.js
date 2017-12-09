const Notes = require('../models/notes');
const Directory = require('../models/directory');

module.exports = class SyncObserver {

  /**
   * Initialize params for the API
   */
  constructor() {
    this.folders = new Directory();
    this.notes = new Notes();
  }

  /**
   * Prepare updates for API during synchronization
   * @param {string} dt_sync – last synchronization timestamp
   * @returns {object} {
   *    {object} dt_sync – last synchronization timestamp,
   *    {object} updates {
   *      {string} folders - list of fresh folders,
   *      {object} notes - list of fresh notes
   *    }
   * }
   */
  async prepareUpdates(dt_sync) {
    try {
      let newFolders = await this.folders.getUpdates(dt_sync);
      let newNotes = await this.notes.getUpdates(dt_sync);

      return {
        'dt_sync': dt_sync,
        'updates': {
          'folders': newFolders,
          'notes': newNotes
        }
      };
    } catch (err) {
      console.log('Error during synchronization getUpdates: ', err);
      return false;
    }
  }

  /**
   * Send updates to the API server and receive response with updates
   * @param updates
   * @returns {Promise.<void>}
   */
  async sendUpdates(updates) {
    try {

    }
    catch (err) {
      console.log("Error during synchronization sendUpdates: ", err);
      return false;
    }
  }

  /**
   * Apply update instructions got from API
   * @param reply
   * @returns {Promise.<void>}
   */
  async applyUpdates(reply) {
    try {
      // process folders
      let foldersInstructions = reply.folders;
      let notesInstructions = reply.notes;
      await this.mergeFolders(foldersInstructions);
      await this.mergeNotes(notesInstructions);
    }
    catch (err) {
      console("Error during applyUpdates: ", err);
      return false;
    }
  }

  /**
   * Apply merge instructions for folders
   * @param {object:array} instructions
   * @returns {Promise.<void>}
   */
  async mergeFolders(instructions) {
    try {
      // @TODO: Maybe generate new Timestamps before update?
      instructions.forEach(function (element, index, array) {
        if (element.cmd === 'create') {
          this.folders.insert(element.data);
          console.log("[sync] create folder", element.id);
        }
        if (element['cmd'] === 'remove') {
          this.folders.delete(element.id);
          console.log("[sync] delete folder", element.id);
        }
        if (element['cmd'] === 'update') {
          this.folders.insert(element.data, upsert=true);
          console.log("[sync] change folder", element.id);
        }
      });
    }
    catch (err) {
      console("Error during mergeFolders: ", err);
      return false;
    }
  }

  /**
   * Apply merge instructions for notes
   * @param {object:array} instructions
   * @returns {Promise.<void>}
   */
  async mergeNotes(instructions) {
    try {
      // @TODO: Maybe generate new Timestamps before update?
      instructions.forEach(function (element, index, array) {
        if (element.cmd === 'save') {
          this.notes.save(element.folderId, element.data);
          console.log("[sync] save note", element.id);
        }
        if (element['cmd'] === 'remove') {
          this.notes.delete(element.id);
          console.log("[sync] delete note", element.id);
        }
      });
    }
    catch (err) {
      console("Error during mergeFolders: ", err);
      return false;
    }
  }

  /**
   * Sync changes with API server
   * @param {string} dt_sync – last synchronization timestamp
   */
  async sync(dt_sync) {
    try {
      let updates = await this.prepareUpdates(dt_sync);
      console.log(JSON.stringify(updates));
      // @TODO: Send updates to API server and receive a response
      let reply = await this.sendUpdates(updates);
      // @TODO: Apply updates
      await this.applyUpdates(reply);
    }
    catch (err) {
      console("Error during sync event: ", err);
      return false;
    }
  }

};
