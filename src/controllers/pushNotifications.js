'use strict';

/**
 * @module pushNotifications
 */

/**
 * Using node-notifier library to support all Windows versions, Linux, BSD and others
 * https://github.com/mikaelbr/node-notifier/blob/master/DECISION_FLOW.md
 */
const notifier = require('node-notifier');

/**
 * In case of OS X we decided to use native Electron notifications due to the terminal-notifier icon on title
 * https://electronjs.org/docs/api/notification
 */
const { Notification } = require('electron');

/**
 * OS library
 * @type {"os"}
 */
const os = require('os');
/**
 * Path library
 * @type {"path"}
 */
const path = require('path');

/**
 * @typedef {Object} PushOptions
 * @property {String} title - Message title.
 * @property {String} message - notification content
 * @property {String} [subtitle] - Message subtitle.
 * @property {Boolean} [silent] - need sound or not
 * @property {String} [image] - notification icon. Using CodeX Notes logo as default
 */

/**
 * @typedef {Object} NotifierOptions
 * @property {String} title  - information that will be shown at the top of the notification
 * @property {String} subtitle - small information that will be shown at the bottom
 * @property {String} message - notification text content
 * @property {String} sound - the name of file to play when the notification is shown
 * @property {Boolean} wait - waits user reaction to the notification
 *
 * ----- Advanced -----
 * @property {String} open - URL to open on click
 * @property {Number} timeout - Takes precedence over wait if both are defined
 * @property {String} closeLabel - show close label with passed text
 * @property {Array<String>} actions - Action label or list of labels in case of dropdown
 * @property {String} dropdownLabel - shows dropdown if multiple actions were passed
 * @property {Boolean} reply - should take input
 */

/**
 * @typedef {Object} PushCallback
 * @property {Function} eventName - key is a name of event and the value is a handler
 */

/**
 * @typedef {Object<PushCallback>} PushCallbacks - push notification callbacks list
 */

class PushNotifications {
  /**
   * @constructor
   */
  constructor() {
  }

  /**
   * sends push notification to the main process
   * @param {PushOptions} options
   * @param {PushCallbacks} callbacks
   */
  send(options, callbacks = {}) {
    if ( os.type() === 'Darwin' ) {
      this.sendOSXNotificaion(options, callbacks);
    } else {
      this.sendDefaultNotification(options, callbacks);
    }
  }

  /**
   * @param {PushOptions} options
   * @param {PushCallbacks} callbacks
   */
  sendOSXNotificaion(options, callbacks) {
    let notificationOptions = {
          title : options.title,
          subtitle : options.subtitle,
          icon  : options.image,
          body  : options.message
        },
        notification = new Notification(notificationOptions);
    if ( typeof callbacks['click'] === 'function' ) {
      notification.on('click', callbacks['click']);
    }

    notification.show();
  }

  /**
   * Here we use node-notifier module to send notifications on Linus, Windows and others
   *
   * @param {PushOptions} options
   * @param {PushCallbacks} callbacks
   */
  sendDefaultNotification(options, callbacks) {
    /**
     * Assemble data from passed options
     * @type {NotifierOptions}
     */
    let notifierOption = {
      appIcon : this.icon,
      title   : options.title || this.title,
      subtitle : options.subtitle,
      contentImage : options.image,
      message : options.message,

      timeout : 10
    };

    if ( callbacks.length > 0 ) {
      notifierOption.wait = true;
    }

    if ( typeof callbacks['click'] === 'function' ) {
      notifier.once('click', callbacks['click']);
    }

    notifier.notify(notifierOption);
  }
}

module.exports = PushNotifications;
