/**
 * Helpers
 */
class Utils {

  /**
   * Compare some items
   *
   * @param items
   *
   * @returns {boolean}
   */
  static equals(...items) {
    let firstStringified = JSON.stringify(items.shift());

    for (let i = items.length - 1; i >= 0; i--) {
      if (JSON.stringify(items[i]) !== firstStringified) {
        return false;
      }
    }

    return true;
  }

  /**
   * Show function's caller
   *
   * @returns {string}
   */
  static get caller() {
    return (new Error()).stack.split('\n').splice(3,1).shift().trim();
  }

  /**
   * Show object beautifier
   *
   * @param obj
   *
   * @returns {string}
   */
  static print(obj) {
    return JSON.stringify(obj, null, 2);
  }
}

module.exports = Utils;
