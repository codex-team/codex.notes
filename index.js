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
  mainWindow.webContents.openDevTools();


});

var sanitizeHtml = require('sanitize-html');

/**
 * Notes List module
 */
ipcMain.on('load notes list', (event, arg) => {

  let noteBlanks = fs.readdirSync(__dirname + '/public/articles');
  let notes = noteBlanks.map( article => {

    let content = fs.readFileSync(__dirname + '/public/articles/' + article);
    let json = JSON.parse(content);
    let firstBlock = json.items[0].data.text;

    /**
     * Clean all HTML tags from first block to use it as title
     */
    let title = sanitizeHtml(firstBlock, {allowedTags: []});

    return {
      title,
      url: article.split('.')[0]
    };

  });

   // Event emitter for sending asynchronous messages
   event.sender.send('update notes list', {notes});
});