import Folder from './folder';

const AsideSwiper = require('./aside-swiper').default;
const $ = require('./dom').default;

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
  * @property {Element}     this.newFolderButton   New folder button
  * @property {Element}     this.newFolderField    New folder form field
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
    window.ipcRenderer.on('update notes list', (event, {notes}) => {
      notesMenu.classList.remove(this.CSS.notesMenuLoading);
      notes.forEach( note => this.addMenuItem(note) );
    });

    /**
     * Activate new note button
     */
    let newNoteButtons = document.querySelectorAll(`[name="js-new-note-button"],
                                                    [name="js-new-note-button-in-folder"]`);

    newNoteButtons.forEach( button => {
      button.addEventListener('click', () => this.newNoteButtonClicked(button) );
    });

    /**
     * Activate new folder button
     */
    this.newFolderButton = document.querySelector('[name="js-new-folder-button"]');
    this.newFolderField = document.querySelector('[name="js-new-folder-field"]');

    let newFolderInput  = this.newFolderField.querySelector('input');

    this.newFolderButton.addEventListener('click',  event => this.newFolderButtonClicked(event) );
    newFolderInput.addEventListener('keydown', event => this.newFolderInputFilled(event) );

    /**
     * Activate folders Back button
     */
    let folderHeader = $.get('folder-header');

    folderHeader.addEventListener('click', () => {
      this.closeFolder();
    });
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
   *
   * Can be user async with subscribtion
   * on window.ipcRenderer.on('update notes list', (event, {notes, folder}) => {})
   *
   * or synchronously like loadNotes().then( notes => {})
   *
   * @param  {Number|null} folderId
   * @returns {<Promise>.[]}
   */
  loadNotes( folderId = 0 ) {
    return new Promise(resolve => {
      let response = window.ipcRenderer.sendSync('load notes list', folderId);

      /**
       * @var {object} response
       * @var {array}  response.notes
       * @var {object} response.folder
       * @var {number} response.folder.id
       * @var {string} response.folder.name
       */
      resolve(response);
    });
  }

  /**
   * Loads folders list
   */
  loadFolders() {
    window.ipcRenderer.send('load folders list');
  }


  /**
   * New note button click handler
   * @param {Element} button
   * @this {Aside}
   */
  newNoteButtonClicked(button) {
    let folderId = button.dataset.folderId;

    console.log('folderId: %o', folderId);

    this.currentFolderId = folderId || null;
    /**
     * Set focus to the Editor
     */

    window.setTimeout(function () {
      let editor = document.querySelector('.ce-redactor');

      editor.click();
    }, 10);

    codex.notes.note.clear();
  }

  /**
   * New folder button click handler
   * @param {MouseEvent} event
   */
  newFolderButtonClicked(event) {
    let button = event.target,
        input = this.newFolderField.querySelector('input');

    button.classList.add('hide');
    this.newFolderField.classList.remove('hide');

    input.focus();
  }

   /**
   * New folder input keydown handler
   * @param {KeyboardEvent} event
   */
  newFolderInputFilled(event) {
    if (event.key !== 'Enter') {
      return;
    }

    let input = event.target,
        folderName = input.value.trim();

    if (!folderName) {
      return;
    }

    /**
     * Save folder
     * @type {object}
     */
    let createdFolder = window.ipcRenderer.sendSync('create folder', folderName);

    /**
     * Add saved folder to the menu
     */
    this.addFolder(createdFolder);

    input.value = '';

    this.newFolderField.classList.add('hide');
    this.newFolderButton.classList.remove('hide');
  }




  /**
   *
   * Add note to left menu
   *
   * @param {object} noteData
   * @param {number} noteData.id
   * @param {string} noteData.title
   * @param {number} noteData.folderId
   */
  addMenuItem(noteData) {
    let notesMenu;

    if (!noteData.folderId) {
      notesMenu = document.querySelector('[name="js-notes-menu"]');
    } else if (noteData.folderId === this.currentFolderId) {
      notesMenu = document.querySelector('[name="js-folder-notes-menu"]');
    } else {
      console.log('Note added to closed folder: %o', noteData.folderId);
      return;
    }

    /**
     * If we already have this item, update title
     */
    let existingNote = notesMenu.querySelector('[data-id="' + noteData.id + '"]');

    if (existingNote) {
      existingNote.textContent = this.createMenuItemTitle(noteData.title);
      return;
    }

    let item = this.makeMenuItem(noteData.title, {id: noteData.id});

    notesMenu.insertAdjacentElement('afterbegin', item);

    item.addEventListener('click', event => this.menuItemClicked(event) );
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
    let item = this.makeMenuItem(folder.name, {folderId: folder.id});


    foldersMenu.insertAdjacentElement('afterbegin', item);

    item.addEventListener('click', event => this.folderClicked(event.target) );
  }

  /**
   * Makes aside menu item
   * @param  {String} title   - item title
   * @param  {object} dataset - data to store in dataset
   * @return {Element}
   */
  makeMenuItem(title, dataset) {
    title = this.createMenuItemTitle(title);

    let item = $.make('li', null, {
      textContent: title
    });

    for (let key in dataset) {
      item.dataset[key] = dataset[key];
    }

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
  removeMenuItem(itemId) {
    let notesMenu = document.querySelectorAll('[name="js-notes-menu"], [name="js-folder-notes-menu"]');

    notesMenu.forEach( menu => {
      let existingNote = menu.querySelector('[data-id="' + itemId + '"]');

      if (existingNote) existingNote.remove();
    });
  }

  /**
   * Note in aside menu click listener
   * @param {MouseEvent} event
   */
  menuItemClicked(event) {
    let menuItem = event.target,
        id = menuItem.dataset.id;

    let noteData = window.ipcRenderer.sendSync('get note', {id});

    codex.notes.note.render(noteData);

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
    let folderId = item.dataset.folderId;

    /**
     * Load folder
     */
    new Folder(folderId, item.textContent);

    this.currentFolderId = folderId;

    /**
     * Open folder section
     */
    this.swiper.open();
  }

  /**
   * Closes opened folder
   */
  closeFolder() {
    // this.currentFolderId = null;
    this.swiper.close();
  }

}
