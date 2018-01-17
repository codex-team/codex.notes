'use strict';
let {ipcMain} = require('electron');

/**
 * User controller.
 * Works with events:
 *  - user - get
 */
class UserController {

  /**
   * Bind event handlers
   *
   * @constructor
   */
  constructor() {
    ipcMain.on('user - get', (event) => {
      this.get(event);
    });
  }

  /**
   *
   * @param event
   */
  get(event) {
    event.returnValue = global.user;
  }

}

module.exports = UserController;