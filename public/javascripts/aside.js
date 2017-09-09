import Folder from './folders';
import Note from './note';

/**
 * Aside column module
 */
export default class Aside {

  /**
  * @constructor
  * @property {object} CSS dictionary
  */
  constructor() {
    /**
     * Make CSS dictionary
     * @type {Object}
     */
    this.CSS = {
      notesMenuLoading: 'notes-list--loading'
    };

    /**
     * Find notes list holder
     * @type {Element}
     */
    let notesMenu = document.querySelector('[name="js-notes-menu"]'),
        foldersMenu = document.querySelector('[name="js-folders-menu"]');

    /**
     * Show preloader
     */
    notesMenu.classList.add(this.CSS.notesMenuLoading);
    foldersMenu.classList.add(this.CSS.notesMenuLoading);

    /**
     * Emit message to load list
     */
    window.ipcRenderer.send('load notes list', Folder.currentFolder);
    window.ipcRenderer.send('load folders list');

    /**
     * Update folder list
     */
    window.ipcRenderer.on('update folders list', (event, {userFolders}) => {
      foldersMenu.classList.remove(this.CSS.notesMenuLoading);
      userFolders.forEach(Aside.addFolder);
    });

    /**
     * Update notes list
     */
    window.ipcRenderer.on('update notes list', (event, {notes}) => {
      notesMenu.classList.remove(this.CSS.notesMenuLoading);
      notes.forEach(Aside.addMenuItem);
    });

    /**
     * Activate new note button
     */
    let newNoteButton = document.querySelector('[name="js-new-note-button"]');
    let newFolderButton = document.querySelector('[name="js-new-folder-button"]');

    newNoteButton.addEventListener('click', () => this.newNoteButtonClicked.call(this) );
    newFolderButton.addEventListener('click', Aside.newFolderButtonClicked);
  }

  /**
   * New note button click handler
   * @this {Aside}
   */
  newNoteButtonClicked() {
    /**
     * Set focus to the Editor
     */
    window.setTimeout(function () {
      let editor = document.querySelector('.ce-redactor');

      editor.click();
    }, 10);
    Note.clear();
  }

  /**
   * New folder button click handler
   * @this {Element} - New Folder button
   */
  static newFolderButtonClicked() {
    let newFolderInput = document.querySelector('[name="js-new-folder-input"]'),
        input = newFolderInput.querySelector('input');

    /**
     * Save note by Enter keypress
     */
    input.addEventListener('keydown', event => {
      if (event.keyCode !== 13) {
        return;
      }

      Folder.createFolder(event.target);
    });

    this.classList.add('hide');
    newFolderInput.classList.remove('hide');

    input.focus();
  }

  /**
   *
   * Add note to left menu
   *
   * @param {object} noteData
   * @param {string} noteData.title
   */
  static addMenuItem(noteData) {
    /**
     * Maximum chars at the node title
     * @type {Number}
     */
    const titleMaxLength = 68;

    let notesMenu = document.querySelector('[name="js-notes-menu"]');
    let existingNote = notesMenu.querySelector('[data-id="' + noteData.id + '"]');

    let noteTitle = noteData.title;

    if ( noteTitle.length > titleMaxLength ) {
      noteTitle = noteTitle.substring(0, titleMaxLength) + '…';
    }

    if (existingNote) {
      existingNote.textContent = noteTitle;
      return;
    }

    let menuItem = dom.make('li', null, {
      textContent: noteTitle
    });

    menuItem.dataset.id = noteData.id;

    notesMenu.insertAdjacentElement('afterbegin', menuItem);

    menuItem.addEventListener('click', Aside.menuItemClicked);
  }

  /**
   *  Add new item to folders list
   *
   * @param {object} folder
   * @param {string} folder.name
   * @param {number} folder.id
   */
  static addFolder(folder) {
    /**
     * Maximum chars at the node title
     * @type {Number}
     */
    const titleMaxLength = 68;

    let foldersMenu = document.querySelector('[name="js-folders-menu"]');

    if ( folder.name.length > titleMaxLength ) {
      folder.name = folder.name.substring(0, titleMaxLength) + '…';
    }

    let item = dom.make('li', null, {
      textContent: folder.name
    });

    item.dataset.folderId = folder.id;

    foldersMenu.insertAdjacentElement('afterbegin', item);

    item.addEventListener('click', Aside.folderClicked);
  }

  /**
   * Remove item from menu
   *
   * @param itemId
   */
  static removeMenuItem(itemId) {
    let notesMenu = document.querySelector('[name="js-notes-menu"]');

    let existingNote = notesMenu.querySelector('[data-id="' + itemId + '"]');

    if (existingNote) existingNote.remove();
  }

  /**
   * Note in aside menu click listener
   * @this {Element}
   */
  static menuItemClicked() {
    let menuItem = this,
        id = menuItem.dataset.id;

    let noteData = window.ipcRenderer.sendSync('get note', {id});

    Note.render(noteData);

    /**
     * Scroll to top
     */
    let editorView = document.querySelector('[name="editor-view"]');

    editorView.scrollIntoView();
  }

  /**
   * Folder menu item clicked handler
   */
  static folderClicked() {
    Folder.moveToFolder(this.dataset.folderId, this.textContent);
  }

  /**
   * Remove notes list
   */
  static clearNotesList() {
    let notesMenu = document.querySelector('[name="js-notes-menu"]');

    notesMenu.innerHTML = '';
  }

}

let dom = require('./dom').default;
