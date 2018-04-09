'use strict';

const electron = require('electron');
const app = electron.app;

require('../env.js');

/**
 * Enable errors handling
 * @type {hawkCatcher}
 */
if (process.env.HAWK_TOKEN) {
  let hawkCatcher = require('@codexteam/hawk.nodejs')({
    accessToken: process.env.HAWK_TOKEN
  });

  hawkCatcher.initGlobalCatcher();
}

/**
 * Enable logger
 * @example global.logger.info('Hey yo');
 */
global.logger = require('./utils/logger');
global.logger.setLevel(process.env.LOG_LEVEL || 'debug');

const BrowserWindow = electron.BrowserWindow;
let pkg = require('./../package.json');

/**
 * Enable Pug
 */
const locals = {
  title: 'CodeX Notes',
};
const pug = require('electron-pug')({
  cache: false,
  // debug: true,
  // compileDebug: true
}, locals);

/**
 * Cloud-Synchronization controller
 */
const CloudSyncObserver = require('./controllers/cloudSyncObserver');

/**
 * Client-Synchronization controller
 */
const ClientSyncObserver = require('./controllers/clientSyncObserver');

/**
 * Folders controller
 */
const FoldersController = require('./controllers/folders');

/**
 * Notes controllers
 */
const NotesController = require('./controllers/notes');

/**
 * Authorization
 */
const AuthController = require('./controllers/auth');

/**
 * User Controller
 */
const UserController = require('./controllers/user');

/**
 * AppProtocol Controller
 */
const AppProtocol = require('./controllers/app-protocol');

/**
 * Note unread (unseed) state observer
 */
const SeenStateObserver = require('./controllers/SeenStateObserver');

/**
 * User model
 */
const User = require('./models/user');

/**
 * Sockets Controller
 */
const SocketsController = require('./controllers/sockets');

/**
 * PushNotification Controller
 */
const PushNotifications = require('./controllers/pushNotifications');

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
  constructor() {
    /**
     * Web links with codex:// protocol will be handled by application
     * @type {string}
     */
    this.appProtocol = 'codex';

    let windowParams = {
      title: pkg.productName,
      icon: __dirname + '/' + pkg.productIconPNG,
      width: 1200,
      minWidth: 1070,
      minHeight: 600,
      height: 700,
      // vibrancy: 'ultra-dark',
      backgroundColor: '#fff',
      titleBarStyle: 'hiddenInset',
      show: false
    };

    /**
     * Show small half screen window for debugging
     */
    if (process.env.DEBUG === 'true') {
      windowParams.x = 10;
      windowParams.y = 50;
      windowParams.width = 740;
      windowParams.minWidth = 600;
    }

    this.mainWindow = new BrowserWindow(windowParams);

    /**
     * @todo make crossplaform menu
     */
    if (process.platform === 'darwin') {
      this.makeMenu();
    }

    this.mainWindow.loadURL('file://' + __dirname + '/views/editor.pug');

    this.mainWindow.once('ready-to-show', () => {
      global.logger.debug('\nMain Window is ready to show. Let\'s go \n');
      this.mainWindow.show();
    });

    /** Open the DevTools. */
    if (process.env.DEBUG === 'true') {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.on('closed', () => {
      this.destroy();
    });

    /**
     * Init controllers
     */
    this.initComponents()

    /**
     * Set application protocol
     */
      .then(() => {
        this.setAppProtocol();
      })
      .catch((e) => {
        global.logger.debug('App initialization failed because of ', e);
      });
  }

  /**
   * Activate controller
   */
  initComponents() {
    this.user = new User();

    return this.user.init()
      .then(() => {
        global.logger.debug('Current user data is: ', this.user);

        /**
         * @type {User}
         */
        global.user = this.user;
        this.folders = new FoldersController();
        this.notes = new NotesController();
        this.userCtrl = new UserController();

        /**
         * @type {Sockets}
         */
        this.sockets = new SocketsController();

        this.auth = new AuthController();

        /**
         * @type {CloudSyncObserver}
         */
        this.cloudSyncObserver = new CloudSyncObserver();

        /**
         * @type {ClientSyncObserver}
         */
        this.clientSyncObserver = new ClientSyncObserver();

        /**
         * @type {SeenStateObserver}
         */
        this.seenStateObserver = new SeenStateObserver();

        /**
         * @type {Sockets}
         */
        this.sockets = new SocketsController();

        /**
         * @type {PushNotifications}
         */
        this.pushNotifications = new PushNotifications();
        this.pushNotifications.send({
            title : "Hey",
            message : "You"
        });

      })
      .catch(function (err) {
        global.logger.debug('Initialization error', err);
      });
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
   * Set app protocol to handle internal links
   */
  setAppProtocol() {
    app.setAsDefaultProtocolClient(this.appProtocol);
    app.on('open-url', AppProtocol.process);
  }

  /**
   * Destroyes an application
   */
  destroy() {
    this.mainWindow = null;
  }

}

/**
 * Electron is ready
 */
app.on('ready', function () {
  try {
    global.app = new CodexNotes();
  } catch(error) {
    hawkCatcher.catchException(error);
    global.logger.error(`\n
      \n
      ...........................\n
      \n
      CodeX Notes runtime error:`, error, `\n
      \n
      ...........................`);
  }
});
