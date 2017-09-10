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

    this.autoresizer = null;

    /**
     * Find notes list holder
     * @type {Element}
     */
    let notesMenu = document.querySelector('[name="js-notes-menu"]');

    /**
     * Show preloader
     */
    notesMenu.classList.add(this.CSS.notesMenuLoading);

    /**
     * Emit message to load list
     */
    window.ipcRenderer.send('load notes list');

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

    newNoteButton.addEventListener('click', () => {
      let autoResizableElements = document.getElementsByClassName('js-autoresizable');

      if (autoResizableElements.length > 0) {
        for(let i = 0; i < autoResizableElements.length; i++) {
          autoResizableElements[i].style.height = 'auto';
        }
      }
      this.newNoteButtonClicked.call(this);
    });
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

    let Autoresizer = require('./autoresizer').default;
    let autoResizableElements = document.getElementsByClassName('js-autoresizable');

    if (this.autoresizer) {
      this.autoresizer.destroy();
      this.autoresizer = null;
    }

    this.autoresizer = new Autoresizer(autoResizableElements);

    /**
     * Scroll to top
     */
    let editorView = document.querySelector('[name="editor-view"]');

    editorView.scrollIntoView();
  }
}

let dom = require('./dom').default;
let Note = require('./note').default;
