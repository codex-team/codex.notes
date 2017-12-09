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
    }
    catch (err) {
      console.log("Error during synchronization getUpdates: ", err);
      return false;
    }
  }

  /**
   * Sync changes with API server
   * @param {string} dt_sync – last synchronization timestamp
   */
  async sync(dt_sync) {
    let updates = await this.prepareUpdates(dt_sync);
    console.log(JSON.stringify(updates));
    // @TODO: Send updates to API server
    // @TODO: Receive updates from API server
    // @TODO: Apply updates
  }

};