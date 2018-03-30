/**
 * Logger can save log to file in appData/logs dir
 *
 * @usage enable logger
 * global.logger = require('./utils/logger');
 *
 * @usage set level
 * global.logger.setLevel(process.env.LOG_LEVEL || 'warn');
 *
 * @example logger.trace('my log');
 * @example logger.debug('my log');
 * @example logger.info('my log');
 * @example logger.warn('my log');
 * @example logger.error('my log');
 * @example logger.fatal('my log');
 */
const fs = require('fs');
const {app} = require('electron');
const path = require('path');

/**
 * Logs will be stored in the app-data/logs
 * @type {string}
 */
const logsDirPath = path.join(app.getPath('userData'), 'logs');

if (!fs.existsSync(logsDirPath)){
  fs.mkdirSync(logsDirPath);
}

/** create a log manager */
const manager = require('simple-node-logger').createLogManager();

manager.createRollingFileAppender({
  errorEventName: 'error',
  logDirectory: logsDirPath,
  dateFormat: 'YYYY-MM-DD',
  fileNamePattern: '<DATE>.log',
  timestampFormat: 'HH:mm:ss'
});

module.exports = manager.createLogger();

