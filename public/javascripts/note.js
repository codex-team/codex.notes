const $ = require('./dom').default;
const AutoResizer = require('./autoresizer').default;
const Dialog = require('./dialog').default;
const Shortcut = require('@codexteam/shortcuts').default;
const clipboardUtil = require('./utils/clipboard').default;

/**
 * @typedef {Object} NoteData
 * @property {String} _id           — Note's id
 * @property {String} title         — Note's title
 * @property {String} authorId      — Note's Author id
 * @property {String} folderId      - Note's Folder id
 * @property {String} content       - JSON with Note's body
 * @property {Number} dtModify      - timestamp of last modification
 * @property {Number} dtCreate      - timestamp of Note creation
 * @property {Boolean} isRemoved    - Note's removed state
 * @property {String|null} editorVersion - used CodeX Editor version
 */

/**
 * Note section module
 *
 * @typedef {Note} Note
 * @property {Element} deleteButton
 * @property {Element} titleEl
 * @property {Element} dateEl
 * @property {Timer} showSavedIndicatorTimer
 * @property {boolean} editorContentSelected - is all document selected by CMD+A
 * @property {ShortCut[]} shortcut
 */
export default class Note {

  /**
   * @constructor
   */
  constructor() {
    this.deleteButton = $.get('delete-button');

    this.titleEl = document.getElementById('note-title');
    this.dateEl  = document.getElementById('note-date');
    this.editor  = document.getElementById('codex-editor');

    this.showSavedIndicatorTimer = null;

    /**
     * True after user selects all document by CMD+A
     * @type {boolean}
     */
    this.editorContentSelected = false;

    // when we are creating new note
    if (!this.autoresizedTitle) {
      this.autoresizedTitle = new AutoResizer([ this.titleEl ]);
    }

    this.shortcuts = [];

    this.enableShortcuts();
    this.enableMouseSelection();
  }

  /**
   * enableMouseSelection
   *
   * allows several blocks selection and prevents CodeX Editor inline-toolbar appearance
   *
   * The main idea is that we make editor wrapper editable to use native selection.
   * Other actions instead of mouse down prevents this behaviour
   */
  enableMouseSelection() {
    /**
     * prevent immediate execution
     */
    let stopAllPropagations = (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
    };

    let crossBlockSelection = false;

    /**
     * This listener defines "crossBlockSelection" from current selection
     */
    this.editor.addEventListener('mousemove', (event) => {
      let selection = window.getSelection(),
          range, commonContainer;

      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
        commonContainer = range.commonAncestorContainer;
        if (commonContainer.nodeType === Node.ELEMENT_NODE && commonContainer.classList.contains('ce-redactor')) {
          crossBlockSelection = true;
        } else {
          crossBlockSelection = false;
        }
      }
    }, false);

    /**
     * This listener handle editor inline toolbar
     * In case of "non-crossBlockSelection" we allow the inline toolbar to appear
     */
    this.editor.addEventListener('mouseup', (event) => {
      if (crossBlockSelection) {
        stopAllPropagations(event);
      }
    }, true);

    /**
     * Prevent editor click behaviour when several blocks selected
     */
    this.editor.addEventListener('click', (event) => {
      if (crossBlockSelection) {
        stopAllPropagations(event);
      }
    }, true);

    /**
     * Check current selection and make wrapper editable
     *
     * Sometimes there is difference between click and selectstart, so we need an extra condition with range offset
     * if range length is greater than 0, we make wrapper editable
     */
    this.editor.addEventListener('selectstart', (event) => {
      let selection = window.getSelection(),
          range;

      if ( selection.rangeCount > 0 ) {
        range = selection.getRangeAt(0);
        if (range.startOffset === range.endOffset) {
          this.editor.contentEditable = false;
          return;
        } else {
          this.editor.contentEditable = true;
        }
      }
      this.editor.contentEditable = true;
    }, false);

    /**
     * Keydown on mouse selection
     *
     * handle keydown separately because we made wrapper content editable that can breaks whole editor
     * Allow only CMD+C
     */
    this.editor.addEventListener('keydown', (event) => {
      if (this.editor.contentEditable) {
        let keyCodeC = 67,
            onlyCtrl = event.metaKey && event.keyCode == 91,
            copying  = event.metaKey && event.keyCode == keyCodeC;

        if ( onlyCtrl || ( crossBlockSelection && copying) ) {
          return;
        }

        crossBlockSelection = false;
        this.editor.contentEditable = false;
      }
    });
  }

  /**
   * CMD+A - select all document
   * CDM+C - copy selected content (title + editor area)
   */
  enableShortcuts() {
    let preventDefaultExecution = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
    };

    // any click on body prevents content selection
    // stop preventing copy event
    document.body.addEventListener('click', () => {
      this.editorContentSelected = false;
      this.editor.removeEventListener('copy', preventDefaultExecution);
    }, false);

    /**
     * Select all document by CMD+A
     */
    let selectAllShortcut = new Shortcut({
      name: 'CMD+A',
      on: this.editor,
      callback: event => {
        this.cmdA(event);
        this.editor.addEventListener('copy', preventDefaultExecution);
      }
    });

    /**
     * Copy selected document by CMD+C
     */
    let copySelectedShortcut = new Shortcut({
      name: 'CMD+C',
      on: this.editor,
      callback: () => {
        this.cmdC();
      }
    });

    this.shortcuts.push(selectAllShortcut);
    this.shortcuts.push(copySelectedShortcut);
  }

  /**
   * CMD+A Shortcut
   * Selects title + all Note
   */
  cmdA(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    this.selectEditorContents();
  }

  /**
   * CMD+C Shortcut
   * Copies selected title and Note
   */
  cmdC() {
    if (!this.editorContentSelected) { // selection was cleared
      return;
    }

    let editorContent = this.editor.querySelector('.ce-redactor'),
        formattedText = editorContent.innerText.replace(/\n/g, '\n\n');

    clipboardUtil.copy(this.titleEl.value + '\n\n' + formattedText);

    // select content again because we select textarea contents to copy to the clipboard
    this.selectEditorContents();
  }

  /**
   * Send note data to backend
   * @static
   */
  save() {
    this.deleteButton.classList.remove('hide');

    /**
     * If folder is opened, pass id. Otherwise pass false
     */
    let folderId = codex.notes.aside.currentFolder ? codex.notes.aside.currentFolder.id : null;

    codex.editor.saver.save()
      .then(noteData => {
        this.validate(noteData);
        return noteData;
      })
      .then( noteData => {
        let note = {
          data: noteData,
          title: this.titleEl.value.trim(),
          folderId
        };

        let saveIndicator = document.getElementById('save-indicator');

        if (this.showSavedIndicatorTimer) {
          window.clearTimeout(this.showSavedIndicatorTimer);
        }

        saveIndicator.classList.add('saved');

        this.showSavedIndicatorTimer = window.setTimeout( () => {
          saveIndicator.classList.remove('saved');
        }, 500);

        window.ipcRenderer.send('note - save', {note});
      })
      .catch( err => {
        console.log('Error while saving note: ', err);
      } );
  }

  /**
   * Validate Note data before saving
   * @param {object} noteData
   * @throws {Error}
   */
  validate(noteData) {
    if (!noteData.items.length) {
      throw Error('Article is empty');
    }
  }

  /**
   * Add Note to the menu by Aside.addMenuItem method
   *
   * @param {object} data
   * @param {object} data.note
   * @param {number} data.note.folderId
   * @param {number} data.note._id
   * @param {string} data.note.title
   * @param {Boolean} data.isRootFolder - true if Note included in the Root Folder
   */
  addToMenu({note, isRootFolder}) {
    codex.editor.state.blocks.id = note._id;
    codex.notes.aside.addMenuItem(note, isRootFolder);
  }

  /**
   * Render the Note
   * @param {NoteData} note
   */
  render(note) {
    codex.editor.content.clear(true);
    this.titleEl.value = note.title;

    /**
     * We store all times in a Seconds to correspond server-format
     * @type {Date}
     */
    let dtModify = new Date(note.dtModify * 1000);

    this.dateEl.textContent = dtModify.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    codex.editor.content.load({
      id: note._id,
      items: JSON.parse(note.content),
      time: note.dtModify,
      version: note.editorVersion,
    });
    this.deleteButton.classList.remove('hide');

    /**
     * if we are trying to render new note but we have an Autoresizer instance
     * then we need to clear it before we create new one
     */
    if (this.autoresizedTitle) {
      this.autoresizedTitle.destroy();
    }

    this.autoresizedTitle = new AutoResizer([ this.titleEl ]);
  }

  /**
   * Clears editor
   */
  clear() {
    codex.editor.content.clear(true);
    this.titleEl.value = '';
    this.dateEl.textContent = '';
    codex.editor.ui.addInitialBlock();
    this.deleteButton.classList.add('hide');

    // destroy autoresizer
    this.autoresizedTitle.destroy();

    this.editorContentSelected = false;
  }

  /**
   * Set focus to the Editor
   */
  static focusEditor() {
    window.setTimeout(function () {
      let editor = document.querySelector('.ce-redactor');

      editor.click();
    }, 10);
  }

  /**
   * Delete article
   */
  delete() {
    let id = codex.editor.state.blocks.id;

    if (!id) {
      return;
    }

    if (Dialog.confirm('Are you sure you want to delete this note?')) {
      if (!window.ipcRenderer.sendSync('note - delete', {id})) {
        return false;
      }

      codex.notes.aside.removeMenuItem(id);
      this.clear();
    }
  }

  /**
   * Title input keydowns
   * @description  By ENTER, sets focus on editor
   * @param  {Element} titleElement - title block
   * @param  {Event} event - keydown event
   */
  titleKeydownHandler(titleElement, event) {
    if (event.keyCode == 13) {
      event.preventDefault();

      Note.focusEditor();
    }
  }

  /**
   * selects editor with title
   */
  selectEditorContents() {
    let range = document.createRange(),
        selection = window.getSelection();

    range.selectNodeContents(this.editor);
    selection.removeAllRanges();
    selection.addRange(range);

    this.editorContentSelected = true;
  }
}
