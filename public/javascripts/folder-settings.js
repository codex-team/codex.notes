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
    this.panel = document.getElementById('js-folder-settings');
    this.closeButton = document.getElementById('js-close-folder');

    this.toggler.addEventListener('click', () => {
      this.toggle();
    });

    this.closeButton.addEventListener('click', () => {
      this.close();
    });
  }

  /**
   * CSS dictionary
   */
  static get CSS() {
    return {
      panelOpened: 'folder-settings--opened'
    };
  }

  /**
   * Open panel and change state
   */
  open() {
    this.panel.classList.add(FolderSettings.CSS.panelOpened);
    this.opened = true;
  }

  /**
   * Close panel and change state
   */
  close() {
    this.panel.classList.remove(FolderSettings.CSS.panelOpened);
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

}