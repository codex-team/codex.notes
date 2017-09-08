let fs = require('fs');
let {ipcMain} = require('electron');

const NOTES_DIR = __dirname + '/../data/notes';
const FOLDERS_FILE = __dirname + '/../data/folders.json';

if (!fs.existsSync(FOLDERS_FILE)) {
  fs.writeFileSync(FOLDERS_FILE, JSON.stringify({
    0: {
      name: "root",
      notes: {}
    }}));
}

ipcMain.on('create folder', function (event, folderName) {
  'use strict';

  let folderId = + new Date();

  let folders = fs.readFileSync(FOLDERS_FILE);

  folders = JSON.parse(folders);

  folders[folderId] = {
    name: folderName,
    id: folderId,
    notes: {}
  };

  fs.writeFileSync(FOLDERS_FILE, JSON.stringify(folders));

  event.returnValue = folders[folderId];
});

ipcMain.on('delete folder', function (event, folder) {
  'use strict';

  fs.rmdirSync(NOTES_DIR + '/' + folder);

  event.returnValue = true;
});

ipcMain.on('load folders list', function (event) {
  'use strict';
  let folders = fs.readFileSync(FOLDERS_FILE);

  folders = JSON.parse(folders);

  let userFolders = [];

  for (let folderId in folders) {
    if (folderId == 0) continue;

    userFolders.push({
      name: folders[folderId].name,
      id: folderId
    });
  }

  event.sender.send('update folders list', {userFolders});
});