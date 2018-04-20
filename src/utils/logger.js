/**
 * Logger can save log to file in appData/logs dir
 *
 * @usage enable logger
 * global.logger = require('./utils/logger');
 *
 * @example logger.debug('my log %s', variable);
 * @example logger.info('my log');
 * @example logger.warn('my log');
 * @example logger.error('my log');
 * @example logger.fatal('my log');
 */
const fs = require('fs');
const path = require('path');

/**
 * Logs will be stored in the app-data/logs
 * @type {string}
 */
const logsDirPath = path.join(global.appFolder, 'logs');

if (!fs.existsSync(logsDirPath)) {
  fs.mkdirSync(logsDirPath);
}

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({
    }),
    new DailyRotateFile({
      dirname: logsDirPath,
      filename: '%DATE%.log'
    })
  ]
});


module.exports = logger;
