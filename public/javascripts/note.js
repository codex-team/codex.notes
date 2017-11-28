const $ = require('./dom').default;
const AutoResizer = require('./autoresizer').default;
const Dialog = require('./dialog').default;

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
    codex.editor.saver.save()
      .then( noteData => {
        let note = {
          data: noteData,
          title: this.titleEl.value.trim(),
          folderId: codex.notes.aside.currentFolderId
        };

        let saveIndicator = document.getElementById('save-indicator');

        if (this.showSavedIndicatorTimer) {
          window.clearTimeout(this.showSavedIndicatorTimer);
        }

        saveIndicator.classList.add('saved');

        this.showSavedIndicatorTimer = window.setTimeout( () => {
          saveIndicator.classList.remove('saved');
        }, 500);

        window.ipcRenderer.send('save note', {note});
      })
      .catch( err => console.log('Error while saving note: ', err) );
  }

  /**
   * Add note to the menu by Aside.addMenuItem method
   *
   * @param {object} data
   * @param {object} data.note
   * @param {number} data.note.folderId
   * @param {number} data.note.id
   * @param {string} data.note.title
   */
  addToMenu({note}) {
    codex.editor.state.blocks.id = note.id;

    codex.notes.aside.addMenuItem(note);
  }

  /**
   * Renders note
   * @param  {object} noteData
   */
  render(note) {
    codex.editor.content.clear(true);
    this.titleEl.value = note.title;

    let saveDate = new Date(note.data.time);

    this.dateEl.textContent = saveDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    codex.editor.content.load(note.data);
    this.deleteButton.classList.remove('hide');

    /**
     * if we are trying to render new note but we have an autoresizer instance
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
      if (!window.ipcRenderer.sendSync('delete note', {id, folderId: codex.notes.aside.currentFolderId})) {
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
