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
    this.name = name;

    codex.notes.aside.loadNotes(id)
      .then( ({notes, folder}) => {
        this.notes = notes;
        this.name = folder.name;
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
   * Fills folder header block
   */
  fillHeader() {
    let folderNameElement = $.get('js-folder-name');

    folderNameElement.textContent = this.name;
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