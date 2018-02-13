const parser = require('url');

/**
 * @class AppProtocol
 * @classdesc Class to process urls with custom app protocol
 */
class AppProtocol {

  /**
   * Process url with custom protocol
   *
   * @param event
   * @param {String} url - url to process
   * @returns void
   */
  static async process(event, url) {

    console.log('Processing url ', url);

    let urlParts = parser.parse(url),
        args = urlParts.path.slice(1).split('/');

    switch (urlParts.hostname) {
      case 'join':
        await global.app.auth.verifyCollaborator(...args);
        break;
    }
  }

}

module.exports = AppProtocol;