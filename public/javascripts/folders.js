import Aside from './aside';
import Note from './note';

/**
 * Folders methods
 */
export default class Folder {
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
  static moveToFolder(folderId, folderName) {
    Note.clear();

    Folder.currentFolder = folderId;
    Aside.clearNotesList();
    window.ipcRenderer.send('load notes list', folderId);

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

    Folder.currentFolder = 0;

    Aside.clearNotesList();
    window.ipcRenderer.send('load notes list', Folder.currentFolder);

    let foldersSection = document.getElementById('folders-section'),
        currentFolder = document.getElementById('current-folder');

    foldersSection.classList.remove('hide');
    currentFolder.classList.add('hide');
  }

  /**
   * Return current folder ID
   *
   * @returns {number}
   */
  static get currentFolder() {
    return currentFolder;
  }

  /**
   * Set current folder ID
   *
   * @param {Number} folderId
   */
  static set currentFolder(folderId) {
    currentFolder = folderId;
  }

}

let currentFolder = 0;