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
   * Make CSS dictionary
   * @type {Object}
   */
  static get CSS() {
    return {
      notesMenuLoading: 'notes-list--loading',
      noteListItem : 'notes-list__content-item',
      notSeenState : 'notes-list__content-item--not-seen'
    };
  }
  /**
   * @constructor
   */
  constructor() {
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
    notesMenu.classList.add(Aside.CSS.notesMenuLoading);
    foldersMenu.classList.add(Aside.CSS.notesMenuLoading);

    /**
     * Emit message to load list
     */
    this.loadNotes();
    this.loadFolders();

    /**
     * Update folder list
     */
    window.ipcRenderer.on('update folders list', (event, {userFolders}) => {
      foldersMenu.classList.remove(Aside.CSS.notesMenuLoading);
      foldersMenu.innerHTML = '';
      userFolders.forEach( folder => this.addFolder(folder) );
    });

    /**
     * Update notes list
     */
    window.ipcRenderer.on('notes list - update', (event, {notes, isRootFolder}) => {
      notesMenu.classList.remove(Aside.CSS.notesMenuLoading);
      notes.forEach( note => this.addMenuItem(note, isRootFolder) );
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

    window.ipcRenderer.on('note updated', (event, {note, isRootFolder}) => {
      if (!note.isRemoved) {
        this.addMenuItem(note, isRootFolder);
      } else {
        this.removeMenuItem(note._id);
      }
    });

    window.ipcRenderer.on('folder updated', (event, folder) => {
      if (!folder.isRemoved) {
        this.addFolder(folder);
        /**
         * Update title of opened folder
         */
        if (this.currentFolder && this.currentFolder._id && this.currentFolder._id === folder._id) {
          this.currentFolder.title = folder.title;
        }
      } else {
        this.removeFolderFromMenu(folder._id);
      }
    });
  }

  /**
   * Loads notes list from the server
   *
   * Can be used async with subscribtion
   * on window.ipcRenderer.on('notes list - update', (event, {notes, folder}) => {})
   *
   * or synchronously like loadNotes().then( notes => {})
   *
   * @param  {string|null} folderId
   * @returns {<Promise>.[]}
   */
  loadNotes( folderId = null) {
    return new Promise(resolve => {
      let response = window.ipcRenderer.sendSync('notes list - load', folderId);
      /**
       * @var {object} response
       * @var {array}  response.notes
       * @var {object} response.folder
       * @var {number} response.folder.id
       * @var {string} response.folder.title
       * @var {Boolean} response.isRootFolder
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
   * Add a Note to the left menu
   *
   * @param {object} noteData
   * @param {number} noteData._id
   * @param {string} noteData.title
   * @param {number} noteData.folderId
   *
   * @param {Boolean} isRootFolder - true if Note is included to the Root Folder
   */
  addMenuItem(noteData, isRootFolder) {
    if (!noteData.titleLabel) {
      console.warn('Can not add Note to the Aside because it has no title', noteData);
      return;
    }

    let notesMenu;

    if (isRootFolder) {
      notesMenu = document.querySelector('[name="js-notes-menu"]');
    } else if (this.currentFolder && noteData.folderId === this.currentFolder._id) {
      notesMenu = document.querySelector('[name="js-folder-notes-menu"]');
    } else {
      console.log('Note added to closed folder: %o', noteData.folderId);
      return;
    }

    /**
     * If we already have this item, update title
     */
    let existingNote = notesMenu.querySelector('[data-id="' + noteData._id + '"]');

    if (existingNote) {
      existingNote.textContent = this.createMenuItemTitle(noteData.titleLabel);

      /**
       * Set unread badge because Note was updated
       */
      this.checkUnreadStatus(noteData._id);
      return;
    }

    let item = this.makeMenuItem(noteData.titleLabel, {id: noteData._id});

    notesMenu.insertAdjacentElement('afterbegin', item);

    item.addEventListener('click', event => this.menuItemClicked(event) );
  }

  /**
   * Add new item to the folders list
   *
   * @param {object} folder
   * @param {string} folder.title
   * @param {number} folder._id
   */
  addFolder(folder) {
    if (!folder.title) {
      console.warn('Can not add Folder to the Aside because it has no title', folder);
      return;
    }
    let foldersMenu = document.querySelector('[name="js-folders-menu"]');
    let folderItem = foldersMenu.querySelector('[data-folder-id="' + folder._id + '"]');

    if (folderItem) {
      this.updateFolderTitleInMenu(folder._id, folder.title);
      return;
    }

    let item = this.makeMenuItem(folder.title, {folderId: folder._id});

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

    let item = $.make('li', Aside.CSS.noteListItem, {
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

    // send "note - get" event
    let noteData = window.ipcRenderer.sendSync('note - get', {id});

    codex.notes.note.render(noteData);

    /**
     * Scroll to top
     */
    let editorView = document.querySelector('[name="editor-view"]');

    editorView.scrollIntoView();

    /**
     * Remove unread badge
     */
    this.markNoteAsRead(id);
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
    this.folderSettings.close();
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

  /**
   * Check unread status of passed Notes Ids
   * @param {String[]|String} noteIds - ids of Notes to check
   */
  checkUnreadStatus(noteIds) {
    if (!Array.isArray(noteIds)) {
      /**
       * If only singe id passed
       */
      if (noteIds) {
        noteIds = [ noteIds ];
      } else {
        return;
      }
    }

    /**
     * Request unrad states of passed note ids
     */
    window.ipcRenderer.send('notes - get unread states', { noteIds });

    /**
     * We use "once" to invoke sa callback to automatically removes listener after folder will be closed
     */
    window.ipcRenderer.once('notes - set unread state',

      /**
       * Check unread state of Notes from the current Folder
       * @param  {*} event
       * @param  {Object} unreadStates - map of note ids with unread states {dqO9tu5vY2aSC582: true, ...}
       */
      (event, unreadStates = {}) => {
        for (let noteId in unreadStates) {
          let noteUnread = unreadStates[noteId];

          if (noteUnread) {
            this.markNoteAsUnread(noteId);
          }
        }
      });
  }

  /**
   * Remove unread badge from the Note in Aside
   * @param  {string} noteId - Note's id
   */
  markNoteAsRead(noteId) {
    let noteInAside = document.querySelector(`[name="js-notes-menu"] [data-id="${noteId}"], [name="js-folder-notes-menu"] [data-id="${noteId}"]`);

    if (noteInAside) {
      noteInAside.classList.remove(Aside.CSS.notSeenState);
    }
  }

  /**
   * Mark Note at the Aside as unread
   * @param {string} noteId
   */
  markNoteAsUnread(noteId) {
    let noteInAside = document.querySelector(`[name="js-notes-menu"] [data-id="${noteId}"], [name="js-folder-notes-menu"] [data-id="${noteId}"]`);

    if (noteInAside) {
      noteInAside.classList.add(Aside.CSS.notSeenState);
    }
  }
}
