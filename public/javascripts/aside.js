let dom = require('./dom').default;

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
  static addMenuItem(note) {
    let notesMenu = document.querySelector('[name="js-notes-menu"]');

    let existingNote = notesMenu.querySelector('[data-id="' + note.id + '"]');

    if (existingNote) {
      existingNote.textContent = note.title;
      return;
    }

    let menuItem = dom.make('li', null, {
      textContent: note.title
    });

    menuItem.dataset.id = note.id;

    notesMenu.appendChild(menuItem);

    menuItem.addEventListener('click', Aside.menuItemClicked);
  }

  /**
   * Note in aside menu click listener
   * @param {MouseEvent}
   * @this {Element}
   */
  static menuItemClicked(event) {
    console.log('menu item clicked: %o', this, event);
  }
}
