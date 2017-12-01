const Dialog = require('./dialog').default;

/**
 * Folder Settings panel module
 *
 * @property {Boolean} opened - state
 */
export default class FolderSettings {

  /**
   * @constructor
   */
  constructor() {
    this.toggler = document.getElementById('js-folder-settings-toggler');
    this.closeButton = document.getElementById('js-close-folder');
    this.removeFolderButton = document.getElementById('js-delete-folder');
    this.folderNameInput  = document.getElementsByName('folder-name')[0];

    this.toggler.addEventListener('click', () => {
      this.toggle();
    });

    this.closeButton.addEventListener('click', () => {
      this.close();
    });

    this.removeFolderButton.addEventListener('click', () => {
      this.removeFolderClicked();
    });

    this.folderNameInput.addEventListener('keydown', event => this.changeNameKeydown(event) );
  }

  /**
   * CSS dictionary
   */
  static get CSS() {
    return {
      panelOpenedModifier: 'folder-settings-opened'
    };
  }

  /**
   * Open panel and change state
   */
  open() {
    document.body.classList.add(FolderSettings.CSS.panelOpenedModifier);
    this.opened = true;

    /**
     * Fill folder name input
     */
    this.folderNameInput.value = codex.notes.aside.currentFolder.name || '';
  }

  /**
   * Close panel and change state
   */
  close() {
    document.body.classList.remove(FolderSettings.CSS.panelOpenedModifier);
    this.opened = false;
  }

  /**
   * Shows/hide this.panel
   */
  toggle() {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Handler for Remove Folder Button
   */
  removeFolderClicked() {
    console.assert(codex.notes.aside.currentFolder, 'Cannot remove folder because it is not open');

    let result = codex.notes.aside.currentFolder.delete();

    if (result) {
      this.close();
      codex.notes.aside.closeFolder();
    }
  }

  /**
   * Handler for Change Name input
   * @param  {KeyboardEvent} event - keydowns
   */
  changeNameKeydown(event) {
    if (event.key !== 'Enter') {
      return;
    }

    let input = event.target,
        name = input.value.trim(),
        id = codex.notes.aside.currentFolder.id;

    if (!name) {
      return;
    }

    /**
     * Save folder
     * @type {object}
     */
    let result = window.ipcRenderer.sendSync('folder - change name', { id, name });

    if (!result) {
      Dialog.error('Folder renaming failed. Please, try again.');
      return false;
    }

    /**
     * Update name in the:
     *  - folder header
     *  - aside menu
     */
    codex.notes.aside.currentFolder.name = name;

    /**
     * Close folder settings
     */
    this.close();
  }

}