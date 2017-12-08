'use strict';

const request = require('request-promise');

class ApiController {

  /**
   * Setup event handlers
   */
  constructor() {
    this.apiVersion = '1';
    this.url = 'http://localhost:8081/v' + this.apiVersion + '/';
  }

  async sendRequest(action, data) {
    return await request({
      url: this.url + action,
      method: 'POST',
      body: data,
      json: true
    });
  }
}

module.exports = ApiController;
