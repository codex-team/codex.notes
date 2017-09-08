import Folder from './folders';

const DELETE_BUTTON_ID = 'delete-button';

/**
 * Note
 */
export default class Note {

  /**
   * Send note data to backend
   * @static
   */
  static save() {
    dom.get(DELETE_BUTTON_ID).classList.remove('hide');

    codex.editor.saver.save()
      .then(function (noteData) {
        let note = {
          data: noteData,
          title: window.NOTE_TITLE.value,
          folderId: Folder.currentFolder
        };

        let saveIndicator = document.getElementById('save-indicator');

        saveIndicator.classList.add('saved');
        window.setTimeout(() => {
          saveIndicator.classList.remove('saved');
        }, 500);
        window.ipcRenderer.send('save note', {note});
      });
  }

  /**
   *  Keyup event on editor zone fires timeout to autosave note
   */
  autosave() {
    if (this.autosaveTimer) window.clearTimeout(this.autosaveTimer);

    this.autosaveTimer = window.setTimeout(Note.save, 500);
  }

  /**
   * Add keyup listener to editor zone
   */
  enableAutosave() {
    codex.editor.nodes.redactor.addEventListener('keyup', this.autosave.bind(this));
  }

  /**
   * Remove keyup listener to editor zone
   */
  disableAutosave() {
    codex.editor.nodes.redactor.removeEventListener('keyup', this.autosave.bind(this));
  }

  /**
   *  Add note to menu by Aside.addMenuItem method
   *
   * @param event
   * @param data
   */
  static addToMenu(event, {note}) {
    codex.editor.state.blocks.id = note.id;

    Aside.addMenuItem(note);
  }

  /**
   * Renders note
   * @param  {object} noteData
   */
  static render(note) {
    codex.editor.content.clear(true);
    window.NOTE_TITLE.value = note.title;

    let saveDate = new Date(note.data.time);

    window.NOTE_DATE.textContent = saveDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    codex.editor.content.load(note.data);
    dom.get(DELETE_BUTTON_ID).classList.remove('hide');
  }

  /**
   * Clears editor
   */
  static clear() {
    codex.editor.content.clear(true);
    window.NOTE_TITLE.value = '';
    window.NOTE_DATE.textContent = '';
    codex.editor.ui.addInitialBlock();
    dom.get(DELETE_BUTTON_ID).classList.add('hide');
  }

  /**
   * Delete article
   */
  static delete() {
    let id = codex.editor.state.blocks.id;

    if (!id) {
      return;
    }

    if (!window.ipcRenderer.sendSync('delete note', {id})) {
      return false;
    }

    Note.clear();
    Aside.removeMenuItem(id);
  }

}

let Aside = require('./aside').default;
let dom = require('./dom').default;
