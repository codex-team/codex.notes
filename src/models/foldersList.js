const db = require('../utils/database');
const Folder = require('./folder.js');

/**
 * @typedef {FoldersList} FoldersList
 * @property {Object} query - search query to compose Folders List
 * @type {module.FoldersList}
 */
class FoldersList {

  constructor(query) {
    this.query = query || {
      isRoot: {$ne: true},
      isRemoved: {$ne: true}
    };
  }

  /**
   * Returns Folders list
   *
   * @return {Promise.<Folder[]>}
   */
  async get() {
    let foldersList = await db.find(db.FOLDERS, this.query);

    return foldersList.map( folder => new Folder(folder));
  }
}

module.exports = FoldersList;
