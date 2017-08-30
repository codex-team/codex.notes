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
        window.ipcRenderer.send('save note', {noteData});
      });
  }

  /**
   *  Keyup event on editor zone fires timeout to autosave note
   */
  autosave() {
    if (this.autosaveTimer) window.clearTimeout(this.autosaveTimer);

    this.autosaveTimer = window.setTimeout(Note.save, 200);
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
  static render(noteData) {
    codex.editor.content.clear(true);

    codex.editor.content.load(noteData);
    dom.get(DELETE_BUTTON_ID).classList.remove('hide');
  }

  /**
   * Clears editor
   */
  static clear() {
    codex.editor.content.clear(true);
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
