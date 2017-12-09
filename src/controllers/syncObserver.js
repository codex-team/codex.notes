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
   * @param last_sync
   * @returns ( last_sync – last sync timestamp,
   *    updates - {
   *      folders - list of fresh folders,
   *      notes - list of fresh notes
   *    }
   * )
   */
  async prepareUpdates(last_sync) {
    try {
      let newFolders = await this.folders.getUpdates(last_sync);
      let newNotes = await this.notes.getUpdates(last_sync);
      return {
        'timestamp': last_sync,
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

  async sync(last_sync) {
    let updates = await this.prepareUpdates(last_sync);
    console.log(JSON.stringify(updates));
  }

};