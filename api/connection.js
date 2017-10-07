'use strict';

const dns = require('dns');

class Connection {

  constructor() {
    this.online = false;
  }

  isOnline() {
    return new Promise((resolve, reject) => {
      dns.resolve('www.google.com', function(err) {
        if (err) {
          return reject(err);
        } else {
          this.online = true;
          return resolve();
        }
      });
    });
  }

}

module.exports = Connection;