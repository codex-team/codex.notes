'use strict';

const electron = require('electron');
const app = electron.app;

require('dotenv').config();

const BrowserWindow = electron.BrowserWindow;
let pkg = require('./../package.json');


/**
 * Enable Pug
 */
const locals = {title: 'CodeX Notes'};
const pug = require('electron-pug')({pretty:true}, locals);


/**
 * Syncronization controller
 */
const SyncObserver = require('./controllers/syncObserver');

/**
 * Directories controller
 */
const DirectoryControllerClass = require('./controllers/directory');

/**
 * Notes controllers
 */
const NotesControllerClass = require('./controllers/note');

/**
 * Authorization
 */
const AuthControllerClass = require('./controllers/auth');

/**
 * User model
 */
const UserModelClass = require('./models/users');

/**
 * Database setup
 */
const db = require('./utils/database');

db.makeInitialSettings(app.getPath('userData'));

/**
 * All windows is closed
 */
app.on('window-all-closed', function () {
  app.quit();
});

/**
 * @class      CodexNotes
 * @classdesc  Main application class
 *
 * @typedef {CodexNotes} CodexNotes
 * @property {BrowserWindow} mainWindow
 */
class CodexNotes {

  /**
   * Initializes an application
   */
  constructor(){

    this.mainWindow = new BrowserWindow({
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

    /**
     * @todo make crossplaform menu
     */
    if (process.platform === 'darwin') {
      this.makeMenu();
    }

    this.mainWindow.loadURL(`file://${__dirname}/views/editor.pug`);

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    /** Open the DevTools. */
    if (process.env.OPEN_DEV_TOOLS === 'true') {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.on('closed', () => {
      this.destroy();
    });

    /**
     * Init controllers
     */
    this.initComponents();

  }

  /**
   * Activate controller
   */
  initComponents(){
    // this.Directory = new DirectoryClass();
    this.syncObserver = new SyncObserver();
    this.directory = new DirectoryControllerClass();
    this.notes = new NotesControllerClass();
    this.auth = new AuthControllerClass();
    this.user = new UserModelClass();
    this.user.init()
  }


  /**
   * Makes native application menu
   * @author @guryn
   */
  makeMenu() {

    const menu = electron.Menu;

    let createMenuTemplate = require('./menu'),
        menues = createMenuTemplate(app),
        menuBar = menu.buildFromTemplate(menues.menuBar),
        menuDock = menu.buildFromTemplate(menues.menuDock);

    menu.setApplicationMenu(menuBar);
    app.dock.setMenu(menuDock);
  }

  /**
   * Destroyes an application
   */
  destroy(){
    this.mainWindow = null;
  }

}

/**
 * Electron is ready
 */
app.on('ready', function () {
  try {
    new CodexNotes();
  } catch(error){
    console.log(error);
  }
});



