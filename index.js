'use strict';

const electron = require('electron');
const app = electron.app;
const locals = {title: 'CodeX Notes'};
require('dotenv').config();

const pug = require('electron-pug')({pretty:true}, locals);
const BrowserWindow = electron.BrowserWindow;
let pkg = require('./package.json');

const DirectoryClass = require('./models/directory');
const UsersClass = require('./models/users');
const DirectoryControllerClass = require('./controllers/directory');
const NotesControllerClass = require('./controllers/note');


const db = require('./utils/database');

db.makeInitialSettings(app.getPath('userData'));
let Directory = new DirectoryClass();
let Users = new UsersClass();

Users.register().then(function() {

  let directoryCtrl = new DirectoryControllerClass();
  let notesCtrl = new NotesControllerClass();

}).catch(function (err) {
  console.log("Initialization error", err);
});


let mainWindow = null;

app.on('window-all-closed', function () {
  app.quit();
});

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    title: pkg.productName,
    icon: __dirname + '/' + pkg.productIconPNG,
    width: 1200,
    minWidth: 1070,
    minHeight: 600,
    height: 700,
    vibrancy: 'ultra-dark',
    backgroundColor: '#fff',
    titleBarStyle: 'hiddenInset',
    show: false
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

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  /** Open the DevTools. */
  if (process.env.OPEN_DEV_TOOLS == 'true') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

});
