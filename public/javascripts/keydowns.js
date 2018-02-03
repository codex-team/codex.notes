/**
 * Codex Note keyDown class
 *
 * Handles keyDowns on Note.
 */

/**
 * Module options
 * @type {{SHORTCUTS: string}}
 */
const options = {
  SHORTCUTS : 'shortcuts',
};

const keyCodes = {
  A : 65
};

/**
 * @class KeyDowns
 */
export default class KeyDowns {

  /**
   * Initialize class
   * @constructor
   */
  constructor() {
    this.subscribers = [];
  }

  /**
   * subscribe elements to keyDown listener
   * @param element
   * @param option
   */
  on(element, option) {
    switch (option) {
      // subscribe to shortcut handlers only
      case options.SHORTCUTS:
        element.addEventListener('keydown', (event) => {
          this.handleShortCut(event);
        }, false);
        break;

      // subscribe to all handlers
      default:
        element.addEventListener('keydown', (event) => {
          this.handleShortCut(event);
          // other handler
        }, false);
        break;
    }

    this.subscribers.push(element);
  }

  /**
   * shortcut handler
   * @param {keyDown} event
   */
  handleShortCut(event) {
    if ( !(event.ctrlKey || event.metaKey) ) {
      return;
    }

    switch (event.keyCode) {
      case keyCodes.A:
        this.selectAll(event);
        break;
    }
  }

  /**
   * Create Range and set Selection range from Editor title to last Editor Block
   *
   * @param {keyDown} event
   */
  selectAll(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    let range = document.createRange(),
        selection = window.getSelection();

    range.selectNodeContents(codex.editor.nodes.redactor);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Drop subscribers
   */
  destroy() {
    for (let i = 0; i < this.subscribers.length; i++) {
      // this.subscribers[i].removeEventListener('keydown');
    }
  }
}
