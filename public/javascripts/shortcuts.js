/**
 * Codex Note ShortCuts class
 * Handles keyDowns on Note.
 *
 * Used to create shortcuts on element
 */

/**
 * @class ShortCuts
 * @classdesc Callback will be fired with two params:
 *   - event: standard keyDown param
 *   - target: element which registered on shortcut creation
 *
 * @typedef {Object} ShortCut
 * @property {String} name - shortcut name
 * @property {Element} on - element that passed on shortcut creation
 * @property {Function} callback - custom user function
 */
export default class ShortCuts {

  /**
   * Create new shortcut
   * @param {ShortCut} shortcut
   * @constructor
   */
  constructor(shortcut) {
    this.name = shortcut.name;
    this.element = shortcut.on;
    this.callback = shortcut.callback;
    this.element.addEventListener('keydown', (event) => {
      this.callback.call(null, event, this.element);
    }, false);
  }

  /**
   * Destroy shortcut: remove listener from element
   */
  remove() {
    this.element.removeEventListener('keydown', this.callback);
  }
}
