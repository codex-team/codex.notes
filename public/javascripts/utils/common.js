/**
 * Common methods
 */
export default class Common {
  /**
   * Debouncing method
   * Call method after passed time
   *
   * @param {Function} func - function that we're throttling
   * @param {Number} wait - time in milliseconds
   * @param {Boolean} immediate - call now
   * @return {Function}
   */
  static debounce(func, wait, immediate) {
    let timeout;

    return function () {
      let context = this,
          args = arguments;

      let later = function () {
        timeout = null;
        if (!immediate)  {
          func.apply(context, args);
        }
      };

      let callNow = immediate && !timeout;

      window.clearTimeout(timeout);
      timeout = window.setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
    };
  }
}
