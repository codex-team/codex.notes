'use strict';

let electron = require('electron');

let app = electron.app;
let BrowserWindow = electron.BrowserWindow;

let backend = require('./bin/www');

let mainWindow;

let fs = require('fs');


/**
 * Inter Process Communication - Main proccess
 */
let ipcMain = electron.ipcMain;

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 900,
    minHeight: 600,
    height: 700,
    vibrancy: 'ultra-dark',
    backgroundColor: '#fff',
    titleBarStyle: 'hiddenInset'
  });

  mainWindow.loadURL('http://localhost:3030');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
});

var sanitizeHtml = require('sanitize-html');

/**
 * Notes List module
 */
ipcMain.on('load notes list', (event, arg) => {
  let noteBlanks = fs.readdirSync(__dirname + '/public/notes');
  let notes = noteBlanks.map( note => {
    let content = fs.readFileSync(__dirname + '/public/notes/' + note);
    let json = JSON.parse(content);
    let firstBlock = json.items[0].data.text;

    /**
     * Clean all HTML tags from first block to use it as title
     */
    let title = sanitizeHtml(firstBlock, {allowedTags: []});

    return {
      title,
      id: note.split('.')[0]
    };
  });

  // Event emitter for sending asynchronous messages
  event.sender.send('update notes list', {notes});
});

/**
 * Save note to json file
 */
ipcMain.on('save note', (event, {noteData}) => {
  const NOTES_DIR = __dirname + '/public/notes';

  if (!noteData.items.length && !noteData.id) return;

  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR);
  }

  if (!noteData.id) {
    noteData.id = +new Date();
  }

  fs.writeFileSync(NOTES_DIR + '/' + noteData.id + '.json', JSON.stringify(noteData));

  let note = {
    'title': noteData.items.length ? sanitizeHtml(noteData.items[0].data.text, {allowedTags: []}) : 'Untitled',
    'id': noteData.id
  };

  event.sender.send('note saved', {note});
});
