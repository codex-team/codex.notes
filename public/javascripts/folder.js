const $ = require('./dom').default;
const Dialog = require('./dialog').default;

/**
 * Folders methods
 */
export default class Folder {

  /**
   * Folder methods
   *
   * @param {Number} id   - folder id
   * @param {string} name - folder name
   *
   * @property {Number}    id           - folder id
   * @property {string}    name         - folder name
   * @property {Array}     notes        - notes list
   * @property {Element}   notesListWrapper  - notes list holder
   */
  constructor(id, name) {
    this._id = id;
    this._name = name;

    this.folderNameElement = $.get('js-folder-name');

    codex.notes.aside.loadNotes(id)
      .then( ({notes, folder}) => {
        this.notes = notes;
        this._name = folder.name;
      })
      .then( () => this.fillHeader() )
      .then( () => this.updateNotesList() );

    this.notesListWrapper = document.querySelector('[name="js-folder-notes-menu"]');
  }

  /**
   * Folder id getter
   */
  get id() {
    return this._id;
  }

  /**
   * Folder name getter
   */
  get name() {
    return this._name;
  }

  /**
   * Folder name setter
   */
  set name(newName) {
    this._name = newName;

    /**
     * Update in the header
     */
    this.fillHeader();

    /**
     * Update in the aside menu
     */
    codex.notes.aside.updateFolderNameInMenu(this._id, this._name);
  }

  /**
   * Fills folder header block
   */
  fillHeader() {
    this.folderNameElement.textContent = this._name;
  }

  /**
   * Clear list if there is no one note
   */
  updateNotesList() {
    if (!this.notes.length) {
      this.notesListWrapper.innerHTML = '';
    }
  }

  /**
   * Delete folder
   */
  delete() {
    if (Dialog.confirm('Are you sure you want to delete this folder?')) {
      if (window.ipcRenderer.sendSync('delete folder', this._id)) {
        codex.notes.aside.removeFolderFromMenu(this._id);
        codex.notes.note.clear();
        return true;
      }
    }

    Dialog.error('Folder removing failed');
    return false;
  }

}