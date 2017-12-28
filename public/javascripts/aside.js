import Folder from './folder';
import Note from './note';
import FolderSettings from './folder-settings';

const AsideSwiper = require('./aside-swiper').default;
const $ = require('./dom').default;

/**
 * Maximum chars at the menu title
 * @type {Number}
 */
const menuItemTitleMaxLength = 68;

/**
 * Aside column module
 *
 * @property {object}          this.CSS                     classnames dictionary
 * @property {AsideSwiper}     this.swiper                  AsideSwiper instance
 * @property {Folder}          this.currentFolder           Opened folder instance
 * @property {Folder}          this.previouslyOpenedFolder  See docs in {@link Aside#constructor}
 * @property {Element}         this.newFolderButton         New folder button
 * @property {Element}         this.newFolderField          New folder form field
 * @property {FolderSettings}  this.folderSettings          Folder Settings Panel instance
 */
export default class Aside {

  /**
  * @constructor
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
    this.swiper = new AsideSwiper({
      opened: () => this.folderOpened(),
      closed: () => this.folderClosed()
    });

    /**
     * Current opened folder.
     * @type {Folder}
     */
    this.currentFolder = null;

    /**
     * Save previously opened folder id.
     * Usecase:
     *   - Folder opened by click in menu (and saved in {@link Aside#currentFolder})
     *   - Folder closed by swipe-left on Aside (this.currentFolder = null)
     *   - User makes swipe-right to open Folder back, but we have not its ID
     *   - So we use previouslyOpenedFolder to construct this.currentFolder again
     */
    this.previouslyOpenedFolder = null;

    /**
     * Show preloader
     */
    notesMenu.classList.add(this.CSS.notesMenuLoading);
    foldersMenu.classList.add(this.CSS.notesMenuLoading);

    /**
     * Emit message to load list
     */
    // this.loadNotes();
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
    let newNoteButtons = document.querySelectorAll('[name="js-new-note-button"]');

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
    let folderCloseToggler = $.get('folder-close-zone');

    folderCloseToggler.addEventListener('click', () => {
      this.closeFolder();
    });

    this.activateScrollableGradient();

    /**
     * Active 'Folder Settings' panel
     */
    this.folderSettings = new FolderSettings();
  }

  /**
   * Loads notes list from the server
   *
   * Can be used async with subscribtion
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
       * @var {string} response.folder.title
       */
      resolve(response);
    }).catch(error => {
      console.log('Error while loading notes: ', error);
    });
  }

  /**
   * Loads folders list
   */
  loadFolders() {
    window.ipcRenderer.send('folders list - load');
  }


  /**
   * New note button click handler
   * @this {Aside}
   */
  newNoteButtonClicked() {
    Note.focusEditor();

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
   * New Folder input keydown handler
   * @param {KeyboardEvent} event
   */
  newFolderInputFilled(event) {
    if (event.key !== 'Enter') {
      return;
    }

    let input = event.target,
        folderTitle = input.value.trim();

    if (!folderTitle) {
      return;
    }

    /**
     * Save Folder
     * @type {object}
     */
    let createdFolder = window.ipcRenderer.sendSync('folder - create', folderTitle);

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
    } else if (this.currentFolder && noteData.folderId === this.currentFolder.id) {
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
   * @param {string} folder.title
   * @param {number} folder.id
   */
  addFolder(folder) {
    let foldersMenu = document.querySelector('[name="js-folders-menu"]');
    let item = this.makeMenuItem(folder.title, {folderId: folder.id});

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
   * Remove folder from menu by ID
   * @param folderId - folder ID
   */
  removeFolderFromMenu(folderId) {
    let foldersMenu = document.querySelector('[name="js-folders-menu"]');

    if (!foldersMenu) {
      return false;
    }

    let folderItem = foldersMenu.querySelector('[data-folder-id="' + folderId + '"]');

    if (folderItem) {
      folderItem.remove();
    }
  }

  /**
   * Updates Folder's title in menu
   *
   * @param {MongoId} folderId - folder ID
   * @param {String} title     - new title
   */
  updateFolderTitleInMenu(folderId, title) {
    let foldersMenu = document.querySelector('[name="js-folders-menu"]');

    if (!foldersMenu) {
      return false;
    }

    let folderItem = foldersMenu.querySelector('[data-folder-id="' + folderId + '"]');

    if (folderItem) {
      folderItem.textContent = title;
    }
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
   * Fired after swipe-right
   */
  folderOpened() {
    /**
     * Restore current folder after closing
     */
    if (!this.currentFolder && this.previouslyOpenedFolder) {
      this.currentFolder = new Folder(this.previouslyOpenedFolder);
    }

    console.assert(this.currentFolder, 'Folder opened but does not initialized');

    codex.notes.note.clear();
  }

  /**
   * Fired after swipe-left
   */
  folderClosed() {
    if (this.currentFolder) {
      this.previouslyOpenedFolder = this.currentFolder.id;
    }

    this.currentFolder = null;
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
    this.currentFolder = new Folder(folderId, item.textContent);

    /**
     * Open folder section
     */
    this.swiper.open();
  }

  /**
   * Closes opened folder
   */
  closeFolder() {
    this.swiper.close();
  }

  /**
   * Shows fade-out gradient at the top of scrollable zone
   * Uses by scroll to prevent overlaying first block (NOTES, FOLDERS headings) with gradient when block is not scrolled
   */
  activateScrollableGradient() {
    /**
     * Scroll top offset to show gradient
     * @type {Number}
     */
    const minimumDistance = 5;

    /**
     * Modificatior that will be added to the wrapper on scroll
     * @type {String}
     */
    const scrolledModificator = 'aside__scrollable--scrolled';

    /**
     * Scrollable zoners
     * @type {Element[]}
     */
    let scrollableZones = document.querySelectorAll('[name="js-scrollable"]');

    let addClassOnScroll = event => {
      let scrollableContent = event.target,
          scrollableWrapper = event.target.parentNode;

      if (scrollableContent.scrollTop > minimumDistance) {
        scrollableWrapper.classList.add(scrolledModificator);
      } else {
        scrollableWrapper.classList.remove(scrolledModificator);
      }
    };

    scrollableZones.forEach( zone => {
      zone.addEventListener('scroll', addClassOnScroll);
    });
  }
}
