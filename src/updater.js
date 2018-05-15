const {app, ipcMain} = require('electron');

/**
 * Read more about auto-updater events on this page
 * https://www.electron.build/auto-update
 */
const {autoUpdater} = require('electron-updater');

/**
 * Log wrapper
 *
 * @param message
 */
const showLog = (message) => {
  global.logger.debug('[updater] %s', JSON.stringify(message));
};

let updateIsDownloaded = false;

/**
 * @typedef {object} info
 * @property {string} version - "2.0.1"
 * @property {installer[]} files
 * @property {string} path - "codex.notes-2.0.1-mac.zip"
 * @property {string} sha512 - "vxFl4T...AAvakk/w=="
 * @property {string} releaseDate - "2018-04-19T17:32:22.107Z"
 * @property {string} releaseName - "CodeX Notes 2"
 * @property {string} releaseNotes - "<p>We have fixed a few bugs</p>"
 */

/**
 * @typedef {object} installer
 * @property {string} url - "codex.notes-2.0.1-mac.zip"
 * @property {string} sha512 - "vxFl4T...AAvakk/w=="
 * @property {string} size - "62008014"
 */

/**
 * @typedef {object} progressObj
 * @property {number} bytesPerSecond - 317345
 * @property {number} percent - 1.125174126639946
 * @property {number} transferred - 665155
 * @property {number} total - 59115739
 * @property {number} delta - 174080 (?)
 */

/**
 * Checking for update handler
 */
autoUpdater.on('checking-for-update', () => {
  showLog('Checking for update');
});

autoUpdater.on('update-available', (info) => {
  showLog('New version of the app is available');
  showLog(info);
});

autoUpdater.on('update-not-available', (info) => {
  showLog('No updates are available');
  showLog(info);
});

/**
 * Error handler
 */
autoUpdater.on('error', (err) => {
  showLog('Error while checking for updates');
  showLog(err.message);

  if (!process.env.DEBUG) {
    global.catchException(err);
  }
});

/**
 * Download progress
 */
autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = 'Download speed: ' + progressObj.bytesPerSecond;

  logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%';
  logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')';

  showLog(logMessage);
});

/**
 * Update was downloaded
 */
autoUpdater.on('update-downloaded', (info) => {
  global.logger.debug('[updater] Update is downloaded: %s', JSON.stringify(info));

  /**
   * Show update button
   */
  global.app.clientSyncObserver.showUpdateButton();

  /**
   * Add event listener
   */
  ipcMain.on('quit and install update', () => {
    autoUpdater.quitAndInstall();
  });
});


if (process.env.PRODUCTION) {
  /**
   * Call "check for updates" function
   */
  app.on('ready', () => {
    autoUpdater.checkForUpdates();
  });

  /**
   * Check updates every 60 minutes
   */
  setInterval(() => {
    if (!updateIsDownloaded) {
      global.logger.debug('[updater] check....');
      autoUpdater.checkForUpdates();
    }
  }, 60 * 60 * 1000);
}

module.exports = autoUpdater;
