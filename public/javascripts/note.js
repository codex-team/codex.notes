const $ = require('./dom').default;
const AutoResizer = require('./autoresizer').default;
const Dialog = require('./dialog').default;

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
 */
export default class Note {

  /**
   * @constructor
   *
   * @property {Element} deleteButton
   * @property {Element} titleEl
   * @property {Element} dateEl
   * @property {Timer} showSavedIndicatorTimer
   */
  constructor() {
    this.deleteButton = $.get('delete-button');

    this.titleEl = document.getElementById('note-title');
    this.dateEl  = document.getElementById('note-date');

    this.showSavedIndicatorTimer = null;

    // when we are creating new note
    if (!this.autoresizedTitle) {
      this.autoresizedTitle = new AutoResizer([ this.titleEl ]);
    }
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
      .catch( err => console.log('Error while saving note: ', err) );
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
}
