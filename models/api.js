'use strict';
// let {ipcMain} = require('electron');

/**
 * curlrequest is a node wrapper for the command line curl(1)
 *
 * @see https://www.npmjs.com/package/curlrequest
 */
const curl = require('curlrequest');

class ApiController {

  /**
   * Setup event handlers
   */
  constructor() {
    this.apiVersion = '1';
    this.url = 'http://localhost:8081/v' + this.apiVersion + '/';
  }

  async sendRequest(action, data) {
    let options = {
      url: this.url + action,
      method: 'POST',
      data: data
    };

    curl.request(options, function (err, stdout, meta) {
      return stdout;
    });
    return false;
  }
}

module.exports = ApiController;
