import Folder from './folders';
import Note from './note';

const AsideSwiper = require('./aside-swiper').default;
const dom = require('./dom').default;

/**
 * Maximum chars at the menu title
 * @type {Number}
 */
const menuItemTitleMaxLength = 68;

/**
 * Aside column module
 */
export default class Aside {

  /**
  * @constructor
  * @property {object}      this.CSS               classnames dictionary
  * @property {AsideSwiper} this.swiper            AsideSwiper instance
  * @property {number|null} this.currentFolderId   Opened folder id
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
     * Module for hide/show folder sections
     * @type {AsideSwiper}
     */
    this.swiper = new AsideSwiper();

    /**
     * Current opened folder.
     * @type {Number|null}
     */
    this.currentFolderId = null;

    /**
     * Show preloader
     */
    notesMenu.classList.add(this.CSS.notesMenuLoading);
    foldersMenu.classList.add(this.CSS.notesMenuLoading);

    /**
     * Emit message to load list
     */
    this.loadNotes();
    this.loadFolders();

    /**
     * Update folder list
     */
    window.ipcRenderer.on('update folders list', (event, {userFolders}) => {
      foldersMenu.classList.remove(this.CSS.notesMenuLoading);
      userFolders.forEach( folder => this.addFolder(folder) );
    });

    /**
     * Update notes list
     */
    window.ipcRenderer.on('update notes list', (event, {notes, folder}) => {
      console.log('update notes list: notes,folder: %o', notes, folder);
      notesMenu.classList.remove(this.CSS.notesMenuLoading);
      notes.forEach( note => this.addMenuItem(note) );
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
   * Return current folder ID
   *
   * @returns {number}
   */
  get currentFolder() {
    return this.currentFolderId;
  }

  /**
   * Set current folder ID
   *
   * @param {Number} folderId
   */
  set currentFolder(folderId) {
    this.currentFolderId = folderId;
  }

  /**
   * Loads notes list from the server
   * @param  {Number|null} folderId
   */
  loadNotes( folderId = 0 ) {
    window.ipcRenderer.send('load notes list', folderId);
  }

  /**
   * Loads folders list
   */
  loadFolders() {
    window.ipcRenderer.send('load folders list');
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
  addMenuItem(noteData) {
    let notesMenu = document.querySelector('[name="js-notes-menu"]');

    /**
     * If we already have this item, update title
     */
    let existingNote = notesMenu.querySelector('[data-id="' + noteData.id + '"]');

    if (existingNote) {
      existingNote.textContent = this.createMenuItemTitle(noteData.title);
      return;
    }

    let item = this.makeMenuItem(noteData.title, noteData.id);

    notesMenu.insertAdjacentElement('afterbegin', item);

    item.addEventListener('click', Aside.menuItemClicked);
  }

  /**
   * Add new item to the folders list
   *
   * @param {object} folder
   * @param {string} folder.name
   * @param {number} folder.id
   */
  addFolder(folder) {
    let foldersMenu = document.querySelector('[name="js-folders-menu"]');
    let item = this.makeMenuItem(folder.name, folder.id);


    foldersMenu.insertAdjacentElement('afterbegin', item);

    item.addEventListener('click', event => this.folderClicked(event.target) );
  }

  /**
   * Makes aside menu item
   * @param  {String} title  - item title
   * @param  {Number} id     - item unique id
   * @return {Element}
   */
  makeMenuItem(title, id) {
    title = this.createMenuItemTitle(title);

    let item = dom.make('li', null, {
      textContent: title
    });

    item.dataset.folderId = id;

    return item;
  }

  /**
   * Creates aside menu item title
   * @param {String} title
   * @return {String}
   */
  createMenuItemTitle(title) {
    if ( title.length > menuItemTitleMaxLength ) {
      title = title.substring(0, menuItemTitleMaxLength) + '…';
    }

    return title;
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
   * @param {Element} item - clicked folder button
   */
  folderClicked( item ) {
    console.log('this.swiper: %o', this.swiper);
    this.swiper.open();

    let folder = new Folder(item.dataset.folderId, item.textContent);

    folder.open();
  }

  /**
   * Remove notes list
   */
  static clearNotesList() {
    let notesMenu = document.querySelector('[name="js-notes-menu"]');

    notesMenu.innerHTML = '';
  }

}
