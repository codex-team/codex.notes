const $ = require('./dom').default;
const remote = require('electron').remote;
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
   * @property {Element}   newNoteButton
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;

    codex.notes.aside.loadNotes(id)
      .then( ({notes, folder}) => {
        this.notes = notes;
        this.name = folder.name;
      })
      .then( () => this.fillHeader() )
      .then( () => this.updateNotesList() );

    this.notesListWrapper = document.querySelector('[name="js-folder-notes-menu"]');
    this.newNoteButton = document.querySelector('[name="js-new-note-button-in-folder"]');
    this.folderDeleteButton = document.querySelector('[name="js-delete-folder-button"]');

    this.newNoteButton.dataset.folderId = this.id;
    this.folderDeleteButton.dataset.folderId = this.id;
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
  static delete(folderId) {
    if (Dialog.confirm('Are you sure you want to delete this folder?')) {
      if (!window.ipcRenderer.sendSync('delete folder', folderId)) {
        return false;
      }

      codex.notes.aside.removeFolderMenu(folderId);
      codex.notes.note.clear();
      return true;
    }
    return false;
  }

}