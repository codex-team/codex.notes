'use strict';

let electron = require('electron');

let app = electron.app;
let locals = {title: 'CodeX Notes'};
let pug = require('electron-pug')({pretty:true}, locals);
let BrowserWindow = electron.BrowserWindow;

let mainWindow = null;

app.on('window-all-closed', function () {
  app.quit();
});

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

  mainWindow.loadURL('file://' + __dirname + '/views/editor.pug');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
});

let notesCtrl = require('./controllers/notes');

