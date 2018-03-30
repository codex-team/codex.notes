/**
 * Clipboard module
 */
export default class Clipboard {
  /**
   * copy to clipboards passed text
   *
   * @param {string} text
   * @return {boolean}
   */
  static copy(text) {
    let textarea = document.createElement('textarea'),
        success = false;

    Object.assign(textarea.style, {
      position: 'fixed',
      top: '-100%',
      left: '-100%',
      opacity: '0'
    });

    textarea.value = text;

    document.body.appendChild(textarea);
    textarea.select();

    try {
      success = document.execCommand('copy');
    } catch (e) { }

    document.body.removeChild(textarea);

    return success;
  }
}