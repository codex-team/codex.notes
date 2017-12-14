'use strict';

const request = require('request-promise');
const isOnline = require('is-online');

/**
 * @class       ApiController
 * @classdesc   Api methods
 *
 * @typedef {ApiController} ApiController
 * @property {String} apiVersion - API version
 * @property {String} url - Notes server API uri
 */
class ApiController {

  /**
   * Setup event handlers
   */
  constructor() {
    this.apiVersion = '1';
    this.url = 'http://localhost:8081/v' + this.apiVersion + '/';
  }

  /**
   * Send request to Notes server API
   *
   * @param {string} action - api action. example: 'folder/create'
   * @param {Object} data - data to send
   */
  async sendRequest(action, data) {
    await isOnline()
        .then((connection) => {

            if (!connection) {
              return true;
            }

            return request({
                url: this.url + action,
                method: 'POST',
                body: data,
                json: true
            });
        });
  }
}

module.exports = ApiController;
