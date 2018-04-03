/**
 * enableMouseSelection
 *
 * allows several blocks selection and prevents CodeX Editor inline-toolbar appearance
 *
 * The main idea is that we make editor wrapper editable to use native selection.
 * Other actions instead of mouse down prevents this behaviour
 */

/**
 * @typedef {Object} MouseSelection
 * @property {Boolean} crossBlockSelection - cross-block selection identifier
 */
export default class MouseSelection {

    /**
     * @constructor
     */
  constructor() {
    this.crossBlockSelection = false;
  }

    /**
     * detectCrossBlockSelection
     *
     * @param {MouseEvent} event
     */
  detectCrossBlockSelection(event) {
    let selection = window.getSelection(),
        range, commonContainer;

    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      commonContainer = range.commonAncestorContainer;
      if (commonContainer.nodeType === Node.ELEMENT_NODE && commonContainer.classList.contains('ce-redactor')) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

    /**
     * selectionStarted
     *
     * Sometimes there is difference between click and selectstart, so we need an extra condition with range offset
     * if range length is greater than 0, we make wrapper editable
     *
     * @param {MouseEvent} event
     */
  selectionStarted(event) {
    let selection = window.getSelection(),
        range;

    console.log('selection.rangeCount', selection.rangeCount);
    if ( selection.rangeCount > 0 ) {
      range = selection.getRangeAt(0);
      if (range.startOffset === range.endOffset) {
        // selection.removeAllRanges();
        return false;
      }
    }

    if ( selection.rangeCount === 0 ) {
      return false;
    }

    return true;
  }

    /**
     * Locks editor for writing.
     * @param event
     */
  needLock(event) {
    let keyCodeC = 67,
        metaKey  = 91,
        onlyCtrl = event.metaKey && event.keyCode == metaKey,
        copying  = event.metaKey && event.keyCode == keyCodeC;

    return ( onlyCtrl || copying );
  }
}
