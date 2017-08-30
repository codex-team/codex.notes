const {ipcRenderer} = require('electron');

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
    ipcRenderer.send('load notes list');

    /**
     * Update notes list
     */
    ipcRenderer.on('update notes list', (event, {notes}) => {
      notesMenu.classList.remove(this.CSS.notesMenuLoading);

      notes.forEach( note => {
        let menuItem = dom.make('li', null, {
          textContent: note.title
        });

        notesMenu.appendChild(menuItem);

        menuItem.addEventListener('click', this.menuItemClicked);
      });
    });
  }

  /**
   * Note in aside menu click listener
   * @param {MouseEvent}
   * @this {Element}
   */
  menuItemClicked(event) {
    console.log('menu item clicked: %o', this, event);
  }
}
