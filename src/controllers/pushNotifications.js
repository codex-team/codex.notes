'use strict';

/**
 * @module pushNotifications
 */

/**
 * Using node-notifier library to support all Windows, Linus and others
 * https://github.com/mikaelbr/node-notifier/blob/master/DECISION_FLOW.md
 */
const notifier = require('node-notifier');

/**
 * Path library
 * @type {"path"}
 */
const path = require('path');

/**
 * @typedef {Object} PushOptions
 * @property {String} title - Message title. Will be appeared as push subtitle
 * @property {String} message - notification content
 * @property {Boolean} silent - need sound or not
 * @property {String} image - notification icon. Using CodeX Notes logo as default
 *
 */

/**
 * @typedef {Object} NotifierOptions
 * @property {String} title  - information that will be shown at the top of the notification
 * @property {String} subtitle - small information that will be shown at the bottom
 * @property {String} message - notification text content
 * @property {String} sound - the name of file to play when the notification is shown
 */

/**
 * @typedef {Object} PushNotifications
 */
class PushNotifications {

    /**
     * @constructor
     */
    constructor() {
        this.title = "CodeX Notes";
        this.icon = path.join(__dirname, '/../../assets/icons/png/icon-white512.png');
    }

    /**
     * sends push notification to the main proceess
     *
     * @param {PushOptions} options
     */
    send(options) {

        /**
         * Assemble data from passed options
         * @type {NotifierOptions}
         */
        let notifierOption = {
            icon : this.icon,
            title : this.title,
            subtitle : options.title,
            contentImage : options.image,
            message : options.message,
        };

        notifier.notify(notifierOption);
    }

}

module.exports = PushNotifications;
