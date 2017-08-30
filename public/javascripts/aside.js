let dom = require('./dom').default;
var Note = require('./note').default;

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

    notesMenu.appendChild(menuItem);

    menuItem.addEventListener('click', Aside.menuItemClicked);
  }

  /**
   * Note in aside menu click listener
   * @this {Element}
   */
  static menuItemClicked() {
    let menuItem = this,
        id = menuItem.dataset.id;

    let noteData = window.ipcRenderer.sendSync('get note', {id});

    let noteClass = new Note();

    noteClass.render(noteData);
  }
}
