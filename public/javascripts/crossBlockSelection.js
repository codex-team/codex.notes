/**
 * Cross Block Selection - CBS
 *
 * Mode when user can select several content-editable blocks
 *
 *
 *
 *
 * allows several blocks selection and prevents CodeX Editor inline-toolbar appearance
 *
 * The main idea is that we make editor wrapper editable to use native selection.
 * Other actions instead of mouse down prevents this behaviour
 */

/**
 * @typedef {Object} CrossBlockSelection
 * @property {Element} wrapper - Element that contains several content-editable Blocks
 * @property {Boolean} crossBlockSelection - cross-block selection identifier
 */
export default class CrossBlockSelection {
  /**
   * @constructor
   * @param {Element} wrapper - Element that contains several content-editable Blocks
   */
  constructor({wrapper}) {
    this.wrapper = wrapper;

    /**
     * Is Selection contains more than one content-editable blocks
     * @type {boolean}
     */
    this.crossBlockSelectionMode = false;

    this.prepare();
  }

  /**
   * Selection mode: active (true) or inactive (false)
   * @return {boolean}
   */
  get isActive() {
    return this.wrapper.contentEditable && this.crossBlockSelectionMode;
  }

  /**
   * Enable Cross Block Selection mode
   */
  activate() {
    this.wrapper.contentEditable = true;
  }

  /**
   * Disable CBS
   */
  deactivate() {
    this.wrapper.contentEditable = false;
    this.crossBlockSelectionMode = false;
    this.clearSelection();
  }

  /**
   * Remove Selection
   */
  clearSelection() {
    window.getSelection().removeAllRanges();
  }

  /**
   * Disable standard events (from CodeX Editor or others)
   * @param {*} event
   */
  lockEvents(event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    console.log('events locked');
  }

  /**
   * Start to listen selection
   */
  prepare() {
    /**
     * Check current selection and make wrapper editable
     */
    this.wrapper.addEventListener('selectstart', (event) => {
      this.activate();
    }, false);


    /**
     * Prevent editor click behaviour when several blocks selected
     */
    this.wrapper.addEventListener('click', (event) => {
      let somethingSelected = this.isSomethingSelected();

      if (!somethingSelected) {
        this.deactivate();
        return;
      }

      this.crossBlockSelectionMode = this.detectCrossBlockSelection(event);

      if (this.isActive) {
        this.lockEvents(event);
      }
    }, true);

    /**
     * Keydown on mouse selection
     *
     * handle keydown separately because we made wrapper content editable that can breaks whole editor
     * Allow only CMD+C
     */
    this.wrapper.addEventListener('keydown', (event) => {
      console.log('keydown');
      if (this.isActive) {
        this.lockChanges(event);
      }

      // window.setTimeout(() => {
      //   if (this.isSelectionExceededAvailableZone()) {
      //     console.log('Selection have exceeded available zone, so it will be cleared');
      //     this.deactivate();
      //   }
      // }, 100);
    }, true);

    /**
     * Also prevent paste
     */
    this.wrapper.addEventListener('paste', (event) => {
      if (this.isActive) {
        this.lockChanges(event);
      }
    }, true);

    /**
     * This listener handle editor inline toolbar
     * In case of "non-crossBlockSelection" we allow the inline toolbar to appear
     */
    this.wrapper.addEventListener('mouseup', (event) => {
      this.crossBlockSelectionMode = this.detectCrossBlockSelection(event);

      console.log('this.crossBlockSelectionMode', this.crossBlockSelectionMode);
      console.log('this.isActive', this.isActive);
      /**
       * Block external events (CodeX Editor or others)
       */
      if (this.isActive) {
        this.lockEvents(event);
      }
    }, true);
  }

  /**
   * Disable wrapper's modification when Selection is activated
   * @param {*} event
   */
  lockChanges(event) {
    let keyC = 67,
        cmdPressed = event.ctrlKey || event.metaKey,
        copying  = cmdPressed && event.keyCode === keyC;

    let allowEvent = cmdPressed || copying;

    /**
     * Allow press CMD, lock CodeX Editor handlers
     */
    this.lockEvents(event);

    if (allowEvent) {
      return;
    }

    event.preventDefault();
    this.deactivate();
  }

  /**
   * If selection contains more then one content-editable block
   *
   * @param {MouseEvent} event
   * @return {Boolean}
   */
  detectCrossBlockSelection(event) {
    let selection = window.getSelection();

    if (selection.rangeCount === 0) {
      return false;
    }

    let range = selection.getRangeAt(0);

    /**
     * Common wrapper that contains Start Node and End Node
     * @type {Node}
     */
    let commonContainer = range.commonAncestorContainer;

    /**
     * @todo unhardcode ce-editor
     */
    return commonContainer.nodeType === Node.ELEMENT_NODE && commonContainer.classList.contains('ce-redactor');
  }

  /**
   * Check Selection's content
   * @return {Boolean}
   */
  isSomethingSelected() {
    let selection = window.getSelection();

    if (selection.isCollapsed) {
      return false;
    }

    if (selection.rangeCount === 0) {
      return false;
    }

    let range = selection.getRangeAt(0);

    let selectionContent = range.cloneContents();

    let editorBlocks = selectionContent.querySelectorAll('.ce-block');

    let isEmpty =  Array.prototype.slice.call(editorBlocks).some( block => {
      return block.textContent.trim().length !== 0;
    });

    return !isEmpty;
  }

  /**
   * Check if selection is exceeded available zone: over title and editor
   *
   * In this case user can delete
   */
  isSelectionExceededAvailableZone() {
    let selection = window.getSelection();

    if (selection.rangeCount === 0) {
      return false;
    }

    let range = selection.getRangeAt(0);
    let selectionContent = range.cloneContents();

    let titleInput = selectionContent.querySelector('.note-title'),
        editorHolder = selectionContent.querySelector('.codex-editor');

    return Boolean(titleInput || editorHolder);
  }
}
