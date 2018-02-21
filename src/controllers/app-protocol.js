const parser = require('url');

/**
 * @class AppProtocol
 * @classdesc Class to handle URLs with the custom protocol
 *
 * For example: codex://join/john@doe.com
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