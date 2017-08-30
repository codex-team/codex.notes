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

    newNoteButton.addEventListener('click', () => this.newNoteButtonClicked.call(this) );
  }

  /**
   * New note button click handler
   * @this {Aside}
   */
  newNoteButtonClicked() {
    noteClass.clear();
  }

  /**
   *
   * Add note to left menu
   *
   * @param note
   */
  static addMenuItem(noteData) {
    let notesMenu = document.querySelector('[name="js-notes-menu"]');

    let existingNote = notesMenu.querySelector('[data-id="' + noteData.id + '"]');

    if (existingNote) {
      existingNote.textContent = noteData.title;
      return;
    }

    let menuItem = dom.make('li', null, {
      textContent: noteData.title
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

    noteClass.render(noteData);
  }
}

let dom = require('./dom').default;
let Note = require('./note').default;
let noteClass = new Note();