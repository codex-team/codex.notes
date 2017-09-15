import Aside from './aside';
import Note from './note';

/**
 * Folders methods
 */
export default class Folder {

  /**
   * Folder methods
   */
  constructor() {

  }


  /**
   * Create new folder
   * @param {Element} input  - field with folder title
   */
  static createFolder( input ) {
    let folderTitle = input.value;
    let createdFolder = window.ipcRenderer.sendSync('create folder', folderTitle);

    Aside.addFolder(createdFolder);

    input.value = '';
    input.removeEventListener('keydown', Folder.createFolder);

    let newFolderInput = input.parentNode;
    let newFolderButton = document.querySelector('[name="js-new-folder-button"]');

    newFolderInput.classList.add('hide');
    newFolderButton.classList.remove('hide');
  }

  /**
   * Set up interface for folder
   *
   * @param folderId
   */
  open(folderId, folderName) {
    Note.clear();

    codex.notes.aside.currentFolderId = folderId;
    Aside.clearNotesList();
    codex.notes.aside.loadNotes(folderId);

    let foldersSection = document.getElementById('folders-section'),
        currentFolder = document.getElementById('current-folder'),
        currentFolderTitle = document.getElementById('current-folder-title');

    foldersSection.classList.add('hide');

    currentFolderTitle.textContent = folderName;
    currentFolder.classList.remove('hide');
  }

  /**
   * Setup main interface
   */
  static backToRoot() {
    Note.clear();

    codex.notes.aside.currentFolderId = null;

    Aside.clearNotesList();
    codex.notes.aside.loadNotes();

    let foldersSection = document.getElementById('folders-section'),
        currentFolder = document.getElementById('current-folder');

    foldersSection.classList.remove('hide');
    currentFolder.classList.add('hide');
  }

}