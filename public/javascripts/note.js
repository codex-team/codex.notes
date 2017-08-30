/**
 * @class Note
 */
export default class Note {

  /**
   * @constructor
   */
  constructor() {
    this.saveButton = document.getElementById('save-button');
    window.ipcRenderer.on('note saved', this.addToMenu);
    this.deleteNoteButton = document.getElementById('delete-button');
    this.deleteNoteButton.addEventListener('click', this.delete.bind(this));
  }

  /**
   * Send note data to backend
   */
  save() {
    this.deleteNoteButton.classList.remove('hide');

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

    this.autosaveTimer = window.setTimeout(this.save.bind(this), 200);
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
  addToMenu(event, {note}) {
    codex.editor.state.blocks.id = note.id;

    Aside.addMenuItem(note);
  }

  /**
   * Renders note
   * @param  {object} noteData
   */
  render(noteData) {
    codex.editor.content.clear(true);

    codex.editor.content.load(noteData);
    this.deleteNoteButton.classList.remove('hide');
  }

  /**
   * Clears editor
   */
  clear() {
    codex.editor.content.clear(true);
    codex.editor.ui.addInitialBlock();
    this.deleteNoteButton.classList.add('hide');
  }

  /**
   * Delete article
   */
  delete() {
    let id = codex.editor.state.blocks.id;

    if (!id) {
      return;
    }

    this.clear();
    Aside.removeMenuItem(id);
    window.ipcRenderer.send('delete note', {id});
  }

}

let Aside = require('./aside').default;