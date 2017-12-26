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
    let foldersList = await db.find(db.DIRECTORY, {_id: { $ne: 0 }});

    let folders = foldersList.map( folder => {
      return new Folder(folder);
    });

    return folders;
  }

};