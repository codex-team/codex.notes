'use strict';

/**
 * @module pushNotifications
 */

/**
 * Using native Election Push notifications
 * https://electronjs.org/docs/api/notification
 *
 * @type {Electron.Notification}
 */
const { Notification } = require('electron');

/**
 * @typedef {Object} PushOptions
 * @property {String} title - information that will be shown at the top of the notification
 * @property {String} subtitle - small information that will be shown at the bottom
 * @property {String} body - notification content
 * @property {Boolean} silent - need sound or not
 * @property {String} icon - notification icon. Using CodeX Notes logo as default
 * @property {String} sound - the name of file to play when the notification is shown
 */

/**
 * @typedef {Object} PushNotifications
 */
class PushNotifications {

    /**
     * @constructor
     */
    constructor() { }

    /**
     * sends push notification to the main proceess
     *
     * @param {PushOptions} options
     */
    send(options) {

        if ( !Notification.isSupported() ) {
            return false;
        }

        options.icon = options.icon || 'default';
        options.sound = 'path to file';
        options.silent = options.silent || false;

        let notification = new Notification(options);
        notification.show();

    }

}

module.exports = PushNotifications;
