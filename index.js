'use strict';

const electron = require('electron');
const app = electron.app;
const locals = {title: 'CodeX Notes'};
const pug = require('electron-pug')({pretty:true}, locals);
const BrowserWindow = electron.BrowserWindow;

const DatabaseClass = require('./api/database');
const UserClass = require('./models/user');
const DirectoryClass = require('./models/directory');
const DirectoryControllerClass = require('./controllers/directory');
const NotesControllerClass = require('./controllers/note');

let DB = new DatabaseClass(app.getPath('userData'));
let User = new UserClass(DB);
let Directory = new DirectoryClass(DB);

let directoryCtrl = new DirectoryControllerClass(DB, User);
let notesCtrl = new NotesControllerClass(DB, User);

let mainWindow = null;

User.register().then((result) => {global.sharedObj = {user: result};}).catch((err) => {console.log(err)});

app.on('window-all-closed', function () {
  app.quit();
});

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 1070,
    minHeight: 600,
    height: 700,
    vibrancy: 'ultra-dark',
    backgroundColor: '#fff',
    titleBarStyle: 'hiddenInset'
  });

  if (process.platform === 'darwin') {
    const { Menu } = require('electron');

    let createMenuTemplate = require('./menu'),
        menues = createMenuTemplate(app),
        menuBar = Menu.buildFromTemplate(menues.menuBar),
        menuDock = Menu.buildFromTemplate(menues.menuDock);


    Menu.setApplicationMenu(menuBar);

    app.dock.setMenu(menuDock);
  }

  mainWindow.loadURL('file://' + __dirname + '/views/editor.pug');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

});