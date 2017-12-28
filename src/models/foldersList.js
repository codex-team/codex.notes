const db = require('../utils/database');
const Folder = require('./folder.js');

module.exports = class FoldersList {

  constructor(){
  }

  /**
   * Returns Folders list
   *
   * @return {Promise.<Folder[]>}
   */
  async get() {
    let foldersList = await db.find(db.FOLDERS, {_id: { $ne: 0 }});

    return foldersList.map( folder => new Folder(folder));
  }

};