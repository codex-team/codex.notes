/**
 *
 */
class Utils {

  /**
   *
   */
  static equals(...items) {
    let firstStringified = JSON.stringify(items.shift());

    for (let i = items.length; i >= 0; i--) {
      if (JSON.stringify(items[i]) !== firstStringified) {
        return false;
      }
    }

    return true;
  }

  /**
   *
   */
  static get caller() {
    return (new Error()).stack.split('\n').splice(3,1).shift().trim();
  }

}

module.exports = Utils;
