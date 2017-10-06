'use strict';

let fs = require('fs');
let {ipcMain} = require('electron');
let {dialog} = require('electron');
let sanitizeHtml = require('sanitize-html');
let electron = require('electron');


const NOTES_DIR = __dirname + '/../data/notes';
const FOLDERS_FILE = __dirname + '/../data/folders.json';
const DEFAULT_TITLE = 'Untitled';

if (!fs.existsSync(__dirname + '/../data')) {
  fs.mkdirSync(__dirname + '/../data');
}

if (!fs.existsSync(NOTES_DIR)) {
  fs.mkdirSync(NOTES_DIR);
}

/**
 * Load notes list
 * Can be called synchronously or async-aware
 * @param  {Number} folderId
 */
ipcMain.on('load notes list', (event, folderId) => {
  let folders = fs.readFileSync(FOLDERS_FILE);

  folders = JSON.parse(folders);

  console.assert(folders[folderId], 'Folder not found by id: ' + folderId);

  let folder = folders[folderId];
  let notes = [];

  for (let noteId in folder.notes) {
    notes.push({
      title: folder.notes[noteId].title,
      id: noteId,
      folderId: folderId
    });
  }

  /**
   * Dont dublicate notes field (folder.notes and notes)
   */
  delete folder.notes;

  let returnValue = {notes, folder};
  event.returnValue = returnValue;
  event.sender.send('update notes list', returnValue);

});

/**
 * Save note to json file
 */
ipcMain.on('save note', (event, {note}) => {
  if (!note.data.items.length && !note.data.id) return;

  let folders = fs.readFileSync(FOLDERS_FILE);

  folders = JSON.parse(folders);

  if (!note.data.id) {
    note.data.id = +new Date();
  }

  fs.writeFileSync(NOTES_DIR + '/' + note.data.id + '.json', JSON.stringify(note));

  let titleFromText = !!note.data.items.length ? note.data.items[0].data.text : DEFAULT_TITLE;
  let title = note.title ? note.title : false;

  if (!title) {
    title = sanitizeHtml(titleFromText, {allowedTags: []});
  }

  let folderId = note.folderId || 0;

  if (!folders[folderId]) {
    console.log('Folder not found by id', folderId);
  }

  folders[folderId].notes[note.data.id] = {
    title: title,
    id: note.data.id
  };

  fs.writeFileSync(FOLDERS_FILE, JSON.stringify(folders));

  let newNote = {
    title: title,
    folderId: folderId,
    id: note.data.id
  };

  event.sender.send('note saved', {note: newNote});
});

/**
 * Return note data by id
 * @param {object}
 * @param {number} options.id
 */
ipcMain.on('get note', (event, {id, folder}) => {
  let path = NOTES_DIR;

  if (folder) {
    path += '/' + folder;
  }

  let noteFileData = fs.readFileSync(path + '/' + id + '.json');
  event.returnValue = JSON.parse(noteFileData);
});

/**
 * Delete note
 */
ipcMain.on('delete note', (event, {id, folderId}) => {
  let path = NOTES_DIR;

  path = NOTES_DIR + '/' + id + '.json';

  dialog.showMessageBox({
    type: 'question',
    message: 'Do you really want to remove this note?',
    buttons: ['Delete', 'Cancel'],
    icon: __dirname + '/../assets/icons/png/icon-white128.png',
  }, (response) => {
    if (response === 0) {
      if (fs.existsSync(path)) {
        let folders = fs.readFileSync(FOLDERS_FILE);

        folders = JSON.parse(folders);

        delete folders[folderId || 0].notes[id];

        fs.writeFileSync(FOLDERS_FILE, JSON.stringify(folders));

        fs.unlinkSync(path);
      }
    }
    event.returnValue = !response;
  });
});